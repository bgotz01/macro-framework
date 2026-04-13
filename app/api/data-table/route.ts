import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const assetClass = searchParams.get('assetClass') || null;
        const seriesName = searchParams.get('seriesName') || null;
        const columnName = searchParams.get('columnName') || 'Value';
        const startDate = searchParams.get('startDate') || null;
        const endDate = searchParams.get('endDate') || null;
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');

        // Build WHERE clauses dynamically
        const conditions: Prisma.Sql[] = [Prisma.sql`ts.column_name = ${columnName}`];
        if (assetClass) conditions.push(Prisma.sql`ts.asset_class = ${assetClass}`);
        if (seriesName) conditions.push(Prisma.sql`ts.series_name = ${seriesName}`);
        if (startDate) conditions.push(Prisma.sql`ts.date >= ${startDate}`);
        if (endDate) conditions.push(Prisma.sql`ts.date <= ${endDate}`);

        const where = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

        const [countRows, rows] = await Promise.all([
            prisma.$queryRaw<{ total: bigint }[]>`
                SELECT COUNT(*) as total
                FROM macro_time_series ts
                ${where}
            `,
            prisma.$queryRaw<any[]>`
                SELECT
                    ts.date::text as date,
                    ts.asset_class,
                    ts.series_name,
                    COALESCE(sm.display_name, ts.series_name) as display_name,
                    ts.column_name,
                    ts.value,
                    sm.units,
                    sm.geography
                FROM macro_time_series ts
                LEFT JOIN macro_series_metadata sm
                    ON ts.asset_class = sm.asset_class
                    AND ts.series_name = sm.series_name
                ${where}
                ORDER BY ts.date DESC, ts.series_name ASC
                LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
            `,
        ]);

        const total = Number(countRows[0]?.total ?? 0);

        const data = rows.map(row => ({
            date: row.date,
            assetClass: row.asset_class,
            seriesName: row.series_name,
            displayName: row.display_name,
            columnName: row.column_name,
            value: row.value,
            units: row.units,
            geography: row.geography,
        }));

        return NextResponse.json({
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        }, {
            headers: { 'Cache-Control': 'no-store, max-age=0' },
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
    }
}
