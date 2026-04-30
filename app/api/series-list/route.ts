import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Series metadata is essentially static — cache for 1 hour, serve stale for up to 24h
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Single query: get distinct asset_class + series_name from metadata table only.
        // macro_series_metadata is the source of truth for what's available.
        const series = await prisma.$queryRaw<{ asset_class: string; series_name: string; display_name: string }[]>`
            SELECT
                asset_class,
                series_name,
                COALESCE(display_name, series_name) AS display_name
            FROM macro_series_metadata
            ORDER BY asset_class, series_name
        `;

        const assetClasses = [...new Set(series.map(s => s.asset_class))].sort();

        return NextResponse.json(
            { assetClasses, series },
            {
                headers: {
                    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
                },
            }
        );
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to load series list' }, { status: 500 });
    }
}
