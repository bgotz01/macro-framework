#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_DIR = path.join(process.cwd(), 'data');

interface CSVRow {
    [key: string]: string | number;
}

function getAssetClasses(): string[] {
    return fs.readdirSync(DATA_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

function getCSVFiles(assetClass: string): string[] {
    const assetDir = path.join(DATA_DIR, assetClass);
    if (!fs.existsSync(assetDir)) return [];
    return fs.readdirSync(assetDir)
        .filter(file => file.endsWith('.csv'));
}

function findDateColumn(headers: string[]): string {
    // Find the date column
    const dateCol = headers.find(h =>
        h.toLowerCase() === 'date' ||
        h.toLowerCase().includes('date')
    );
    return dateCol || headers[0];
}

async function splitCSVFiles() {
    console.log('Starting CSV split process...\n');

    const assetClasses = getAssetClasses();
    let totalFilesCreated = 0;

    for (const assetClass of assetClasses) {
        console.log(`Processing asset class: ${assetClass}`);
        const csvFiles = getCSVFiles(assetClass);

        for (const csvFile of csvFiles) {
            const filePath = path.join(DATA_DIR, assetClass, csvFile);
            const baseName = csvFile.replace('.csv', '');

            console.log(`  Reading: ${csvFile}`);

            const csvContent = fs.readFileSync(filePath, 'utf-8');
            const result = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            });

            const headers = result.meta.fields || [];
            const dateColumn = findDateColumn(headers);
            const dataColumns = headers.filter(h => h !== dateColumn);

            console.log(`    Date column: ${dateColumn}`);
            console.log(`    Data columns: ${dataColumns.join(', ')}`);

            // If only one data column, keep as is
            if (dataColumns.length <= 1) {
                console.log(`    ✓ Single column file, keeping as is\n`);
                continue;
            }

            // Split into separate files
            for (const column of dataColumns) {
                const newFileName = `${baseName}-${column.replace(/[^a-zA-Z0-9]/g, '')}.csv`;
                const newFilePath = path.join(DATA_DIR, assetClass, newFileName);

                // Create new CSV with Date and single column
                const newRows: any[] = [];
                for (const row of result.data as CSVRow[]) {
                    const dateValue = row[dateColumn];
                    const colValue = row[column];

                    // Skip rows with missing data
                    if (dateValue && colValue !== null && colValue !== undefined && colValue !== '') {
                        newRows.push({
                            Date: dateValue,
                            Value: colValue
                        });
                    }
                }

                if (newRows.length > 0) {
                    const newCSV = Papa.unparse(newRows);
                    fs.writeFileSync(newFilePath, newCSV);
                    console.log(`    ✓ Created: ${newFileName} (${newRows.length} rows)`);
                    totalFilesCreated++;
                }
            }

            // Optionally backup or remove original file
            const backupPath = path.join(DATA_DIR, assetClass, `_original_${csvFile}`);
            fs.renameSync(filePath, backupPath);
            console.log(`    → Backed up original to: _original_${csvFile}\n`);
        }
    }

    console.log(`\n✅ Split complete! Created ${totalFilesCreated} new files`);
    console.log('\nNext steps:');
    console.log('1. Review the new files in data/ directories');
    console.log('2. Delete _original_* files if satisfied');
    console.log('3. Run: pnpm migrate');
}

splitCSVFiles().catch(console.error);
