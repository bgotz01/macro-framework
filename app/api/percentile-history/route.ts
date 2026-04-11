import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PIVOT_SERIES = [
    'CPI', 'US/FEDFUNDS', 'M1-YoY', 'M2-YoY', 'Real-M2-YoY',
    'US/TNX-Monthly', 'US/US-2yr-Monthly', 'US/IRX-Monthly',
    'Real-10Y', 'Real-3M', 'Yield-Curve', 'Yield-Curve-10Y-3M',
    'PE-5yr', 'PE-2yr', 'Earnings-Yield-5yr', 'Earnings-Yield-2yr',
    'Earnings-Yield-Premium-5yr', 'Earnings-Yield-Premium-2yr',
    'Real-Earnings-Yield-5yr', 'Real-Earnings-Yield-2yr',
];

const SERIES_KEY_MAP: Record<string, string> = {
    'CPI': 'cpi', 'US/FEDFUNDS': 'fedfunds', 'M1-YoY': 'm1yoy', 'M2-YoY': 'm2yoy',
    'Real-M2-YoY': 'realm2yoy', 'US/TNX-Monthly': 'tnx', 'US/US-2yr-Monthly': 'us2yr',
    'US/IRX-Monthly': 'irx', 'Real-10Y': 'realyield', 'Real-3M': 'realyield3m',
    'Yield-Curve': 'yieldcurve', 'Yield-Curve-10Y-3M': 'yieldcurve3m',
    'PE-5yr': 'pe5yr', 'PE-2yr': 'pe2yr',
    'Earnings-Yield-5yr': 'ey5yr', 'Earnings-Yield-2yr': 'ey2yr',
    'Earnings-Yield-Premium-5yr': 'eyp5yr', 'Earnings-Yield-Premium-2yr': 'eyp2yr',
    'Real-Earnings-Yield-5yr': 'rey5yr', 'Real-Earnings-Yield-2yr': 'rey2yr',
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const assetClass = searchParams.get('assetClass');
    const seriesName = searchParams.get('seriesName');

    try {
        // Specific series request
        if (assetClass && seriesName) {
            const columnName = searchParams.get('columnName') ?? 'Value';
            const rows = await prisma.macro_percentile_analysis.findMany({
                where: { asset_class: assetClass, series_name: seriesName, column_name: columnName },
                orderBy: { date: 'asc' },
                select: { date: true, value: true, percentile_rank: true },
            });
            return NextResponse.json({ data: rows });
        }

        // Wide pivot format for chart
        const rows = await prisma.macro_percentile_analysis.findMany({
            where: { series_name: { in: PIVOT_SERIES }, column_name: 'Value' },
            orderBy: { date: 'asc' },
            select: { date: true, series_name: true, value: true, percentile_rank: true, yoy_percentile_change: true },
        });

        // Pivot in memory
        const dateMap = new Map<string, any>();
        for (const row of rows) {
            if (!dateMap.has(row.date)) dateMap.set(row.date, { date: row.date });
            const key = SERIES_KEY_MAP[row.series_name];
            if (key) {
                const entry = dateMap.get(row.date);
                entry[`${key}_value`] = row.value;
                entry[`${key}_percentile`] = row.percentile_rank;
                entry[`${key}_yoy`] = row.yoy_percentile_change;
            }
        }

        return NextResponse.json({ data: Array.from(dateMap.values()) });
    } catch (error) {
        console.error('Error fetching percentile history:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
