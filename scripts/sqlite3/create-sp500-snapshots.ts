#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

function parseWikipediaDate(dateStr: string): Date {
    if (dateStr.includes('-') && dateStr.length <= 11) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const day = parts[0];
            const monthMap: { [key: string]: string } = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
            const month = monthMap[parts[1]] || parts[1];
            let year = parts[2];

            if (year.length === 2) {
                const yearNum = parseInt(year);
                year = yearNum > 50 ? `19${year}` : `20${year}`;
            }

            return new Date(`${year}-${month}-${day}`);
        }
    }
    return new Date(dateStr);
}

function createSnapshots() {
    console.log('\n📸 Creating S&P 500 Historical Snapshots\n');
    console.log('━'.repeat(70));

    const db = new Database(DB_PATH);

    // Create snapshots table
    console.log('\nCreating snapshots table...');
    db.exec(`
        DROP TABLE IF EXISTS sp500_snapshots;
        
        CREATE TABLE sp500_snapshots (
            snapshot_date TEXT NOT NULL,
            ticker TEXT NOT NULL,
            company_name TEXT,
            PRIMARY KEY (snapshot_date, ticker)
        );
        
        CREATE INDEX idx_snapshot_date ON sp500_snapshots(snapshot_date);
        CREATE INDEX idx_snapshot_ticker ON sp500_snapshots(ticker);
    `);

    const insertSnapshot = db.prepare(`
        INSERT INTO sp500_snapshots (snapshot_date, ticker, company_name)
        VALUES (?, ?, ?)
    `);

    // Start with current constituents (2026)
    const currentConstituents = db.prepare(`
        SELECT symbol, security FROM sp500_constituents
    `).all() as Array<{ symbol: string; security: string }>;

    console.log(`\nStarting with ${currentConstituents.length} current constituents (2026)\n`);

    // Get all Wikipedia changes
    const wikipediaChanges = db.prepare(`
        SELECT date, added_ticker, added_company, removed_ticker, removed_company
        FROM sp500_changes
        ORDER BY date DESC
    `).all() as Array<{
        date: string;
        added_ticker: string | null;
        added_company: string | null;
        removed_ticker: string | null;
        removed_company: string | null;
    }>;

    // Create snapshots for 2025, 2024, 2023, 2022 using Wikipedia
    const snapshotDates = ['2025-12-31', '2024-12-31', '2023-12-31', '2022-12-31'];

    let currentComposition = new Map<string, string>();
    currentConstituents.forEach(({ symbol, security }) => {
        currentComposition.set(symbol, security);
    });

    for (const snapshotDate of snapshotDates) {
        const targetDate = new Date(snapshotDate);

        // Reverse changes that happened after this date
        for (const change of wikipediaChanges) {
            const changeDate = parseWikipediaDate(change.date);
            if (changeDate <= targetDate) break;

            // Reverse the change
            if (change.added_ticker) {
                currentComposition.delete(change.added_ticker);
            }
            if (change.removed_ticker && change.removed_company) {
                currentComposition.set(change.removed_ticker, change.removed_company);
            }
        }

        // Save this snapshot
        const insertMany = db.transaction((entries: Array<[string, string, string]>) => {
            for (const [date, ticker, name] of entries) {
                insertSnapshot.run(date, ticker, name);
            }
        });

        const entries: Array<[string, string, string]> = Array.from(currentComposition.entries())
            .map(([ticker, name]) => [snapshotDate, ticker, name]);

        insertMany(entries);

        console.log(`✓ ${snapshotDate}: ${currentComposition.size} companies`);
    }

    // Now use Wharton data to create snapshots from 2022 back to 2000
    console.log('\nUsing Wharton data for 2000-2021...\n');

    // For each year, determine which companies should be in the index
    // based on their SP500 Start and SP500 End dates
    for (let year = 2021; year >= 2000; year--) {
        const snapshotDate = `${year}-12-31`;
        const targetDate = new Date(snapshotDate);

        // Get all companies that were in the index on this date
        // A company is in the index if: start_date <= target_date < end_date
        const companiesInIndex = db.prepare(`
            SELECT DISTINCT ticker
            FROM sp500_changes_wharton
            WHERE action = 'added'
              AND date(start_date) <= date(?)
              AND date(end_date) > date(?)
        `).all(snapshotDate, snapshotDate) as Array<{ ticker: string }>;

        // Save this snapshot
        const insertMany = db.transaction((entries: Array<[string, string, string]>) => {
            for (const [date, ticker, name] of entries) {
                insertSnapshot.run(date, ticker, name);
            }
        });

        const entries: Array<[string, string, string]> = companiesInIndex
            .map(({ ticker }) => [snapshotDate, ticker, ticker]);

        insertMany(entries);

        console.log(`✓ ${snapshotDate}: ${companiesInIndex.length} companies`);
    }

    // Show summary
    console.log('\n' + '━'.repeat(70));
    console.log('✅ Snapshots Created!\n');

    const summary = db.prepare(`
        SELECT 
            snapshot_date,
            COUNT(*) as count
        FROM sp500_snapshots
        GROUP BY snapshot_date
        ORDER BY snapshot_date DESC
    `).all() as Array<{ snapshot_date: string; count: number }>;

    console.log('Year-End Snapshots:');
    summary.forEach(({ snapshot_date, count }) => {
        console.log(`  ${snapshot_date}: ${count} companies`);
    });

    console.log('\n' + '━'.repeat(70) + '\n');

    db.close();
}

createSnapshots();
