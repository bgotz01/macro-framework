import {
    calculateLiquidityRegime,
    calculateValuationRegime,
    calculatePriceRegime,
} from '@/lib/regime-config';
import { calculateFlowTrendState } from '@/lib/regime-config/flow-trend-config';
import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';

interface MetricValue {
    value: number | null;
    percentile_rank: number | null;
    date: string;
}

interface Signal {
    id: string;
    title: string;
    level: 'risk-off' | 'risk-on';
    priority: number;
    active: boolean;
    detail: string;
    tooltip: string;
    date: string | null;
}

export function calculateRegimeClassifications(
    real3M: MetricValue | null,
    real10Y: MetricValue | null,
    yieldCurve: MetricValue | null,
    realM2: MetricValue | null,
    eyp5yr: MetricValue | null,
    rey5yr: MetricValue | null,
    cpi: MetricValue | null,
    slope200MA: MetricValue | null,
    div200MA: MetricValue | null,
    slopeStreak: MetricValue | null
) {
    const liquidityRegime = calculateLiquidityRegime(
        real3M?.value ?? null,
        real10Y?.value ?? null,
        yieldCurve?.value ?? null,
        realM2?.value ?? null
    );

    const valuationRegime = calculateValuationRegime(
        eyp5yr?.value ?? null,
        rey5yr?.value ?? null
    );

    const priceRegime = calculatePriceRegime(cpi?.value ?? null);

    const flowTrend = calculateFlowTrendState(
        slope200MA?.value ?? null,
        div200MA?.value ?? null,
        slopeStreak?.value ?? null
    );

    return {
        liquidity: liquidityRegime,
        valuation: valuationRegime,
        price: priceRegime,
        flowTrend,
    };
}

export function calculateRegimeMonths(entryDate: string, currentDate: string): number {
    const entry = new Date(entryDate);
    const current = new Date(currentDate);
    return (current.getFullYear() - entry.getFullYear()) * 12 + (current.getMonth() - entry.getMonth());
}

export function buildSignals(
    real10Y: MetricValue | null,
    rey5yr: MetricValue | null,
    eyp5yr: MetricValue | null,
    yieldCurve: MetricValue | null
): Signal[] {
    return [
        {
            id: 'system-stress',
            title: 'Bond Stress',
            level: 'risk-off',
            priority: 1,
            active: real10Y !== null && real10Y.value !== null && real10Y.value < -0.5,
            detail: `Real 10Y: ${real10Y?.value?.toFixed(2) ?? 'N/A'}% (trigger: < -0.5%)`,
            tooltip: 'Financial system unanchored — bonds fail to preserve purchasing power. Rotate to gold / real assets.',
            date: real10Y?.date ?? null,
        },
        {
            id: 'real-ey-warning',
            title: 'Real EY Warning',
            level: 'risk-off',
            priority: 2,
            active: rey5yr !== null && rey5yr.value !== null && rey5yr.value < 0.5,
            detail: `Real EY: ${rey5yr?.value?.toFixed(2) ?? 'N/A'}% (trigger: < +0.5%)`,
            tooltip: 'Equities barely clearing inflation — reduce equity aggressiveness. First level of the multi-level valuation signal.',
            date: rey5yr?.date ?? null,
        },
        {
            id: 'real-ey-sell',
            title: 'Real EY Sell',
            level: 'risk-off',
            priority: 2,
            active: rey5yr !== null && rey5yr.value !== null && rey5yr.value < -1,
            detail: `Real EY: ${rey5yr?.value?.toFixed(2) ?? 'N/A'}% (trigger: < -1%)`,
            tooltip: 'Equities failing to clear inflation — SELL / underweight equities. Rotate to bonds (if Real 10Y > 0%) or gold.',
            date: rey5yr?.date ?? null,
        },
        {
            id: 'equity-danger',
            title: 'Equity Danger',
            level: 'risk-off',
            priority: 3,
            active: eyp5yr !== null && yieldCurve !== null &&
                eyp5yr.value !== null && yieldCurve.value !== null &&
                eyp5yr.value < -1 && yieldCurve.value < 0,
            detail: `EYP: ${eyp5yr?.value?.toFixed(2) ?? 'N/A'}%, YC: ${yieldCurve?.value?.toFixed(2) ?? 'N/A'}%`,
            tooltip: 'Expensive equities + inverted yield curve = broken liquidity transmission. Poor carry and growth cannot be financed.',
            date: eyp5yr?.date ?? null,
        },
        {
            id: 'growth',
            title: 'Growth Signal',
            level: 'risk-on',
            priority: 4,
            active: eyp5yr !== null && yieldCurve !== null &&
                eyp5yr.value !== null && yieldCurve.value !== null &&
                eyp5yr.value < -1 && yieldCurve.value > 0,
            detail: `EYP: ${eyp5yr?.value?.toFixed(2) ?? 'N/A'}%, YC: ${yieldCurve?.value?.toFixed(2) ?? 'N/A'}%`,
            tooltip: 'Positive yield curve enables financing of duration — growth compensates for weak carry. Favor high-growth equities.',
            date: eyp5yr?.date ?? null,
        },
        {
            id: 'equity-value',
            title: 'Equity Value',
            level: 'risk-on',
            priority: 5,
            active: rey5yr !== null && rey5yr.value !== null && rey5yr.value >= 3.0,
            detail: `Real EY: ${rey5yr?.value?.toFixed(2) ?? 'N/A'}% (trigger: ≥ 3%)`,
            tooltip: 'Attractive real earnings yield — equities offer good compensation above inflation. BUY signal for broad equity exposure.',
            date: rey5yr?.date ?? null,
        },
    ];
}

export function getHighestPrioritySignal(signals: Signal[]): Signal {
    const activeSignals = signals.filter(s => s.active);

    if (activeSignals.length > 0) {
        return activeSignals.sort((a, b) => a.priority - b.priority)[0];
    }

    return {
        id: 'normal',
        title: 'Normal',
        level: 'risk-on',
        priority: 6,
        active: true,
        detail: 'No stress signals active',
        tooltip: 'All metrics healthy — no stress signals firing. Standard balanced allocation applies.',
        date: null,
    };
}

export function buildRegimeData(
    regimeRowData: { regime: string; entry_date: string; trigger_reason: string; date: string } | null
) {
    if (!regimeRowData) return null;

    const regimeMonths = calculateRegimeMonths(regimeRowData.entry_date, regimeRowData.date);

    return {
        name: regimeRowData.regime,
        entryDate: regimeRowData.entry_date,
        months: regimeMonths,
        trigger: regimeRowData.trigger_reason,
        color: REGIME_METADATA[regimeRowData.regime as RegimeFamily]?.color ?? '#6b7280',
        description: REGIME_METADATA[regimeRowData.regime as RegimeFamily]?.description ?? '',
        guidance: REGIME_METADATA[regimeRowData.regime as RegimeFamily]?.guidance ?? '',
    };
}
