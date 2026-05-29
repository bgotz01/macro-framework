import RealMatrixWrapper from '@/components/regime/real-matrix-wrapper';
import PercentileChart from '@/components/charts/percentile-chart';
import PageHeader from '@/components/page-header';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';

async function getLatestPercentiles() {
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
    let latestDate: string | null = null;

    for (const s of series) {
        const rows = await prisma.$queryRaw<{ value: number; percentile_rank: number; yoy_percentile_change: number; date: string }[]>`
            SELECT value, percentile_rank, yoy_percentile_change, date::text as date
            FROM macro_percentile_analysis
            WHERE asset_class = ${s.asset_class} AND series_name = ${s.series_name}
            ORDER BY date DESC LIMIT 1
        `;
        const row = rows[0];
        if (row) {
            result[s.key] = { percentile: row.percentile_rank, value: row.value, yoy: row.yoy_percentile_change, date: row.date };
            if (!latestDate || row.date < latestDate) latestDate = row.date;
        } else {
            result[s.key] = { percentile: null, value: null, yoy: null, date: null };
        }
    }

    return { data: result, latestDate };
}

export default async function RealPercentileMatrixPage() {
    const { data, latestDate } = await getLatestPercentiles();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <PageHeader title="PERCENTILE MATRIX" subtitle="Regime Detection" />

            <RealMatrixWrapper
                latestDataDate={latestDate || undefined}
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
