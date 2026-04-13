import { prisma } from '@/lib/prisma';
import { DecadeData } from '@/types/matrix';
import { DecadeTable } from '@/components/matrix/decade-table';
import { CycleTable } from '@/components/matrix/cycle-table';

// Threshold definitions (same as main matrix page)
const LEVELS = {
    inflation: { low: 3, mid: 6 },
    bondYieldsNominal: { low: 2, mid: 5 },
    bondYieldsReal: { low: 0, mid: 2 },
    yieldCurve: { low: -0.5, mid: 0.5 },
    equityPE: { low: 15, mid: 20 },
    earningsYield: { low: 5, mid: 6.67 }, // Inverse of P/E: 1/20 = 5%, 1/15 = 6.67%
    fedFunds: { low: 2, mid: 4 },
};

function getLevel(value: number | null, thresholds: { low: number; mid: number }): 'LOW' | 'MID' | 'HIGH' | '-' {
    if (value === null) return '-';
    if (value < thresholds.low) return 'LOW';
    if (value < thresholds.mid) return 'MID';
    return 'HIGH';
}

function getLevelColor(level: 'LOW' | 'MID' | 'HIGH' | '-'): string {
    switch (level) {
        case 'LOW': return 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100';
        case 'MID': return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100';
        case 'HIGH': return 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100';
        default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
    }
}

function calculateOutliers(metrics: Array<{ metric: string; value: number | null; percentile: number | null }>): {
    outlier1: { metric: string; value: number | null; percentile: number | null; distance: number } | null;
    outlier2: { metric: string; value: number | null; percentile: number | null; distance: number } | null;
} {
    // Calculate distance from 50th percentile for each metric
    const metricsWithDistance = metrics
        .filter(m => m.percentile !== null)
        .map(m => ({
            ...m,
            distance: Math.abs((m.percentile as number) - 50)
        }))
        .sort((a, b) => b.distance - a.distance);

    return {
        outlier1: metricsWithDistance[0] || null,
        outlier2: metricsWithDistance[1] || null,
    };
}

async function getValueAtDate(assetClass: string, seriesName: string, targetDate: string): Promise<number | null> {
    try {
        if (targetDate === 'latest') {
            const rows = await prisma.$queryRaw<{ value: number }[]>`
                SELECT value FROM macro_time_series
                WHERE asset_class = ${assetClass} AND series_name = ${seriesName} AND column_name = 'Value'
                ORDER BY date DESC LIMIT 1
            `;
            return rows[0]?.value ?? null;
        } else {
            const rows = await prisma.$queryRaw<{ value: number }[]>`
                SELECT value FROM macro_time_series
                WHERE asset_class = ${assetClass} AND series_name = ${seriesName} AND column_name = 'Value'
                  AND date <= ${targetDate}
                ORDER BY date DESC LIMIT 1
            `;
            return rows[0]?.value ?? null;
        }
    } catch (error) {
        console.error(`Error fetching ${assetClass}/${seriesName} at ${targetDate}:`, error);
        return null;
    }
}

async function getPercentileAtDate(assetClass: string, seriesName: string, targetDate: string): Promise<number | null> {
    try {
        if (targetDate === 'latest') {
            const rows = await prisma.$queryRaw<{ percentile_rank: number }[]>`
                SELECT percentile_rank FROM macro_percentile_analysis
                WHERE asset_class = ${assetClass} AND series_name = ${seriesName}
                ORDER BY date DESC LIMIT 1
            `;
            return rows[0]?.percentile_rank ?? null;
        } else {
            const rows = await prisma.$queryRaw<{ percentile_rank: number }[]>`
                SELECT percentile_rank FROM macro_percentile_analysis
                WHERE asset_class = ${assetClass} AND series_name = ${seriesName}
                  AND date <= ${targetDate}
                ORDER BY date DESC LIMIT 1
            `;
            return rows[0]?.percentile_rank ?? null;
        }
    } catch (error) {
        console.error(`Error fetching percentile for ${assetClass}/${seriesName} at ${targetDate}:`, error);
        return null;
    }
}

