#!/usr/bin/env tsx
/**
 * Calculates SP500 and NDX price divergence from 50/200/500-day MAs and saves to Postgres.
 */
import { prisma } from '../../lib/prisma';

const INDEXES = [
    {
        label: 'SP500',
        priceSeriesName: 'US/GSPC',
        priceAssetClass: 'equities' as const,
        maNames: ['SP500-MA50', 'SP500-MA200', 'SP500-MA500'],
        divNames: ['SP500-50MA-Div', 'SP500-200MA-Div', 'SP500-500MA-Div'],
        anchorSeries: 'SP500-200MA-Div',
    },
    {
        label: 'NDX',
        priceSeriesName: 'NDX',
        priceAssetClass: 'equities' as const,
        maNames: ['NDX-MA50', 'NDX-MA200', 'NDX-MA500'],
        divNames: ['NDX-50MA-Div', 'NDX-200MA-Div', 'NDX-500MA-Div'],
        anchorSeries: 'NDX-200MA-Div',
    },
];

async function calculateDivergence(index: typeof INDEXES[number]) {
    console.log(`\n📊 ${index.label} MA divergence...`);

    const latest = await prisma.macro_time_series.aggregate({
        where: { asset_class: 'derived', series_name: index.anchorSeries },
        _max: { date: true },
    });
    const latestComputed = latest._max.date;

    const prices = await prisma.macro_time_series.findMany({
        where: { asset_class: index.priceAssetClass, series_name: index.priceSeriesName, column_name: 'Value', ...(latestComputed ? { date: { gt: latestComputed } } : {}) },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    if (!prices.length) { console.log('  ✓ Already up to date'); return; }

    const dates = prices.map(p => p.date);
    const maRows = await prisma.macro_time_series.findMany({
        where: { asset_class: 'derived', series_name: { in: index.maNames }, date: { in: dates } },
        select: { date: true, series_name: true, value: true },
    });

    const maMap = new Map<string, { ma50?: number; ma200?: number; ma500?: number }>();
    for (const r of maRows) {
        const entry = maMap.get(r.date) ?? {};
        if (r.series_name === index.maNames[0]) entry.ma50 = r.value ?? undefined;
        if (r.series_name === index.maNames[1]) entry.ma200 = r.value ?? undefined;
        if (r.series_name === index.maNames[2]) entry.ma500 = r.value ?? undefined;
        maMap.set(r.date, entry);
    }

    const rows: Array<{ date: string; asset_class: string; series_name: string; column_name: string; value: number }> = [];
    for (const p of prices) {
        const ma = maMap.get(p.date);
        if (!ma || !p.value) continue;
        if (ma.ma50) rows.push({ date: p.date, asset_class: 'derived', series_name: index.divNames[0], column_name: 'value', value: ((p.value - ma.ma50) / ma.ma50) * 100 });
        if (ma.ma200) rows.push({ date: p.date, asset_class: 'derived', series_name: index.divNames[1], column_name: 'value', value: ((p.value - ma.ma200) / ma.ma200) * 100 });
        if (ma.ma500) rows.push({ date: p.date, asset_class: 'derived', series_name: index.divNames[2], column_name: 'value', value: ((p.value - ma.ma500) / ma.ma500) * 100 });
    }

    if (!rows.length) { console.log('  ✓ No new divergence data'); return; }

    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_time_series.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    for (let j = 0; j < index.divNames.length; j++) {
        const periods = ['50MA', '200MA', '500MA'];
        await prisma.macro_series_metadata.upsert({
            where: { asset_class_series_name: { asset_class: 'derived', series_name: index.divNames[j] } },
            create: { asset_class: 'derived', series_name: index.divNames[j], display_name: `${index.label} ${periods[j]} Divergence`, units: '%', last_updated: now },
            update: { last_updated: now },
        });
    }

    console.log(`  ✓ Inserted ${rows.length} divergence values`);
}

async function main() {
    console.log('📊 Calculating MA divergence in Postgres...');
    for (const index of INDEXES) {
        await calculateDivergence(index);
    }
    console.log('\n✅ Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
