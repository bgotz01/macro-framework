#!/usr/bin/env tsx
/**
 * Calculates percentile ranks for all SP500 MA-derived series and saves to Postgres.
 */
import { prisma } from '../../lib/prisma';

const SERIES = [
    'SP500-MA50', 'SP500-MA200', 'SP500-MA500',
    'SP500-50MA-Div', 'SP500-200MA-Div', 'SP500-500MA-Div',
    'SP500-50MA-Slope', 'SP500-200MA-Slope', 'SP500-500MA-Slope',
    'SP500-50MA-SlopeStreak', 'SP500-200MA-SlopeStreak', 'SP500-500MA-SlopeStreak',
    'SP500-50MA-PriceAboveStreak', 'SP500-200MA-PriceAboveStreak', 'SP500-500MA-PriceAboveStreak',
];

async function processPercentiles(seriesName: string) {
    const latest = await prisma.macro_percentile_analysis.aggregate({
        where: { asset_class: 'derived', series_name: seriesName, percentile_rank: { not: null } },
        _max: { date: true },
    });
    const latestComputed = latest._max.date;

    const allData = await prisma.macro_time_series.findMany({
        where: { asset_class: 'derived', series_name: seriesName, value: { not: null } },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    if (!allData.length) return;

    const newData = latestComputed ? allData.filter(d => d.date > latestComputed) : allData;
    if (!newData.length) { console.log(`  ✓ ${seriesName}: up to date`); return; }

    const sortedValues = [...allData].map(d => d.value!).sort((a, b) => a - b);
    const total = sortedValues.length;

    const rows = newData.map(d => {
        const rank = sortedValues.filter(v => v < d.value!).length;
        return { date: d.date, asset_class: 'derived', series_name: seriesName, column_name: 'value', value: d.value, percentile_rank: total > 1 ? (rank / (total - 1)) * 100 : 0 };
    });

    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_percentile_analysis.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
    }
    console.log(`  ✓ ${seriesName}: ${rows.length} percentile values`);
}

async function main() {
    console.log('📊 Calculating MA percentiles in Postgres...\n');
    for (const s of SERIES) {
        try { await processPercentiles(s); }
        catch (e) { console.error(`  ✗ ${s}:`, e); }
    }
    console.log('\n✅ MA percentiles complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
