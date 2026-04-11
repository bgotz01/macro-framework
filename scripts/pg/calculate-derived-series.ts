#!/usr/bin/env tsx
/**
 * Calculates all derived series (Real Yields, Yield Curves, EYP, REY)
 * and their percentile ranks in Postgres. Incremental — only adds new dates.
 *
 * Formulas:
 *   Real-10Y          = US/TNX-Monthly - CPI
 *   Real-3M           = US/IRX-Monthly - CPI
 *   Yield-Curve       = US/TNX-Monthly - US/US-2yr-Monthly
 *   Yield-Curve-10Y-3M= US/TNX-Monthly - US/IRX-Monthly
 *   Earnings-Yield-Premium     = (100/Shiller-PE) - US/IRX-Monthly
 *   Earnings-Yield-Premium-5yr = (100/PE-5yr) - US/IRX-Monthly
 *   Real-Earnings-Yield        = (100/Shiller-PE) - CPI
 *   Real-Earnings-Yield-5yr    = Earnings-Yield-5yr - CPI
 */
import { prisma } from '../../lib/prisma';

type Row = { date: string; value: number };

async function loadSeries(asset_class: string, series_name: string): Promise<Map<string, number>> {
    const rows = await prisma.macro_time_series.findMany({
        where: { asset_class, series_name, column_name: 'Value', value: { not: null } },
        select: { date: true, value: true },
    });
    // Key by YYYY-MM for monthly matching
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.date.substring(0, 7), r.value!);
    return map;
}

async function loadSeriesByDate(asset_class: string, series_name: string): Promise<Map<string, number>> {
    const rows = await prisma.macro_time_series.findMany({
        where: { asset_class, series_name, column_name: 'Value', value: { not: null } },
        select: { date: true, value: true },
    });
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.date, r.value!);
    return map;
}

function percentileRank(values: number[], target: number): number {
    const below = values.filter(v => v < target).length;
    return values.length > 1 ? (below / (values.length - 1)) * 100 : 0;
}

async function upsertDerived(seriesName: string, rows: Row[], displayName: string) {
    if (!rows.length) { console.log(`  ✓ ${seriesName}: no new data`); return; }

    // Upsert time_series
    await prisma.macro_time_series.createMany({
        data: rows.map(r => ({ date: r.date, asset_class: 'derived', series_name: seriesName, column_name: 'Value', value: r.value })),
        skipDuplicates: true,
    });

    // Recalculate percentiles for ALL data (needed for correct ranking after new rows)
    const allRows = await prisma.macro_time_series.findMany({
        where: { asset_class: 'derived', series_name: seriesName, column_name: 'Value', value: { not: null } },
        select: { date: true, value: true },
        orderBy: { date: 'asc' },
    });
    const allValues = allRows.map(r => r.value!);

    // Only insert percentiles for new dates
    const newDates = new Set(rows.map(r => r.date));
    const pctRows = allRows
        .filter(r => newDates.has(r.date))
        .map(r => ({
            date: r.date, asset_class: 'derived', series_name: seriesName,
            column_name: 'Value', value: r.value,
            percentile_rank: Math.round(percentileRank(allValues, r.value!) * 100) / 100,
        }));

    await prisma.macro_percentile_analysis.createMany({ data: pctRows, skipDuplicates: true });

    await prisma.macro_series_metadata.upsert({
        where: { asset_class_series_name: { asset_class: 'derived', series_name: seriesName } },
        create: { asset_class: 'derived', series_name: seriesName, display_name: displayName, units: 'percent', last_updated: BigInt(Date.now()) },
        update: { last_updated: BigInt(Date.now()) },
    });

    console.log(`  ✓ ${seriesName}: ${rows.length} new values`);
}

async function getLatestDate(seriesName: string, force: boolean): Promise<string> {
    if (force) return '1900-01-01';
    const r = await prisma.macro_time_series.aggregate({
        where: { asset_class: 'derived', series_name: seriesName, column_name: 'Value' },
        _max: { date: true },
    });
    return r._max.date ?? '1900-01-01';
}

