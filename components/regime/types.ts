export interface PercentileValues {
    cpi: number | null;
    fedFunds: number | null;
    tnx: number | null;
    irx: number | null;
    pe5yr: number | null;
    ey5yr: number | null;
    real10Y: number | null;
    real3M: number | null;
    rey5yr: number | null;
    eyp5yr: number | null;
    yieldCurve: number | null;
}

export interface MetricValue {
    value: number | null;
    yoy: number | null;
}

export interface MetricValues {
    cpi: MetricValue;
    fedFunds: MetricValue;
    tnx: MetricValue;
    irx: MetricValue;
    pe5yr: MetricValue;
    ey5yr: MetricValue;
    real10Y: MetricValue;
    real3M: MetricValue;
    rey5yr: MetricValue;
    eyp5yr: MetricValue;
    yieldCurve: MetricValue;
}
