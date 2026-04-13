import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const currentDate = searchParams.get('date') || 'latest';

    try {
        const currentRow = currentDate === 'latest'
            ? await prisma.$queryRaw<any[]>`
                SELECT date, value FROM percentile_analysis
                WHERE series_name = 'Yield-Curve-10Y-3M'
                ORDER BY date DESC LIMIT 1
              `.then(r => r[0])
            : await prisma.$queryRaw<any[]>`
                SELECT date, value FROM percentile_analysis
                WHERE series_name = 'Yield-Curve-10Y-3M' AND date = ${currentDate} LIMIT 1
              `.then(r => r[0]);

        if (!currentRow) {
            return NextResponse.json({
                isInverted: false,
                monthsSinceUninversion: null,
                lastInversionEndDate: null,
            });
        }

        const isCurrentlyInverted = currentRow.value < 0;

        if (isCurrentlyInverted) {
            return NextResponse.json({
                isInverted: true,
                monthsSinceUninversion: null,
                lastInversionEndDate: null,
            });
        }

        const lastInversionRow = await prisma.$queryRaw<any[]>`
            SELECT date, value FROM percentile_analysis
            WHERE series_name = 'Yield-Curve-10Y-3M'
              AND date <= ${currentRow.date}
              AND value < 0
            ORDER BY date DESC LIMIT 1
        `.then(r => r[0]);

        if (!lastInversionRow) {
            return NextResponse.json({
                isInverted: false,
                monthsSinceUninversion: null,
                lastInversionEndDate: null,
            });
        }

        const lastInversionDate = new Date(lastInversionRow.date);
        const currentDateObj = new Date(currentRow.date);
        const monthsDiff =
            (currentDateObj.getFullYear() - lastInversionDate.getFullYear()) * 12 +
            (currentDateObj.getMonth() - lastInversionDate.getMonth());

        return NextResponse.json({
            isInverted: false,
            monthsSinceUninversion: monthsDiff,
            lastInversionEndDate: lastInversionRow.date,
            currentValue: currentRow.value,
        });
    } catch (error) {
        console.error('Error checking yield curve inversion:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
