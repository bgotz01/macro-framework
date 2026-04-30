import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const assetClass = searchParams.get('assetClass') || 'economic';
    const seriesName = searchParams.get('seriesName') || 'CPI';
    const year = searchParams.get('year') || 'all';

    if (page < 1 || pageSize < 1 || pageSize > 100)
        return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });

    try {
        const where: any = { asset_class: assetClass, series_name: seriesName, column_name: 'Value' };
        if (year !== 'all') {
            where.date = { gte: `${year}-01-01`, lte: `${year}-12-31` };
        }

        const [totalRecords, rows, availableYearsRaw] = await Promise.all([
            prisma.macro_percentile_analysis.count({ where }),
            prisma.macro_percentile_analysis.findMany({
                where,
                orderBy: { date: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: { date: true, value: true, percentile_rank: true, yoy_percentile_change: true },
            }),
            // Extract distinct years directly in SQL — avoids fetching all date strings
            prisma.$queryRaw<{ yr: number }[]>`
                SELECT DISTINCT EXTRACT(YEAR FROM date::date)::int AS yr
                FROM macro_percentile_analysis
                WHERE asset_class = ${assetClass}
                  AND series_name = ${seriesName}
                  AND column_name = 'Value'
                ORDER BY yr DESC
            `,
        ]);

        const availableYears = availableYearsRaw.map(r => r.yr);

        return NextResponse.json({
            data: rows.map(r => ({
                date: r.date,
                dateStr: r.date,
                value: r.value,
                percentileRank: r.percentile_rank,
                yoyPercentileChange: r.yoy_percentile_change,
            })),
            pagination: { page, pageSize, totalRecords, totalPages: Math.ceil(totalRecords / pageSize) },
            series: { assetClass, seriesName },
            availableYears,
        });
    } catch (error) {
        console.error('Error fetching percentile data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
