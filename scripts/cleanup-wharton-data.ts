#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const CHANGES_DIR = path.join(process.cwd(), 'data', 'SP500', 'changes');
const CLEANED_DIR = path.join(process.cwd(), 'data', 'SP500', 'changes-cleaned');

interface WhartonRow {
    'Added/Removed': string;
    'Ticker': string;
    'SP500 Start': string;
    'SP500 End': string;
}

interface CleanedRow {
    'Added/Removed': string;
    'Ticker': string;
    'SP500 Start': string;
    'SP500 End': string;
}

function cleanupWhartonData() {
    console.log('\n🧹 Cleaning Up Wharton S&P 500 Changes Data\n');
    console.log('━'.repeat(70));

    // Create cleaned directory if it doesn't exist
    if (!fs.existsSync(CLEANED_DIR)) {
        fs.mkdirSync(CLEANED_DIR, { recursive: true });
    }

    const yearFiles = fs.readdirSync(CHANGES_DIR)
        .filter(f => f.endsWith('.csv'))
        .sort();

    console.log(`\nProcessing ${yearFiles.length} year files\n`);

    let totalOriginalRows = 0;
    let totalCleanedRows = 0;
    let totalMultiTickerRows = 0;

    for (const file of yearFiles) {
        const year = file.replace('.csv', '');
        const filePath = path.join(CHANGES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        const result = Papa.parse<WhartonRow>(content, {
            header: true,
            skipEmptyLines: true,
        });

        const cleanedRows: CleanedRow[] = [];
        let multiTickerCount = 0;

        for (const row of result.data) {
            const action = row['Added/Removed'];
            const tickerField = row['Ticker'];
            const startDate = row['SP500 Start'];
            const endDate = row['SP500 End'];

            // Check if there are multiple tickers
            const tickers = tickerField.split(',').map(t => t.trim());

            if (tickers.length > 1) {
                // Multi-ticker row: split into separate rows
                multiTickerCount++;

                for (const ticker of tickers) {
                    if (ticker) {
                        cleanedRows.push({
                            'Added/Removed': action,
                            'Ticker': ticker,
                            'SP500 Start': startDate,
                            'SP500 End': endDate
                        });
                    }
                }
            } else {
                // Single ticker: keep as is
                cleanedRows.push({
                    'Added/Removed': action,
                    'Ticker': tickerField.trim(),
                    'SP500 Start': startDate,
                    'SP500 End': endDate
                });
            }
        }

        totalOriginalRows += result.data.length;
        totalCleanedRows += cleanedRows.length;
        totalMultiTickerRows += multiTickerCount;

        // Write cleaned data to new file
        const cleanedFilePath = path.join(CLEANED_DIR, file);
        const csv = Papa.unparse(cleanedRows, {
            header: true
        });
        fs.writeFileSync(cleanedFilePath, csv);

        console.log(`${year}: ${result.data.length} → ${cleanedRows.length} rows (${multiTickerCount} multi-ticker split)`);
    }

    console.log('\n' + '━'.repeat(70));
    console.log('✅ Cleanup Complete!\n');
    console.log(`Original rows: ${totalOriginalRows}`);
    console.log(`Cleaned rows: ${totalCleanedRows}`);
    console.log(`Multi-ticker rows split: ${totalMultiTickerRows}`);
    console.log(`Additional rows created: ${totalCleanedRows - totalOriginalRows}`);
    console.log(`\nCleaned files saved to: ${CLEANED_DIR}`);
    console.log('━'.repeat(70) + '\n');
}

cleanupWhartonData();
