#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_DIR = path.join(process.cwd(), 'data', 'economic');

interface DataRow {
    observation_date?: string;
    FYFSD?: number;
    FYFSGDA188S?: number;
    [key: string]: any;
}

async function convertDeficitData() {
    console.log('🔄 Converting federal deficit data files...\n');

    // Convert FYFSD (millions to billions)
    const fyfsdPath = path.join(DATA_DIR, 'FYFSD.csv');
    if (fs.existsSync(fyfsdPath)) {
        try {
            const csvContent = fs.readFileSync(fyfsdPath, 'utf-8');
            const result = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            });

            const data = result.data as DataRow[];
            const transformedData = data
                .filter(row => row.observation_date && row.FYFSD !== null && row.FYFSD !== undefined)
                .map(row => ({
                    Date: row.observation_date,
                    Value: (row.FYFSD! / 1000).toFixed(3) // Convert millions to billions
                }));

            const csv = Papa.unparse(transformedData);
            fs.writeFileSync(fyfsdPath, csv);
            console.log(`  ✓ FYFSD: Converted ${transformedData.length} rows (millions → billions)`);
        } catch (err) {
            console.error(`  ❌ FYFSD: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    } else {
        console.log('  ⚠️  FYFSD.csv not found');
    }

    // Convert FYFSGDA188S (already in percent, just rename columns)
    const fyfsgdaPath = path.join(DATA_DIR, 'FYFSGDA188S.csv');
    if (fs.existsSync(fyfsgdaPath)) {
        try {
            const csvContent = fs.readFileSync(fyfsgdaPath, 'utf-8');
            const result = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            });

            const data = result.data as DataRow[];
            const transformedData = data
                .filter(row => row.observation_date && row.FYFSGDA188S !== null && row.FYFSGDA188S !== undefined)
                .map(row => ({
                    Date: row.observation_date,
                    Value: row.FYFSGDA188S
                }));

            const csv = Papa.unparse(transformedData);
            fs.writeFileSync(fyfsgdaPath, csv);
            console.log(`  ✓ FYFSGDA188S: Converted ${transformedData.length} rows`);
        } catch (err) {
            console.error(`  ❌ FYFSGDA188S: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    } else {
        console.log('  ⚠️  FYFSGDA188S.csv not found');
    }

    console.log('\n✅ Deficit data conversion complete!');
}

convertDeficitData().catch(console.error);
