import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        // Get year-end S&P 500 prices (last available value each year)
        const sp500Rows = db.prepare(`
            SELECT 
                substr(date, 1, 4) as year,
                value
            FROM time_series
            WHERE asset_class = 'valuations'
              AND series_name = 'SP500-Price'
              AND column_name = 'Value'
            ORDER BY date ASC
        `).all() as Array<{ year: string; value: number }>;

        // Group by year, keep last value per year (rows are ASC so last write wins)
        const sp500ByYear = new Map<number, number>();
        for (const row of sp500Rows) {
            sp500ByYear.set(parseInt(row.year), row.value);
        }

        // Get year-end REY values (last available value each year)
        const reyRows = db.prepare(`
            SELECT 
                substr(date, 1, 4) as year,
                value,
                percentile_rank
            FROM percentile_analysis
            WHERE asset_class = 'derived'
              AND series_name = 'Real-Earnings-Yield-5yr'
            ORDER BY date ASC
        `).all() as Array<{ year: string; value: number; percentile_rank: number | null }>;

        const reyByYear = new Map<number, { value: number; percentile: number | null }>();
        for (const row of reyRows) {
            reyByYear.set(parseInt(row.year), {
                value: row.value,
                percentile: row.percentile_rank,
            });
        }

        // Get year-end EYP values
        const eypRows = db.prepare(`
            SELECT 
                substr(date, 1, 4) as year,
                value,
                percentile_rank
            FROM percentile_analysis
            WHERE asset_class = 'derived'
              AND series_name = 'Earnings-Yield-Premium-5yr'
            ORDER BY date ASC
        `).all() as Array<{ year: string; value: number; percentile_rank: number | null }>;

        const eypByYear = new Map<number, { value: number; percentile: number | null }>();
        for (const row of eypRows) {
            eypByYear.set(parseInt(row.year), {
                value: row.value,
                percentile: row.percentile_rank,
            });
        }

        // Get year-end Real 10Y values
        const real10YRows = db.prepare(`
            SELECT 
                substr(date, 1, 4) as year,
                value,
                percentile_rank
            FROM percentile_analysis
            WHERE asset_class = 'derived'
              AND series_name = 'Real-10Y'
            ORDER BY date ASC
        `).all() as Array<{ year: string; value: number; percentile_rank: number | null }>;

        const real10YByYear = new Map<number, { value: number; percentile: number | null }>();
        for (const row of real10YRows) {
            real10YByYear.set(parseInt(row.year), {
                value: row.value,
                percentile: row.percentile_rank,
            });
        }

        db.close();

        // Build annual data with returns
        const years = [...new Set([...sp500ByYear.keys(), ...reyByYear.keys(), ...eypByYear.keys(), ...real10YByYear.keys()])].sort();
        const data = [];

        for (const year of years) {
            const price = sp500ByYear.get(year);
            const prevPrice = sp500ByYear.get(year - 1);
            const rey = reyByYear.get(year);
            const eyp = eypByYear.get(year);
            const real10Y = real10YByYear.get(year);

            const reyStart = reyByYear.get(year - 1);
            const eypStart = eypByYear.get(year - 1);
            const real10YStart = real10YByYear.get(year - 1);

            const annualReturn = price && prevPrice
                ? ((price - prevPrice) / prevPrice) * 100
                : null;

            data.push({
                year,
                sp500Price: price ?? null,
                annualReturn,
                reyStart: reyStart?.value ?? null,
                reyValue: rey?.value ?? null,
                eypStart: eypStart?.value ?? null,
                eypValue: eyp?.value ?? null,
                real10YStart: real10YStart?.value ?? null,
                real10YValue: real10Y?.value ?? null,
            });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error fetching annual regime data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
