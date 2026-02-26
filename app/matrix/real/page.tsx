import RealMatrixWrapper from '@/components/real-matrix-wrapper';
import PercentileChart from '@/components/charts/percentile-chart';
import Database from 'better-sqlite3';
import path from 'path';

async function getLatestPercentiles() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { readonly: true, timeout: 10000 });

    const series = [
        { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
        { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
        { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
        { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
        { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
        { asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', key: 'ey5yr' },
        { asset_class: 'derived', series_name: 'Real-Yield', key: 'realYield' },
        { asset_class: 'derived', series_name: 'Real-Yield-3M', key: 'realYield3m' },
        { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },
        { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
    ];

    const result: any = {};

    for (const s of series) {
        const query = `
            SELECT asset_class, series_name, date, value, percentile_rank, yoy_percentile_change
            FROM percentile_analysis
            WHERE asset_class = ? AND series_name = ?
            ORDER BY date DESC
            LIMIT 1
        `;

        const row = db.prepare(query).get(s.asset_class, s.series_name) as any;

        if (row) {
            result[s.key] = {
                percentile: row.percentile_rank,
                value: row.value,
                yoy: row.yoy_percentile_change,
                date: new Date(row.date).toISOString().split('T')[0]
            };
        } else {
            result[s.key] = { percentile: null, value: null, yoy: null, date: null };
        }
    }

    db.close();
    return result;
}

export default async function RealPercentileMatrixPage() {
    const data = await getLatestPercentiles();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Real Metrics Percentile Matrix</h1>
                <p className="text-muted-foreground">
                    Historical percentile rankings for market and real (inflation-adjusted) metrics
                </p>
            </div>

            <RealMatrixWrapper
                initialPercentiles={{
                    cpi: data.cpi?.percentile || null,
                    fedFunds: data.fedFunds?.percentile || null,
                    tnx: data.tnx?.percentile || null,
                    irx: data.irx?.percentile || null,
                    pe5yr: data.pe5yr?.percentile || null,
                    ey5yr: data.ey5yr?.percentile || null,
                    realYield: data.realYield?.percentile || null,
                    realYield3m: data.realYield3m?.percentile || null,
                    rey5yr: data.rey5yr?.percentile || null,
                    eyp5yr: data.eyp5yr?.percentile || null,
                }}
                initialValues={{
                    cpi: { value: data.cpi?.value || null, yoy: data.cpi?.yoy || null },
                    fedFunds: { value: data.fedFunds?.value || null, yoy: data.fedFunds?.yoy || null },
                    tnx: { value: data.tnx?.value || null, yoy: data.tnx?.yoy || null },
                    irx: { value: data.irx?.value || null, yoy: data.irx?.yoy || null },
                    pe5yr: { value: data.pe5yr?.value || null, yoy: data.pe5yr?.yoy || null },
                    ey5yr: { value: data.ey5yr?.value || null, yoy: data.ey5yr?.yoy || null },
                    realYield: { value: data.realYield?.value || null, yoy: data.realYield?.yoy || null },
                    realYield3m: { value: data.realYield3m?.value || null, yoy: data.realYield3m?.yoy || null },
                    rey5yr: { value: data.rey5yr?.value || null, yoy: data.rey5yr?.yoy || null },
                    eyp5yr: { value: data.eyp5yr?.value || null, yoy: data.eyp5yr?.yoy || null },
                }}
            />

            {/* Historical Chart */}
            <div className="mt-8">
                <PercentileChart height={500} />
            </div>
        </div>
    );
}
