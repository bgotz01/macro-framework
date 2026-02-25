import CompactRegimeMatrix from '@/components/compact-regime-matrix';
import CompactMatrixPercentile from '@/components/compact-matrix-percentile';
import { DataServiceNew } from '@/lib/data-service-new';
import Database from 'better-sqlite3';
import path from 'path';

async function getLatestValue(assetClass: string, seriesName: string): Promise<{ value: number | null; date: string | null }> {
    try {
        const data = await DataServiceNew.loadCSV(`${assetClass}/${seriesName}`);
        if (data.data && data.data.length > 0) {
            const latest = data.data[data.data.length - 1];
            const columns = Object.keys(latest).filter(k => k !== 'date');
            const value = columns.length > 0 ? latest[columns[0]] : null;
            const dateStr = latest.date as string;
            return {
                value: typeof value === 'number' ? value : null,
                date: dateStr,
            };
        }
        return { value: null, date: null };
    } catch (error) {
        console.error(`Error fetching ${assetClass}/${seriesName}:`, error);
        return { value: null, date: null };
    }
}

async function getLatestPercentile(assetClass: string, seriesName: string): Promise<{ value: number | null; percentile: number | null; date: string | null }> {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        const query = `
            SELECT value, percentile_rank, date
            FROM percentile_analysis
            WHERE asset_class = ? AND series_name = ?
            ORDER BY date DESC
            LIMIT 1
        `;

        const result = db.prepare(query).get(assetClass, seriesName) as { value: number; percentile_rank: number; date: string } | undefined;
        db.close();

        if (result) {
            return { value: result.value, percentile: result.percentile_rank, date: result.date };
        }
        return { value: null, percentile: null, date: null };
    } catch (error) {
        console.error(`Error fetching percentile for ${assetClass}/${seriesName}:`, error);
        return { value: null, percentile: null, date: null };
    }
}

