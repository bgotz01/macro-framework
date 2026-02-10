import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || '');

    if (!year || isNaN(year)) {
        return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 });
    }

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        // Define all series to fetch
        const series = [
            { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
            { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
            { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
            { asset_class: 'bonds', series_name: 'US/US-2yr-Monthly', key: 'us2yr' },
            { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
            { asset_class: 'valuations', series_name: 'Shiller-PE', key: 'shillerPE' },
            { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
            { asset_class: 'derived', series_name: 'Real-Yield', key: 'realYield' },
            { asset_class: 'derived', series_name: 'Yield-Curve', key: 'yieldCurve' },
            { asset_class: 'derived', series_name: 'Earnings-Yield-Premium', key: 'eyp' },
            { asset_class: 'derived', series_name: 'Real-Earnings-Yield', key: 'rey' },
        ];

        const result: any = { year };

        // Get year-end data for each series
        const yearStart = new Date(year, 0, 1).getTime();
        const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();
        const q4Start = new Date(year, 9, 1).getTime();

        for (const s of series) {
            const query = `
                SELECT 
                    asset_class,
                    series_name,
                    date,
                    value,
                    percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? 
                  AND series_name = ?
                  AND date >= ?
                  AND date <= ?
                ORDER BY date DESC
                LIMIT 1
            `;

            const row = db.prepare(query).get(s.asset_class, s.series_name, q4Start, yearEnd) as any;

            if (row) {
                result[s.key] = {
                    assetClass: row.asset_class,
                    seriesName: row.series_name,
                    date: row.date,
                    dateStr: new Date(row.date).toISOString().split('T')[0],
                    value: row.value,
                    percentileRank: row.percentile_rank
                };
            } else {
                result[s.key] = null;
            }
        }

        db.close();

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching percentile data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
