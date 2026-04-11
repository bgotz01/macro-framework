import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SERIES = [
    { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
    { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
    { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
    { asset_class: 'bonds', series_name: 'US/US-2yr-Monthly', key: 'us2yr' },
    { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
    { asset_class: 'valuations', series_name: 'Shiller-PE', key: 'shillerPE' },
    { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
    { asset_class: 'valuations', series_name: 'Earnings-Yield', key: 'eyCAPE' },
    { asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', key: 'ey5yr' },
    { asset_class: 'derived', series_name: 'Real-10Y', key: 'realYield' },
    { asset_class: 'derived', series_name: 'Real-3M', key: 'realYield3m' },
    { asset_class: 'derived', series_name: 'Yield-Curve', key: 'yieldCurve' },
    { asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', key: 'yieldCurve3M' },
    { asset_class: 'derived', series_name: 'Earnings-Yield-Premium', key: 'eyp' },
    { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
    { asset_class: 'derived', series_name: 'Real-Earnings-Yield', key: 'rey' },
    { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },
];

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year') || '';
    const monthParam = searchParams.get('month') || '';

    const isLatest = yearParam === 'latest';
    const year = isLatest ? null : parseInt(yearParam);
    const month = monthParam ? parseInt(monthParam) : null;

    if (!isLatest && (!year || isNaN(year))) {
        return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
    }

    try {
        const result: any = { year: isLatest ? 'latest' : year, month };

        await Promise.all(SERIES.map(async (s) => {
            let rows: any[];

            if (isLatest) {
                rows = await prisma.$queryRaw`
                    SELECT asset_class, series_name, date::text as date,
                           value, percentile_rank, yoy_percentile_change
                    FROM macro_percentile_analysis
                    WHERE asset_class = ${s.asset_class} AND series_name = ${s.series_name}
                    ORDER BY date DESC LIMIT 1
                `;
            } else if (month) {
                const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
                const monthEnd = `${year}-${String(month).padStart(2, '0')}-31`;
                rows = await prisma.$queryRaw`
                    SELECT asset_class, series_name, date::text as date,
                           value, percentile_rank, yoy_percentile_change
                    FROM macro_percentile_analysis
                    WHERE asset_class = ${s.asset_class} AND series_name = ${s.series_name}
                      AND date >= ${monthStart}::date AND date <= ${monthEnd}::date
                    ORDER BY date DESC LIMIT 1
                `;
            } else {
                const q4Start = `${year}-10-01`;
                const yearEnd = `${year}-12-31`;
                rows = await prisma.$queryRaw`
                    SELECT asset_class, series_name, date::text as date,
                           value, percentile_rank, yoy_percentile_change
                    FROM macro_percentile_analysis
                    WHERE asset_class = ${s.asset_class} AND series_name = ${s.series_name}
                      AND date >= ${q4Start}::date AND date <= ${yearEnd}::date
                    ORDER BY date DESC LIMIT 1
                `;
            }

            const row = rows[0];
            result[s.key] = row ? {
                assetClass: row.asset_class,
                seriesName: row.series_name,
                date: row.date,
                value: row.value,
                percentileRank: row.percentile_rank,
                yoyPercentileChange: row.yoy_percentile_change,
            } : null;
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching percentile data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
