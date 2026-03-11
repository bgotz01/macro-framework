import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const assetClass = searchParams.get('assetClass');
    const seriesName = searchParams.get('seriesName');

    if (!assetClass || !seriesName) {
        return NextResponse.json({ error: 'Missing assetClass or seriesName parameter' }, { status: 400 });
    }

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

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

        const rows = db.prepare(query).all(assetClass, seriesName) as any[];

        db.close();

        return NextResponse.json({ data: rows });
    } catch (error) {
        console.error('Error fetching percentile history:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
