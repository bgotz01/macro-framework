import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sector = searchParams.get('sector');
        const asOfDate = searchParams.get('asOfDate'); // Format: YYYY-MM-DD

        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        if (asOfDate) {
            // Use pre-calculated snapshots
            const snapshotData = db.prepare(`
                SELECT s.ticker as symbol, s.company_name as security,
                       c.gics_sector, c.gics_sub_industry,
                       c.headquarters_location, c.date_added, c.founded
                FROM sp500_snapshots s
                LEFT JOIN sp500_constituents c ON s.ticker = c.symbol
                WHERE s.snapshot_date = ?
            `).all(asOfDate) as Array<{
                symbol: string;
                security: string | null;
                gics_sector: string | null;
                gics_sub_industry: string | null;
                headquarters_location: string | null;
                date_added: string | null;
                founded: string | null;
            }>;

            if (snapshotData.length === 0) {
                db.close();
                return NextResponse.json(
                    { error: `No snapshot available for ${asOfDate}. Available: 2000-12-31 to 2025-12-31` },
                    { status: 404 }
                );
            }

            let constituents = snapshotData.map(row => ({
                ...row,
                security: row.security || row.symbol // Use ticker if no company name
            }));

            // Apply sector filter if provided
            if (sector) {
                constituents = constituents.filter(c => c.gics_sector === sector);
            }

            // Sort by security name
            constituents.sort((a, b) => (a.security || '').localeCompare(b.security || ''));

            db.close();
            return NextResponse.json({
                constituents,
                asOfDate,
                count: constituents.length
            });
        } else {
            // Current constituents
            let query = `
                SELECT 
                    symbol, security, gics_sector, gics_sub_industry,
                    headquarters_location, date_added, founded
                FROM sp500_constituents
            `;

            const params: any[] = [];

            if (sector) {
                query += ' WHERE gics_sector = ?';
                params.push(sector);
            }

            query += ' ORDER BY security';

            const constituents = db.prepare(query).all(...params);

            db.close();

            return NextResponse.json({ constituents });
        }
    } catch (error) {
        console.error('Error fetching S&P 500 constituents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch constituents' },
            { status: 500 }
        );
    }
}
