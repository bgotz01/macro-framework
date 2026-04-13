import { NextRequest, NextResponse } from 'next/server';
import { getStockdataPool } from '@/lib/stockdata-db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const currentDate = searchParams.get('date') || 'latest';

    const pool = getStockdataPool();
    if (!pool) {
        return NextResponse.json({ error: 'Stock data database not configured' }, { status: 503 });
    }

    try {
        // Get the current yield curve value
        const currentResult = currentDate === 'latest'
            ? await pool.query(
                `SELECT date, value FROM macro_percentile_analysis
                 WHERE series_name = 'Yield-Curve-10Y-3M'
                 ORDER BY date DESC LIMIT 1`
            )
            : await pool.query(
                `SELECT date, value FROM macro_percentile_analysis
                 WHERE series_name = 'Yield-Curve-10Y-3M' AND date = $1 LIMIT 1`,
                [currentDate]
            );

        const currentRow = currentResult.rows[0];

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

        // Find the last date when yield curve was inverted (before current date)
        const lastInversionResult = await pool.query(
            `SELECT date, value FROM macro_percentile_analysis
             WHERE series_name = 'Yield-Curve-10Y-3M'
               AND date <= $1
               AND value < 0
             ORDER BY date DESC LIMIT 1`,
            [currentRow.date]
        );

        const lastInversionRow = lastInversionResult.rows[0];

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
