#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const inputPath = path.join(process.cwd(), 'data/valuations/sp-500-earnings.csv');
const outputDir = path.join(process.cwd(), 'data/valuations');

interface DataRow {
    date?: string;
    sp500?: string | number;
    eps?: string | number;
}

console.log('🔄 Processing S&P 500 earnings data...\n');

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

// Transform SP500 Price data - keep original dates (exact snapshots)
const priceData = data
    .filter(row => row.date && row.sp500)
    .map(row => {
        const value = typeof row.sp500 === 'string'
            ? parseFloat(row.sp500.replace('%', '').trim())
            : row.sp500;

        return {
            Date: row.date!.trim(),
            Value: value
        };
    });

const priceCsv = Papa.unparse(priceData);
const priceOutputPath = path.join(outputDir, 'SP500-Price.csv');
fs.writeFileSync(priceOutputPath, priceCsv);
console.log(`✓ Created SP500-Price.csv (${priceData.length} rows)`);

// Transform EPS data - keep original dates (exact snapshots)
const epsData = data
    .filter(row => row.date && row.eps)
    .map(row => {
        const value = typeof row.eps === 'string'
            ? parseFloat(row.eps.replace('%', '').trim())
            : row.eps;

        return {
            Date: row.date!.trim(),
            Value: value
        };
    });

const epsCsv = Papa.unparse(epsData);
const epsOutputPath = path.join(outputDir, 'SP500-EPS.csv');
fs.writeFileSync(epsOutputPath, epsCsv);
console.log(`✓ Created SP500-EPS.csv (${epsData.length} rows)`);

console.log(`\n✅ Processing complete!`);
console.log(`   Date range: ${priceData[0].Date} to ${priceData[priceData.length - 1].Date}`);