async function buildRowData(decade: string, date: string): Promise<DecadeData> {
    const [
        cpi, tenYear, pe5yr, fedFunds,
        realYield, yieldCurve, earningsYieldPremium5yr,
        cpiPct, tenYearPct, pe5yrPct, fedFundsPct,
        realYieldPct, yieldCurvePct, eyp5yrPct, rey5yrPct,
    ] = await Promise.all([
        // Raw values — use monthly series so dates align with derived series
        getValueAtDate('economic', 'CPI', date),
        getValueAtDate('bonds', 'US/TNX-Monthly', date),
        getValueAtDate('valuations', 'PE-5yr', date),
        getValueAtDate('economic', 'US/FEDFUNDS', date),
        // Derived values — pull directly from pre-computed series
        getValueAtDate('derived', 'Real-10Y', date),
        getValueAtDate('derived', 'Yield-Curve-10Y-3M', date),
        getValueAtDate('derived', 'Earnings-Yield-Premium-5yr', date),
        // Percentiles
        getPercentileAtDate('economic', 'CPI', date),
        getPercentileAtDate('bonds', 'US/TNX-Monthly', date),
        getPercentileAtDate('valuations', 'PE-5yr', date),
        getPercentileAtDate('economic', 'US/FEDFUNDS', date),
        getPercentileAtDate('derived', 'Real-10Y', date),
        getPercentileAtDate('derived', 'Yield-Curve-10Y-3M', date),
        getPercentileAtDate('derived', 'Earnings-Yield-Premium-5yr', date),
        getPercentileAtDate('derived', 'Real-Earnings-Yield-5yr', date),
    ]);

    const earningsYield5yr = pe5yr !== null && pe5yr > 0 ? (100 / pe5yr) : null;
    const realEarningsYield5yr = earningsYield5yr !== null && cpi !== null ? earningsYield5yr - cpi : null;

    const outliers = calculateOutliers([
        { metric: 'Inflation', value: cpi, percentile: cpiPct },
        { metric: 'Fed Funds', value: fedFunds, percentile: fedFundsPct },
        { metric: '10Y Yield', value: tenYear, percentile: tenYearPct },
        { metric: 'Real 10Y', value: realYield, percentile: realYieldPct },
        { metric: 'Yield Curve', value: yieldCurve, percentile: yieldCurvePct },
        { metric: 'P/E 5yr', value: pe5yr, percentile: pe5yrPct },
        { metric: 'EYP 5yr', value: earningsYieldPremium5yr, percentile: eyp5yrPct },
        { metric: 'Real EY 5yr', value: realEarningsYield5yr, percentile: rey5yrPct },
    ]);

    return {
        decade,
        date,
        inflation: cpi,
        bondYield: tenYear,
        realYield,
        yieldCurve,
        equityPE5yr: pe5yr,
        earningsYieldPremium5yr,
        realEarningsYield5yr,
        fedFunds,
        inflationPercentile: cpiPct,
        bondYieldPercentile: tenYearPct,
        realYieldPercentile: realYieldPct,
        yieldCurvePercentile: yieldCurvePct,
        equityPE5yrPercentile: pe5yrPct,
        earningsYieldPremium5yrPercentile: eyp5yrPct,
        realEarningsYield5yrPercentile: rey5yrPct,
        fedFundsPercentile: fedFundsPct,
        outlier1: outliers.outlier1,
        outlier2: outliers.outlier2,
    };
}

async function getDecadeData(): Promise<DecadeData[]> {
    const decades = [
        { decade: '1960s (mid)', date: '1964-12-31' },
        { decade: '1960s', date: '1969-12-31' },
        { decade: '1970s (mid)', date: '1974-12-31' },
        { decade: '1970s', date: '1979-12-31' },
        { decade: '1980s (mid)', date: '1984-12-31' },
        { decade: '1980s', date: '1989-12-31' },
        { decade: '1990s (mid)', date: '1994-12-31' },
        { decade: '1990s', date: '1999-12-31' },
        { decade: '2000s (mid)', date: '2004-12-31' },
        { decade: '2000s', date: '2009-12-31' },
        { decade: '2010s (mid)', date: '2014-12-31' },
        { decade: '2010s', date: '2019-12-31' },
        { decade: '2020s (mid)', date: '2024-12-31' },
        { decade: 'Latest', date: 'latest' },
    ];

    return Promise.all(decades.map(({ decade, date }) => buildRowData(decade, date)));
}

