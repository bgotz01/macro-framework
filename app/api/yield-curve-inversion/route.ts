import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    if (!dateParam) {
        return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }

    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { readonly: true, timeout: 10000 });

    try {
        // Convert the selected date to Unix timestamp (milliseconds)
        const selectedDate = new Date(dateParam);
        const selectedTimestamp = selectedDate.getTime();

        // Calculate 24 months ago
        const twentyFourMonthsAgo = new Date(selectedDate);
        twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
        const cutoffTimestamp = twentyFourMonthsAgo.getTime();

        // Find the most recent inversion (where curve went negative) BEFORE the selected date
        // and within 24 months before the selected date
        const inversionQuery = `
            SELECT date, value
            FROM percentile_analysis
            WHERE asset_class = 'derived' 
            AND series_name = 'Yield-Curve-10Y-3M'
            AND value < 0
            AND date <= ?
            AND date >= ?
            ORDER BY date DESC
            LIMIT 1
        `;

        const inversionRow = db.prepare(inversionQuery).get(selectedTimestamp, cutoffTimestamp) as any;

        db.close();

        if (!inversionRow) {
            return NextResponse.json({ inversionDate: null });
        }

        // Convert timestamp back to date string
        const inversionDate = new Date(inversionRow.date).toISOString().split('T')[0];
        return NextResponse.json({ inversionDate });
    } catch (error) {
        db.close();
        console.error('Error fetching yield curve inversion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
