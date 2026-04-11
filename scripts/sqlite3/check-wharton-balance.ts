#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const CLEANED_DIR = path.join(process.cwd(), 'data', 'SP500', 'changes-cleaned');

interface WhartonRow {
    'Added/Removed': string;
    'Ticker': string;
    'SP500 Start': string;
    'SP500 End': string;
}

function checkBalance() {
    console.log('\n📊 Checking Add/Remove Balance for Each Year\n');
    console.log('━'.repeat(70));

    const yearFiles = fs.readdirSync(CLEANED_DIR)
        .filter(f => f.endsWith('.csv'))
        .sort();

    console.log('Year  | Added | Removed | Difference');
    console.log('━'.repeat(70));

    let totalAdded = 0;
    let totalRemoved = 0;

    for (const file of yearFiles) {
        const year = file.replace('.csv', '');
        const filePath = path.join(CLEANED_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        const result = Papa.parse<WhartonRow>(content, {
            header: true,
            skipEmptyLines: true,
        });

        let added = 0;
        let removed = 0;

        for (const row of result.data) {
            const action = row['Added/Removed'].toLowerCase();
            if (action === 'added') {
                added++;
            } else if (action === 'removed') {
                removed++;
            }
        }

        totalAdded += added;
        totalRemoved += removed;

        const diff = added - removed;
        const diffStr = diff > 0 ? `+${diff}` : `${diff}`;

        console.log(`${year} | ${added.toString().padStart(5)} | ${removed.toString().padStart(7)} | ${diffStr.padStart(10)}`);
    }

    console.log('━'.repeat(70));
    console.log(`Total | ${totalAdded.toString().padStart(5)} | ${totalRemoved.toString().padStart(7)} | ${(totalAdded - totalRemoved > 0 ? '+' : '') + (totalAdded - totalRemoved)}`);
    console.log('━'.repeat(70) + '\n');
}

checkBalance();
