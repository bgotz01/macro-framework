import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

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
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        let rows: { date: string; ma50: number; ma200: number; ma500: number }[];

        if (index === 'ndx') {
            // Compute MAs from raw daily NDX prices
            const prices = db.prepare(`
                SELECT date, value AS price
                FROM time_series
                WHERE series_name = 'NDX' AND column_name = 'Value'
                ORDER BY date ASC
            `).all() as { date: string; price: number }[];

            rows = prices
                .map((r, i) => {
                    if (i < 499) return null; // need at least 500 rows for 500MA
                    const win500 = prices.slice(i - 499, i + 1);
                    const win200 = win500.slice(300); // last 200
                    const win50 = win500.slice(450); // last 50
                    const avg = (arr: typeof prices) => arr.reduce((s, x) => s + x.price, 0) / arr.length;
                    return { date: r.date, ma50: avg(win50), ma200: avg(win200), ma500: avg(win500) };
                })
                .filter(Boolean) as { date: string; ma50: number; ma200: number; ma500: number }[];
        } else {
            // SP500 — use pre-computed MA series from percentile_analysis
            rows = db.prepare(`
                SELECT
                    ma50.date,
                    ma50.value  AS ma50,
                    ma200.value AS ma200,
                    ma500.value AS ma500
                FROM percentile_analysis ma50
                JOIN percentile_analysis ma200 ON ma50.date = ma200.date
                JOIN percentile_analysis ma500 ON ma50.date = ma500.date
                WHERE ma50.series_name  = 'SP500-MA50'
                  AND ma200.series_name = 'SP500-MA200'
                  AND ma500.series_name = 'SP500-MA500'
                ORDER BY ma50.date ASC
            `).all() as { date: string; ma50: number; ma200: number; ma500: number }[];
        }

        db.close();
        return NextResponse.json({ data: computeDivergences(rows), index });
    } catch (error) {
        console.error('Error fetching MA divergence data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
