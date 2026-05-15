import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fetch all relevant series for proximity calculation
const SERIES = [
    { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
    { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },
    { asset_class: 'derived', series_name: 'Real-10Y', key: 'real10Y' },
    { asset_class: 'derived', series_name: 'Real-3M', key: 'real3M' },
    { asset_class: 'economic', series_name: 'Real-M2-YoY', key: 'realM2' },
] as const;

type SeriesKey = typeof SERIES[number]['key'];

interface ConditionDef {
    dataKey: SeriesKey;
    threshold: number;
    direction: 'lte' | 'gte';
    range: number;
}

interface RegimeProximityDef {
    regime: string;
    conditions: ConditionDef[];
    logic: 'AND' | 'OR';
}

const REGIME_PROXIMITY_DEFS: RegimeProximityDef[] = [
    {
        regime: 'Liquidity Shock',
        conditions: [
            { dataKey: 'realM2', threshold: 10, direction: 'gte', range: 8 },
        ],
        logic: 'AND',
    },
    {
        regime: 'Crisis',
        conditions: [
            { dataKey: 'real10Y', threshold: -1, direction: 'lte', range: 3 },
            { dataKey: 'realM2', threshold: 5, direction: 'lte', range: 6 },
        ],
        logic: 'AND',
    },
    {
        regime: 'Bond Stress',
        conditions: [
            { dataKey: 'real10Y', threshold: -0.5, direction: 'lte', range: 3 },
            { dataKey: 'real3M', threshold: -1, direction: 'lte', range: 3 },
        ],
        logic: 'AND',
    },
    {
        regime: 'Overvaluation',
        conditions: [
            { dataKey: 'eyp5yr', threshold: -2.5, direction: 'lte', range: 3 },
            { dataKey: 'rey5yr', threshold: -0.5, direction: 'lte', range: 3 },
        ],
        logic: 'OR',
    },
    {
        regime: 'Broad Growth',
        conditions: [
            { dataKey: 'rey5yr', threshold: 3, direction: 'gte', range: 4 },
        ],
        logic: 'AND',
    },
    {
        regime: 'Long Duration',
        conditions: [
            { dataKey: 'eyp5yr', threshold: 0, direction: 'lte', range: 3 },
            { dataKey: 'real10Y', threshold: 1, direction: 'gte', range: 3 },
        ],
        logic: 'AND',
    },
];

function calcProximity(value: number | null, threshold: number, direction: 'lte' | 'gte', range: number): number {
    if (value === null) return 0;
    if (direction === 'lte') {
        if (value <= threshold) return 100;
        const distance = value - threshold;
        if (distance >= range) return 0;
        return Math.round(((range - distance) / range) * 100);
    } else {
        if (value >= threshold) return 100;
        const distance = threshold - value;
        if (distance >= range) return 0;
        return Math.round(((range - distance) / range) * 100);
    }
}

export async function GET() {
    try {
        const seriesNames = SERIES.map(s => s.series_name);

        const rows = await prisma.$queryRaw<{ series_name: string; date: string; value: number }[]>`
            SELECT series_name, date, value
            FROM macro_percentile_analysis
            WHERE series_name = ANY(${seriesNames})
            ORDER BY date ASC
        `;

        // Group by date, pivot into per-date metric map
        const byDate = new Map<string, Partial<Record<SeriesKey, number>>>();
        for (const row of rows) {
            const s = SERIES.find(s => s.series_name === row.series_name);
            if (!s) continue;
            if (!byDate.has(row.date)) byDate.set(row.date, {});
            byDate.get(row.date)![s.key] = row.value;
        }

        // For each date, compute proximity for each regime
        const result: Array<Record<string, string | number>> = [];

        for (const [date, metrics] of byDate) {
            const point: Record<string, string | number> = { date };

            for (const def of REGIME_PROXIMITY_DEFS) {
                const proximities = def.conditions.map(cond => {
                    const val = metrics[cond.dataKey] ?? null;
                    return calcProximity(val, cond.threshold, cond.direction, cond.range);
                });

                const overall = def.logic === 'OR'
                    ? Math.max(...proximities)
                    : Math.min(...proximities);

                // camelCase key: "Broad Growth" -> "broadGrowth"
                const key = def.regime.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, c => c.toLowerCase());
                point[key] = overall;
            }

            result.push(point);
        }

        result.sort((a, b) => (a.date as string).localeCompare(b.date as string));

        return NextResponse.json({ data: result }, {
            headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
        });
    } catch (error) {
        console.error('Error fetching regime proximity history:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
