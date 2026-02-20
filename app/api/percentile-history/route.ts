import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        // Get all series data
        const series = [
            { key: 'cpi', asset_class: 'economic', series_name: 'CPI' },
            { key: 'fedfunds', asset_class: 'economic', series_name: 'US/FEDFUNDS' },
            { key: 'tnx', asset_class: 'bonds', series_name: 'US/TNX-Monthly' },
            { key: 'us2yr', asset_class: 'bonds', series_name: 'US/US-2yr-Monthly' },
            { key: 'irx', asset_class: 'bonds', series_name: 'US/IRX-Monthly' },
            { key: 'realyield', asset_class: 'derived', series_name: 'Real-Yield' },
            { key: 'yieldcurve', asset_class: 'derived', series_name: 'Yield-Curve' },
            { key: 'yieldcurve3m', asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M' },
            { key: 'shillerpe', asset_class: 'valuations', series_name: 'Shiller-PE' },
            { key: 'pe5yr', asset_class: 'valuations', series_name: 'PE-5yr' },
            { key: 'eyp', asset_class: 'derived', series_name: 'Earnings-Yield-Premium' },
            { key: 'eyp5yr', asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr' },
            { key: 'rey', asset_class: 'derived', series_name: 'Real-Earnings-Yield' },
        ];

        // Fetch data for each series
        const seriesData: Record<string, any[]> = {};

        for (const s of series) {
            const query = `
                SELECT 
                    date,
                    value,
                    percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ?
                  AND series_name = ?
                ORDER BY date ASC
            `;

            const rows = db.prepare(query).all(s.asset_class, s.series_name) as any[];
            seriesData[s.key] = rows;
        }

        // Combine all series data by date
        const dateMap = new Map<number, any>();

        for (const [key, rows] of Object.entries(seriesData)) {
            for (const row of rows) {
                if (!dateMap.has(row.date)) {
                    dateMap.set(row.date, {
                        date: new Date(row.date).toISOString().split('T')[0],
                        dateTimestamp: row.date
                    });
                }

                const point = dateMap.get(row.date)!;
                point[`${key}_value`] = row.value;
                point[`${key}_percentile`] = row.percentile_rank;
            }
        }

        // Convert map to array and sort by date
        const data = Array.from(dateMap.values()).sort((a, b) => a.dateTimestamp - b.dateTimestamp);

        db.close();

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error fetching percentile history:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
