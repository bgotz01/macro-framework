import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface SeriesConfig {
    asset_class: string;
    series_name: string;
    key: string;
    latestOnly?: boolean;
}

const SERIES: SeriesConfig[] = [
    { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
    { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
    { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
    { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
    { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
    { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },
    { asset_class: 'derived', series_name: 'Real-10Y', key: 'real10Y' },
    { asset_class: 'derived', series_name: 'Real-3M', key: 'real3M' },
    { asset_class: 'economic', series_name: 'Real-M2-YoY', key: 'realM2' },
    { asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', key: 'yieldCurve' },
    { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
    { asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', key: 'ey5yr' },
    { asset_class: 'derived', series_name: 'SP500-200MA-Slope', key: 'slope200MA', latestOnly: true },
    { asset_class: 'derived', series_name: 'SP500-500MA-Slope', key: 'slope500MA', latestOnly: true },
    { asset_class: 'derived', series_name: 'SP500-200MA-Div', key: 'divergence200MA', latestOnly: true },
    { asset_class: 'derived', series_name: 'SP500-200MA-PriceAboveStreak', key: 'daysAbove200MA', latestOnly: true },
    { asset_class: 'derived', series_name: 'SP500-200MA-SlopeStreak', key: 'slopeStreak200MA', latestOnly: true },
];

// Build a key for grouping rows back to their SeriesConfig
function seriesKey(asset_class: string, series_name: string) {
    return `${asset_class}::${series_name}`;
}

export async function GET(request: NextRequest) {
    const targetDate = request.nextUrl.searchParams.get('date') || 'latest';

    try {
        // Resolve reference date for monthly alignment (single query)
        let referenceDate: string | null = null;
        if (targetDate === 'latest') {
            const rows = await prisma.$queryRaw<{ date: string }[]>`
                SELECT date FROM macro_percentile_analysis
                WHERE asset_class = 'derived' AND series_name = 'Real-Earnings-Yield-5yr'
                ORDER BY date DESC LIMIT 1
            `;
            referenceDate = rows[0]?.date ?? null;
        }

        // Split series into latestOnly vs monthly-aligned
        const latestOnlySeries = SERIES.filter(s => s.latestOnly);
        const monthlySeries = SERIES.filter(s => !s.latestOnly);

        // Build series name arrays for IN clauses
        const latestOnlyNames = latestOnlySeries.map(s => s.series_name);
        const monthlyNames = monthlySeries.map(s => s.series_name);

        // Fetch all rows in 2 batched queries using DISTINCT ON for "latest per series"
        const [latestOnlyRows, monthlyRows] = await Promise.all([
            latestOnlyNames.length > 0
                ? prisma.$queryRaw<{ asset_class: string; series_name: string; date: string; value: number; percentile_rank: number | null }[]>`
                    SELECT DISTINCT ON (asset_class, series_name)
                        asset_class, series_name, date, value, percentile_rank
                    FROM macro_percentile_analysis
                    WHERE series_name = ANY(${latestOnlyNames})
                    ORDER BY asset_class, series_name, date DESC
                  `
                : Promise.resolve([]),

            monthlyNames.length > 0
                ? targetDate === 'latest' && referenceDate
                    ? prisma.$queryRaw<{ asset_class: string; series_name: string; date: string; value: number; percentile_rank: number | null }[]>`
                        SELECT DISTINCT ON (asset_class, series_name)
                            asset_class, series_name, date, value, percentile_rank
                        FROM macro_percentile_analysis
                        WHERE series_name = ANY(${monthlyNames})
                          AND date <= ${referenceDate}
                        ORDER BY asset_class, series_name, date DESC
                      `
                    : targetDate === 'latest'
                        ? prisma.$queryRaw<{ asset_class: string; series_name: string; date: string; value: number; percentile_rank: number | null }[]>`
                        SELECT DISTINCT ON (asset_class, series_name)
                            asset_class, series_name, date, value, percentile_rank
                        FROM macro_percentile_analysis
                        WHERE series_name = ANY(${monthlyNames})
                        ORDER BY asset_class, series_name, date DESC
                      `
                        : prisma.$queryRaw<{ asset_class: string; series_name: string; date: string; value: number; percentile_rank: number | null }[]>`
                        SELECT DISTINCT ON (asset_class, series_name)
                            asset_class, series_name, date, value, percentile_rank
                        FROM macro_percentile_analysis
                        WHERE series_name = ANY(${monthlyNames})
                          AND LEFT(date, 7) = LEFT(${targetDate}, 7)
                        ORDER BY asset_class, series_name, date DESC
                      `
                : Promise.resolve([]),
        ]);

        // Index all rows by asset_class::series_name for O(1) lookup
        const rowMap = new Map<string, { date: string; value: number; percentile_rank: number | null }>();
        for (const row of [...latestOnlyRows, ...monthlyRows]) {
            rowMap.set(seriesKey(row.asset_class, row.series_name), row);
        }

        // Build result object
        const result: Record<string, { value: number; percentile: number | null; date: string } | null> = {};
        for (const s of SERIES) {
            const row = rowMap.get(seriesKey(s.asset_class, s.series_name));
            result[s.key] = row
                ? { value: row.value, percentile: row.percentile_rank, date: row.date }
                : null;
        }

        return NextResponse.json(result, {
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch (error) {
        console.error('Error fetching regime data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
