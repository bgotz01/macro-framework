import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const targetDate = searchParams.get('date') || 'latest';

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        let query: string;
        let params: any[];

        if (targetDate === 'latest') {
            query = `
                SELECT 
                    date,
                    regime,
                    entry_date,
                    trigger_reason,
                    liquidity_score,
                    rey,
                    eyp,
                    real10Y,
                    real3M,
                    realM2
                FROM regime_timeline
                ORDER BY date DESC
                LIMIT 1
            `;
            params = [];
        } else {
            query = `
                SELECT 
                    date,
                    regime,
                    entry_date,
                    trigger_reason,
                    liquidity_score,
                    rey,
                    eyp,
                    real10Y,
                    real3M,
                    realM2
                FROM regime_timeline
                WHERE date <= ?
                ORDER BY date DESC
                LIMIT 1
            `;
            params = [targetDate];
        }

        const row = db.prepare(query).get(...params) as any;

        db.close();

        if (!row) {
            return NextResponse.json({ error: 'No regime data found' }, { status: 404 });
        }

        // Calculate days in regime
        const entryDate = new Date(row.entry_date);
        const currentDate = new Date(row.date);
        const daysInRegime = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

        return NextResponse.json({
            regime: row.regime,
            entryDate: row.entry_date,
            currentDate: row.date,
            daysInRegime,
            triggerReason: row.trigger_reason,
            conditions: {
                liquidityScore: row.liquidity_score,
                rey: row.rey,
                eyp: row.eyp,
                real10Y: row.real10Y,
                real3M: row.real3M,
                realM2: row.realM2,
                // Add placeholder values for display
                stage: 'N/A',
                pressure: 'N/A',
                risk: 'N/A',
                direction: 'N/A'
            }
        });
    } catch (error) {
        console.error('Error fetching regime state:', error);
        return NextResponse.json({ error: 'Failed to fetch regime state' }, { status: 500 });
    }
}
