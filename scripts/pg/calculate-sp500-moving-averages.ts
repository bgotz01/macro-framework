#!/usr/bin/env tsx
/**
 * Calculates SP500 and NDX 50/200/500-day moving averages and saves to Postgres.
 */
import { prisma } from '../../lib/prisma';

const INDEXES = [
    {
        label: 'SP500',
        seriesName: 'US/GSPC',
        assetClass: 'equities' as const,
        windows: [
            { period: 50, name: 'SP500-MA50', display: 'S&P 500 50-Day MA' },
            { period: 200, name: 'SP500-MA200', display: 'S&P 500 200-Day MA' },
            { period: 500, name: 'SP500-MA500', display: 'S&P 500 500-Day MA' },
        ],
    },
    {
        label: 'NDX',
        seriesName: 'NDX',
        assetClass: 'equities' as const,
        windows: [
            { period: 50, name: 'NDX-MA50', display: 'NDX 50-Day MA' },
            { period: 200, name: 'NDX-MA200', display: 'NDX 200-Day MA' },
            { period: 500, name: 'NDX-MA500', display: 'NDX 500-Day MA' },
        ],
    },
];

async function calculateMAs(index: typeof INDEXES[number]) {
    console.log(`\n📈 ${index.label} moving averages...`);

    const latest = await prisma.macro_time_series.aggregate({
        where: { asset_class: 'derived', series_name: index.windows[1].name }, // use 200MA as anchor
        _max: { date: true },
    });
    const latestComputed = latest._max.date;

    const prices = await prisma.macro_time_series.findMany({
        where: { asset_class: index.assetClass, series_name: index.seriesName, column_name: 'Value', value: { not: null } },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    console.log(`  Found ${prices.length} price records`);
    if (!prices.length) { console.error(`  No ${index.label} data`); return; }

    let fromIndex = 0;
    if (latestComputed) {
        const idx = prices.findIndex(d => d.date > latestComputed);
        if (idx === -1) { console.log('  ✓ Already up to date'); return; }
        fromIndex = idx;
        console.log(`  Incremental: ${prices.length - fromIndex} new dates`);
    }

    const rows: Array<{ date: string; asset_class: string; series_name: string; column_name: string; value: number }> = [];

    for (const w of index.windows) {
        const startIdx = Math.max(fromIndex, w.period - 1);
        for (let i = startIdx; i < prices.length; i++) {
            if (latestComputed && prices[i].date <= latestComputed) continue;
            const sum = prices.slice(i - w.period + 1, i + 1).reduce((s, p) => s + p.value!, 0);
            rows.push({ date: prices[i].date, asset_class: 'derived', series_name: w.name, column_name: 'value', value: sum / w.period });
        }
        console.log(`  ${w.name}: ${rows.filter(r => r.series_name === w.name).length} new values`);
    }

    if (!rows.length) { console.log('  ✓ Already up to date'); return; }

    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_time_series.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    for (const w of index.windows) {
        await prisma.macro_series_metadata.upsert({
            where: { asset_class_series_name: { asset_class: 'derived', series_name: w.name } },
            create: { asset_class: 'derived', series_name: w.name, display_name: w.display, last_updated: now },
            update: { last_updated: now },
        });
    }

    console.log(`  ✓ Inserted ${rows.length} MA values`);
}

async function main() {
    console.log('📈 Calculating moving averages in Postgres...');
    for (const index of INDEXES) {
        await calculateMAs(index);
    }
    console.log('\n✅ Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
