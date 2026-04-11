#!/usr/bin/env tsx
/**
 * Calculates daily % slope of SP500 50/200/500-day MAs and saves to Postgres.
 */
import { prisma } from '../../lib/prisma';

async function calculateSlope(maPeriod: string) {
    const slopeName = `SP500-${maPeriod}MA-Slope`;
    const maName = `SP500-MA${maPeriod}`;

    const latest = await prisma.macro_time_series.aggregate({
        where: { asset_class: 'derived', series_name: slopeName },
        _max: { date: true },
    });
    const latestComputed = latest._max.date;

    // Load one row before cutoff to compute first slope
    const maData = await prisma.macro_time_series.findMany({
        where: {
            asset_class: 'derived', series_name: maName,
            ...(latestComputed ? { date: { gte: latestComputed } } : {}),
        },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    if (maData.length < 2) { console.log(`  ✓ ${slopeName}: up to date`); return; }

    const rows: Array<{ date: string; asset_class: string; series_name: string; column_name: string; value: number }> = [];
    for (let i = 1; i < maData.length; i++) {
        if (latestComputed && maData[i].date <= latestComputed) continue;
        const curr = maData[i].value!, prev = maData[i - 1].value!;
        if (prev !== 0) rows.push({ date: maData[i].date, asset_class: 'derived', series_name: slopeName, column_name: 'value', value: ((curr - prev) / prev) * 100 });
    }

    if (!rows.length) { console.log(`  ✓ ${slopeName}: up to date`); return; }

    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_time_series.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
    }

    await prisma.macro_series_metadata.upsert({
        where: { asset_class_series_name: { asset_class: 'derived', series_name: slopeName } },
        create: { asset_class: 'derived', series_name: slopeName, display_name: `S&P 500 ${maPeriod}-Day MA Slope`, units: '%' },
        update: {},
    });

    console.log(`  ✓ ${slopeName}: ${rows.length} values`);
}

async function main() {
    console.log('📈 Calculating SP500 MA slopes in Postgres...');
    for (const period of ['50', '200', '500']) {
        try { await calculateSlope(period); }
        catch (e) { console.error(`  ✗ ${period}MA slope:`, e); }
    }
    console.log('\n✅ MA slopes complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
