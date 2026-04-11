#!/usr/bin/env tsx
/**
 * Calculates SP500 price divergence from 50/200/500-day MAs and saves to Postgres.
 */
import { prisma } from '../../lib/prisma';

async function main() {
    console.log('📊 Calculating SP500 MA divergence in Postgres...');

    const latest = await prisma.macro_time_series.aggregate({
        where: { asset_class: 'derived', series_name: 'SP500-200MA-Div' },
        _max: { date: true },
    });
    const latestComputed = latest._max.date;

    // Load prices and MAs together
    const prices = await prisma.macro_time_series.findMany({
        where: { asset_class: 'equities', series_name: 'US/GSPC', column_name: 'Value', ...(latestComputed ? { date: { gt: latestComputed } } : {}) },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    if (!prices.length) { console.log('✓ Already up to date'); return; }

    // Load MAs for those dates
    const dates = prices.map(p => p.date);
    const maRows = await prisma.macro_time_series.findMany({
        where: { asset_class: 'derived', series_name: { in: ['SP500-MA50', 'SP500-MA200', 'SP500-MA500'] }, date: { in: dates } },
        select: { date: true, series_name: true, value: true },
    });

    const maMap = new Map<string, { ma50?: number; ma200?: number; ma500?: number }>();
    for (const r of maRows) {
        const entry = maMap.get(r.date) ?? {};
        if (r.series_name === 'SP500-MA50') entry.ma50 = r.value ?? undefined;
        if (r.series_name === 'SP500-MA200') entry.ma200 = r.value ?? undefined;
        if (r.series_name === 'SP500-MA500') entry.ma500 = r.value ?? undefined;
        maMap.set(r.date, entry);
    }

    const rows: Array<{ date: string; asset_class: string; series_name: string; column_name: string; value: number }> = [];
    for (const p of prices) {
        const ma = maMap.get(p.date);
        if (!ma || !p.value) continue;
        if (ma.ma50) rows.push({ date: p.date, asset_class: 'derived', series_name: 'SP500-50MA-Div', column_name: 'value', value: ((p.value - ma.ma50) / ma.ma50) * 100 });
        if (ma.ma200) rows.push({ date: p.date, asset_class: 'derived', series_name: 'SP500-200MA-Div', column_name: 'value', value: ((p.value - ma.ma200) / ma.ma200) * 100 });
        if (ma.ma500) rows.push({ date: p.date, asset_class: 'derived', series_name: 'SP500-500MA-Div', column_name: 'value', value: ((p.value - ma.ma500) / ma.ma500) * 100 });
    }

    if (!rows.length) { console.log('✓ No new divergence data'); return; }

    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_time_series.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    for (const [name, label] of [['SP500-50MA-Div', '50MA'], ['SP500-200MA-Div', '200MA'], ['SP500-500MA-Div', '500MA']] as [string, string][]) {
        await prisma.macro_series_metadata.upsert({
            where: { asset_class_series_name: { asset_class: 'derived', series_name: name } },
            create: { asset_class: 'derived', series_name: name, display_name: `S&P 500 ${label} Divergence`, units: '%', last_updated: now },
            update: { last_updated: now },
        });
    }

    console.log(`✓ Inserted ${rows.length} divergence values`);
    console.log('✅ Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
