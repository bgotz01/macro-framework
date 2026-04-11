#!/usr/bin/env tsx
/**
 * Calculates SP500 MA slope streaks and price-above-MA streaks, saves to Postgres.
 */
import { prisma } from '../../lib/prisma';

async function calculateStreaks(maPeriod: string) {
    const slopeStreakName = `SP500-${maPeriod}MA-SlopeStreak`;
    const priceStreakName = `SP500-${maPeriod}MA-PriceAboveStreak`;
    const slopeName = `SP500-${maPeriod}MA-Slope`;
    const maName = `SP500-MA${maPeriod}`;

    const latest = await prisma.macro_time_series.aggregate({
        where: { asset_class: 'derived', series_name: slopeStreakName },
        _max: { date: true },
    });
    const latestComputed = latest._max.date;

    let currentSlopeStreak = 0, currentPriceStreak = 0;
    if (latestComputed) {
        const [ss, ps] = await Promise.all([
            prisma.macro_time_series.findFirst({ where: { asset_class: 'derived', series_name: slopeStreakName, date: latestComputed }, select: { value: true } }),
            prisma.macro_time_series.findFirst({ where: { asset_class: 'derived', series_name: priceStreakName, date: latestComputed }, select: { value: true } }),
        ]);
        currentSlopeStreak = ss?.value ?? 0;
        currentPriceStreak = ps?.value ?? 0;
    }

    // Load new rows joining price, MA, slope
    const slopeRows = await prisma.macro_time_series.findMany({
        where: { asset_class: 'derived', series_name: slopeName, ...(latestComputed ? { date: { gt: latestComputed } } : {}) },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    if (!slopeRows.length) { console.log(`  ✓ ${slopeStreakName}: up to date`); return; }

    const dates = slopeRows.map(r => r.date);
    const [prices, mas] = await Promise.all([
        prisma.macro_time_series.findMany({ where: { asset_class: 'equities', series_name: 'US/GSPC', column_name: 'Value', date: { in: dates } }, select: { date: true, value: true } }),
        prisma.macro_time_series.findMany({ where: { asset_class: 'derived', series_name: maName, date: { in: dates } }, select: { date: true, value: true } }),
    ]);

    const priceMap = new Map(prices.map(p => [p.date, p.value]));
    const maMap = new Map(mas.map(m => [m.date, m.value]));

    const rows: Array<{ date: string; asset_class: string; series_name: string; column_name: string; value: number }> = [];

    for (const r of slopeRows) {
        const slope = r.value ?? 0;
        const price = priceMap.get(r.date);
        const ma = maMap.get(r.date);

        if (slope > 0) currentSlopeStreak = currentSlopeStreak >= 0 ? currentSlopeStreak + 1 : 1;
        else if (slope < 0) currentSlopeStreak = currentSlopeStreak <= 0 ? currentSlopeStreak - 1 : -1;

        if (price != null && ma != null) {
            if (price > ma) currentPriceStreak = currentPriceStreak >= 0 ? currentPriceStreak + 1 : 1;
            else if (price < ma) currentPriceStreak = currentPriceStreak <= 0 ? currentPriceStreak - 1 : -1;
        }

        rows.push(
            { date: r.date, asset_class: 'derived', series_name: slopeStreakName, column_name: 'value', value: currentSlopeStreak },
            { date: r.date, asset_class: 'derived', series_name: priceStreakName, column_name: 'value', value: currentPriceStreak },
        );
    }

    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_time_series.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
    }

    for (const [name, label] of [[slopeStreakName, `${maPeriod}-Day MA Slope Streak`], [priceStreakName, `Price vs ${maPeriod}-Day MA Streak`]] as [string, string][]) {
        await prisma.macro_series_metadata.upsert({
            where: { asset_class_series_name: { asset_class: 'derived', series_name: name } },
            create: { asset_class: 'derived', series_name: name, display_name: label, units: 'days' },
            update: {},
        });
    }

    console.log(`  ✓ ${slopeStreakName}: ${rows.length / 2} values`);
}

async function main() {
    console.log('📊 Calculating SP500 MA streaks in Postgres...');
    for (const period of ['50', '200', '500']) {
        try { await calculateStreaks(period); }
        catch (e) { console.error(`  ✗ ${period}MA streaks:`, e); }
    }
    console.log('\n✅ MA streaks complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
