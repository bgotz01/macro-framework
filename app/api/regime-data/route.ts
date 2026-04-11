import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SeriesConfig {
    asset_class: string;
    series_name: string;
    key: string;
    latestOnly?: boolean;
}

const SERIES: SeriesConfig[] = [
    { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
    { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
    { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
    { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
    { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
    { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },
    { asset_class: 'derived', series_name: 'Real-10Y', key: 'real10Y' },
    { asset_class: 'derived', series_name: 'Real-3M', key: 'real3M' },
    { asset_class: 'economic', series_name: 'Real-M2-YoY', key: 'realM2' },
    { asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', key: 'yieldCurve' },
    { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
    { asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', key: 'ey5yr' },
    { asset_class: 'derived', series_name: 'SP500-200MA-Slope', key: 'slope200MA', latestOnly: true },
    { asset_class: 'derived', series_name: 'SP500-500MA-Slope', key: 'slope500MA', latestOnly: true },
    { asset_class: 'derived', series_name: 'SP500-200MA-Div', key: 'divergence200MA', latestOnly: true },
    { asset_class: 'derived', series_name: 'SP500-200MA-PriceAboveStreak', key: 'daysAbove200MA', latestOnly: true },
    { asset_class: 'derived', series_name: 'SP500-200MA-SlopeStreak', key: 'slopeStreak200MA', latestOnly: true },
];

export async function GET(request: NextRequest) {
    const targetDate = request.nextUrl.searchParams.get('date') || 'latest';

    try {
        // Resolve reference date for monthly alignment
        let referenceDate: string | null = null;
        if (targetDate === 'latest') {
            const rows = await prisma.$queryRaw<{ date: string }[]>`
                SELECT date FROM macro_percentile_analysis
                WHERE asset_class = 'derived' AND series_name = 'Real-Earnings-Yield-5yr'
                ORDER BY date DESC LIMIT 1
            `;
            referenceDate = rows[0]?.date ?? null;
        }

        const result: any = {};

        await Promise.all(SERIES.map(async (s) => {
            let rows: { date: string; value: number; percentile_rank: number | null }[];

            if (targetDate === 'latest' && s.latestOnly) {
                rows = await prisma.$queryRaw`
                    SELECT date, value, percentile_rank
                    FROM macro_percentile_analysis
                    WHERE asset_class = ${s.asset_class} AND series_name = ${s.series_name}
                    ORDER BY date DESC LIMIT 1
                `;
            } else if (targetDate === 'latest' && referenceDate) {
                rows = await prisma.$queryRaw`
                    SELECT date, value, percentile_rank
                    FROM macro_percentile_analysis
                    WHERE asset_class = ${s.asset_class} AND series_name = ${s.series_name}
                      AND date <= ${referenceDate}
                    ORDER BY date DESC LIMIT 1
                `;
            } else if (targetDate === 'latest') {
                rows = await prisma.$queryRaw`
                    SELECT date, value, percentile_rank
                    FROM macro_percentile_analysis
                    WHERE asset_class = ${s.asset_class} AND series_name = ${s.series_name}
                    ORDER BY date DESC LIMIT 1
                `;
            } else {
                rows = await prisma.$queryRaw`
                    SELECT date, value, percentile_rank
                    FROM macro_percentile_analysis
                    WHERE asset_class = ${s.asset_class} AND series_name = ${s.series_name}
                      AND to_char(date::date, 'YYYY-MM') = to_char(${targetDate}::date, 'YYYY-MM')
                    ORDER BY date DESC LIMIT 1
                `;
            }

            const row = rows[0];
            result[s.key] = row
                ? { value: row.value, percentile: row.percentile_rank, date: row.date }
                : null;
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching regime data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
