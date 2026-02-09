#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_DIR = path.join(process.cwd(), 'data', 'economic');
const INPUT_FILE = path.join(DATA_DIR, 'CPIAUCSL.csv');
const YOY_FILE = path.join(DATA_DIR, 'CPI.csv');

interface CPIRow {
    observation_date: string;
    CPIAUCSL: number;
}

async function calculateCPIYoY() {
    console.log('📊 Calculating CPI Year-over-Year change...\n');

    // Read the input file
    const csvContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const result = Papa.parse<CPIRow>(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });

    if (result.errors.length > 0) {
        console.error('❌ Error parsing CSV:', result.errors);
        process.exit(1);
    }

    const data = result.data;
    console.log(`✓ Loaded ${data.length} data points from CPIAUCSL.csv\n`);

    // Calculate YoY change
    const yoyData: Array<{ Date: string; Value: number }> = [];

    for (let i = 12; i < data.length; i++) {
        const currentRow = data[i];
        const yearAgoRow = data[i - 12];

        if (!currentRow || !yearAgoRow) continue;

        const currentValue = currentRow.CPIAUCSL;
        const yearAgoValue = yearAgoRow.CPIAUCSL;

        if (currentValue && yearAgoValue && yearAgoValue !== 0) {
            const yoyChange = ((currentValue - yearAgoValue) / yearAgoValue) * 100;

            yoyData.push({
                Date: currentRow.observation_date,
                Value: parseFloat(yoyChange.toFixed(2))
            });
        }
    }

    const yoyCSV = Papa.unparse(yoyData);
    fs.writeFileSync(YOY_FILE, yoyCSV);
    console.log(`✓ Created CPI.csv with ${yoyData.length} rows (YoY % change)\n`);

    // Show sample data
    console.log('Sample YoY data (last 5 points):');
    yoyData.slice(-5).forEach(row => {
        console.log(`  ${row.Date}: ${row.Value}%`);
    });

    console.log('\n✅ Done! Now run: pnpm import-data');
}

calculateCPIYoY().catch(console.error);
