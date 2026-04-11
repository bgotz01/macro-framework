#!/usr/bin/env tsx
/**
 * Derives monthly series from daily data by taking the last trading day of each month.
 * Bonds: US/TNX, US/IRX, US/US-2yr
 * Valuations: US/GSPC -> SP500-Price
 */
import { prisma } from '../../lib/prisma';

const SERIES_MAP = [
    { sourceAssetClass: 'bonds', daily: 'US/TNX', targetAssetClass: 'bonds', monthly: 'US/TNX-Monthly', displayName: '10Y Treasury Yield (Monthly)' },
    { sourceAssetClass: 'bonds', daily: 'US/IRX', targetAssetClass: 'bonds', monthly: 'US/IRX-Monthly', displayName: '3M Treasury Yield (Monthly)' },
    { sourceAssetClass: 'bonds', daily: 'US/US-2yr', targetAssetClass: 'bonds', monthly: 'US/US-2yr-Monthly', displayName: '2Y Treasury Yield (Monthly)' },
    { sourceAssetClass: 'equities', daily: 'US/GSPC', targetAssetClass: 'valuations', monthly: 'SP500-Price', displayName: 'S&P 500 Price (Monthly)' },
];

async function processMonthly(sourceAssetClass: string, daily: string, targetAssetClass: string, monthly: string, displayName: string) {
    const latest = await prisma.macro_time_series.aggregate({
        where: { asset_class: targetAssetClass, series_name: monthly, column_name: 'Value' },
        _max: { date: true },
    });
    const latestComputed = latest._max.date;

    const dailyData = await prisma.macro_time_series.findMany({
        where: {
            asset_class: sourceAssetClass,
            series_name: daily,
            column_name: 'Value',
            value: { not: null },
            ...(latestComputed ? { date: { gt: latestComputed } } : {}),
        },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    if (!dailyData.length) { console.log(`  ✓ ${monthly}: up to date`); return; }

    // Group by YYYY-MM, take last entry per month
    const monthMap = new Map<string, { date: string; value: number }>();
    for (const row of dailyData) {
        const month = row.date.substring(0, 7);
        monthMap.set(month, { date: row.date, value: row.value! });
    }

    // Exclude current incomplete month
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const rows = [...monthMap.entries()]
        .filter(([month]) => month < currentMonth)
        .map(([, { date, value }]) => ({
            date, asset_class: targetAssetClass, series_name: monthly, column_name: 'Value', value,
        }));

    if (!rows.length) { console.log(`  ✓ ${monthly}: no complete new months yet`); return; }

    await prisma.macro_time_series.createMany({ data: rows, skipDuplicates: true });

    await prisma.macro_series_metadata.upsert({
        where: { asset_class_series_name: { asset_class: targetAssetClass, series_name: monthly } },
        create: { asset_class: targetAssetClass, series_name: monthly, display_name: displayName, last_updated: BigInt(Date.now()) },
        update: { last_updated: BigInt(Date.now()) },
    });

    console.log(`  ✓ ${monthly}: ${rows.length} new monthly values (latest: ${rows[rows.length - 1].date})`);
}

async function main() {
    console.log('📊 Calculating monthly series in Postgres...\n');
    for (const s of SERIES_MAP) {
        try { await processMonthly(s.sourceAssetClass, s.daily, s.targetAssetClass, s.monthly, s.displayName); }
        catch (e) { console.error(`  ✗ ${s.monthly}:`, e); }
    }
    console.log('\n✅ Monthly series complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
