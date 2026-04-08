import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

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
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        // Resolve reference date (end-of-month for the target period)
        let refDate: string;
        if (targetDate === 'latest') {
            const row = db.prepare(`
                SELECT date FROM percentile_analysis
                WHERE asset_class = 'derived' AND series_name = 'Real-Earnings-Yield-5yr'
                ORDER BY date DESC LIMIT 1
            `).get() as { date: string } | undefined;
            refDate = row?.date ?? new Date().toISOString().split('T')[0];
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

        for (const s of SERIES) {
            // Current month row
            const cur = db.prepare(`
                SELECT date, percentile_rank FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ?
                  AND strftime('%Y-%m', date) = strftime('%Y-%m', ?)
                ORDER BY date DESC LIMIT 1
            `).get(s.asset_class, s.series_name, refDate) as { date: string; percentile_rank: number } | undefined;

            // Previous month row — go back one month from refDate
            const prev = db.prepare(`
                SELECT date, percentile_rank FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ?
                  AND date < date(?, 'start of month')
                ORDER BY date DESC LIMIT 1
            `).get(s.asset_class, s.series_name, refDate) as { date: string; percentile_rank: number } | undefined;

            const current = cur?.percentile_rank ?? null;
            const previous = prev?.percentile_rank ?? null;
            const delta = current !== null && previous !== null
                ? Math.round((current - previous) * 10) / 10
                : null;

            result[s.key] = {
                label: s.label,
                current,
                previous,
                delta,
                date: cur?.date ?? null,
                prevDate: prev?.date ?? null,
            };
        }

        db.close();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching percentile changes:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