async function get12YearCycleData(): Promise<DecadeData[]> {
    const cycles = [
        { decade: '1948-1959 (mid)', date: '1953-12-31' },
        { decade: '1948-1959', date: '1959-12-31' },
        { decade: '1960-1971 (mid)', date: '1965-12-31' },
        { decade: '1960-1971', date: '1971-12-31' },
        { decade: '1972-1983 (mid)', date: '1977-12-31' },
        { decade: '1972-1983', date: '1983-12-31' },
        { decade: '1984-1995 (mid)', date: '1989-12-31' },
        { decade: '1984-1995', date: '1995-12-31' },
        { decade: '1996-2007 (mid)', date: '2001-12-31' },
        { decade: '1996-2007', date: '2007-12-31' },
        { decade: '2008-2019 (mid)', date: '2013-12-31' },
        { decade: '2008-2019', date: '2019-12-31' },
        { decade: '2020-2031 (mid)', date: '2024-12-31' },
        { decade: 'Latest', date: 'latest' },
    ];

    return Promise.all(cycles.map(({ decade, date }) => buildRowData(decade, date)));
}

export default async function DecadesPage() {
    const decadeData = await getDecadeData();
    const cycleData = await get12YearCycleData();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Historical Analysis
                </div>
                <h1 className="page-title text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Decade-End Regime Levels
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Macro regime levels at the end of each decade (December 31st)
                </p>
            </div>

            {/* Legend */}
            <div className="mb-8 p-6 rounded-2xl border border-border bg-card">
                <h3 className="text-lg font-bold mb-4">Level Definitions</h3>
                <div className="grid md:grid-cols-6 gap-4 text-sm">
                    <div>
                        <div className="font-semibold mb-2">Inflation</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 3%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 3-6%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 6%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Bond Yield</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 2%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 2-5%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 5%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Real 10Y Yield</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 0%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 0-2%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 2%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Fed Funds</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 2%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 2-4%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 4%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Yield Curve (10Y - 3M)</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>INV: &lt; -0.5%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>FLAT: -0.5 to 0.5%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>STEEP: &gt; 0.5%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">P/E 5yr</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>CHEAP: &lt; 15x</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>FAIR: 15-20x</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>EXP: &gt; 20x</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">EY Premium 5yr</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 6.67%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 5-6.67%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 5%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Real EY 5yr</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 6.67%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 5-6.67%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 5%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DecadeTable
                data={decadeData}
                getLevelColor={getLevelColor}
                getLevel={getLevel}
                levels={LEVELS}
            />

            {/* Insights */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="text-lg font-bold mb-3">📊 Key Observations</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• <strong>1970s:</strong> High inflation era with elevated bond yields</li>
                        <li>• <strong>1980s-1990s:</strong> Disinflation period with declining rates</li>
                        <li>• <strong>2000s-2010s:</strong> ZIRP environment with low inflation</li>
                        <li>• <strong>2020s:</strong> Return of inflation and rate normalization</li>
                    </ul>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="text-lg font-bold mb-3">💡 Framework Note</h3>
                    <p className="text-sm text-muted-foreground">
                        This view shows only the <strong>level</strong> dimension of the regime framework.
                        The full framework includes both level and direction (falling/stable/rising) to create
                        a 3×3 matrix for each measure. Historical analysis of directional trends requires
                        comparing values over time windows.
                    </p>
                </div>
            </div>

            {/* 12-Year Cycle Section */}
            <div className="mt-16">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                        12-Year Cycle Analysis
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                        12-Year Cycle Matrix Levels
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Macro regime levels at the end of each 12-year cycle (starting from 1948)
                    </p>
                </div>

                {/* Data Table */}
                <CycleTable
                    data={cycleData}
                    getLevelColor={getLevelColor}
                    getLevel={getLevel}
                    levels={LEVELS}
                />

                {/* 12-Year Cycle Insights */}
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="text-lg font-bold mb-3">🔄 Cycle Observations</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• <strong>1960-1971:</strong> Transition from stability to inflation</li>
                            <li>• <strong>1972-1983:</strong> High inflation and Volcker disinflation</li>
                            <li>• <strong>1984-1995:</strong> Great Moderation begins</li>
                            <li>• <strong>1996-2007:</strong> Tech boom and housing bubble</li>
                            <li>• <strong>2008-2019:</strong> Financial crisis and ZIRP era</li>
                            <li>• <strong>2020-2031:</strong> Pandemic, inflation return, rate normalization</li>
                        </ul>
                    </div>
                    <div className="p-6 rounded-2xl border border-border bg-card">
                        <h3 className="text-lg font-bold mb-3">📈 12-Year Cycle Framework</h3>
                        <p className="text-sm text-muted-foreground">
                            The 12-year cycle framework aligns with Jupiter's orbital period and has historically
                            corresponded with major economic and market regime shifts. This view captures end-of-cycle
                            conditions, showing how macro regimes evolve across longer structural periods compared
                            to decade-based analysis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
