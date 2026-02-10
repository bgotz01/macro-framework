#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const inputPath = path.join(process.cwd(), 'data/valuations/sp-500-pe-ratio.csv');
const outputPath = path.join(process.cwd(), 'data/valuations/SP500-PE.csv');

interface DataRow {
    date?: string;
    value?: string | number;
}

console.log('🔄 Processing S&P 500 P/E ratio...\n');

const csvContent = fs.readFileSync(inputPath, 'utf-8');
const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (header) => header.trim().toLowerCase()
});

if (result.errors.length > 0) {
    console.error('❌ Error parsing:', result.errors[0].message);
    process.exit(1);
}

const data = result.data as DataRow[];
console.log(`✓ Loaded ${data.length} rows`);

// Transform data - keep original dates since they represent exact snapshots
const transformedData = data
    .filter(row => row.date && row.value)
    .map(row => {
        const value = typeof row.value === 'string'
            ? parseFloat(row.value.replace('%', '').trim())
            : row.value;

        return {
            Date: row.date!.trim(),
            Value: value
        };
    });

const csv = Papa.unparse(transformedData);
fs.writeFileSync(outputPath, csv);

console.log(`✓ Created SP500-PE.csv (${transformedData.length} rows)`);
console.log(`✓ Date range: ${transformedData[0].Date} to ${transformedData[transformedData.length - 1].Date}\n`);
