#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_DIR = path.join(process.cwd(), 'data', 'economic');
const INPUT_FILE = path.join(DATA_DIR, 'CPIAUCSL.csv');
const OUTPUT_FILE = path.join(DATA_DIR, 'CPINominal.csv');

interface CPIRow {
    observation_date: string;
    CPIAUCSL: number;
}

async function convertCPIAUCSL() {
    console.log('📊 Converting CPIAUCSL to CPINominal...\n');

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

    // Convert to Date,Value format
    const nominalData = data.map(row => ({
        Date: row.observation_date,
        Value: row.CPIAUCSL
    }));

    const nominalCSV = Papa.unparse(nominalData);
    fs.writeFileSync(OUTPUT_FILE, nominalCSV);
    console.log(`✓ Created CPINominal.csv with ${nominalData.length} rows\n`);

    // Show sample data
    console.log('Sample data (last 5 points):');
    nominalData.slice(-5).forEach(row => {
        console.log(`  ${row.Date}: ${row.Value}`);
    });

    console.log('\n✅ Done! Now run: pnpm import-data');
}

convertCPIAUCSL().catch(console.error);
