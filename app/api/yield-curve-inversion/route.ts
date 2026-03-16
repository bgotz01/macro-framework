import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const currentDate = searchParams.get('date') || 'latest';

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        // Get the current yield curve value
        const currentQuery = `
            SELECT date, value
            FROM percentile_analysis
            WHERE series_name = 'Yield-Curve-10Y-3M'
            ${currentDate === 'latest' ? 'ORDER BY date DESC LIMIT 1' : 'AND date = ? LIMIT 1'}
        `;

        const currentRow = currentDate === 'latest'
            ? db.prepare(currentQuery).get() as any
            : db.prepare(currentQuery).get(currentDate) as any;

        if (!currentRow) {
            db.close();
            return NextResponse.json({
                isInverted: false,
                monthsSinceUninversion: null,
                lastInversionEndDate: null
            });
        }

        const isCurrentlyInverted = currentRow.value < 0;

        // If currently inverted, no need to check for uninversion
        if (isCurrentlyInverted) {
            db.close();
            return NextResponse.json({
                isInverted: true,
                monthsSinceUninversion: null,
                lastInversionEndDate: null
            });
        }

        // Find the last date when yield curve was inverted (before current date)
        const lastInversionQuery = `
            SELECT date, value
            FROM percentile_analysis
            WHERE series_name = 'Yield-Curve-10Y-3M'
              AND date <= ?
              AND value < 0
            ORDER BY date DESC
            LIMIT 1
        `;

        const lastInversionRow = db.prepare(lastInversionQuery).get(currentRow.date) as any;

        if (!lastInversionRow) {
            // Never been inverted before this date
            db.close();
            return NextResponse.json({
                isInverted: false,
                monthsSinceUninversion: null,
                lastInversionEndDate: null
            });
        }

        // Calculate months since uninversion
        const lastInversionDate = new Date(lastInversionRow.date);
        const currentDateObj = new Date(currentRow.date);

        const monthsDiff = (currentDateObj.getFullYear() - lastInversionDate.getFullYear()) * 12
            + (currentDateObj.getMonth() - lastInversionDate.getMonth());

        db.close();

        return NextResponse.json({
            isInverted: false,
            monthsSinceUninversion: monthsDiff,
            lastInversionEndDate: lastInversionRow.date,
            currentValue: currentRow.value
        });

    } catch (error) {
        console.error('Error checking yield curve inversion:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
