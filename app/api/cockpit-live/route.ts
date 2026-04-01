import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { readonly: true });

    const get = (ac: string, sn: string) =>
        db.prepare(`SELECT date, value FROM time_series WHERE asset_class=? AND series_name=? AND column_name='Value' ORDER BY date DESC LIMIT 1`)
            .get(ac, sn) as { date: string; value: number } | undefined;

    const tnx = get('bonds', 'US/TNX');
    const irx = get('bonds', 'US/IRX');
    const gspc = get('equities', 'US/GSPC');
    const cpi = get('economic', 'CPI');
    const m2yoy = get('economic', 'M2-YoY');
    const eps5yr = get('valuations', 'SP500-EPS-5yr');

    db.close();

    return NextResponse.json({
        tnx: { value: tnx?.value ?? null, date: tnx?.date ?? null },
        irx: { value: irx?.value ?? null, date: irx?.date ?? null },
        gspc: { value: gspc?.value ?? null, date: gspc?.date ?? null },
        cpi: { value: cpi?.value ?? null, date: cpi?.date ?? null },
        m2yoy: { value: m2yoy?.value ?? null, date: m2yoy?.date ?? null },
        eps5yr: { value: eps5yr?.value ?? null, date: eps5yr?.date ?? null },
    });
}
