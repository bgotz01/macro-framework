import Database from 'better-sqlite3';
import path from 'path';

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

interface DecadeData {
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
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        let query: string;
        let params: any[];

        if (targetDate === 'latest') {
            // Get the most recent value
            query = `
                SELECT value, date
                FROM time_series
                WHERE asset_class = ? 
                  AND series_name = ? 
                  AND column_name = 'Value'
                ORDER BY date DESC
                LIMIT 1
            `;
            params = [assetClass, seriesName];
        } else {
            // Convert target date to timestamp
            const targetTimestamp = new Date(targetDate).getTime();

            // Find the closest date within 45 days (for monthly data)
            query = `
                SELECT value, date
                FROM time_series
                WHERE asset_class = ? 
                  AND series_name = ? 
                  AND column_name = 'Value'
                  AND ABS(date - ?) <= 45 * 24 * 60 * 60 * 1000
                ORDER BY ABS(date - ?)
                LIMIT 1
            `;
            params = [assetClass, seriesName, targetTimestamp, targetTimestamp];
        }

        const result = db.prepare(query).get(...params) as { value: number } | undefined;
        db.close();

        return result ? result.value : null;
    } catch (error) {
        console.error(`Error fetching ${assetClass}/${seriesName} at ${targetDate}:`, error);
        return null;
    }
}

