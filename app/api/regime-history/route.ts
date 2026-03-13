import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

interface RegimeRow {
    date: string;
    regime: string;
    entry_date: string;
}

interface RegimePeriod {
    regime: string;
    startDate: string;
    endDate: string;
    months: number;
}

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        const rows = db.prepare(`
      SELECT date, regime, entry_date
      FROM regime_timeline
      ORDER BY date ASC
    `).all() as RegimeRow[];

        db.close();

        // Group consecutive months by regime
        const periods: RegimePeriod[] = [];
        let currentPeriod: RegimePeriod | null = null;

        for (const row of rows) {
            if (!currentPeriod || currentPeriod.regime !== row.regime) {
                // Start new period
                if (currentPeriod) {
                    periods.push(currentPeriod);
                }
                currentPeriod = {
                    regime: row.regime,
                    startDate: row.entry_date,
                    endDate: row.date,
                    months: 1
                };
            } else {
                // Continue current period
                currentPeriod.endDate = row.date;
                currentPeriod.months++;
            }
        }

        // Add the last period
        if (currentPeriod) {
            // Check if the last period is current (within last 60 days)
            const lastDate = new Date(currentPeriod.endDate);
            const now = new Date();
            const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

            if (daysDiff < 60) {
                currentPeriod.endDate = 'Current';
            }

            periods.push(currentPeriod);
        }

        return NextResponse.json({ periods });
    } catch (error) {
        console.error('Error fetching regime history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch regime history' },
            { status: 500 }
        );
    }
}
