import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SERIES = [
    { key: 'fedFunds', asset_class: 'economic', series_name: 'US/FEDFUNDS', label: 'Fed Rate' },
    { key: 'irx', asset_class: 'bonds', series_name: 'US/IRX-Monthly', label: '3M Yield' },
    { key: 'tnx', asset_class: 'bonds', series_name: 'US/TNX-Monthly', label: '10Y Yield' },
    { key: 'cpi', asset_class: 'economic', series_name: 'CPI', label: 'CPI' },
    { key: 'realM2', asset_class: 'economic', series_name: 'Real-M2-YoY', label: 'Real M2' },
    { key: 'pe5yr', asset_class: 'valuations', series_name: 'PE-5yr', label: 'PE 5yr' },
    { key: 'ey5yr', asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', label: 'EY 5yr' },
    { key: 'eyp5yr', asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', label: 'EYP 5yr' },
    { key: 'rey5yr', asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', label: 'Real EY' },
    { key: 'real10Y', asset_class: 'derived', series_name: 'Real-10Y', label: 'Real 10Y' },
    { key: 'real3M', asset_class: 'derived', series_name: 'Real-3M', label: 'Real 3M' },
    { key: 'yieldCurve', asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', label: 'Yield Curve' },
];

export async function GET(request: NextRequest) {
    const targetDate = request.nextUrl.searchParams.get('date') || 'latest';

    try {
        let refDate: string;
        if (targetDate === 'latest') {
            const rows = await prisma.$queryRaw<{ date: string }[]>`
                SELECT date::text as date FROM macro_percentile_analysis
                WHERE asset_class = 'derived' AND series_name = 'Real-Earnings-Yield-5yr'
                ORDER BY date DESC LIMIT 1
            `;
            refDate = rows[0]?.date ?? new Date().toISOString().split('T')[0];
        } else {
            refDate = targetDate;
        }

        const result: Record<string, {
            label: string;
            current: number | null;
            previous: number | null;
            delta: number | null;
            date: string | null;
            prevDate: string | null;
        }> = {};

        await Promise.all(SERIES.map(async (s) => {
            const [curRows] = await Promise.all([
                prisma.$queryRaw<{ date: string; percentile_rank: number }[]>`
                    SELECT date::text as date, percentile_rank
                    FROM macro_percentile_analysis
                    WHERE asset_class = ${s.asset_class}
                      AND series_name = ${s.series_name}
                      AND date <= ${refDate}
                    ORDER BY date DESC LIMIT 1
                `,
            ]);

            const current = curRows[0]?.percentile_rank ?? null;
            const currentDate = curRows[0]?.date ?? null;

            // Get previous month relative to the actual current date found (not refDate)
            // so delta is always month-over-month even when series lags behind
            const prevRows = currentDate ? await prisma.$queryRaw<{ date: string; percentile_rank: number }[]>`
                SELECT date::text as date, percentile_rank
                FROM macro_percentile_analysis
                WHERE asset_class = ${s.asset_class}
                  AND series_name = ${s.series_name}
                  AND LEFT(date, 7) < LEFT(${currentDate}, 7)
                ORDER BY date DESC LIMIT 1
            ` : [];

            const previous = prevRows[0]?.percentile_rank ?? null;
            const delta = current !== null && previous !== null
                ? Math.round((current - previous) * 10) / 10
                : null;

            result[s.key] = {
                label: s.label,
                current,
                previous,
                delta,
                date: currentDate,
                prevDate: prevRows[0]?.date ?? null,
            };
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching percentile changes:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
