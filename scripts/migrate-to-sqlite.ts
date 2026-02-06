import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import Database from 'better-sqlite3';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface CSVRow {
    [key: string]: string | number;
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

function getCSVFiles(assetClass: string): string[] {
    const assetDir = path.join(DATA_DIR, assetClass);
    return fs.readdirSync(assetDir)
        .filter(file => file.endsWith('.csv') && !file.startsWith('_original_'));
}

async function migrateCSVToSQLite() {
    console.log('Starting migration to SQLite...');

    // Remove existing DB
    if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        console.log('Removed existing database');
    }

    // Create new DB
    const db = new Database(DB_PATH);

    // Load schema
    const schema = fs.readFileSync(path.join(process.cwd(), 'lib', 'db-schema.sql'), 'utf-8');
    db.exec(schema);
    console.log('Created database schema');

    // Prepare statements
    const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, ?, ?)
    `);

    const insertMetaStmt = db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, last_updated)
        VALUES (?, ?, ?, ?)
    `);

    let totalRows = 0;
    const assetClasses = getAssetClasses();

    // Begin transaction for performance
    const insertMany = db.transaction((rows: any[]) => {
        for (const row of rows) {
            insertStmt.run(row.date, row.asset_class, row.series_name, row.column_name, row.value);
        }
    });

    for (const assetClass of assetClasses) {
        console.log(`\nProcessing asset class: ${assetClass}`);
        const csvFiles = getCSVFiles(assetClass);

        for (const csvFile of csvFiles) {
            const filePath = path.join(DATA_DIR, assetClass, csvFile);
            const seriesName = csvFile.replace('.csv', '');

            console.log(`  - ${seriesName}`);

            const csvContent = fs.readFileSync(filePath, 'utf-8');
            const result = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            });

            const rows: any[] = [];
            let dateColumn = '';

            // Find date column
            const headers = result.meta.fields || [];
            dateColumn = headers.find(h =>
                h.toLowerCase().includes('date') ||
                h.toLowerCase() === 'date'
            ) || headers[0];

            for (const row of result.data as CSVRow[]) {
                const dateStr = row[dateColumn];
                if (!dateStr) continue;

                try {
                    const timestamp = parseDate(String(dateStr));

                    // Insert each numeric column as a separate series
                    for (const [key, value] of Object.entries(row)) {
                        if (key === dateColumn) continue;
                        if (typeof value !== 'number' || isNaN(value)) continue;

                        rows.push({
                            date: timestamp,
                            asset_class: assetClass,
                            series_name: seriesName,
                            column_name: key,
                            value: value
                        });
                    }
                } catch (err) {
                    console.warn(`    Warning: Skipping invalid date: ${dateStr}`);
                }
            }

            insertMany(rows);
            totalRows += rows.length;

            // Insert metadata
            insertMetaStmt.run(
                assetClass,
                seriesName,
                seriesName.replace(/[-_]/g, ' '),
                Date.now()
            );

            console.log(`    Inserted ${rows.length} data points`);
        }
    }

    db.close();
    console.log(`\n✅ Migration complete! Total rows: ${totalRows}`);
    console.log(`Database created at: ${DB_PATH}`);
}

migrateCSVToSQLite().catch(console.error);
