import Database from 'better-sqlite3';
import path from 'path';
import { prisma } from '@/lib/prisma';
import {
    calculateLiquidityRegime,
    calculateValuationRegime,
    calculatePriceRegime,
} from '@/lib/regime-config';
import { calculateFlowTrendState } from '@/lib/regime-config/flow-trend-config';
import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';
import CockpitClient from './cockpit-client';

interface MetricRow {
    date: string;
    value: number;
    percentile_rank: number | null;
}

async function getMetric(assetClass: string, seriesName: string, refDate?: string): Promise<MetricRow | null> {
    type RawRow = { date: string; value: number; percentile_rank: number | null };
    const rows = refDate
        ? await prisma.$queryRaw<RawRow[]>`
            SELECT date::text as date, value, percentile_rank FROM macro_percentile_analysis
            WHERE asset_class = ${assetClass} AND series_name = ${seriesName} AND date::text <= ${refDate}
            ORDER BY date DESC LIMIT 1`
        : await prisma.$queryRaw<RawRow[]>`
            SELECT date::text as date, value, percentile_rank FROM macro_percentile_analysis
            WHERE asset_class = ${assetClass} AND series_name = ${seriesName}
            ORDER BY date DESC LIMIT 1`;
    if (!rows[0]) return null;
    return { date: rows[0].date.slice(0, 10), value: rows[0].value, percentile_rank: rows[0].percentile_rank };
}

