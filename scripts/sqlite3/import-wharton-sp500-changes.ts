#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');
const CHANGES_DIR = path.join(process.cwd(), 'data', 'SP500', 'changes-cleaned');

interface WhartonRow {
    'Added/Removed': string;
    'Ticker': string;
    'SP500 Start': string;
    'SP500 End': string;
}

interface ProcessedChange {
    date: string;
    ticker: string;
    action: 'added' | 'removed';
    startDate: string;
    endDate: string;
}

function processWhartonData() {
    console.log('\n🔄 Processing Wharton S&P 500 Changes Data\n');
    console.log('━'.repeat(70));

    const db = new Database(DB_PATH);

    // Create a new table for the processed changes
    db.exec(`
        DROP TABLE IF EXISTS sp500_changes_wharton;
        
        CREATE TABLE sp500_changes_wharton (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            ticker TEXT NOT NULL,
            action TEXT NOT NULL,
            start_date TEXT,
            end_date TEXT
        );
        
        CREATE INDEX idx_wharton_date ON sp500_changes_wharton(date);
        CREATE INDEX idx_wharton_ticker ON sp500_changes_wharton(ticker);
        CREATE INDEX idx_wharton_action ON sp500_changes_wharton(action);
    `);

    const insertStmt = db.prepare(`
        INSERT INTO sp500_changes_wharton (date, ticker, action, start_date, end_date)
        VALUES (?, ?, ?, ?, ?)
    `);

    const allChanges: ProcessedChange[] = [];
    let totalRows = 0;

    // Read all year files
    const yearFiles = fs.readdirSync(CHANGES_DIR)
        .filter(f => f.endsWith('.csv'))
        .sort();

    console.log(`\nFound ${yearFiles.length} year files\n`);

    for (const file of yearFiles) {
        const year = file.replace('.csv', '');
        const filePath = path.join(CHANGES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        const result = Papa.parse<WhartonRow>(content, {
            header: true,
            skipEmptyLines: true,
        });

        let yearChanges = 0;

        for (const row of result.data) {
            const action = row['Added/Removed'].toLowerCase() as 'added' | 'removed';
            const ticker = row['Ticker'].trim();
            const startDate = row['SP500 Start'];
            const endDate = row['SP500 End'];

            // Use the appropriate date based on action
            const changeDate = action === 'added' ? startDate : endDate;

            if (ticker) {
                allChanges.push({
                    date: changeDate,
                    ticker,
                    action,
                    startDate,
                    endDate
                });
                yearChanges++;
                totalRows++;
            }
        }

        console.log(`${year}: ${yearChanges} changes`);
    }

    // Sort by date
    allChanges.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Insert into database
    const insertMany = db.transaction((changes: ProcessedChange[]) => {
        for (const change of changes) {
            insertStmt.run(
                change.date,
                change.ticker,
                change.action,
                change.startDate,
                change.endDate
            );
        }
    });

    insertMany(allChanges);

    // Show statistics
    console.log('\n' + '━'.repeat(70));
    console.log('✅ Import Complete!\n');
    console.log(`Total changes processed: ${totalRows}`);

    const stats = db.prepare(`
        SELECT 
            action,
            COUNT(*) as count,
            MIN(date) as earliest,
            MAX(date) as latest
        FROM sp500_changes_wharton
        GROUP BY action
    `).all() as Array<{ action: string; count: number; earliest: string; latest: string }>;

    console.log('\nBy Action:');
    stats.forEach(({ action, count, earliest, latest }) => {
        console.log(`  ${action}: ${count} (${earliest} to ${latest})`);
    });

    // Check for companies still in index (end date = 2022-12-30)
    const stillInIndex = db.prepare(`
        SELECT COUNT(DISTINCT ticker) as count
        FROM sp500_changes_wharton
        WHERE end_date = '2022-12-30' AND action = 'added'
    `).get() as { count: number };

    console.log(`\nCompanies still in index as of 2022-12-30: ${stillInIndex.count}`);

    // Show date range
    const dateRange = db.prepare(`
        SELECT MIN(date) as earliest, MAX(date) as latest
        FROM sp500_changes_wharton
    `).get() as { earliest: string; latest: string };

    console.log(`\nDate range: ${dateRange.earliest} to ${dateRange.latest}`);
    console.log('━'.repeat(70) + '\n');

    db.close();
}

processWhartonData();
