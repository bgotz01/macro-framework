#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import Database from 'better-sqlite3';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');
const METADATA_PATH = path.join(process.cwd(), 'data', 'series-metadata.json');

interface CSVRow {
    Date?: string;
    Value?: number;
    [key: string]: any;
}

interface SeriesMetadata {
    displayName?: string;
    description?: string;
    geography?: string;
    frequency?: string;
    units?: string;
}

interface MetadataFile {
    [assetClass: string]: {
        [seriesName: string]: SeriesMetadata;
    };
}

function parseDate(dateStr: string): number {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
    }
    return date.getTime();
}

function getAssetClasses(): string[] {
    return fs.readdirSync(DATA_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}

function getCSVFiles(assetClass: string): Array<{ path: string; relativePath: string }> {
    const assetDir = path.join(DATA_DIR, assetClass);
    if (!fs.existsSync(assetDir)) return [];

    const files: Array<{ path: string; relativePath: string }> = [];

    function scanDirectory(dir: string, relative: string = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

            const fullPath = path.join(dir, entry.name);
            const relativePath = relative ? path.join(relative, entry.name) : entry.name;
            if (entry.isDirectory()) {
                scanDirectory(fullPath, relativePath);
            } else if (entry.name.endsWith('.csv')) {
                files.push({ path: fullPath, relativePath });
            }
        }
    }

    scanDirectory(assetDir);
    return files;
}

function validateCSV(filePath: string, csvData: any): { valid: boolean; error?: string } {
    const fields = csvData.meta.fields || [];

    // Check for Date and Value columns
    const hasDate = fields.some((f: string) => f.toLowerCase() === 'date');
    const hasValue = fields.some((f: string) => f.toLowerCase() === 'value');

    if (!hasDate) {
        return { valid: false, error: 'Missing "Date" column' };
    }

    if (!hasValue) {
        return { valid: false, error: 'Missing "Value" column' };
    }

    // Check for extra columns
    if (fields.length > 2) {
        return { valid: false, error: `Too many columns (${fields.length}). Expected only Date,Value` };
    }

    return { valid: true };
}

async function importDataIncremental() {
    console.log('🔄 Starting incremental data import (new dates only)...\n');

    // Load metadata file if it exists
    let metadata: MetadataFile = {};
    if (fs.existsSync(METADATA_PATH)) {
        try {
            metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));
            console.log('✓ Loaded series metadata\n');
        } catch (err) {
            console.log('⚠️  Could not load metadata file\n');
        }
    }

    // Check if DB exists, if not create schema
    const dbExists = fs.existsSync(DB_PATH);
    if (!dbExists) {
        console.log('❌ Database does not exist. Run full import first.');
        process.exit(1);
    }

    const db = new Database(DB_PATH);

    // Prepare statements - using INSERT OR IGNORE to skip existing dates
    const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, 'Value', ?)
    `);

    const updateMetaStmt = db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, geography, units, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Get existing data ranges for each series to optimize imports
    const existingDataStmt = db.prepare(`
        SELECT MAX(date) as max_date 
        FROM time_series 
        WHERE asset_class = ? AND series_name = ?
    `);

    let totalRows = 0;
    let totalFiles = 0;
    let errorFiles = 0;
    let skippedFiles = 0;
    const assetClasses = getAssetClasses();

    // Begin transaction for performance
    const insertMany = db.transaction((rows: any[]) => {
        let insertedCount = 0;
        for (const row of rows) {
            const result = insertStmt.run(row.date, row.asset_class, row.series_name, row.value);
            if (result.changes > 0) insertedCount++;
        }
        return insertedCount;
    });

    for (const assetClass of assetClasses) {
        const csvFiles = getCSVFiles(assetClass);
        if (csvFiles.length === 0) continue;

        console.log(`📁 ${assetClass.toUpperCase()}`);

        for (const { path: filePath, relativePath } of csvFiles) {
            // Use the relative path (without .csv) as series name
            const seriesName = relativePath.replace('.csv', '').replace(/\\/g, '/');

            try {
                // Check existing data range for this series
                const existingData = existingDataStmt.get(assetClass, seriesName) as { max_date?: number };
                const maxExistingDate = existingData?.max_date || 0;

                const csvContent = fs.readFileSync(filePath, 'utf-8');
                const result = Papa.parse(csvContent, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true,
                });

                // Validate CSV format
                const validation = validateCSV(filePath, result);
                if (!validation.valid) {
                    console.log(`  ❌ ${seriesName}: ${validation.error}`);
                    errorFiles++;
                    continue;
                }

                const rows: any[] = [];
                let skippedRows = 0;
                let duplicateRows = 0;

                for (const row of result.data as CSVRow[]) {
                    const dateStr = row.Date || row.date;
                    const value = row.Value || row.value;

                    // Skip rows with missing or zero values
                    if (!dateStr || value === null || value === undefined || value === '' || value === 0) {
                        skippedRows++;
                        continue;
                    }

                    try {
                        const timestamp = parseDate(String(dateStr));

                        // Skip dates that already exist in database
                        if (timestamp <= maxExistingDate) {
                            duplicateRows++;
                            continue;
                        }

                        rows.push({
                            date: timestamp,
                            asset_class: assetClass,
                            series_name: seriesName,
                            value: value
                        });
                    } catch (err) {
                        skippedRows++;
                    }
                }

                if (rows.length > 0) {
                    const insertedCount = insertMany(rows);
                    totalRows += insertedCount;
                    totalFiles++;

                    // Get metadata from file or use default
                    const metaEntry = metadata[assetClass]?.[seriesName];
                    const displayName = metaEntry?.displayName || seriesName.replace(/[-_]/g, ' ');
                    const description = metaEntry?.description || null;
                    const geography = metaEntry?.geography || null;
                    const units = metaEntry?.units || null;

                    // Update metadata
                    updateMetaStmt.run(
                        assetClass,
                        seriesName,
                        displayName,
                        description,
                        geography,
                        units,
                        Date.now()
                    );

                    const statusParts = [];
                    if (insertedCount > 0) statusParts.push(`${insertedCount} new`);
                    if (duplicateRows > 0) statusParts.push(`${duplicateRows} existing`);
                    if (skippedRows > 0) statusParts.push(`${skippedRows} invalid`);

                    console.log(`  ✓ ${seriesName}: ${statusParts.join(', ')}`);
                } else {
                    if (duplicateRows > 0) {
                        console.log(`  ⏭️  ${seriesName}: No new data (${duplicateRows} existing dates)`);
                        skippedFiles++;
                    } else {
                        console.log(`  ⚠️  ${seriesName}: No valid data`);
                        errorFiles++;
                    }
                }
            } catch (err) {
                console.log(`  ❌ ${seriesName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                errorFiles++;
            }
        }
        console.log('');
    }

    db.close();

    console.log('━'.repeat(50));
    console.log(`✅ Incremental import complete!`);
    console.log(`   Files processed: ${totalFiles}`);
    console.log(`   Files skipped (no new data): ${skippedFiles}`);
    console.log(`   New data points: ${totalRows.toLocaleString()}`);
    if (errorFiles > 0) {
        console.log(`   ⚠️  Errors: ${errorFiles}`);
    }
    console.log('━'.repeat(50));
}

importDataIncremental().catch(console.error);