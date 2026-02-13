import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        // Sector breakdown
        const sectorBreakdown = db.prepare(`
            SELECT 
                gics_sector,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sp500_constituents), 2) as percentage
            FROM sp500_constituents
            WHERE gics_sector IS NOT NULL
            GROUP BY gics_sector
            ORDER BY count DESC
        `).all();

        // Top sub-industries
        const topSubIndustries = db.prepare(`
            SELECT 
                gics_sub_industry,
                COUNT(*) as count
            FROM sp500_constituents
            WHERE gics_sub_industry IS NOT NULL
            GROUP BY gics_sub_industry
            ORDER BY count DESC
            LIMIT 10
        `).all();

        // Removal reasons
        const removalReasons = db.prepare(`
            SELECT 
                CASE 
                    WHEN reason LIKE '%acquired%' OR reason LIKE '%Acquired%' THEN 'Acquisition'
                    WHEN reason LIKE '%Market cap%' OR reason LIKE '%market cap%' THEN 'Market Cap Change'
                    WHEN reason LIKE '%spun off%' OR reason LIKE '%spin%' THEN 'Spin-off'
                    WHEN reason LIKE '%merged%' OR reason LIKE '%merge%' THEN 'Merger'
                    WHEN reason LIKE '%bankruptcy%' THEN 'Bankruptcy'
                    ELSE 'Other'
                END as reason_category,
                COUNT(*) as count
            FROM sp500_changes
            WHERE removed_ticker IS NOT NULL AND reason IS NOT NULL
            GROUP BY reason_category
            ORDER BY count DESC
        `).all();

        // Original 1957 members still in index
        const originalMembers = db.prepare(`
            SELECT COUNT(*) as count 
            FROM sp500_constituents 
            WHERE date_added = '1957-03-04'
        `).get() as { count: number };

        // Total stats
        const stats = db.prepare(`
            SELECT 
                COUNT(*) as total_constituents,
                COUNT(DISTINCT gics_sector) as total_sectors,
                COUNT(DISTINCT gics_sub_industry) as total_sub_industries
            FROM sp500_constituents
        `).get() as { total_constituents: number; total_sectors: number; total_sub_industries: number } | undefined;

        const totalChanges = db.prepare(`
            SELECT COUNT(*) as count FROM sp500_changes
        `).get() as { count: number };

        db.close();

        return NextResponse.json({
            stats: {
                total_constituents: stats?.total_constituents || 0,
                total_sectors: stats?.total_sectors || 0,
                total_sub_industries: stats?.total_sub_industries || 0,
                total_changes: totalChanges.count,
                original_1957_members: originalMembers.count
            },
            sectorBreakdown,
            topSubIndustries,
            removalReasons
        });
    } catch (error) {
        console.error('Error fetching S&P 500 analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
