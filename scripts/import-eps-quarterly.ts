#!/usr/bin/env tsx
/**
 * One-time import of quarterly S&P 500 EPS actuals from data/eps/sp500-eps.csv
 * into macro_time_series as asset_class='valuations', series_name='SP500-EPS-Quarterly'
 */
import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';

async function main() {
    const csvPath = path.join(process.cwd(), 'data', 'eps', 'sp500-eps.csv');
    const lines = fs.readFileSync(csvPath, 'utf-8').trim().split('\n').slice(1);

    const rows = lines
        .map(line => {
            const [date, eps] = line.split(',');
            return { date: date.trim(), value: parseFloat(eps.trim()) };
        })
        .filter(r => !isNaN(r.value));

    console.log(`Importing ${rows.length} quarterly EPS rows...`);

    let count = 0;
    for (const row of rows) {
        await prisma.macro_time_series.upsert({
            where: {
                date_asset_class_series_name_column_name: {
                    date: row.date,
                    asset_class: 'valuations',
                    series_name: 'SP500-EPS-Quarterly',
                    column_name: 'Value',
                },
            },
            create: { date: row.date, asset_class: 'valuations', series_name: 'SP500-EPS-Quarterly', column_name: 'Value', value: row.value },
            update: { value: row.value },
        });
        count++;
    }

    // Ensure metadata exists
    await prisma.macro_series_metadata.upsert({
        where: { asset_class_series_name: { asset_class: 'valuations', series_name: 'SP500-EPS-Quarterly' } },
        create: { asset_class: 'valuations', series_name: 'SP500-EPS-Quarterly', display_name: 'S&P 500 EPS (Quarterly)', units: 'usd', currency: 'USD' },
        update: { display_name: 'S&P 500 EPS (Quarterly)' },
    });

    console.log(`Done. ${count} rows imported.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
