import { PercentileService } from '@/lib/percentile-service';
import PercentileViewer from '@/components/percentile-viewer';
import PercentileChart from '@/components/charts/percentile-chart';
import Database from 'better-sqlite3';
import path from 'path';

async function getInitialData(year: number | 'latest') {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { readonly: true, timeout: 10000 });

    const series = [
        { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
        { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
        { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
        { asset_class: 'bonds', series_name: 'US/US-2yr-Monthly', key: 'us2yr' },
        { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
        { asset_class: 'valuations', series_name: 'Shiller-PE', key: 'shillerPE' },
        { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
        { asset_class: 'derived', series_name: 'Real-Yield', key: 'realYield' },
        { asset_class: 'derived', series_name: 'Yield-Curve', key: 'yieldCurve' },
        { asset_class: 'derived', series_name: 'Earnings-Yield-Premium', key: 'eyp' },
        { asset_class: 'derived', series_name: 'Real-Earnings-Yield', key: 'rey' },
    ];

    const result: any = { year };

    for (const s of series) {
        let query: string;
        let params: any[];

        if (year === 'latest') {
            // Get the most recent data point
            query = `
                SELECT asset_class, series_name, date, value, percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ?
                ORDER BY date DESC
                LIMIT 1
            `;
            params = [s.asset_class, s.series_name];
        } else {
            // Get year-end data for specific year
            const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();
            const q4Start = new Date(year, 9, 1).getTime();

            query = `
                SELECT asset_class, series_name, date, value, percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ?
                  AND date >= ? AND date <= ?
                ORDER BY date DESC
                LIMIT 1
            `;
            params = [s.asset_class, s.series_name, q4Start, yearEnd];
        }

        const row = db.prepare(query).get(...params) as any;

        if (row) {
            result[s.key] = {
                assetClass: row.asset_class,
                seriesName: row.series_name,
                date: row.date,
                dateStr: new Date(row.date).toISOString().split('T')[0],
                value: row.value,
                percentileRank: row.percentile_rank
            };
        } else {
            result[s.key] = null;
        }
    }

    db.close();
    return result;
}

export default async function PercentileAnalysisPage() {
    // Get available years
    const availableYears = PercentileService.getAvailableYears();

    // Get initial data for latest
    const initialData = await getInitialData('latest');

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    Analysis • Historical Percentiles
                </div>
                <h1 className="text-4xl font-bold mb-4">Percentile Analysis</h1>
                <p className="text-lg text-muted-foreground">
                    Historical context: Where do values rank compared to all past observations?
                </p>
            </div>

            {/* Methodology */}
            <div className="mb-8 p-6 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <h2 className="text-xl font-bold mb-3 text-blue-900 dark:text-blue-100">
                    📊 Methodology
                </h2>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    For each date, we calculate what percentile the current value represents compared to
                    <strong> all historical data up to that date</strong> (expanding window).
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                    <li>• 0th percentile = lowest value ever seen (up to that date)</li>
                    <li>• 50th percentile = median of all historical values</li>
                    <li>• 100th percentile = highest value ever seen (up to that date)</li>
                </ul>
            </div>

            {/* Interactive Viewer */}
            <PercentileViewer
                initialYear={9999}
                availableYears={availableYears}
                initialData={initialData}
            />

            {/* Historical Chart */}
            <div className="mb-8 mt-8">
                <PercentileChart height={500} />
            </div>

            {/* Percentile Scale Reference */}
            <div className="p-6 rounded-xl border bg-card">
                <h2 className="text-xl font-bold mb-4">Percentile Scale Reference</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="w-24 text-sm font-mono text-green-600 dark:text-green-400">0-25th</div>
                        <div className="flex-1 h-8 rounded bg-gradient-to-r from-green-500 to-green-400"></div>
                        <div className="w-48 text-sm">Bottom Quartile (Low)</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-24 text-sm font-mono text-blue-600 dark:text-blue-400">25-50th</div>
                        <div className="flex-1 h-8 rounded bg-gradient-to-r from-blue-500 to-blue-400"></div>
                        <div className="w-48 text-sm">Below Average</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-24 text-sm font-mono text-yellow-600 dark:text-yellow-400">50-75th</div>
                        <div className="flex-1 h-8 rounded bg-gradient-to-r from-yellow-500 to-yellow-400"></div>
                        <div className="w-48 text-sm">Above Average</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-24 text-sm font-mono text-red-600 dark:text-red-400">75-100th</div>
                        <div className="flex-1 h-8 rounded bg-gradient-to-r from-red-500 to-red-400"></div>
                        <div className="w-48 text-sm">Top Quartile (High)</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex gap-4">
                <a
                    href="/matrix"
                    className="px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all duration-200 border border-primary/20"
                >
                    ← Back to Matrix
                </a>
                <a
                    href="/matrix/chart"
                    className="px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all duration-200 border border-primary/20"
                >
                    View Charts →
                </a>
            </div>
        </div>
    );
}
