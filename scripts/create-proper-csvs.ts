#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const PUBLIC_DATA = path.join(process.cwd(), 'public/data');
const DATA_DIR = path.join(process.cwd(), 'data');

// Manually define what we want to extract
const extractions = [
    {
        source: 'public/data/bonds/USmacro.csv',
        outputs: [
            { column: '10yr', name: 'US-10yr.csv', dest: 'bonds' },
            { column: '2yr', name: 'US-2yr.csv', dest: 'bonds' },
            { column: 'BankRate', name: 'US-BankRate.csv', dest: 'bonds' },
            { column: '10-2yr', name: 'US-10-2yr-Spread.csv', dest: 'bonds' },
        ]
    },
    {
        source: 'public/data/equities/DJI.csv',
        outputs: [
            { column: 'DJI', name: 'DJI.csv', dest: 'equities' }
        ]
    },
    {
        source: 'public/data/equities/ShillerPE.csv',
        outputs: [
            { column: 'Value', name: 'Shiller-PE.csv', dest: 'equities' }
        ]
    }
];

async function createProperCSVs() {
    console.log('Creating properly named CSV files...\n');

    for (const extraction of extractions) {
        const sourcePath = path.join(process.cwd(), extraction.source);

        if (!fs.existsSync(sourcePath)) {
            console.log(`⚠ Skipping ${extraction.source} (not found)`);
            continue;
        }

        console.log(`Reading: ${extraction.source}`);
        const csvContent = fs.readFileSync(sourcePath, 'utf-8');
        const result = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
        });

        const headers = result.meta.fields || [];
        const dateColumn = headers.find(h => h.toLowerCase() === 'date') || headers[0];

        for (const output of extraction.outputs) {
            const destDir = path.join(DATA_DIR, output.dest);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            const destPath = path.join(destDir, output.name);
            const rows: any[] = [];

            for (const row of result.data as any[]) {
                const dateValue = row[dateColumn];
                const colValue = row[output.column];

                if (dateValue && colValue !== null && colValue !== undefined && colValue !== '') {
                    rows.push({
                        Date: dateValue,
                        Value: colValue
                    });
                }
            }

            if (rows.length > 0) {
                const newCSV = Papa.unparse(rows);
                fs.writeFileSync(destPath, newCSV);
                console.log(`  ✓ ${output.name} (${rows.length} rows)`);
            } else {
                console.log(`  ⚠ ${output.name} (no data)`);
            }
        }
        console.log('');
    }

    console.log('✅ Done! Now run: pnpm migrate');
}

createProperCSVs().catch(console.error);
