import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const [assetClassRows, series] = await Promise.all([
            prisma.$queryRaw<{ asset_class: string }[]>`
                SELECT DISTINCT asset_class
                FROM macro_time_series
                ORDER BY asset_class
            `,
            prisma.$queryRaw<{ asset_class: string; series_name: string; display_name: string }[]>`
                SELECT DISTINCT
                    ts.asset_class,
                    ts.series_name,
                    COALESCE(sm.display_name, ts.series_name) as display_name
                FROM macro_time_series ts
                LEFT JOIN macro_series_metadata sm
                    ON ts.asset_class = sm.asset_class
                    AND ts.series_name = sm.series_name
                ORDER BY ts.asset_class, ts.series_name
            `,
        ]);

        return NextResponse.json({
            assetClasses: assetClassRows.map(ac => ac.asset_class),
            series,
        }, {
            headers: { 'Cache-Control': 'no-store, max-age=0' },
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to load series list' }, { status: 500 });
    }
}
