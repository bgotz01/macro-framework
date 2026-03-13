// Type definitions for regime parameters

export interface MetricData {
    value: number | null;
    percentile: number | null;
    date: string | null;
}

export interface RegimeData {
    // Input Variables
    fedFunds: MetricData;
    irx: MetricData;
    tnx: MetricData;
    cpi: MetricData;
    eyp5yr: MetricData;
    rey5yr: MetricData;

    // Liquidity
    real10Y: MetricData;
    real3M: MetricData;
    realM2: MetricData;
    yieldCurve: MetricData;

    // Valuation
    pe5yr: MetricData;
    ey5yr: MetricData;

    // Flow/Trend (200MA metrics)
    slope200MA: MetricData;
    divergence200MA: MetricData;
    daysAbove200MA: MetricData;
    slopeStreak200MA: MetricData;
}

export type RegimeDataKey =
    | 'fedFunds'
    | 'irx'
    | 'tnx'
    | 'cpi'
    | 'eyp5yr'
    | 'rey5yr'
    | 'real10Y'
    | 'real3M'
    | 'realM2'
    | 'yieldCurve'
    | 'pe5yr'
    | 'ey5yr'
    | 'slope200MA'
    | 'divergence200MA'
    | 'daysAbove200MA'
    | 'slopeStreak200MA';
