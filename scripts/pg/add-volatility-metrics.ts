#!/usr/bin/env tsx
/**
 * Calculates rolling volatility (63d, 126d, 252d, 504d) for equities and bonds,
 * saves to Postgres macro_time_series.
 */
import { prisma } from '../../lib/prisma';

function rollingStdDev(values: number[], window: number, annualize = 252, scalePercent = true): number | null {
    if (values.length < window) return null;
    const w = values.slice(-window);
    const mean = w.reduce((s, v) => s + v, 0) / window;
    const variance = w.reduce((s, v) => s + (v - mean) ** 2, 0) / window;
    const vol = Math.sqrt(variance) * Math.sqrt(annualize);
    return scalePercent ? vol * 100 : vol;
}

async function processVolatility(assetClass: string, seriesName: string, useAbsoluteChanges: boolean, scalePercent: boolean) {
    const latest = await prisma.macro_time_series.aggregate({
        where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value_Vol63' },
        _max: { date: true },
    });
    const latestComputed = latest._max.date;

    const prices = await prisma.macro_time_series.findMany({
        where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value', value: { not: null } },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    if (!prices.length) return;

    const changes: { date: string; ret: number }[] = [];
    for (let i = 1; i < prices.length; i++) {
        const prev = prices[i - 1].value!, curr = prices[i].value!;
        if (useAbsoluteChanges) {
            changes.push({ date: prices[i].date, ret: curr - prev });
        } else if (prev > 0) {
            changes.push({ date: prices[i].date, ret: (curr - prev) / prev });
        }
    }

    let fromIndex = 0;
    if (latestComputed) {
        const idx = changes.findIndex(r => r.date > latestComputed);
        if (idx === -1) { console.log(`  ✓ ${seriesName}: up to date`); return; }
        fromIndex = idx;
    }

    const rows: Array<{ date: string; asset_class: string; series_name: string; column_name: string; value: number }> = [];
    for (let i = fromIndex; i < changes.length; i++) {
        const retValues = changes.slice(0, i + 1).map(r => r.ret);
        for (const window of [63, 126, 252, 504]) {
            const vol = rollingStdDev(retValues, window, 252, scalePercent);
            if (vol !== null) rows.push({ date: changes[i].date, asset_class: assetClass, series_name: seriesName, column_name: `Value_Vol${window}`, value: vol });
        }
    }

    if (!rows.length) return;
    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_time_series.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
    }
    console.log(`  ✓ ${seriesName}: ${rows.length} volatility values`);
}

async function main() {
    console.log('📊 Calculating volatility metrics in Postgres...\n');

    console.log('=== EQUITIES ===');
    const equitySeries = await prisma.macro_series_metadata.findMany({ where: { asset_class: 'equities' }, select: { series_name: true } });
    for (const { series_name } of equitySeries) {
        try { await processVolatility('equities', series_name, false, true); }
        catch (e) { console.error(`  ✗ ${series_name}:`, e); }
    }

    console.log('\n=== BONDS ===');
    const bondSeries = await prisma.macro_series_metadata.findMany({
        where: { asset_class: 'bonds', series_name: { not: { contains: '-Monthly' } } },
        select: { series_name: true },
    });
    for (const { series_name } of bondSeries) {
        try { await processVolatility('bonds', series_name, true, false); }
        catch (e) { console.error(`  ✗ ${series_name}:`, e); }
    }

    console.log('\n✅ Volatility metrics complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
