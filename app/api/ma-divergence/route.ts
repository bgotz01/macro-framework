import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function computeDivergences(rows: { date: string; ma50: number; ma200: number; ma500: number }[]) {
    return rows.map(r => ({
        date: r.date,
        ma50: r.ma50,
        ma200: r.ma200,
        ma500: r.ma500,
        div_50_200: parseFloat(((r.ma50 - r.ma200) / r.ma200 * 100).toFixed(3)),
        div_200_500: parseFloat(((r.ma200 - r.ma500) / r.ma500 * 100).toFixed(3)),
    }));
}

export async function GET(request: NextRequest) {
    const index = request.nextUrl.searchParams.get('index') || 'sp500';

    try {
        let rows: { date: string; ma50: number; ma200: number; ma500: number }[];

        if (index === 'ndx') {
            const prices = await prisma.$queryRaw<{ date: string; price: number }[]>`
                SELECT date::text as date, value AS price
                FROM macro_time_series
                WHERE series_name = 'NDX' AND column_name = 'Value'
                ORDER BY date ASC
            `;

            rows = prices
                .map((r, i) => {
                    if (i < 499) return null;
                    const win500 = prices.slice(i - 499, i + 1);
                    const win200 = win500.slice(300);
                    const win50 = win500.slice(450);
                    const avg = (arr: typeof prices) => arr.reduce((s, x) => s + x.price, 0) / arr.length;
                    return { date: r.date, ma50: avg(win50), ma200: avg(win200), ma500: avg(win500) };
                })
                .filter(Boolean) as { date: string; ma50: number; ma200: number; ma500: number }[];
        } else {
            rows = await prisma.$queryRaw<{ date: string; ma50: number; ma200: number; ma500: number }[]>`
                SELECT
                    ma50.date::text as date,
                    ma50.value  AS ma50,
                    ma200.value AS ma200,
                    ma500.value AS ma500
                FROM macro_percentile_analysis ma50
                JOIN macro_percentile_analysis ma200 ON ma50.date = ma200.date
                JOIN macro_percentile_analysis ma500 ON ma50.date = ma500.date
                WHERE ma50.series_name  = 'SP500-MA50'
                  AND ma200.series_name = 'SP500-MA200'
                  AND ma500.series_name = 'SP500-MA500'
                ORDER BY ma50.date ASC
            `;
        }

        return NextResponse.json({ data: computeDivergences(rows), index });
    } catch (error) {
        console.error('Error fetching MA divergence data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
