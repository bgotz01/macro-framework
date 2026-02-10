import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        // Get all asset classes
        const assetClasses = db.prepare(`
            SELECT DISTINCT asset_class 
            FROM time_series 
            ORDER BY asset_class
        `).all() as Array<{ asset_class: string }>;

        // Get all series with metadata
        const series = db.prepare(`
            SELECT DISTINCT 
                ts.asset_class,
                ts.series_name,
                COALESCE(sm.display_name, ts.series_name) as display_name
            FROM time_series ts
            LEFT JOIN series_metadata sm 
                ON ts.asset_class = sm.asset_class 
                AND ts.series_name = sm.series_name
            ORDER BY ts.asset_class, ts.series_name
        `).all() as Array<{ asset_class: string; series_name: string; display_name: string }>;

        db.close();

        return NextResponse.json({
            assetClasses: assetClasses.map(ac => ac.asset_class),
            series,
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to load series list' },
            { status: 500 }
        );
    }
}
