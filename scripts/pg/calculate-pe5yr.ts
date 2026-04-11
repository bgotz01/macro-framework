#!/usr/bin/env tsx
/**
 * Calculates PE-5yr = SP500-Price / SP500-EPS-5yr (incremental)
 * Then derives Earnings-Yield-5yr = 100 / PE-5yr
 * Both saved to macro_time_series as asset_class='valuations'
 */
import { prisma } from '../../lib/prisma';

async function main() {
    console.log('📊 Calculating PE-5yr and Earnings-Yield-5yr in Postgres...\n');

    // Find latest already computed per series
    const [latest5yr, latest2yr] = await Promise.all([
        prisma.macro_time_series.aggregate({
            where: { asset_class: 'valuations', series_name: 'PE-5yr', column_name: 'Value' },
            _max: { date: true },
        }),
        prisma.macro_time_series.aggregate({
            where: { asset_class: 'valuations', series_name: 'PE-2yr', column_name: 'Value' },
            _max: { date: true },
        }),
    ]);
    const latestComputed5yr = latest5yr._max.date ?? '1900-01-01';
    const latestComputed2yr = latest2yr._max.date ?? '1900-01-01';
    const latestComputed = latestComputed5yr < latestComputed2yr ? latestComputed5yr : latestComputed2yr;
    console.log(`Latest PE-5yr: ${latestComputed5yr}, PE-2yr: ${latestComputed2yr}`);

    // Load price and EPS data newer than latest
    const [prices, eps5yr, eps2yr] = await Promise.all([
        prisma.macro_time_series.findMany({
            where: { asset_class: 'valuations', series_name: 'SP500-Price', column_name: 'Value', value: { not: null }, date: { gt: latestComputed } },
            select: { date: true, value: true },
            orderBy: { date: 'asc' },
        }),
        prisma.macro_time_series.findMany({
            where: { asset_class: 'valuations', series_name: 'SP500-EPS-5yr', column_name: 'Value', value: { not: null } },
            select: { date: true, value: true },
        }),
        prisma.macro_time_series.findMany({
            where: { asset_class: 'valuations', series_name: 'SP500-EPS-2yr', column_name: 'Value', value: { not: null } },
            select: { date: true, value: true },
        }),
    ]);

    if (!prices.length) { console.log('✓ PE ratios already up to date'); return; }

    const eps5yrMap = new Map(eps5yr.map(r => [r.date, r.value!]));
    const eps2yrMap = new Map(eps2yr.map(r => [r.date, r.value!]));

    const rows: Array<{ date: string; asset_class: string; series_name: string; column_name: string; value: number }> = [];

    for (const p of prices) {
        const e5 = eps5yrMap.get(p.date);
        if (e5 && e5 > 0) {
            const pe = p.value! / e5;
            rows.push({ date: p.date, asset_class: 'valuations', series_name: 'PE-5yr', column_name: 'Value', value: pe });
            rows.push({ date: p.date, asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', column_name: 'Value', value: 100 / pe });
        }
        const e2 = eps2yrMap.get(p.date);
        if (e2 && e2 > 0) {
            const pe = p.value! / e2;
            rows.push({ date: p.date, asset_class: 'valuations', series_name: 'PE-2yr', column_name: 'Value', value: pe });
            rows.push({ date: p.date, asset_class: 'valuations', series_name: 'Earnings-Yield-2yr', column_name: 'Value', value: 100 / pe });
        }
    }

    if (!rows.length) { console.log('✓ No matching price/EPS dates found'); return; }

    await prisma.macro_time_series.createMany({ data: rows, skipDuplicates: true });
    console.log(`✓ Inserted ${rows.length} PE/EY values (latest: ${prices[prices.length - 1].date})`);
    console.log('\n✅ Done. Run calculate-percentiles.ts and calculate-derived-series.ts next.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
