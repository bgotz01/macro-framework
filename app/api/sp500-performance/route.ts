import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate'); // Format: YYYY-MM-DD
    const months = parseInt(searchParams.get('months') || '24');

    if (!startDate) {
        return NextResponse.json({ error: 'startDate is required' }, { status: 400 });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + months);

        // time_series stores dates as Unix timestamps (milliseconds)
        const startTimestamp = BigInt(start.getTime());
        const endTimestamp = BigInt(end.getTime());

        const data = await prisma.$queryRaw<Array<{ date: bigint; value: number }>>`
            SELECT date, value
            FROM time_series
            WHERE asset_class = 'equities'
              AND series_name = 'US/GSPC'
              AND date >= ${startTimestamp}
              AND date <= ${endTimestamp}
            ORDER BY date ASC
        `;

        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found for date range' }, { status: 404 });
        }

        const startValue = data[0].value;
        const endValue = data[data.length - 1].value;
        const returnPct = ((endValue - startValue) / startValue) * 100;

        const formattedData = data.map(d => ({
            date: new Date(Number(d.date)).toISOString().split('T')[0],
            value: d.value,
            returnPct: ((d.value - startValue) / startValue) * 100,
        }));

        return NextResponse.json({
            startDate: formattedData[0].date,
            endDate: formattedData[formattedData.length - 1].date,
            startValue,
            endValue,
            returnPct,
            data: formattedData,
        });
    } catch (error) {
        console.error('Error fetching S&P 500 performance:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
