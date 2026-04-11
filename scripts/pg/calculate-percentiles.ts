#!/usr/bin/env tsx
/**
 * Calculates percentile ranks for key macro series and saves to Postgres macro_percentile_analysis.
 */
import { prisma } from '../../lib/prisma';

const SERIES_TO_ANALYZE = [
    { assetClass: 'economic', seriesName: 'CPI', columnName: 'Value' },
    { assetClass: 'economic', seriesName: 'US/FEDFUNDS', columnName: 'Value' },
    { assetClass: 'bonds', seriesName: 'US/TNX-Monthly', columnName: 'Value' },
    { assetClass: 'bonds', seriesName: 'US/US-2yr-Monthly', columnName: 'Value' },
    { assetClass: 'bonds', seriesName: 'US/IRX-Monthly', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'Shiller-PE', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'PE-5yr', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'PE-2yr', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'Earnings-Yield-5yr', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'Earnings-Yield-2yr', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'Earnings-Yield', columnName: 'Value' },
];

async function processPercentiles(assetClass: string, seriesName: string, columnName: string, force: boolean) {
    console.log(`Processing ${assetClass}/${seriesName}...`);

    const latest = force ? null : await prisma.macro_percentile_analysis.aggregate({
        where: { asset_class: assetClass, series_name: seriesName, column_name: columnName },
        _max: { date: true },
    });
    const latestComputed = force ? null : latest!._max.date;

    // Load all data (need full history for correct percentile ranking)
    const allData = await prisma.macro_time_series.findMany({
        where: { asset_class: assetClass, series_name: seriesName, column_name: columnName, value: { not: null } },
        orderBy: { date: 'asc' },
        select: { date: true, value: true },
    });

    if (!allData.length) { console.log(`  No data`); return; }

    const newData = latestComputed ? allData.filter(d => d.date > latestComputed) : allData;
    if (!newData.length) { console.log(`  ✓ Up to date`); return; }

    // Sort all values for percentile ranking
    const sortedValues = [...allData].map(d => d.value!).sort((a, b) => a - b);
    const total = sortedValues.length;

    const rows = newData.map(d => {
        const rank = sortedValues.filter(v => v < d.value!).length;
        const percentile_rank = total > 1 ? (rank / (total - 1)) * 100 : 0;
        return { date: d.date, asset_class: assetClass, series_name: seriesName, column_name: columnName, value: d.value, percentile_rank };
    });

    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_percentile_analysis.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
    }
    console.log(`  ✅ ${rows.length} records`);
}

async function main() {
    const force = process.argv.includes('--force');
    if (force) console.log('⚠️  Force mode: recalculating all percentiles\n');
    console.log('📊 Calculating percentiles in Postgres...\n');
    for (const s of SERIES_TO_ANALYZE) {
        try { await processPercentiles(s.assetClass, s.seriesName, s.columnName, force); }
        catch (e) { console.error(`  ✗ ${s.seriesName}:`, e); }
    }
    console.log('\n✅ Percentile calculation complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
