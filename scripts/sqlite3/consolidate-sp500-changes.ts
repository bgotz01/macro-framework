#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

function parseWikipediaDate(dateStr: string): string {
    // Convert "09-Feb-26" to "2026-02-09"
    if (dateStr.includes('-') && dateStr.length <= 11) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
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

            return `${year}-${month}-${day}`;
        }
    }
    return dateStr;
}

function consolidateChanges() {
    console.log('\n🔄 Consolidating S&P 500 Changes Data\n');
    console.log('━'.repeat(70));

    const db = new Database(DB_PATH);

    // Create new consolidated table
    console.log('\nCreating consolidated table...');
    db.exec(`
        DROP TABLE IF EXISTS sp500_changes_consolidated;
        
        CREATE TABLE sp500_changes_consolidated (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            ticker TEXT NOT NULL,
            company_name TEXT,
            action TEXT NOT NULL,
            source TEXT NOT NULL
        );
        
        CREATE INDEX idx_consolidated_date ON sp500_changes_consolidated(date);
        CREATE INDEX idx_consolidated_ticker ON sp500_changes_consolidated(ticker);
        CREATE INDEX idx_consolidated_action ON sp500_changes_consolidated(action);
    `);

    const insertStmt = db.prepare(`
        INSERT INTO sp500_changes_consolidated (date, ticker, company_name, action, source)
        VALUES (?, ?, ?, ?, ?)
    `);

    let totalInserted = 0;

    // 1. Import Wharton data (2000-2020, already split into one ticker per row)
    console.log('\nImporting Wharton data (2000-2020)...');
    const whartonData = db.prepare(`
        SELECT date, ticker, action
        FROM sp500_changes_wharton
        ORDER BY date
    `).all() as Array<{ date: string; ticker: string; action: string }>;

    const insertWharton = db.transaction((rows: any[]) => {
        for (const row of rows) {
            insertStmt.run(row.date, row.ticker, null, row.action, 'wharton');
        }
    });

    insertWharton(whartonData);
    console.log(`  ✓ Imported ${whartonData.length} Wharton changes`);
    totalInserted += whartonData.length;

    // 2. Import Wikipedia data (2007-2026), but only for dates AFTER 2020-12-31
    console.log('\nImporting Wikipedia data (2021-2026)...');
    const wikipediaData = db.prepare(`
        SELECT date, added_ticker, added_company, removed_ticker, removed_company
        FROM sp500_changes
    `).all() as Array<{
        date: string;
        added_ticker: string | null;
        added_company: string | null;
        removed_ticker: string | null;
        removed_company: string | null;
    }>;

    let wikipediaCount = 0;
    const insertWikipedia = db.transaction((rows: any[]) => {
        for (const row of rows) {
            const isoDate = parseWikipediaDate(row.date);

            // Only include if after 2020-12-31 (to avoid overlap with Wharton)
            if (isoDate > '2020-12-31') {
                if (row.added_ticker) {
                    insertStmt.run(isoDate, row.added_ticker, row.added_company, 'added', 'wikipedia');
                    wikipediaCount++;
                }
                if (row.removed_ticker) {
                    insertStmt.run(isoDate, row.removed_ticker, row.removed_company, 'removed', 'wikipedia');
                    wikipediaCount++;
                }
            }
        }
    });

    insertWikipedia(wikipediaData);
    console.log(`  ✓ Imported ${wikipediaCount} Wikipedia changes (post-2020)`);
    totalInserted += wikipediaCount;

    // Show statistics
    console.log('\n' + '━'.repeat(70));
    console.log('✅ Consolidation Complete!\n');
    console.log(`Total changes: ${totalInserted}`);

    const stats = db.prepare(`
        SELECT 
            action,
            source,
            COUNT(*) as count,
            MIN(date) as earliest,
            MAX(date) as latest
        FROM sp500_changes_consolidated
        GROUP BY action, source
        ORDER BY source, action
    `).all() as Array<{
        action: string;
        source: string;
        count: number;
        earliest: string;
        latest: string;
    }>;

    console.log('\nBy Source and Action:');
    stats.forEach(({ action, source, count, earliest, latest }) => {
        console.log(`  ${source.padEnd(10)} ${action.padEnd(8)} ${count.toString().padStart(4)} (${earliest} to ${latest})`);
    });

    const dateRange = db.prepare(`
        SELECT MIN(date) as earliest, MAX(date) as latest
        FROM sp500_changes_consolidated
    `).get() as { earliest: string; latest: string };

    console.log(`\nOverall date range: ${dateRange.earliest} to ${dateRange.latest}`);

    // Check for overlaps
    const overlaps = db.prepare(`
        SELECT date, COUNT(*) as count
        FROM sp500_changes_consolidated
        GROUP BY date
        HAVING count > 2
        ORDER BY count DESC
        LIMIT 10
    `).all() as Array<{ date: string; count: number }>;

    if (overlaps.length > 0) {
        console.log(`\nDates with most changes:`);
        overlaps.forEach(({ date, count }) => {
            console.log(`  ${date}: ${count} changes`);
        });
    }

    console.log('\n' + '━'.repeat(70) + '\n');

    db.close();
}

consolidateChanges();