export default async function CockpitPage() {
    // Get latest S&P 500 date from Postgres
    const gspcRows = await prisma.$queryRaw<{ date: string }[]>`
        SELECT date::text as date FROM macro_time_series
        WHERE asset_class = 'equities' AND series_name = 'US/GSPC' AND column_name = 'Value'
        ORDER BY date DESC LIMIT 1
    `;
    const sp500Date = gspcRows[0]?.date ?? null;

    // Reference date from REY (monthly aligned) — from Postgres
    const refRow = await prisma.$queryRaw<{ date: string }[]>`
        SELECT date::text as date FROM macro_percentile_analysis
        WHERE asset_class = 'derived' AND series_name = 'Real-Earnings-Yield-5yr'
        ORDER BY date DESC LIMIT 1`;
    const refDate = refRow[0]?.date?.slice(0, 10);

    // All metrics from Postgres
    const [
        real10Y, real3M, realM2, yieldCurve, eyp5yr, rey5yr,
        cpi, pe5yr, ey5yr, fedFunds, tnx, irx,
        slope200MA, div200MA, slopeStreak, daysAbove,
    ] = await Promise.all([
        getMetric('derived', 'Real-10Y', refDate),
        getMetric('derived', 'Real-3M', refDate),
        getMetric('economic', 'Real-M2-YoY', refDate),
        getMetric('derived', 'Yield-Curve-10Y-3M', refDate),
        getMetric('derived', 'Earnings-Yield-Premium-5yr', refDate),
        getMetric('derived', 'Real-Earnings-Yield-5yr', refDate),
        getMetric('economic', 'CPI', refDate),
        getMetric('valuations', 'PE-5yr', refDate),
        getMetric('valuations', 'Earnings-Yield-5yr', refDate),
        getMetric('economic', 'US/FEDFUNDS', refDate),
        getMetric('bonds', 'US/TNX-Monthly', refDate),
        getMetric('bonds', 'US/IRX-Monthly', refDate),
        // Trend metrics — daily, no refDate cap
        getMetric('derived', 'SP500-200MA-Slope'),
        getMetric('derived', 'SP500-200MA-Div'),
        getMetric('derived', 'SP500-200MA-SlopeStreak'),
        getMetric('derived', 'SP500-200MA-PriceAboveStreak'),
    ]);

    // S&P 500 latest price + regime state from SQLite (not in Postgres)
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { readonly: true });
    const sp500Sqlite = db.prepare(`SELECT date, value FROM time_series WHERE asset_class='equities' AND series_name='US/GSPC' AND column_name='Value' AND date LIKE '____-__-__' ORDER BY date DESC LIMIT 1`).get() as { date: string; value: number } | undefined;
    const regimeRow = db.prepare(`SELECT date, regime, entry_date, trigger_reason FROM regime_timeline ORDER BY date DESC LIMIT 1`).get() as { date: string; regime: string; entry_date: string; trigger_reason: string } | undefined;
    db.close();

    // Calculate classifications
    const liquidityRegime = calculateLiquidityRegime(
        real3M?.value ?? null, real10Y?.value ?? null,
        yieldCurve?.value ?? null, realM2?.value ?? null
    );
    const valuationRegime = calculateValuationRegime(eyp5yr?.value ?? null, rey5yr?.value ?? null);
    const priceRegime = calculatePriceRegime(cpi?.value ?? null);
    const flowTrend = calculateFlowTrendState(
        slope200MA?.value ?? null, div200MA?.value ?? null, slopeStreak?.value ?? null
    );

    // Regime months
    let regimeMonths = 0;
    if (regimeRow) {
        const entry = new Date(regimeRow.entry_date);
        const current = new Date(regimeRow.date);
        regimeMonths = (current.getFullYear() - entry.getFullYear()) * 12 + (current.getMonth() - entry.getMonth());
    }

    // Detect active signals
    const signals: { id: string; title: string; level: 'risk-off' | 'risk-on'; priority: number; active: boolean; detail: string; tooltip: string; date: string | null }[] = [
        {
            id: 'system-stress', title: 'Bond Stress', level: 'risk-off', priority: 1,
            active: real10Y !== null && real10Y.value < -0.5,
            detail: `Real 10Y: ${real10Y?.value?.toFixed(2) ?? 'N/A'}% (trigger: < -0.5%)`,
            tooltip: 'Financial system unanchored — bonds fail to preserve purchasing power. Rotate to gold / real assets.',
            date: real10Y?.date ?? null,
        },
        {
            id: 'real-ey-warning', title: 'Real EY Warning', level: 'risk-off', priority: 2,
            active: rey5yr !== null && rey5yr.value < 0.5,
            detail: `Real EY: ${rey5yr?.value?.toFixed(2) ?? 'N/A'}% (trigger: < +0.5%)`,
            tooltip: 'Equities barely clearing inflation — reduce equity aggressiveness. First level of the multi-level valuation signal.',
            date: rey5yr?.date ?? null,
        },
        {
            id: 'real-ey-sell', title: 'Real EY Sell', level: 'risk-off', priority: 2,
            active: rey5yr !== null && rey5yr.value < -1,
            detail: `Real EY: ${rey5yr?.value?.toFixed(2) ?? 'N/A'}% (trigger: < -1%)`,
            tooltip: 'Equities failing to clear inflation — SELL / underweight equities. Rotate to bonds (if Real 10Y > 0%) or gold.',
            date: rey5yr?.date ?? null,
        },
        {
            id: 'equity-danger', title: 'Equity Danger', level: 'risk-off', priority: 3,
            active: eyp5yr !== null && yieldCurve !== null && eyp5yr.value < -1 && yieldCurve.value < 0,
            detail: `EYP: ${eyp5yr?.value?.toFixed(2) ?? 'N/A'}%, YC: ${yieldCurve?.value?.toFixed(2) ?? 'N/A'}%`,
            tooltip: 'Expensive equities + inverted yield curve = broken liquidity transmission. Poor carry and growth cannot be financed.',
            date: eyp5yr?.date ?? null,
        },
        {
            id: 'growth', title: 'Growth Signal', level: 'risk-on', priority: 4,
            active: eyp5yr !== null && yieldCurve !== null && eyp5yr.value < -1 && yieldCurve.value > 0,
            detail: `EYP: ${eyp5yr?.value?.toFixed(2) ?? 'N/A'}%, YC: ${yieldCurve?.value?.toFixed(2) ?? 'N/A'}%`,
            tooltip: 'Positive yield curve enables financing of duration — growth compensates for weak carry. Favor high-growth equities.',
            date: eyp5yr?.date ?? null,
        },
        {
            id: 'equity-value', title: 'Equity Value', level: 'risk-on', priority: 5,
            active: rey5yr !== null && rey5yr.value >= 3.0,
            detail: `Real EY: ${rey5yr?.value?.toFixed(2) ?? 'N/A'}% (trigger: ≥ 3%)`,
            tooltip: 'Attractive real earnings yield — equities offer good compensation above inflation. BUY signal for broad equity exposure.',
            date: rey5yr?.date ?? null,
        },
    ];

    const activeSignals = signals.filter(s => s.active);
    const highestSignal = activeSignals.length > 0
        ? activeSignals.sort((a, b) => a.priority - b.priority)[0]
        : { id: 'normal', title: 'Normal', level: 'risk-on' as const, priority: 6, active: true, detail: 'No stress signals active', tooltip: 'All metrics healthy — no stress signals firing. Standard balanced allocation applies.', date: null };

    const data = {
        refDate: refDate ?? null,
        sp500: sp500Sqlite ? { price: sp500Sqlite.value, date: sp500Sqlite.date } : null,
        sp500Date,
        regime: regimeRow ? {
            name: regimeRow.regime,
            entryDate: regimeRow.entry_date,
            months: regimeMonths,
            trigger: regimeRow.trigger_reason,
            color: REGIME_METADATA[regimeRow.regime as RegimeFamily]?.color ?? '#6b7280',
            description: REGIME_METADATA[regimeRow.regime as RegimeFamily]?.description ?? '',
            guidance: REGIME_METADATA[regimeRow.regime as RegimeFamily]?.guidance ?? '',
        } : null,
        liquidity: {
            regime: liquidityRegime.regime.name,
            score: liquidityRegime.score.total,
            metrics: {
                real3M: { value: real3M?.value ?? null, percentile: real3M?.percentile_rank ?? null },
                real10Y: { value: real10Y?.value ?? null, percentile: real10Y?.percentile_rank ?? null },
                yieldCurve: { value: yieldCurve?.value ?? null, percentile: yieldCurve?.percentile_rank ?? null },
                realM2: { value: realM2?.value ?? null, percentile: realM2?.percentile_rank ?? null },
            },
        },
        valuation: {
            regime: valuationRegime.regime.name,
            score: valuationRegime.score,
            metrics: {
                eyp5yr: { value: eyp5yr?.value ?? null, percentile: eyp5yr?.percentile_rank ?? null },
                rey5yr: { value: rey5yr?.value ?? null, percentile: rey5yr?.percentile_rank ?? null },
                pe5yr: { value: pe5yr?.value ?? null, percentile: pe5yr?.percentile_rank ?? null },
                ey5yr: { value: ey5yr?.value ?? null, percentile: ey5yr?.percentile_rank ?? null },
            },
        },
        price: {
            regime: priceRegime.regime.name,
            score: priceRegime.score,
            cpi: { value: cpi?.value ?? null, percentile: cpi?.percentile_rank ?? null },
        },
        trend: {
            direction: flowTrend.direction.label,
            stage: flowTrend.stage.label,
            pressure: flowTrend.pressure.label,
            risk: flowTrend.risk.label,
            pressureColor: flowTrend.pressure.color,
            slope: slope200MA?.value ?? null,
            divergence: div200MA?.value ?? null,
            streak: slopeStreak?.value ?? null,
            daysAbove: daysAbove?.value ?? null,
        },
        inputs: {
            fedFunds: { value: fedFunds?.value ?? null, percentile: fedFunds?.percentile_rank ?? null },
            irx: { value: irx?.value ?? null, percentile: irx?.percentile_rank ?? null },
            tnx: { value: tnx?.value ?? null, percentile: tnx?.percentile_rank ?? null },
            cpi: { value: cpi?.value ?? null, percentile: cpi?.percentile_rank ?? null },
        },
        signals: { all: signals, active: activeSignals, highest: highestSignal },
        proximityData: {
            real3M: { value: real3M?.value ?? null, percentile: real3M?.percentile_rank ?? null, date: real3M?.date ?? null },
            real10Y: { value: real10Y?.value ?? null, percentile: real10Y?.percentile_rank ?? null, date: real10Y?.date ?? null },
            realM2: { value: realM2?.value ?? null, percentile: realM2?.percentile_rank ?? null, date: realM2?.date ?? null },
            yieldCurve: { value: yieldCurve?.value ?? null, percentile: yieldCurve?.percentile_rank ?? null, date: yieldCurve?.date ?? null },
            eyp5yr: { value: eyp5yr?.value ?? null, percentile: eyp5yr?.percentile_rank ?? null, date: eyp5yr?.date ?? null },
            rey5yr: { value: rey5yr?.value ?? null, percentile: rey5yr?.percentile_rank ?? null, date: rey5yr?.date ?? null },
            fedFunds: { value: fedFunds?.value ?? null, percentile: fedFunds?.percentile_rank ?? null, date: fedFunds?.date ?? null },
            irx: { value: irx?.value ?? null, percentile: irx?.percentile_rank ?? null, date: irx?.date ?? null },
            tnx: { value: tnx?.value ?? null, percentile: tnx?.percentile_rank ?? null, date: tnx?.date ?? null },
            cpi: { value: cpi?.value ?? null, percentile: cpi?.percentile_rank ?? null, date: cpi?.date ?? null },
            pe5yr: { value: pe5yr?.value ?? null, percentile: pe5yr?.percentile_rank ?? null, date: pe5yr?.date ?? null },
            ey5yr: { value: ey5yr?.value ?? null, percentile: ey5yr?.percentile_rank ?? null, date: ey5yr?.date ?? null },
            slope200MA: { value: slope200MA?.value ?? null, percentile: slope200MA?.percentile_rank ?? null, date: slope200MA?.date ?? null },
            slope500MA: { value: null, percentile: null, date: null },
            divergence200MA: { value: div200MA?.value ?? null, percentile: div200MA?.percentile_rank ?? null, date: div200MA?.date ?? null },
            daysAbove200MA: { value: daysAbove?.value ?? null, percentile: daysAbove?.percentile_rank ?? null, date: daysAbove?.date ?? null },
            slopeStreak200MA: { value: slopeStreak?.value ?? null, percentile: slopeStreak?.percentile_rank ?? null, date: slopeStreak?.date ?? null },
        },
    };

    return <CockpitClient data={data} />;
}
