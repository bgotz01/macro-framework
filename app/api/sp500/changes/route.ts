import { NextResponse } from 'next/server';
import { getStockdataPool } from '@/lib/stockdata-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const pool = getStockdataPool();
    if (!pool) {
        return NextResponse.json({ changes: [] });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const year = searchParams.get('year');

        // In the original SQLite schema, date was stored as a 2-digit year suffix string.
        // In Postgres we expect a proper date or text column — filter by year prefix instead.
        const params: (string | number)[] = [];
        let whereClause = '';

        if (year) {
            params.push(`${year}%`);
            whereClause = `WHERE date::text LIKE $${params.length}`;
        }

        params.push(limit);
        const result = await pool.query(
            `SELECT date, added_ticker, added_company,
                    removed_ticker, removed_company, reason
             FROM sp500_changes
             ${whereClause}
             ORDER BY date DESC
             LIMIT $${params.length}`,
            params
        );

        return NextResponse.json({ changes: result.rows });
    } catch (error) {
        console.error('Error fetching S&P 500 changes:', error);
        return NextResponse.json({ error: 'Failed to fetch changes' }, { status: 500 });
    }
}
