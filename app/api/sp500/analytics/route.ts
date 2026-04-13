import { NextResponse } from 'next/server';
import { getStockdataPool } from '@/lib/stockdata-db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const pool = getStockdataPool();
    if (!pool) {
        return NextResponse.json({
            stats: {
                total_constituents: 0,
                total_sectors: 0,
                total_sub_industries: 0,
                total_changes: 0,
                original_1957_members: 0,
            },
            sectorBreakdown: [],
            topSubIndustries: [],
            removalReasons: [],
        });
    }

    try {
        const [sectorResult, subIndustryResult, removalResult, originalResult, statsResult, changesResult] =
            await Promise.all([
                pool.query(`
                    SELECT gics_sector,
                           COUNT(*) AS count,
                           ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sp500_constituents), 2) AS percentage
                    FROM sp500_constituents
                    WHERE gics_sector IS NOT NULL
                    GROUP BY gics_sector
                    ORDER BY count DESC
                `),
                pool.query(`
                    SELECT gics_sub_industry, COUNT(*) AS count
                    FROM sp500_constituents
                    WHERE gics_sub_industry IS NOT NULL
                    GROUP BY gics_sub_industry
                    ORDER BY count DESC
                    LIMIT 10
                `),
                pool.query(`
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
                `),
                pool.query(`
                    SELECT COUNT(*) AS count
                    FROM sp500_constituents
                    WHERE date_added = '1957-03-04'
                `),
                pool.query(`
                    SELECT COUNT(*) AS total_constituents,
                           COUNT(DISTINCT gics_sector) AS total_sectors,
                           COUNT(DISTINCT gics_sub_industry) AS total_sub_industries
                    FROM sp500_constituents
                `),
                pool.query(`SELECT COUNT(*) AS count FROM sp500_changes`),
            ]);

        const stats = statsResult.rows[0];

        return NextResponse.json({
            stats: {
                total_constituents: Number(stats?.total_constituents || 0),
                total_sectors: Number(stats?.total_sectors || 0),
                total_sub_industries: Number(stats?.total_sub_industries || 0),
                total_changes: Number(changesResult.rows[0]?.count || 0),
                original_1957_members: Number(originalResult.rows[0]?.count || 0),
            },
            sectorBreakdown: sectorResult.rows,
            topSubIndustries: subIndustryResult.rows,
            removalReasons: removalResult.rows,
        });
    } catch (error) {
        console.error('Error fetching S&P 500 analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