async function main() {
    const force = process.argv.includes('--force');
    if (force) console.log('⚠️  Force mode: recalculating all derived series\n');
    console.log('📊 Calculating derived series in Postgres...\n');

    // Load source data
    const [tnx, irx, us2yr, cpi, shillerPE, pe5yr, ey5yr, pe2yr, ey2yr] = await Promise.all([
        loadSeries('bonds', 'US/TNX-Monthly'),
        loadSeries('bonds', 'US/IRX-Monthly'),
        loadSeriesByDate('bonds', 'US/US-2yr-Monthly'),
        loadSeries('economic', 'CPI'),
        loadSeries('valuations', 'Shiller-PE'),
        loadSeriesByDate('valuations', 'PE-5yr'),
        loadSeriesByDate('valuations', 'Earnings-Yield-5yr'),
        loadSeriesByDate('valuations', 'PE-2yr'),
        loadSeriesByDate('valuations', 'Earnings-Yield-2yr'),
    ]);

    // Also load US/US-2yr-Monthly by month key for matching
    const us2yrByMonth = new Map<string, number>();
    for (const [date, val] of us2yr) us2yrByMonth.set(date.substring(0, 7), val);

    const pe5yrByMonth = new Map<string, number>();
    for (const [date, val] of pe5yr) pe5yrByMonth.set(date.substring(0, 7), val);

    const ey5yrByMonth = new Map<string, number>();
    for (const [date, val] of ey5yr) ey5yrByMonth.set(date.substring(0, 7), val);

    const pe2yrByMonth = new Map<string, number>();
    for (const [date, val] of pe2yr) pe2yrByMonth.set(date.substring(0, 7), val);

    const ey2yrByMonth = new Map<string, number>();
    for (const [date, val] of ey2yr) ey2yrByMonth.set(date.substring(0, 7), val);

    // Helper: build rows for a derived series, only new dates
    function buildRows(
        sourceMap: Map<string, number>,
        calc: (month: string) => number | null,
        latestDate: string
    ): Row[] {
        const rows: Row[] = [];
        // We need the actual date (not just month) — use TNX dates as canonical
        for (const [month, _] of sourceMap) {
            // Find the actual date for this month from TNX
            const val = calc(month);
            if (val === null || isNaN(val)) continue;
            // Get canonical date from TNX monthly
            rows.push({ date: month, value: val }); // placeholder, fix below
        }
        return rows;
    }

    // Load canonical dates (last trading day of month) from TNX-Monthly
    const tnxDates = await prisma.macro_time_series.findMany({
        where: { asset_class: 'bonds', series_name: 'US/TNX-Monthly', column_name: 'Value' },
        select: { date: true },
        orderBy: { date: 'asc' },
    });
    const monthToDate = new Map<string, string>();
    for (const r of tnxDates) monthToDate.set(r.date.substring(0, 7), r.date);

    // CPI dates (for CPI-based series, use CPI date as canonical)
    const cpiDates = await prisma.macro_time_series.findMany({
        where: { asset_class: 'economic', series_name: 'CPI', column_name: 'Value' },
        select: { date: true },
        orderBy: { date: 'asc' },
    });
    const cpiMonthToDate = new Map<string, string>();
    for (const r of cpiDates) cpiMonthToDate.set(r.date.substring(0, 7), r.date);

    function makeRows(
        months: string[],
        calc: (m: string) => number | null,
        latestDate: string,
        dateMap: Map<string, string>
    ): Row[] {
        return months
            .filter(m => {
                const d = dateMap.get(m);
                return d && d > latestDate;
            })
            .map(m => ({ date: dateMap.get(m)!, value: calc(m)! }))
            .filter(r => r.value !== null && !isNaN(r.value));
    }

    const allMonths = [...new Set([...tnx.keys(), ...cpi.keys()])].sort();

    // 1. Real-10Y = TNX - CPI
    const real10yLatest = await getLatestDate('Real-10Y', force);
    await upsertDerived('Real-10Y', makeRows(allMonths, m => {
        const t = tnx.get(m), c = cpi.get(m);
        return t != null && c != null ? t - c : null;
    }, real10yLatest, monthToDate), 'Real 10Y (10Y-CPI)');

    // 2. Real-3M = IRX - CPI
    const real3mLatest = await getLatestDate('Real-3M', force);
    await upsertDerived('Real-3M', makeRows(allMonths, m => {
        const i = irx.get(m), c = cpi.get(m);
        return i != null && c != null ? i - c : null;
    }, real3mLatest, monthToDate), 'Real 3M (3M-CPI)');

    // 3. Yield-Curve = TNX - US2yr
    const ycLatest = await getLatestDate('Yield-Curve', force);
    await upsertDerived('Yield-Curve', makeRows(allMonths, m => {
        const t = tnx.get(m), u = us2yrByMonth.get(m);
        return t != null && u != null ? t - u : null;
    }, ycLatest, monthToDate), 'Yield Curve (10Y-2Y)');

    // 4. Yield-Curve-10Y-3M = TNX - IRX
    const yc3mLatest = await getLatestDate('Yield-Curve-10Y-3M', force);
    await upsertDerived('Yield-Curve-10Y-3M', makeRows(allMonths, m => {
        const t = tnx.get(m), i = irx.get(m);
        return t != null && i != null ? t - i : null;
    }, yc3mLatest, monthToDate), 'Yield Curve (10Y-3M)');

    // 5. Earnings-Yield-Premium = (100/Shiller-PE) - IRX
    const eypLatest = await getLatestDate('Earnings-Yield-Premium', force);
    await upsertDerived('Earnings-Yield-Premium', makeRows(allMonths, m => {
        const pe = shillerPE.get(m), i = irx.get(m);
        return pe != null && pe > 0 && i != null ? (100 / pe) - i : null;
    }, eypLatest, cpiMonthToDate), 'Earnings Yield Premium (EY-3M)');

    // 6. Earnings-Yield-Premium-5yr = (100/PE-5yr) - IRX
    const eyp5yrLatest = await getLatestDate('Earnings-Yield-Premium-5yr', force);
    await upsertDerived('Earnings-Yield-Premium-5yr', makeRows(allMonths, m => {
        const pe = pe5yrByMonth.get(m), i = irx.get(m);
        return pe != null && pe > 0 && i != null ? (100 / pe) - i : null;
    }, eyp5yrLatest, monthToDate), 'Earnings Yield Premium 5yr');

    // 6b. Earnings-Yield-Premium-2yr = (100/PE-2yr) - IRX
    const eyp2yrLatest = await getLatestDate('Earnings-Yield-Premium-2yr', force);
    await upsertDerived('Earnings-Yield-Premium-2yr', makeRows(allMonths, m => {
        const pe = pe2yrByMonth.get(m), i = irx.get(m);
        return pe != null && pe > 0 && i != null ? (100 / pe) - i : null;
    }, eyp2yrLatest, monthToDate), 'Earnings Yield Premium 2yr');

    // 7. Real-Earnings-Yield = (100/Shiller-PE) - CPI
    const reyLatest = await getLatestDate('Real-Earnings-Yield', force);
    await upsertDerived('Real-Earnings-Yield', makeRows(allMonths, m => {
        const pe = shillerPE.get(m), c = cpi.get(m);
        return pe != null && pe > 0 && c != null ? (100 / pe) - c : null;
    }, reyLatest, cpiMonthToDate), 'Real Earnings Yield (EY-CPI)');

    // 8. Real-Earnings-Yield-5yr = EY-5yr - CPI
    const rey5yrLatest = await getLatestDate('Real-Earnings-Yield-5yr', force);
    await upsertDerived('Real-Earnings-Yield-5yr', makeRows(allMonths, m => {
        const ey = ey5yrByMonth.get(m), c = cpi.get(m);
        return ey != null && c != null ? ey - c : null;
    }, rey5yrLatest, cpiMonthToDate), 'Real Earnings Yield 5yr');

    // 8b. Real-Earnings-Yield-2yr = EY-2yr - CPI
    const rey2yrLatest = await getLatestDate('Real-Earnings-Yield-2yr', force);
    await upsertDerived('Real-Earnings-Yield-2yr', makeRows(allMonths, m => {
        const ey = ey2yrByMonth.get(m), c = cpi.get(m);
        return ey != null && c != null ? ey - c : null;
    }, rey2yrLatest, cpiMonthToDate), 'Real Earnings Yield 2yr');

    console.log('\n✅ All derived series complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
