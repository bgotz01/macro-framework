import { prisma } from '@/lib/prisma';
import {
    calculateRegimeClassifications,
    buildSignals,
    getHighestPrioritySignal,
    buildRegimeData,
} from './cockpit-classifications';

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

export async function getCockpitData() {
    // Get latest S&P 500 date
    const gspcRows = await prisma.$queryRaw<{ date: string }[]>`
        SELECT date::text as date FROM macro_time_series
        WHERE asset_class = 'equities' AND series_name = 'US/GSPC' AND column_name = 'Value'
        ORDER BY date DESC LIMIT 1
    `;
    const sp500Date = gspcRows[0]?.date ?? null;

    // Reference date from REY (monthly aligned)
    const refRow = await prisma.$queryRaw<{ date: string }[]>`
        SELECT date::text as date FROM macro_percentile_analysis
        WHERE asset_class = 'derived' AND series_name = 'Real-Earnings-Yield-5yr'
        ORDER BY date DESC LIMIT 1`;
    const refDate = refRow[0]?.date?.slice(0, 10);

    // Fetch all metrics
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

    // S&P 500 latest price + regime state
    const [sp500Row, regimeRow] = await Promise.all([
        prisma.$queryRaw<{ date: string; value: number }[]>`
            SELECT date::text as date, value FROM macro_time_series
            WHERE asset_class = 'equities' AND series_name = 'US/GSPC' AND column_name = 'Value'
            AND date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
            ORDER BY date DESC LIMIT 1`,
        prisma.$queryRaw<{ date: string; regime: string; entry_date: string; trigger_reason: string }[]>`
            SELECT date::text as date, regime, entry_date::text as entry_date, trigger_reason
            FROM macro_regime_timeline ORDER BY date DESC LIMIT 1`,
    ]);
    const sp500Sqlite = sp500Row[0];
    const regimeRowData = regimeRow[0];

    // Calculate classifications using helper functions
    const { liquidity, valuation, price, flowTrend } = calculateRegimeClassifications(
        real3M, real10Y, yieldCurve, realM2, eyp5yr, rey5yr, cpi, slope200MA, div200MA, slopeStreak
    );

    // Build signals
    const signals = buildSignals(real10Y, rey5yr, eyp5yr, yieldCurve);
    const activeSignals = signals.filter(s => s.active);
    const highestSignal = getHighestPrioritySignal(signals);

    // Build regime data
    const regime = buildRegimeData(regimeRowData);

    return {
        refDate: refDate ?? null,
        sp500: sp500Sqlite ? { price: sp500Sqlite.value, date: sp500Sqlite.date } : null,
        sp500Date,
        regime,
        liquidity: {
            regime: liquidity.regime.name,
            score: liquidity.score.total,
            metrics: {
                real3M: { value: real3M?.value ?? null, percentile: real3M?.percentile_rank ?? null },
                real10Y: { value: real10Y?.value ?? null, percentile: real10Y?.percentile_rank ?? null },
                yieldCurve: { value: yieldCurve?.value ?? null, percentile: yieldCurve?.percentile_rank ?? null },
                realM2: { value: realM2?.value ?? null, percentile: realM2?.percentile_rank ?? null },
            },
        },
        valuation: {
            regime: valuation.regime.name,
            score: valuation.score,
            metrics: {
                eyp5yr: { value: eyp5yr?.value ?? null, percentile: eyp5yr?.percentile_rank ?? null },
                rey5yr: { value: rey5yr?.value ?? null, percentile: rey5yr?.percentile_rank ?? null },
                pe5yr: { value: pe5yr?.value ?? null, percentile: pe5yr?.percentile_rank ?? null },
                ey5yr: { value: ey5yr?.value ?? null, percentile: ey5yr?.percentile_rank ?? null },
            },
        },
        price: {
            regime: price.regime.name,
            score: price.score,
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
}
