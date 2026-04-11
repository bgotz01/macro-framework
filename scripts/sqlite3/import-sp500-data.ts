#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');
const CONSTITUENTS_PATH = path.join(process.cwd(), 'data', 'SP500', 'SP500.csv');
const CHANGES_PATH = path.join(process.cwd(), 'data', 'SP500', 'SP500Changes.csv');

interface ConstituentRow {
    Symbol: string;
    Security: string;
    'GICS Sector': string;
    'GICS Sub-Industry': string;
    'Headquarters Location': string;
    'Date added': string;
    CIK: string;
    Founded: string;
    'Extra Notes': string;
}

interface ChangeRow {
    Date: string;
    'Added Ticker': string;
    'Added Company': string;
    'Removed Ticker': string;
    'Removed Company': string;
    Reason: string;
}

async function importSP500Data() {
    console.log('🚀 Starting S&P 500 data import...\n');

    const db = new Database(DB_PATH);

    // Create tables if they don't exist
    console.log('Creating S&P 500 tables...');
    const schema = fs.readFileSync(path.join(process.cwd(), 'lib', 'sp500-schema.sql'), 'utf-8');
    db.exec(schema);
    console.log('✓ Tables created\n');

    // Clear existing data
    db.exec('DELETE FROM sp500_constituents');
    db.exec('DELETE FROM sp500_changes');
    console.log('✓ Cleared existing data\n');

    // Import constituents
    console.log('📊 Importing S&P 500 constituents...');
    const constituentsContent = fs.readFileSync(CONSTITUENTS_PATH, 'utf-8');
    const constituentsResult = Papa.parse<ConstituentRow>(constituentsContent, {
        header: true,
        skipEmptyLines: true,
    });

    const insertConstituent = db.prepare(`
    INSERT INTO sp500_constituents (
      symbol, security, gics_sector, gics_sub_industry, 
      headquarters_location, date_added, cik, founded, extra_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const insertMany = db.transaction((rows: ConstituentRow[]) => {
        for (const row of rows) {
            insertConstituent.run(
                row.Symbol || null,
                row.Security || null,
                row['GICS Sector'] || null,
                row['GICS Sub-Industry'] || null,
                row['Headquarters Location'] || null,
                row['Date added'] || null,
                row.CIK ? parseInt(row.CIK) : null,
                row.Founded || null,
                row['Extra Notes'] || null
            );
        }
    });

    insertMany(constituentsResult.data);
    console.log(`✓ Imported ${constituentsResult.data.length} constituents\n`);

    // Import changes
    console.log('📈 Importing S&P 500 historical changes...');
    const changesContent = fs.readFileSync(CHANGES_PATH, 'utf-8');
    const changesResult = Papa.parse<ChangeRow>(changesContent, {
        header: true,
        skipEmptyLines: true,
    });

    const insertChange = db.prepare(`
    INSERT INTO sp500_changes (
      date, added_ticker, added_company, removed_ticker, removed_company, reason
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

    const insertChanges = db.transaction((rows: ChangeRow[]) => {
        for (const row of rows) {
            insertChange.run(
                row.Date || null,
                row['Added Ticker'] || null,
                row['Added Company'] || null,
                row['Removed Ticker'] || null,
                row['Removed Company'] || null,
                row.Reason || null
            );
        }
    });

    insertChanges(changesResult.data);
    console.log(`✓ Imported ${changesResult.data.length} historical changes\n`);

    // Show some stats
    const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT gics_sector) as sectors,
      COUNT(DISTINCT gics_sub_industry) as industries
    FROM sp500_constituents
  `).get() as { total: number; sectors: number; industries: number };

    const sectorBreakdown = db.prepare(`
    SELECT gics_sector, COUNT(*) as count
    FROM sp500_constituents
    WHERE gics_sector IS NOT NULL
    GROUP BY gics_sector
    ORDER BY count DESC
  `).all() as Array<{ gics_sector: string; count: number }>;

    console.log('━'.repeat(50));
    console.log('✅ S&P 500 Import Complete!');
    console.log(`   Total constituents: ${stats.total}`);
    console.log(`   Sectors: ${stats.sectors}`);
    console.log(`   Sub-industries: ${stats.industries}`);
    console.log(`   Historical changes: ${changesResult.data.length}`);
    console.log('\n📊 Sector Breakdown:');
    sectorBreakdown.forEach(({ gics_sector, count }) => {
        console.log(`   ${gics_sector}: ${count}`);
    });
    console.log('━'.repeat(50));

    db.close();
}

importSP500Data().catch(console.error);
