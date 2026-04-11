#!/usr/bin/env tsx
/**
 * Imports economic CSV data files into Postgres macro_time_series.
 */
import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma';

const SERIES_TO_IMPORT = [
    { filename: 'BOGZ1FL153064486Q.csv', seriesName: 'Corporate-Equities-Pct-Assets', displayName: 'Corporate Equities % of Assets', units: '%', convertToBillions: false },
    { filename: 'BOGZ1FL594090005Q.csv', seriesName: 'Pension-Funds-Assets', displayName: 'Pension Funds: Total Financial Assets', units: 'Billions', convertToBillions: true },
    { filename: 'BOGZ1LM654090000Q.csv', seriesName: 'Mutual-Fund-Assets', displayName: 'Mutual Fund: Total Financial Assets', units: 'Billions', convertToBillions: true },
    { filename: 'WRMFNS.csv', seriesName: 'Retail-Money-Market-Funds', displayName: 'Retail Money Market Funds', units: 'Billions', convertToBillions: false },
    { filename: 'MMMFFAQ027S.csv', seriesName: 'Money-Market-Funds-Total', displayName: 'Money Market Funds: Total Financial Assets', units: 'Billions', convertToBillions: false },
    { filename: 'W006RC1Q027SBEA.csv', seriesName: 'W006RC1Q027SBEA', displayName: 'Federal Tax Receipts', units: 'billions', convertToBillions: false },
    { filename: 'FDHBFIN.csv', seriesName: 'FDHBFIN', displayName: 'Federal Debt Held by Foreign Investors', units: 'billions', convertToBillions: false },
    { filename: 'US/M2SL.csv', seriesName: 'M2SL', displayName: 'M2 Money Supply', units: 'billions', convertToBillions: false },
];

function parseCSV(filePath: string, convertToBillions: boolean): Array<{ date: string; value: number }> {
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n').slice(1);
    return lines.map(line => {
        const [dateStr, valueStr] = line.split(',');
        const date = new Date(dateStr).toISOString().split('T')[0];
        let value = parseFloat(valueStr);
        if (convertToBillions) value /= 1000;
        return { date, value };
    }).filter(r => r.date && !isNaN(r.value));
}

async function main() {
    console.log('📊 Importing economic data to Postgres...\n');

    for (const series of SERIES_TO_IMPORT) {
        console.log(`Processing ${series.displayName}...`);
        const filePath = path.join(process.cwd(), 'data', 'economic', series.filename);
        if (!fs.existsSync(filePath)) { console.log(`  ⚠️  File not found: ${filePath}`); continue; }

        const data = parseCSV(filePath, series.convertToBillions);

        const existing = await prisma.macro_time_series.aggregate({
            where: { asset_class: 'economic', series_name: series.seriesName },
            _max: { date: true },
        });
        const latestDate = existing._max.date ?? '1900-01-01';
        const newData = data.filter(p => p.date > latestDate);

        if (!newData.length) { console.log(`  ✓ No new data`); continue; }

        await prisma.macro_time_series.createMany({
            data: newData.map(p => ({ date: p.date, asset_class: 'economic', series_name: series.seriesName, column_name: 'Value', value: p.value })),
            skipDuplicates: true,
        });

        await prisma.macro_series_metadata.upsert({
            where: { asset_class_series_name: { asset_class: 'economic', series_name: series.seriesName } },
            create: { asset_class: 'economic', series_name: series.seriesName, display_name: series.displayName, units: series.units, last_updated: BigInt(Date.now()) },
            update: { last_updated: BigInt(Date.now()) },
        });

        console.log(`  ✅ Inserted ${newData.length} new rows`);
    }

    console.log('\n✅ Economic data import complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
