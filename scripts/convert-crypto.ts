#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_DIR = path.join(process.cwd(), 'data', 'crypto');

interface CryptoRow {
    Date: string;
    Close: number;
}

async function convertCrypto() {
    console.log('📊 Converting crypto files to Date,Value format...\n');

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));

    for (const file of files) {
        const inputPath = path.join(DATA_DIR, file);

        console.log(`Processing ${file}...`);

        const csvContent = fs.readFileSync(inputPath, 'utf-8');
        const result = Papa.parse<CryptoRow>(csvContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
        });

        if (result.errors.length > 0) {
            console.error(`  ❌ Error parsing: ${result.errors[0].message}`);
            continue;
        }

        // Convert to Date,Value format using Close price
        const converted = result.data.map(row => ({
            Date: row.Date,
            Value: row.Close
        }));

        const outputCSV = Papa.unparse(converted);
        fs.writeFileSync(inputPath, outputCSV);

        console.log(`  ✓ Converted ${converted.length} rows\n`);
    }

    console.log('✅ Done! Now run: pnpm import-data');
}

convertCrypto().catch(console.error);
