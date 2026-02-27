import RealMatrixWrapper from '@/components/regime/real-matrix-wrapper';
import PercentileChart from '@/components/charts/percentile-chart';
import Database from 'better-sqlite3';
import path from 'path';
import { Suspense } from 'react';

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
        { asset_class: 'derived', series_name: 'Real-10Y', key: 'real10Y' },
        { asset_class: 'derived', series_name: 'Real-3M', key: 'real3M' },
        { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },
        { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
        { asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', key: 'yieldCurve' },
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
                <h1 className="text-3xl font-light tracking-wider mb-1" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}>
                    CAPITAL PHYSICS
                </h1>
                <p className="text-sm font-light text-muted-foreground tracking-widest uppercase" style={{ letterSpacing: '0.2em' }}>
                    Regime Detection
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
                    real10Y: data.real10Y?.percentile || null,
                    real3M: data.real3M?.percentile || null,
                    rey5yr: data.rey5yr?.percentile || null,
                    eyp5yr: data.eyp5yr?.percentile || null,
                    yieldCurve: data.yieldCurve?.percentile || null,
                }}
                initialValues={{
                    cpi: { value: data.cpi?.value || null, yoy: data.cpi?.yoy || null },
                    fedFunds: { value: data.fedFunds?.value || null, yoy: data.fedFunds?.yoy || null },
                    tnx: { value: data.tnx?.value || null, yoy: data.tnx?.yoy || null },
                    irx: { value: data.irx?.value || null, yoy: data.irx?.yoy || null },
                    pe5yr: { value: data.pe5yr?.value || null, yoy: data.pe5yr?.yoy || null },
                    ey5yr: { value: data.ey5yr?.value || null, yoy: data.ey5yr?.yoy || null },
                    real10Y: { value: data.real10Y?.value || null, yoy: data.real10Y?.yoy || null },
                    real3M: { value: data.real3M?.value || null, yoy: data.real3M?.yoy || null },
                    rey5yr: { value: data.rey5yr?.value || null, yoy: data.rey5yr?.yoy || null },
                    eyp5yr: { value: data.eyp5yr?.value || null, yoy: data.eyp5yr?.yoy || null },
                    yieldCurve: { value: data.yieldCurve?.value || null, yoy: data.yieldCurve?.yoy || null },
                }}
            />

            {/* Historical Chart */}
            <div className="mt-8">
                <Suspense fallback={<div className="h-[500px] flex items-center justify-center">Loading chart...</div>}>
                    <PercentileChart height={500} />
                </Suspense>
            </div>
        </div>
    );
}
