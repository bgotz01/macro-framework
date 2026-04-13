import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sector = searchParams.get('sector');
        const asOfDate = searchParams.get('asOfDate'); // Format: YYYY-MM-DD

        if (asOfDate) {
            const snapshotData = await prisma.$queryRaw<any[]>`
                SELECT s.ticker AS symbol, s.company_name AS security,
                       c.gics_sector, c.gics_sub_industry,
                       c.headquarters_location, c.date_added, c.founded
                FROM sp500_snapshots s
                LEFT JOIN sp500_constituents c ON s.ticker = c.symbol
                WHERE s.snapshot_date = ${asOfDate}
            `;

            if (snapshotData.length === 0) {
                return NextResponse.json(
                    { error: `No snapshot available for ${asOfDate}. Available: 2000-12-31 to 2025-12-31` },
                    { status: 404 }
                );
            }

            let constituents = snapshotData.map((row: any) => ({
                ...row,
                security: row.security || row.symbol,
            }));

            if (sector) {
                constituents = constituents.filter((c: any) => c.gics_sector === sector);
            }

            constituents.sort((a: any, b: any) => (a.security || '').localeCompare(b.security || ''));

            return NextResponse.json({ constituents, asOfDate, count: constituents.length });
        } else {
            const constituents = await prisma.sp500_constituents.findMany({
                where: sector ? { gics_sector: sector } : undefined,
                orderBy: { security: 'asc' },
            });

            return NextResponse.json({ constituents });
        }
    } catch (error) {
        console.error('Error fetching S&P 500 constituents:', error);
        return NextResponse.json({ error: 'Failed to fetch constituents' }, { status: 500 });
    }
}
