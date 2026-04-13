import { NextResponse } from 'next/server';
import { getStockdataPool } from '@/lib/stockdata-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const pool = getStockdataPool();
    if (!pool) {
        return NextResponse.json({ constituents: [] });
    }

    try {
        const { searchParams } = new URL(request.url);
        const sector = searchParams.get('sector');
        const asOfDate = searchParams.get('asOfDate'); // Format: YYYY-MM-DD

        if (asOfDate) {
            const params: string[] = [asOfDate];
            const result = await pool.query(
                `SELECT s.ticker AS symbol, s.company_name AS security,
                        c.gics_sector, c.gics_sub_industry,
                        c.headquarters_location, c.date_added, c.founded
                 FROM sp500_snapshots s
                 LEFT JOIN sp500_constituents c ON s.ticker = c.symbol
                 WHERE s.snapshot_date = $1`,
                params
            );

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { error: `No snapshot available for ${asOfDate}. Available: 2000-12-31 to 2025-12-31` },
                    { status: 404 }
                );
            }

            let constituents = result.rows.map((row: any) => ({
                ...row,
                security: row.security || row.symbol,
            }));

            if (sector) {
                constituents = constituents.filter((c: any) => c.gics_sector === sector);
            }

            constituents.sort((a: any, b: any) => (a.security || '').localeCompare(b.security || ''));

            return NextResponse.json({ constituents, asOfDate, count: constituents.length });
        } else {
            const params: string[] = [];
            let whereClause = '';

            if (sector) {
                params.push(sector);
                whereClause = `WHERE gics_sector = $1`;
            }

            const result = await pool.query(
                `SELECT symbol, security, gics_sector, gics_sub_industry,
                        headquarters_location, date_added, founded
                 FROM sp500_constituents
                 ${whereClause}
                 ORDER BY security`,
                params
            );

            return NextResponse.json({ constituents: result.rows });
        }
    } catch (error) {
        console.error('Error fetching S&P 500 constituents:', error);
        return NextResponse.json({ error: 'Failed to fetch constituents' }, { status: 500 });
    }
}
