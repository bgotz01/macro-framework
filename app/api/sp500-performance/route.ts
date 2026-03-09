import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate'); // Format: YYYY-MM-DD
    const months = parseInt(searchParams.get('months') || '24');

    if (!startDate) {
        return NextResponse.json({ error: 'startDate is required' }, { status: 400 });
    }

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        // Convert dates to Unix timestamps (milliseconds)
        const start = new Date(startDate);
        const startTimestamp = start.getTime();

        const end = new Date(start);
        end.setMonth(end.getMonth() + months);
        const endTimestamp = end.getTime();

        // Query S&P 500 price data using timestamps
        const data = db.prepare(`
            SELECT date, value
            FROM time_series
            WHERE asset_class = 'equities'
              AND series_name = 'US/GSPC'
              AND date >= ?
              AND date <= ?
            ORDER BY date ASC
        `).all(startTimestamp, endTimestamp) as Array<{ date: number; value: number }>;

        db.close();

        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found for date range' }, { status: 404 });
        }

        // Calculate performance metrics
        const startValue = data[0].value;
        const endValue = data[data.length - 1].value;
        const returnPct = ((endValue - startValue) / startValue) * 100;

        // Convert timestamps back to date strings
        const formattedData = data.map(d => ({
            date: new Date(d.date).toISOString().split('T')[0],
            value: d.value,
            returnPct: ((d.value - startValue) / startValue) * 100
        }));

        return NextResponse.json({
            startDate: formattedData[0].date,
            endDate: formattedData[formattedData.length - 1].date,
            startValue,
            endValue,
            returnPct,
            data: formattedData
        });
    } catch (error) {
        console.error('Error fetching S&P 500 performance:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
