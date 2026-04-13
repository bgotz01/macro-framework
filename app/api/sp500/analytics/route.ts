import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [sectorBreakdown, topSubIndustries, removalReasons, originalMembers, stats, totalChanges] =
            await Promise.all([
                prisma.$queryRaw<any[]>`
                    SELECT gics_sector,
                           COUNT(*) AS count,
                           ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sp500_constituents), 2) AS percentage
                    FROM sp500_constituents
                    WHERE gics_sector IS NOT NULL
                    GROUP BY gics_sector
                    ORDER BY count DESC
                `,
                prisma.$queryRaw<any[]>`
                    SELECT gics_sub_industry, COUNT(*) AS count
                    FROM sp500_constituents
                    WHERE gics_sub_industry IS NOT NULL
                    GROUP BY gics_sub_industry
                    ORDER BY count DESC
                    LIMIT 10
                `,
                prisma.$queryRaw<any[]>`
                    SELECT
                        CASE
                            WHEN reason ILIKE '%acquired%' THEN 'Acquisition'
                            WHEN reason ILIKE '%market cap%' THEN 'Market Cap Change'
                            WHEN reason ILIKE '%spun off%' OR reason ILIKE '%spin%' THEN 'Spin-off'
                            WHEN reason ILIKE '%merged%' OR reason ILIKE '%merge%' THEN 'Merger'
                            WHEN reason ILIKE '%bankruptcy%' THEN 'Bankruptcy'
                            ELSE 'Other'
                        END AS reason_category,
                        COUNT(*) AS count
                    FROM sp500_changes
                    WHERE removed_ticker IS NOT NULL AND reason IS NOT NULL
                    GROUP BY reason_category
                    ORDER BY count DESC
                `,
                prisma.$queryRaw<any[]>`
                    SELECT COUNT(*) AS count FROM sp500_constituents WHERE date_added = '1957-03-04'
                `,
                prisma.$queryRaw<any[]>`
                    SELECT COUNT(*) AS total_constituents,
                           COUNT(DISTINCT gics_sector) AS total_sectors,
                           COUNT(DISTINCT gics_sub_industry) AS total_sub_industries
                    FROM sp500_constituents
                `,
                prisma.$queryRaw<any[]>`SELECT COUNT(*) AS count FROM sp500_changes`,
            ]);

        const s = stats[0];

        return NextResponse.json({
            stats: {
                total_constituents: Number(s?.total_constituents || 0),
                total_sectors: Number(s?.total_sectors || 0),
                total_sub_industries: Number(s?.total_sub_industries || 0),
                total_changes: Number(totalChanges[0]?.count || 0),
                original_1957_members: Number(originalMembers[0]?.count || 0),
            },
            sectorBreakdown,
            topSubIndustries,
            removalReasons,
        });
    } catch (error) {
        console.error('Error fetching S&P 500 analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