export default async function HistoricalMatrixPage() {
    // Fetch all data server-side
    const [cpi, tenYear, twoYear, threeMonth, shillerPE, fedFunds, pe5yr, earningsYield5yr] = await Promise.all([
        getLatestValue('economic', 'CPI'),
        getLatestValue('bonds', 'US/TNX'),
        getLatestValue('bonds', 'US/US-2yr'),
        getLatestValue('bonds', 'US/IRX'),
        getLatestValue('valuations', 'Shiller-PE'),
        getLatestValue('economic', 'US/FEDFUNDS'),
        getLatestValue('valuations', 'PE-5yr'),
        getLatestValue('valuations', 'Earnings-Yield-5yr'),
    ]);

    // Fetch percentile data
    const [cpiPerc, tenYearPerc, twoYearPerc, shillerPEPerc, fedFundsPerc, pe5yrPerc] = await Promise.all([
        getLatestPercentile('economic', 'CPI'),
        getLatestPercentile('bonds', 'US/TNX-Monthly'),
        getLatestPercentile('bonds', 'US/US-2yr-Monthly'),
        getLatestPercentile('valuations', 'Shiller-PE'),
        getLatestPercentile('economic', 'US/FEDFUNDS'),
        getLatestPercentile('valuations', 'PE-5yr'),
    ]);

    // Get derived percentiles
    const realYieldPerc = await getLatestPercentile('derived', 'Real-Yield');
    const yieldCurvePerc = await getLatestPercentile('derived', 'Yield-Curve');
    const eypPerc = await getLatestPercentile('derived', 'Earnings-Yield-Premium');
    const reyPerc = await getLatestPercentile('derived', 'Real-Earnings-Yield');
    const eyp5yrPerc = await getLatestPercentile('derived', 'Earnings-Yield-Premium-5yr');
    const rey5yrPerc = await getLatestPercentile('derived', 'Real-Earnings-Yield-5yr');

    // Calculate Real Yield value (for display)
    const realYieldValue = tenYear.value !== null && cpi.value !== null ? tenYear.value - cpi.value : null;
    const realYieldDate = tenYear.date && cpi.date ? (tenYear.date > cpi.date ? cpi.date : tenYear.date) : null;

    const initialValues = {
        inflation: cpi.value,
        bondYieldNominal: tenYear.value,
        bondYieldReal: tenYear.value !== null && cpi.value !== null ? tenYear.value - cpi.value : null,
        yieldCurve: tenYear.value !== null && twoYear.value !== null ? tenYear.value - twoYear.value : null,
        equityPE: shillerPE.value,
        fedFunds: fedFunds.value,
        earningsYieldPremium: shillerPE.value !== null && shillerPE.value > 0 && threeMonth.value !== null
            ? (100 / shillerPE.value) - threeMonth.value
            : null,
        realEarningsYield: shillerPE.value !== null && shillerPE.value > 0 && cpi.value !== null
            ? (100 / shillerPE.value) - cpi.value
            : null,
        // 5-year metrics
        equityPE5yr: pe5yr.value,
        earningsYieldPremium5yr: earningsYield5yr.value !== null && threeMonth.value !== null
            ? earningsYield5yr.value - threeMonth.value
            : null,
        realEarningsYield5yr: earningsYield5yr.value !== null && cpi.value !== null
            ? earningsYield5yr.value - cpi.value
            : null,
    };

    const initialDates = {
        inflation: cpi.date,
        bondYieldNominal: tenYear.date,
        bondYieldReal: tenYear.date && cpi.date ? (tenYear.date > cpi.date ? cpi.date : tenYear.date) : null,
        yieldCurve: tenYear.date && twoYear.date ? (tenYear.date > twoYear.date ? twoYear.date : tenYear.date) : null,
        fedFunds: fedFunds.date,
        equityPE: shillerPE.date,
        earningsYieldPremium: shillerPE.date && threeMonth.date ? (shillerPE.date > threeMonth.date ? threeMonth.date : shillerPE.date) : null,
        realEarningsYield: shillerPE.date && cpi.date ? (shillerPE.date > cpi.date ? cpi.date : shillerPE.date) : null,
        equityPE5yr: pe5yr.date,
        earningsYieldPremium5yr: earningsYield5yr.date && threeMonth.date ? (earningsYield5yr.date > threeMonth.date ? threeMonth.date : earningsYield5yr.date) : null,
        realEarningsYield5yr: earningsYield5yr.date && cpi.date ? (earningsYield5yr.date > cpi.date ? cpi.date : earningsYield5yr.date) : null,
    };

    const initialPercentileValues = {
        inflation: {
            percentile: cpiPerc.percentile,
            value: cpiPerc.value
        },
        bondYieldNominal: {
            percentile: tenYearPerc.percentile,
            value: tenYearPerc.value
        },
        bondYieldReal: {
            percentile: realYieldPerc.percentile,
            value: realYieldValue
        },
        yieldCurve: {
            percentile: yieldCurvePerc.percentile,
            value: yieldCurvePerc.value
        },
        fedFunds: {
            percentile: fedFundsPerc.percentile,
            value: fedFundsPerc.value
        },
        equityPE: {
            percentile: shillerPEPerc.percentile,
            value: shillerPEPerc.value
        },
        earningsYieldPremium: {
            percentile: eypPerc.percentile,
            value: eypPerc.value
        },
        realEarningsYield: {
            percentile: reyPerc.percentile,
            value: reyPerc.value
        },
        // 5-year metrics
        equityPE5yr: {
            percentile: pe5yrPerc.percentile,
            value: pe5yrPerc.value
        },
        earningsYieldPremium5yr: {
            percentile: eyp5yrPerc.percentile,
            value: eyp5yrPerc.value
        },
        realEarningsYield5yr: {
            percentile: rey5yrPerc.percentile,
            value: rey5yrPerc.value
        },
    };

    const initialPercentileDates = {
        inflation: cpiPerc.date,
        bondYieldNominal: tenYearPerc.date,
        bondYieldReal: realYieldPerc.date,
        yieldCurve: yieldCurvePerc.date,
        fedFunds: fedFundsPerc.date,
        equityPE: shillerPEPerc.date,
        earningsYieldPremium: eypPerc.date,
        realEarningsYield: reyPerc.date,
        equityPE5yr: pe5yrPerc.date,
        earningsYieldPremium5yr: eyp5yrPerc.date,
        realEarningsYield5yr: rey5yrPerc.date,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Historical Analysis
                </div>
                <h1 className="page-title text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Historical Regime Matrix
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Explore macro regime conditions across different time periods
                </p>
            </div>

            {/* Compact Regime Matrix */}
            <CompactRegimeMatrix initialValues={initialValues} initialDates={initialDates} />

            {/* Compact Matrix Percentile */}
            <div className="mt-12">
                <CompactMatrixPercentile initialValues={initialPercentileValues} initialDates={initialPercentileDates} />
            </div>

            {/* Insights */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="text-lg font-bold mb-3">📊 How to Use</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Select any month and year to view historical regime conditions</li>
                        <li>• Color-coded borders indicate regime levels (green=low, yellow=mid, red=high)</li>
                        <li>• Compare different time periods to understand regime shifts</li>
                        <li>• Use this to analyze how macro conditions evolved over time</li>
                    </ul>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="text-lg font-bold mb-3">💡 Framework Note</h3>
                    <p className="text-sm text-muted-foreground">
                        This view shows the <strong>level</strong> dimension of the regime framework at specific points in time.
                        The full framework includes both level and direction (falling/stable/rising) to create
                        a 3×3 matrix for each measure. Use the main Matrix page to see current conditions with directional trends.
                    </p>
                </div>
            </div>
        </div>
    );
}
