import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const targetDate = searchParams.get('date') || 'latest';

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        interface SeriesConfig {
            asset_class: string;
            series_name: string;
            key: string;
            latestOnly?: boolean; // if true, always fetch the most recent row regardless of referenceDate
        }

        const series: SeriesConfig[] = [
            // Input Variables
            { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
            { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
            { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
            { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
            { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
            { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },

            // Liquidity
            { asset_class: 'derived', series_name: 'Real-10Y', key: 'real10Y' },
            { asset_class: 'derived', series_name: 'Real-3M', key: 'real3M' },
            { asset_class: 'economic', series_name: 'Real-M2-YoY', key: 'realM2' },
            { asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', key: 'yieldCurve' },

            // Valuation
            { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
            { asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', key: 'ey5yr' },

            // Flow/Trend - daily data, always fetch true latest
            { asset_class: 'derived', series_name: 'SP500-200MA-Slope', key: 'slope200MA', latestOnly: true },
            { asset_class: 'derived', series_name: 'SP500-500MA-Slope', key: 'slope500MA', latestOnly: true },
            { asset_class: 'derived', series_name: 'SP500-200MA-Div', key: 'divergence200MA', latestOnly: true },
            { asset_class: 'derived', series_name: 'SP500-200MA-PriceAboveStreak', key: 'daysAbove200MA', latestOnly: true },
            { asset_class: 'derived', series_name: 'SP500-200MA-SlopeStreak', key: 'slopeStreak200MA', latestOnly: true }
        ];

        const result: any = {};

        // If fetching "latest", first determine the reference date from monthly series
        // to ensure all metrics align to the same month
        let referenceDate: string | null = null;
        if (targetDate === 'latest') {
            const refDateRow = db.prepare(`
                SELECT date
                FROM percentile_analysis
                WHERE asset_class = 'derived' AND series_name = 'Real-Earnings-Yield-5yr'
                ORDER BY date DESC
                LIMIT 1
            `).get() as { date: string } | undefined;

            referenceDate = refDateRow?.date || null;
        }

        for (const s of series) {
            let query: string;
            let params: any[];

            if (targetDate === 'latest' && s.latestOnly) {
                // Daily data — always fetch the true latest row
                query = `
                    SELECT date, value, percentile_rank
                    FROM percentile_analysis
                    WHERE asset_class = ? AND series_name = ?
                    ORDER BY date DESC
                    LIMIT 1
                `;
                params = [s.asset_class, s.series_name];
            } else if (targetDate === 'latest' && referenceDate) {
                // Use reference date to align all series to the same month
                query = `
                    SELECT date, value, percentile_rank
                    FROM percentile_analysis
                    WHERE asset_class = ? AND series_name = ? AND date <= ?
                    ORDER BY date DESC
                    LIMIT 1
                `;
                params = [s.asset_class, s.series_name, referenceDate];
            } else if (targetDate === 'latest') {
                query = `
                    SELECT date, value, percentile_rank
                    FROM percentile_analysis
                    WHERE asset_class = ? AND series_name = ?
                    ORDER BY date DESC
                    LIMIT 1
                `;
                params = [s.asset_class, s.series_name];
            } else {
                // For specific dates, find data from the same month (prefer end of month)
                query = `
                    SELECT date, value, percentile_rank
                    FROM percentile_analysis
                    WHERE asset_class = ? 
                    AND series_name = ? 
                    AND strftime('%Y-%m', date) = strftime('%Y-%m', ?)
                    ORDER BY date DESC
                    LIMIT 1
                `;
                params = [s.asset_class, s.series_name, targetDate];
            }

            const row = db.prepare(query).get(...params) as
                | { date: string; value: number; percentile_rank: number | null }
                | undefined;

            result[s.key] = row
                ? {
                    value: row.value,
                    percentile: row.percentile_rank,
                    date: row.date
                }
                : null;
        }

        db.close();

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching regime data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