async function getPercentileAtDate(assetClass: string, seriesName: string, targetDate: string): Promise<number | null> {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        let query: string;
        let params: any[];

        if (targetDate === 'latest') {
            // Get the most recent percentile
            query = `
                SELECT percentile_rank, date
                FROM percentile_analysis
                WHERE asset_class = ? 
                  AND series_name = ?
                ORDER BY date DESC
                LIMIT 1
            `;
            params = [assetClass, seriesName];
        } else {
            // Convert target date to timestamp
            const targetTimestamp = new Date(targetDate).getTime();

            // Find the closest date within 45 days (for monthly data)
            query = `
                SELECT percentile_rank, date
                FROM percentile_analysis
                WHERE asset_class = ? 
                  AND series_name = ? 
                  AND ABS(date - ?) <= 45 * 24 * 60 * 60 * 1000
                ORDER BY ABS(date - ?)
                LIMIT 1
            `;
            params = [assetClass, seriesName, targetTimestamp, targetTimestamp];
        }

        const result = db.prepare(query).get(...params) as { percentile_rank: number } | undefined;
        db.close();

        return result ? result.percentile_rank : null;
    } catch (error) {
        console.error(`Error fetching percentile for ${assetClass}/${seriesName} at ${targetDate}:`, error);
        return null;
    }
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
        { decade: 'Latest', date: 'latest' }, // Most recent data
    ];

    const data: DecadeData[] = [];

    for (const { decade, date } of decades) {
        const [cpi, tenYear, threeMonth, pe5yr, fedFunds, cpiPct, tenYearPct, threeMonthPct, pe5yrPct, fedFundsPct] = await Promise.all([
            getValueAtDate('economic', 'CPI', date),
            getValueAtDate('bonds', 'US/TNX', date),
            getValueAtDate('bonds', 'US/IRX', date),
            getValueAtDate('valuations', 'PE-5yr', date),
            getValueAtDate('economic', 'US/FEDFUNDS', date),
            getPercentileAtDate('economic', 'CPI', date),
            getPercentileAtDate('bonds', 'US/TNX-Monthly', date),
            getPercentileAtDate('bonds', 'US/IRX-Monthly', date),
            getPercentileAtDate('valuations', 'PE-5yr', date),
            getPercentileAtDate('economic', 'US/FEDFUNDS', date),
        ]);

        const realYield = tenYear !== null && cpi !== null ? tenYear - cpi : null;
        const yieldCurve = tenYear !== null && threeMonth !== null ? tenYear - threeMonth : null;
        const earningsYield5yr = pe5yr !== null && pe5yr > 0 ? (100 / pe5yr) : null;
        const earningsYieldPremium5yr = earningsYield5yr !== null && threeMonth !== null ? earningsYield5yr - threeMonth : null;
        const realEarningsYield5yr = earningsYield5yr !== null && cpi !== null ? earningsYield5yr - cpi : null;

        // Fetch percentiles for derived metrics
        const [realYieldPct, yieldCurvePct, eyp5yrPct, rey5yrPct] = await Promise.all([
            getPercentileAtDate('derived', 'Real-10Y', date),
            getPercentileAtDate('derived', 'Yield-Curve-10Y-3M', date),
            getPercentileAtDate('derived', 'Earnings-Yield-Premium-5yr', date),
            getPercentileAtDate('derived', 'Real-Earnings-Yield-5yr', date),
        ]);

        // Calculate outliers
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

        data.push({
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
        });
    }

    return data;
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
        { decade: 'Latest', date: 'latest' }, // Most recent data
    ];

    const data: DecadeData[] = [];

    for (const { decade, date } of cycles) {
        const [cpi, tenYear, threeMonth, pe5yr, fedFunds, cpiPct, tenYearPct, threeMonthPct, pe5yrPct, fedFundsPct] = await Promise.all([
            getValueAtDate('economic', 'CPI', date),
            getValueAtDate('bonds', 'US/TNX', date),
            getValueAtDate('bonds', 'US/IRX', date),
            getValueAtDate('valuations', 'PE-5yr', date),
            getValueAtDate('economic', 'US/FEDFUNDS', date),
            getPercentileAtDate('economic', 'CPI', date),
            getPercentileAtDate('bonds', 'US/TNX-Monthly', date),
            getPercentileAtDate('bonds', 'US/IRX-Monthly', date),
            getPercentileAtDate('valuations', 'PE-5yr', date),
            getPercentileAtDate('economic', 'US/FEDFUNDS', date),
        ]);

        const realYield = tenYear !== null && cpi !== null ? tenYear - cpi : null;
        const yieldCurve = tenYear !== null && threeMonth !== null ? tenYear - threeMonth : null;
        const earningsYield5yr = pe5yr !== null && pe5yr > 0 ? (100 / pe5yr) : null;
        const earningsYieldPremium5yr = earningsYield5yr !== null && threeMonth !== null ? earningsYield5yr - threeMonth : null;
        const realEarningsYield5yr = earningsYield5yr !== null && cpi !== null ? earningsYield5yr - cpi : null;

        // Fetch percentiles for derived metrics
        const [realYieldPct, yieldCurvePct, eyp5yrPct, rey5yrPct] = await Promise.all([
            getPercentileAtDate('derived', 'Real-10Y', date),
            getPercentileAtDate('derived', 'Yield-Curve-10Y-3M', date),
            getPercentileAtDate('derived', 'Earnings-Yield-Premium-5yr', date),
            getPercentileAtDate('derived', 'Real-Earnings-Yield-5yr', date),
        ]);

        // Calculate outliers
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

        data.push({
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
        });
    }

    return data;
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
            <div className="overflow-x-auto rounded-2xl border border-border shadow-lg">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                            <th className="border border-border p-4 text-left font-bold">Decade</th>
                            <th className="border border-border p-4 text-left font-bold">Year</th>
                            <th className="border border-border p-4 text-center font-bold">Inflation</th>
                            <th className="border border-border p-4 text-center font-bold">Fed Funds</th>
                            <th className="border border-border p-4 text-center font-bold">10Y Bond Yield</th>
                            <th className="border border-border p-4 text-center font-bold">Real 10Y Yield</th>
                            <th className="border border-border p-4 text-center font-bold">Yield Curve<br /><span className="text-xs font-normal">(10Y - 3M)</span></th>
                            <th className="border border-border p-4 text-center font-bold">P/E 5yr</th>
                            <th className="border border-border p-4 text-center font-bold">EY Premium 5yr<br /><span className="text-xs font-normal">(1/PE5yr - 3M)</span></th>
                            <th className="border border-border p-4 text-center font-bold">Real EY 5yr<br /><span className="text-xs font-normal">(EY5yr - CPI)</span></th>
                            <th className="border border-border p-4 text-center font-bold bg-purple-50 dark:bg-purple-950/30">Outlier 1</th>
                            <th className="border border-border p-4 text-center font-bold bg-indigo-50 dark:bg-indigo-950/30">Outlier 2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {decadeData.map((row) => {
                            const inflationLevel = getLevel(row.inflation, LEVELS.inflation);
                            const bondYieldLevel = getLevel(row.bondYield, LEVELS.bondYieldsNominal);
                            const realYieldLevel = getLevel(row.realYield, LEVELS.bondYieldsReal);
                            const fedFundsLevel = getLevel(row.fedFunds, LEVELS.fedFunds);
                            const yieldCurveLevel = getLevel(row.yieldCurve, LEVELS.yieldCurve);
                            const equityPE5yrLevel = getLevel(row.equityPE5yr, LEVELS.equityPE);
                            const earningsYieldPremium5yrLevel = getLevel(row.earningsYieldPremium5yr, LEVELS.earningsYield);
                            const realEarningsYield5yrLevel = getLevel(row.realEarningsYield5yr, LEVELS.earningsYield);

                            return (
                                <tr key={row.decade} className={`transition-colors ${row.decade === 'Latest' ? 'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 border-t-2 border-blue-300 dark:border-blue-700' : 'hover:bg-muted/30'}`}>
                                    <td className="border border-border p-4 font-bold text-lg">{row.decade}</td>
                                    <td className="border border-border p-4 text-sm text-muted-foreground">
                                        {row.date === 'latest' ? 'Current' : row.date.split('-')[0]}
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(inflationLevel)}`}>
                                                {inflationLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.inflation !== null ? `${row.inflation.toFixed(1)}%` : '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.inflationPercentile !== null ? `Pct: ${row.inflationPercentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(fedFundsLevel)}`}>
                                                {fedFundsLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.fedFunds !== null ? `${row.fedFunds.toFixed(1)}%` : '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.fedFundsPercentile !== null ? `Pct: ${row.fedFundsPercentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(bondYieldLevel)}`}>
                                                {bondYieldLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.bondYield !== null ? `${row.bondYield.toFixed(1)}%` : '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.bondYieldPercentile !== null ? `Pct: ${row.bondYieldPercentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(realYieldLevel)}`}>
                                                {realYieldLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.realYield !== null ? `${row.realYield.toFixed(1)}%` : '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.realYieldPercentile !== null ? `Pct: ${row.realYieldPercentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(yieldCurveLevel)}`}>
                                                {yieldCurveLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.yieldCurve !== null ? `${row.yieldCurve > 0 ? '+' : ''}${row.yieldCurve.toFixed(2)}%` : '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.yieldCurvePercentile !== null ? `Pct: ${row.yieldCurvePercentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(equityPE5yrLevel)}`}>
                                                {equityPE5yrLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.equityPE5yr !== null ? `${row.equityPE5yr.toFixed(1)}x` : '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.equityPE5yrPercentile !== null ? `Pct: ${row.equityPE5yrPercentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(earningsYieldPremium5yrLevel)}`}>
                                                {earningsYieldPremium5yrLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.earningsYieldPremium5yr !== null ? `${row.earningsYieldPremium5yr.toFixed(2)}%` : '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.earningsYieldPremium5yrPercentile !== null ? `Pct: ${row.earningsYieldPremium5yrPercentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(realEarningsYield5yrLevel)}`}>
                                                {realEarningsYield5yrLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.realEarningsYield5yr !== null ? `${row.realEarningsYield5yr.toFixed(2)}%` : '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.realEarningsYield5yrPercentile !== null ? `Pct: ${row.realEarningsYield5yrPercentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4 bg-purple-50 dark:bg-purple-950/30">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                                {row.outlier1?.metric || '-'}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.outlier1 && row.outlier1.value !== null && row.outlier1.value !== undefined
                                                    ? `${row.outlier1.value.toFixed(1)}${row.outlier1.metric.includes('P/E') ? 'x' : '%'}`
                                                    : '-'}
                                            </div>
                                            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                {row.outlier1 && row.outlier1.percentile !== null ? `Pct: ${row.outlier1.percentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4 bg-indigo-50 dark:bg-indigo-950/30">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                                {row.outlier2?.metric || '-'}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.outlier2 && row.outlier2.value !== null && row.outlier2.value !== undefined
                                                    ? `${row.outlier2.value.toFixed(1)}${row.outlier2.metric.includes('P/E') ? 'x' : '%'}`
                                                    : '-'}
                                            </div>
                                            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                {row.outlier2 && row.outlier2.percentile !== null ? `Pct: ${row.outlier2.percentile.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

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
                <div className="overflow-x-auto rounded-2xl border border-border shadow-lg">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                <th className="border border-border p-4 text-left font-bold">Cycle</th>
                                <th className="border border-border p-4 text-left font-bold">Year</th>
                                <th className="border border-border p-4 text-center font-bold">Inflation</th>
                                <th className="border border-border p-4 text-center font-bold">Fed Funds</th>
                                <th className="border border-border p-4 text-center font-bold">10Y Bond Yield</th>
                                <th className="border border-border p-4 text-center font-bold">Real 10Y Yield</th>
                                <th className="border border-border p-4 text-center font-bold">Yield Curve<br /><span className="text-xs font-normal">(10Y - 3M)</span></th>
                                <th className="border border-border p-4 text-center font-bold">P/E 5yr</th>
                                <th className="border border-border p-4 text-center font-bold">EY Premium 5yr<br /><span className="text-xs font-normal">(1/PE5yr - 3M)</span></th>
                                <th className="border border-border p-4 text-center font-bold">Real EY 5yr<br /><span className="text-xs font-normal">(EY5yr - CPI)</span></th>
                                <th className="border border-border p-4 text-center font-bold bg-purple-50 dark:bg-purple-950/30">Outlier 1</th>
                                <th className="border border-border p-4 text-center font-bold bg-indigo-50 dark:bg-indigo-950/30">Outlier 2</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cycleData.map((row) => {
                                const inflationLevel = getLevel(row.inflation, LEVELS.inflation);
                                const bondYieldLevel = getLevel(row.bondYield, LEVELS.bondYieldsNominal);
                                const realYieldLevel = getLevel(row.realYield, LEVELS.bondYieldsReal);
                                const fedFundsLevel = getLevel(row.fedFunds, LEVELS.fedFunds);
                                const yieldCurveLevel = getLevel(row.yieldCurve, LEVELS.yieldCurve);
                                const equityPE5yrLevel = getLevel(row.equityPE5yr, LEVELS.equityPE);
                                const earningsYieldPremium5yrLevel = getLevel(row.earningsYieldPremium5yr, LEVELS.earningsYield);
                                const realEarningsYield5yrLevel = getLevel(row.realEarningsYield5yr, LEVELS.earningsYield);

                                return (
                                    <tr key={row.decade} className={`transition-colors ${row.decade === 'Latest' ? 'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 border-t-2 border-blue-300 dark:border-blue-700' : 'hover:bg-muted/30'}`}>
                                        <td className="border border-border p-4 font-bold text-lg">{row.decade}</td>
                                        <td className="border border-border p-4 text-sm text-muted-foreground">
                                            {row.date === 'latest' ? 'Current' : row.date.split('-')[0]}
                                        </td>
                                        <td className="border border-border p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(inflationLevel)}`}>
                                                    {inflationLevel}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.inflation !== null ? `Pct: ${row.inflation.toFixed(1)}%` : '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.inflationPercentile !== null ? `Pct: ${row.inflationPercentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(fedFundsLevel)}`}>
                                                    {fedFundsLevel}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.fedFunds !== null ? `${row.fedFunds.toFixed(1)}%` : '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.fedFundsPercentile !== null ? `Pct: ${row.fedFundsPercentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(bondYieldLevel)}`}>
                                                    {bondYieldLevel}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.bondYield !== null ? `${row.bondYield.toFixed(1)}%` : '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.bondYieldPercentile !== null ? `Pct: ${row.bondYieldPercentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(realYieldLevel)}`}>
                                                    {realYieldLevel}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.realYield !== null ? `${row.realYield.toFixed(1)}%` : '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.realYieldPercentile !== null ? `Pct: ${row.realYieldPercentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(yieldCurveLevel)}`}>
                                                    {yieldCurveLevel}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.yieldCurve !== null ? `${row.yieldCurve > 0 ? '+' : ''}${row.yieldCurve.toFixed(2)}%` : '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.yieldCurvePercentile !== null ? `Pct: ${row.yieldCurvePercentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(equityPE5yrLevel)}`}>
                                                    {equityPE5yrLevel}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.equityPE5yr !== null ? `${row.equityPE5yr.toFixed(1)}x` : '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.equityPE5yrPercentile !== null ? `Pct: ${row.equityPE5yrPercentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(earningsYieldPremium5yrLevel)}`}>
                                                    {earningsYieldPremium5yrLevel}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.earningsYieldPremium5yr !== null ? `${row.earningsYieldPremium5yr.toFixed(2)}%` : '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.earningsYieldPremium5yrPercentile !== null ? `Pct: ${row.earningsYieldPremium5yrPercentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(realEarningsYield5yrLevel)}`}>
                                                    {realEarningsYield5yrLevel}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.realEarningsYield5yr !== null ? `${row.realEarningsYield5yr.toFixed(2)}%` : '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.realEarningsYield5yrPercentile !== null ? `Pct: ${row.realEarningsYield5yrPercentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-4 bg-purple-50 dark:bg-purple-950/30">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                                    {row.outlier1?.metric || '-'}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.outlier1 && row.outlier1.value !== null && row.outlier1.value !== undefined
                                                        ? `${row.outlier1.value.toFixed(1)}${row.outlier1.metric.includes('P/E') ? 'x' : '%'}`
                                                        : '-'}
                                                </div>
                                                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                    {row.outlier1 && row.outlier1.percentile !== null ? `Pct: ${row.outlier1.percentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-border p-4 bg-indigo-50 dark:bg-indigo-950/30">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                                    {row.outlier2?.metric || '-'}
                                                </div>
                                                <div className="text-sm font-mono">
                                                    {row.outlier2 && row.outlier2.value !== null && row.outlier2.value !== undefined
                                                        ? `${row.outlier2.value.toFixed(1)}${row.outlier2.metric.includes('P/E') ? 'x' : '%'}`
                                                        : '-'}
                                                </div>
                                                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                    {row.outlier2 && row.outlier2.percentile !== null ? `Pct: ${row.outlier2.percentile.toFixed(0)}%` : ''}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

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
