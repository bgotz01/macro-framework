export interface DecadeData {
    decade: string;
    date: string;
    inflation: number | null;
    bondYield: number | null;
    realYield: number | null;
    yieldCurve: number | null;
    equityPE5yr: number | null;
    earningsYieldPremium5yr: number | null;
    realEarningsYield5yr: number | null;
    fedFunds: number | null;
    inflationPercentile: number | null;
    bondYieldPercentile: number | null;
    realYieldPercentile: number | null;
    yieldCurvePercentile: number | null;
    equityPE5yrPercentile: number | null;
    earningsYieldPremium5yrPercentile: number | null;
    realEarningsYield5yrPercentile: number | null;
    fedFundsPercentile: number | null;
    outlier1: { metric: string; value: number | null; percentile: number | null; distance: number } | null;
    outlier2: { metric: string; value: number | null; percentile: number | null; distance: number } | null;
}
