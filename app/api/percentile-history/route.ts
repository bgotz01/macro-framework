import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        // Get all percentile data for the metrics we want to chart
        // Using monthly series for consistency
        const series = [
            { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
            { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedfunds' },
            { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
            { asset_class: 'bonds', series_name: 'US/US-2yr-Monthly', key: 'us2yr' },
            { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
            { asset_class: 'valuations', series_name: 'Shiller-PE', key: 'shillerpe' },
            { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
            { asset_class: 'derived', series_name: 'Real-Yield', key: 'realyield' },
            { asset_class: 'derived', series_name: 'Yield-Curve', key: 'yieldcurve' },
            { asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', key: 'yieldcurve3m' },
            { asset_class: 'derived', series_name: 'Earnings-Yield-Premium', key: 'eyp' },
            { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
            { asset_class: 'derived', series_name: 'Real-Earnings-Yield', key: 'rey' },
        ];

        const dataMap = new Map();

        for (const s of series) {
            const query = `
                SELECT date, value, percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ?
                ORDER BY date ASC
            `;

            const results = db.prepare(query).all(s.asset_class, s.series_name) as any[];

            results.forEach(row => {
                const dateStr = new Date(row.date).toISOString().split('T')[0];

                if (!dataMap.has(row.date)) {
                    dataMap.set(row.date, {
                        date: dateStr,
                        dateTimestamp: row.date
                    });
                }

                const existing = dataMap.get(row.date);
                existing[`${s.key}_value`] = row.value;
                existing[`${s.key}_percentile`] = row.percentile_rank;
            });
        }

        db.close();

        const data = Array.from(dataMap.values())
            .sort((a, b) => a.dateTimestamp - b.dateTimestamp);

        return NextResponse.json({
            data,
            count: data.length
        });
    } catch (error) {
        console.error('Error fetching percentile history:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
