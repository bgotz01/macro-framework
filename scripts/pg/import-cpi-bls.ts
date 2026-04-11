#!/usr/bin/env tsx
/**
 * Imports BLS CPI-U (NSA) historical data from data/cpi/CPI-U-BLS.csv
 * into macro_time_series as CPINominal, then recalculates CPI YoY.
 * Replaces all existing CPINominal data.
 */
import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma';

async function main() {
    const csvPath = path.join(process.cwd(), 'data', 'cpi', 'CPI-U-BLS.csv');
    const lines = fs.readFileSync(csvPath, 'utf-8').trim().split('\n').slice(1);

    const rows = lines.map(line => {
        const [date, value] = line.split(',');
        return { date: date.trim(), value: parseFloat(value.trim()) };
    }).filter(r => !isNaN(r.value));

    console.log(`Loaded ${rows.length} rows from BLS CSV (${rows[0].date} → ${rows[rows.length - 1].date})`);

    // Replace all CPINominal data
    console.log('Clearing existing CPINominal data...');
    await prisma.macro_time_series.deleteMany({
        where: { asset_class: 'economic', series_name: 'CPINominal', column_name: 'Value' },
    });

    // Insert in batches
    console.log('Inserting BLS CPI-U data...');
    for (let i = 0; i < rows.length; i += 1000) {
        await prisma.macro_time_series.createMany({
            data: rows.slice(i, i + 1000).map(r => ({
                date: r.date, asset_class: 'economic', series_name: 'CPINominal', column_name: 'Value', value: r.value,
            })),
            skipDuplicates: true,
        });
    }
    console.log(`✓ Inserted ${rows.length} CPINominal rows`);

    // Recalculate CPI YoY from the new data
    console.log('Recalculating CPI YoY...');
    const dateMap = new Map(rows.map(r => [r.date.substring(0, 7), r]));

    const yoyRows: Array<{ date: string; value: number }> = [];
    for (const row of rows) {
        const prevMonth = row.date.substring(0, 7);
        const prevYear = parseInt(prevMonth.substring(0, 4)) - 1;
        const prevKey = `${prevYear}-${prevMonth.substring(5, 7)}`;
        const prev = dateMap.get(prevKey);
        if (prev) {
            yoyRows.push({ date: row.date, value: ((row.value - prev.value) / prev.value) * 100 });
        }
    }

    // Replace CPI YoY
    await prisma.macro_time_series.deleteMany({
        where: { asset_class: 'economic', series_name: 'CPI', column_name: 'Value' },
    });

    for (let i = 0; i < yoyRows.length; i += 1000) {
        await prisma.macro_time_series.createMany({
            data: yoyRows.slice(i, i + 1000).map(r => ({
                date: r.date, asset_class: 'economic', series_name: 'CPI', column_name: 'Value', value: r.value,
            })),
            skipDuplicates: true,
        });
    }
    console.log(`✓ Inserted ${yoyRows.length} CPI YoY rows`);

    // Update metadata
    await prisma.macro_series_metadata.upsert({
        where: { asset_class_series_name: { asset_class: 'economic', series_name: 'CPINominal' } },
        create: { asset_class: 'economic', series_name: 'CPINominal', display_name: 'CPI-U (NSA)', units: 'index', source: 'BLS', last_updated: BigInt(Date.now()) },
        update: { display_name: 'CPI-U (NSA)', source: 'BLS', last_updated: BigInt(Date.now()) },
    });

    console.log('\n✅ Done. Run calculate-derived-series.ts and calculate-percentiles.ts next.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
