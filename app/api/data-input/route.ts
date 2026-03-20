import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const SERIES_CONFIG: Record<string, { asset_class: string; series_name: string; column_name: string; timeSeriesOnly?: boolean; quarterFill?: boolean }> = {
    CPI: { asset_class: 'economic', series_name: 'CPI', column_name: 'Value' },
    'M2-YoY': { asset_class: 'economic', series_name: 'M2-YoY', column_name: 'Value' },
    'SP500-EPS': { asset_class: 'valuations', series_name: 'SP500-EPS', column_name: 'Value', timeSeriesOnly: true, quarterFill: true },
};

function toMonthEnd(dateStr: string): string {
    const [y, m] = dateStr.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

// Returns the month-end dates for the entry month + next 2 months
function quarterDates(dateStr: string): string[] {
    const [y, m] = dateStr.split('-').map(Number);
    return [0, 1, 2].map(offset => {
        const totalMonth = m + offset;
        const ny = y + Math.floor((totalMonth - 1) / 12);
        const nm = ((totalMonth - 1) % 12) + 1;
        const lastDay = new Date(ny, nm, 0).getDate();
        return `${ny}-${String(nm).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { series, date, value } = body as { series: string; date: string; value: number };

        if (!series || !date || value === undefined || value === null) {
            return NextResponse.json({ error: 'Missing required fields: series, date, value' }, { status: 400 });
        }

        const config = SERIES_CONFIG[series];
        if (!config) {
            return NextResponse.json({ error: `Unknown series: ${series}` }, { status: 400 });
        }

        const dates = config.quarterFill ? quarterDates(date) : [toMonthEnd(date)];
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { timeout: 10000 });
        const upsertTS = db.prepare(`
            INSERT INTO time_series (date, asset_class, series_name, column_name, value)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(date, asset_class, series_name, column_name)
            DO UPDATE SET value = excluded.value
        `);
        const upsertPA = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, ?, ?, ?, ?, NULL)
            ON CONFLICT(date, asset_class, series_name, column_name)
            DO UPDATE SET value = excluded.value
        `);

        for (const d of dates) {
            upsertTS.run(d, config.asset_class, config.series_name, config.column_name, value);
            if (!config.timeSeriesOnly) {
                upsertPA.run(d, config.asset_class, config.series_name, config.column_name, value);
            }
        }

        db.close();

        return NextResponse.json({ success: true, date: dates[0], dates, series, value });
    } catch (error) {
        console.error('Error inserting data:', error);
        return NextResponse.json({ error: 'Failed to insert data' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const series = request.nextUrl.searchParams.get('series') || 'CPI';

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        const config = SERIES_CONFIG[series];
        if (!config) {
            return NextResponse.json({ error: `Unknown series: ${series}` }, { status: 400 });
        }

        const table = config.timeSeriesOnly ? 'time_series' : 'percentile_analysis';
        // Fetch more rows to ensure we get enough complete quarters after alignment
        const rowsDesc = db.prepare(`
            SELECT date, value
            FROM ${table}
            WHERE asset_class = ? AND series_name = ? AND column_name = ?
            ORDER BY date DESC
            LIMIT 30
        `).all(config.asset_class, config.series_name, config.column_name) as { date: string; value: number }[];
        const rows = [...rowsDesc].reverse();

        db.close();

        const QUARTER_MONTHS = new Set([3, 6, 9, 12]);
        let data: { date: string; value: number; isFilled: boolean }[];

        if (config.quarterFill) {
            // Skip leading non-anchor rows so grouping starts cleanly on a quarter-end
            let start = 0;
            while (start < rows.length && !QUARTER_MONTHS.has(parseInt(rows[start].date.split('-')[1]))) {
                start++;
            }
            const aligned = rows.slice(start);

            const chunks: { date: string; value: number; isFilled: boolean }[][] = [];
            let chunk: { date: string; value: number; isFilled: boolean }[] = [];
            for (const row of aligned) {
                const m = parseInt(row.date.split('-')[1]);
                const isAnchor = QUARTER_MONTHS.has(m);
                if (isAnchor && chunk.length > 0) {
                    chunks.push(chunk);
                    chunk = [];
                }
                chunk.push({ ...row, isFilled: !isAnchor });
            }
            if (chunk.length > 0) chunks.push(chunk);
            // Only keep complete chunks (3 rows each), newest first, limit to 8 quarters
            data = chunks.filter(c => c.length === 3).reverse().slice(0, 8).flat();
        } else {
            data = rows.reverse().map(row => ({ ...row, isFilled: false }));
        }

        return NextResponse.json({ series, data });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
