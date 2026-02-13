import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const year = searchParams.get('year');

        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        let query = `
            SELECT 
                date, added_ticker, added_company, 
                removed_ticker, removed_company, reason
            FROM sp500_changes
        `;

        const params: any[] = [];

        if (year) {
            query += ' WHERE date LIKE ?';
            params.push(`%${year.slice(-2)}`);
        }

        query += ' ORDER BY date DESC LIMIT ?';
        params.push(limit);

        const changes = db.prepare(query).all(...params);

        db.close();

        return NextResponse.json({ changes });
    } catch (error) {
        console.error('Error fetching S&P 500 changes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch changes' },
            { status: 500 }
        );
    }
}
