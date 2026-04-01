import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

interface RegimeTimelineRow {
    date: string;
    regime: string;
}

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        const rows = db.prepare(`
            SELECT date, regime
            FROM regime_timeline
            ORDER BY date ASC
        `).all() as RegimeTimelineRow[];

        db.close();

        return NextResponse.json({ data: rows });
    } catch (error) {
        console.error('Error fetching regime timeline:', error);
        return NextResponse.json(
            { error: 'Failed to fetch regime timeline' },
            { status: 500 }
        );
    }
}
