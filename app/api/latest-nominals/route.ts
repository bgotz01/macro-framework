import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { readonly: true, timeout: 10000 });

    try {
        // Fetch latest 10Y Treasury
        const tnxQuery = `
            SELECT value
            FROM percentile_analysis
            WHERE asset_class = 'bonds' AND series_name = 'US/TNX-Monthly'
            ORDER BY date DESC
            LIMIT 1
        `;
        const tnxRow = db.prepare(tnxQuery).get() as any;

        // Fetch latest 3M Treasury
        const irxQuery = `
            SELECT value
            FROM percentile_analysis
            WHERE asset_class = 'bonds' AND series_name = 'US/IRX-Monthly'
            ORDER BY date DESC
            LIMIT 1
        `;
        const irxRow = db.prepare(irxQuery).get() as any;

        // Fetch latest CPI
        const cpiQuery = `
            SELECT value
            FROM percentile_analysis
            WHERE asset_class = 'economic' AND series_name = 'CPI'
            ORDER BY date DESC
            LIMIT 1
        `;
        const cpiRow = db.prepare(cpiQuery).get() as any;

        // Fetch latest EY5yr
        const ey5yrQuery = `
            SELECT value
            FROM percentile_analysis
            WHERE asset_class = 'valuations' AND series_name = 'Earnings-Yield-5yr'
            ORDER BY date DESC
            LIMIT 1
        `;
        const ey5yrRow = db.prepare(ey5yrQuery).get() as any;

        db.close();

        return NextResponse.json({
            tnx: tnxRow?.value || null,
            irx: irxRow?.value || null,
            cpi: cpiRow?.value || null,
            ey5yr: ey5yrRow?.value || null
        });
    } catch (error) {
        db.close();
        console.error('Error fetching latest nominals:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
