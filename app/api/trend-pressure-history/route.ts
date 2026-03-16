import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const ma = request.nextUrl.searchParams.get('ma') || '200';

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        // Join all three daily percentile series
        const rows = db.prepare(`
            SELECT
                d.date,
                d.value            AS divergence_value,
                d.percentile_rank  AS divergence_percentile,
                p.value            AS days_above_value,
                p.percentile_rank  AS days_above_percentile,
                s.value            AS slope_value,
                s.percentile_rank  AS slope_percentile
            FROM percentile_analysis d
            JOIN percentile_analysis p ON d.date = p.date
            JOIN percentile_analysis s ON d.date = s.date
            WHERE d.series_name = ?
              AND p.series_name = ?
              AND s.series_name = ?
              AND d.percentile_rank IS NOT NULL
              AND p.percentile_rank IS NOT NULL
              AND s.percentile_rank IS NOT NULL
            ORDER BY d.date ASC
        `).all(
            `SP500-${ma}MA-Div`,
            `SP500-${ma}MA-PriceAboveStreak`,
            `SP500-${ma}MA-Slope`
        ) as any[];

        db.close();
        return NextResponse.json({ data: rows, ma });
    } catch (error) {
        console.error('Error fetching trend pressure history:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
