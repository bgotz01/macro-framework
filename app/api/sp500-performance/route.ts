import { NextRequest, NextResponse } from 'next/server';
import { getStockdataPool } from '@/lib/stockdata-db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate'); // Format: YYYY-MM-DD
    const months = parseInt(searchParams.get('months') || '24');

    if (!startDate) {
        return NextResponse.json({ error: 'startDate is required' }, { status: 400 });
    }

    const pool = getStockdataPool();
    if (!pool) {
        return NextResponse.json({ error: 'Stock data database not configured' }, { status: 503 });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + months);
        const endDate = end.toISOString().split('T')[0];

        // time_series stores dates as Unix timestamps (milliseconds) in the original SQLite schema.
        // In Postgres the column is a bigint; convert to/from ISO dates accordingly.
        const result = await pool.query<{ date: string; value: number }>(
            `SELECT to_char(to_timestamp(date / 1000), 'YYYY-MM-DD') AS date, value
             FROM time_series
             WHERE asset_class = 'equities'
               AND series_name = 'US/GSPC'
               AND to_timestamp(date / 1000)::date >= $1::date
               AND to_timestamp(date / 1000)::date <= $2::date
             ORDER BY date ASC`,
            [startDate, endDate]
        );

        const data = result.rows;

        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found for date range' }, { status: 404 });
        }

        const startValue = data[0].value;
        const endValue = data[data.length - 1].value;
        const returnPct = ((endValue - startValue) / startValue) * 100;

        const formattedData = data.map(d => ({
            date: d.date,
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
