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

        const [totalRecords, rows, yearsRaw] = await Promise.all([
            prisma.macro_percentile_analysis.count({ where }),
            prisma.macro_percentile_analysis.findMany({
                where,
                orderBy: { date: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: { date: true, value: true, percentile_rank: true, yoy_percentile_change: true },
            }),
            prisma.macro_percentile_analysis.findMany({
                where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value' },
                distinct: ['date'],
                select: { date: true },
                orderBy: { date: 'desc' },
            }),
        ]);

        const availableYears = [...new Set(yearsRaw.map(r => parseInt(r.date.substring(0, 4))))].sort((a, b) => b - a);

        return NextResponse.json({
            data: rows.map(r => ({ date: r.date, dateStr: r.date, value: r.value, percentileRank: r.percentile_rank, yoyPercentileChange: r.yoy_percentile_change })),
            pagination: { page, pageSize, totalRecords, totalPages: Math.ceil(totalRecords / pageSize) },
            series: { assetClass, seriesName },
            availableYears,
        });
    } catch (error) {
        console.error('Error fetching percentile data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
