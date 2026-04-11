#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');
const CHANGES_DIR = path.join(process.cwd(), 'data', 'SP500', 'changes');

interface WhartonRow {
    'Added/Removed': string;
    'PERMNO': string;
    'Company': string;
    'Ticker': string;
    'SP500 Start': string;
    'SP500 End': string;
}

function importWhartonData() {
    console.log('\n🔄 Importing Wharton S&P 500 Data (with PERMNO)\n');
    console.log('━'.repeat(70));

    const db = new Database(DB_PATH);

    // Create table for Wharton data
    db.exec(`
        DROP TABLE IF EXISTS sp500_wharton;
        
        CREATE TABLE sp500_wharton (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            permno TEXT NOT NULL,
            company TEXT,
            ticker TEXT,
            action TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL
        );
        
        CREATE INDEX idx_wharton_permno ON sp500_wharton(permno);
        CREATE INDEX idx_wharton_ticker ON sp500_wharton(ticker);
        CREATE INDEX idx_wharton_dates ON sp500_wharton(start_date, end_date);
    `);

    const insertStmt = db.prepare(`
        INSERT INTO sp500_wharton (permno, company, ticker, action, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    let totalRows = 0;

    // Read all year files
    const yearFiles = fs.readdirSync(CHANGES_DIR)
        .filter(f => f.endsWith('.csv'))
        .sort();

    console.log(`\nFound ${yearFiles.length} year files\n`);

    const insertMany = db.transaction((rows: Array<[string, string, string, string, string, string]>) => {
        for (const row of rows) {
            insertStmt.run(...row);
        }
    });

    for (const file of yearFiles) {
        const year = file.replace('.csv', '');
        const filePath = path.join(CHANGES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        const result = Papa.parse<WhartonRow>(content, {
            header: true,
            skipEmptyLines: true,
        });

        const rows: Array<[string, string, string, string, string, string]> = [];

        for (const row of result.data) {
            const action = row['Added/Removed'].toLowerCase();
            const permno = row['PERMNO']?.trim();
            const company = row['Company']?.trim();
            const ticker = row['Ticker']?.trim();
            const startDate = row['SP500 Start']?.trim();
            const endDate = row['SP500 End']?.trim();

            if (permno && action && startDate && endDate) {
                rows.push([permno, company, ticker, action, startDate, endDate]);
                totalRows++;
            }
        }

        insertMany(rows);
        console.log(`${year}: ${rows.length} entries`);
    }

    // Show statistics
    console.log('\n' + '━'.repeat(70));
    console.log('✅ Import Complete!\n');
    console.log(`Total entries: ${totalRows}`);

    const stats = db.prepare(`
        SELECT 
            action,
            COUNT(*) as count,
            MIN(start_date) as earliest,
            MAX(end_date) as latest
        FROM sp500_wharton
        GROUP BY action
    `).all() as Array<{ action: string; count: number; earliest: string; latest: string }>;

    console.log('\nBy Action:');
    stats.forEach(({ action, count, earliest, latest }) => {
        console.log(`  ${action}: ${count} (${earliest} to ${latest})`);
    });

    // Count unique companies (PERMNOs)
    const uniqueCompanies = db.prepare(`
        SELECT COUNT(DISTINCT permno) as count
        FROM sp500_wharton
        WHERE action = 'added'
    `).get() as { count: number };

    console.log(`\nUnique companies (PERMNOs): ${uniqueCompanies.count}`);

    // Companies still in index as of 2022-12-30
    const stillInIndex = db.prepare(`
        SELECT COUNT(DISTINCT permno) as count
        FROM sp500_wharton
        WHERE end_date = '2022-12-30' AND action = 'added'
    `).get() as { count: number };

    console.log(`Companies still in index as of 2022-12-30: ${stillInIndex.count}`);

    console.log('\n' + '━'.repeat(70) + '\n');

    db.close();
}

importWhartonData();
