#!/usr/bin/env tsx
/**
 * Calculates 2Y, 5Y, 10Y cyclical returns for equities/commodities/crypto/volatility
 * and saves to Postgres macro_time_series.
 */
import { prisma } from '../../lib/prisma';

const ASSET_CLASSES = ['equities', 'commodities', 'crypto', 'volatility'];

async function processSeriesCyclicalReturns(assetClass: string, seriesName: string) {
    // Find latest already computed
    const latest = await prisma.macro_time_series.aggregate({
        where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value_Return2Y' },
        _max: { date: true },
    });
    const latestComputed = latest._max.date;

    // Load all source data (need full history for lookbacks)
    const data = await prisma.macro_time_series.findMany({
        where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value', value: { not: null } },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    if (data.length < 252 * 2) return;

    let fromIndex = 0;
    if (latestComputed) {
        const idx = data.findIndex(d => d.date > latestComputed);
        if (idx === -1) { console.log(`  ✓ ${seriesName}: up to date`); return; }
        fromIndex = idx;
    }

    const rows: Array<{ date: string; asset_class: string; series_name: string; column_name: string; value: number }> = [];

    for (let i = fromIndex; i < data.length; i++) {
        const curr = data[i].value!;
        const date = data[i].date;
        for (const [periods, col] of [[252 * 2, 'Value_Return2Y'], [252 * 5, 'Value_Return5Y'], [252 * 10, 'Value_Return10Y']] as [number, string][]) {
            if (i >= periods) {
                const past = data[i - periods].value!;
                if (past !== 0) rows.push({ date, asset_class: assetClass, series_name: seriesName, column_name: col, value: ((curr - past) / past) * 100 });
            }
        }
    }

    if (!rows.length) return;
    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_time_series.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
    }
    console.log(`  ✓ ${seriesName}: ${rows.length} cyclical return values`);
}

async function main() {
    console.log('📈 Calculating cyclical returns in Postgres...\n');

    for (const assetClass of ASSET_CLASSES) {
        const series = await prisma.macro_time_series.findMany({
            where: { asset_class: assetClass, column_name: 'Value' },
            distinct: ['series_name'],
            select: { series_name: true },
        });
        console.log(`\n${assetClass.toUpperCase()}: ${series.length} series`);
        for (const { series_name } of series) {
            try { await processSeriesCyclicalReturns(assetClass, series_name); }
            catch (e) { console.error(`  ✗ ${series_name}:`, e); }
        }
    }

    console.log('\n✅ Cyclical returns complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
