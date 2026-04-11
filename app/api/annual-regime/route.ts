import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sp500Rows = await prisma.$queryRaw<Array<{ year: string; value: number }>>`
            SELECT
                substr(date::text, 1, 4) as year,
                value
            FROM macro_time_series
            WHERE asset_class = 'valuations'
              AND series_name = 'SP500-Price'
              AND column_name = 'Value'
            ORDER BY date ASC
        `;

        const sp500ByYear = new Map<number, number>();
        for (const row of sp500Rows) {
            sp500ByYear.set(parseInt(row.year), row.value);
        }

        const reyRows = await prisma.$queryRaw<Array<{ year: string; value: number; percentile_rank: number | null }>>`
            SELECT
                substr(date::text, 1, 4) as year,
                value,
                percentile_rank
            FROM macro_percentile_analysis
            WHERE asset_class = 'derived'
              AND series_name = 'Real-Earnings-Yield-5yr'
            ORDER BY date ASC
        `;

        const reyByYear = new Map<number, { value: number; percentile: number | null }>();
        for (const row of reyRows) {
            reyByYear.set(parseInt(row.year), { value: row.value, percentile: row.percentile_rank });
        }

        const eypRows = await prisma.$queryRaw<Array<{ year: string; value: number; percentile_rank: number | null }>>`
            SELECT
                substr(date::text, 1, 4) as year,
                value,
                percentile_rank
            FROM macro_percentile_analysis
            WHERE asset_class = 'derived'
              AND series_name = 'Earnings-Yield-Premium-5yr'
            ORDER BY date ASC
        `;

        const eypByYear = new Map<number, { value: number; percentile: number | null }>();
        for (const row of eypRows) {
            eypByYear.set(parseInt(row.year), { value: row.value, percentile: row.percentile_rank });
        }

        const real10YRows = await prisma.$queryRaw<Array<{ year: string; value: number; percentile_rank: number | null }>>`
            SELECT
                substr(date::text, 1, 4) as year,
                value,
                percentile_rank
            FROM macro_percentile_analysis
            WHERE asset_class = 'derived'
              AND series_name = 'Real-10Y'
            ORDER BY date ASC
        `;

        const real10YByYear = new Map<number, { value: number; percentile: number | null }>();
        for (const row of real10YRows) {
            real10YByYear.set(parseInt(row.year), { value: row.value, percentile: row.percentile_rank });
        }

        const years = [...new Set([
            ...sp500ByYear.keys(),
            ...reyByYear.keys(),
            ...eypByYear.keys(),
            ...real10YByYear.keys(),
        ])].sort();

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
