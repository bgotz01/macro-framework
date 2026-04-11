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

function createWhartonSnapshots() {
    console.log('\n📸 Creating S&P 500 Wharton Snapshots\n');
    console.log('━'.repeat(70));

    const db = new Database(DB_PATH);

    // Create snapshots table
    console.log('\nCreating wharton snapshots table...');
    db.exec(`
        DROP TABLE IF EXISTS sp500_snapshots_wharton;
        
        CREATE TABLE sp500_snapshots_wharton (
            snapshot_date TEXT NOT NULL,
            permno TEXT NOT NULL,
            ticker TEXT,
            company TEXT,
            PRIMARY KEY (snapshot_date, permno)
        );
        
        CREATE INDEX idx_wharton_snapshot_date ON sp500_snapshots_wharton(snapshot_date);
        CREATE INDEX idx_wharton_snapshot_permno ON sp500_snapshots_wharton(permno);
    `);

    const insertSnapshot = db.prepare(`
        INSERT INTO sp500_snapshots_wharton (snapshot_date, permno, ticker, company)
        VALUES (?, ?, ?, ?)
    `);

    // Start with Wikipedia 2022-12-31 baseline
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

    // Get current constituents and work back to 2022-12-31
    const currentConstituents = db.prepare(`
        SELECT symbol, security FROM sp500_constituents
    `).all() as Array<{ symbol: string; security: string }>;

    console.log(`\nStarting with ${currentConstituents.length} current constituents`);
    console.log('Working backwards to 2022-12-31 using Wikipedia data...\n');

    let composition2022 = new Map<string, string>();
    currentConstituents.forEach(({ symbol, security }) => {
        composition2022.set(symbol, security);
    });

    // Reverse Wikipedia changes to get to 2022-12-31
    const targetDate = new Date('2022-12-31');
    for (const change of wikipediaChanges) {
        const changeDate = parseWikipediaDate(change.date);
        if (changeDate <= targetDate) break;

        if (change.added_ticker) {
            composition2022.delete(change.added_ticker);
        }
        if (change.removed_ticker && change.removed_company) {
            composition2022.set(change.removed_ticker, change.removed_company);
        }
    }

    console.log(`✓ 2022-12-31 baseline: ${composition2022.size} companies (from Wikipedia)\n`);

    // Map tickers to PERMNOs - companies with end_date = 2022-12-30 are still in index
    const ticker2022ToPermno = new Map<string, { permno: string; company: string }>();
    const wharton2022 = db.prepare(`
        SELECT DISTINCT permno, ticker, company
        FROM sp500_wharton
        WHERE action = 'added'
          AND date(start_date) <= date('2022-12-31')
          AND date(end_date) >= date('2022-12-30')
    `).all() as Array<{ permno: string; ticker: string; company: string }>;

    console.log(`Found ${wharton2022.length} companies in Wharton data for 2022\n`);

    wharton2022.forEach(({ permno, ticker, company }) => {
        if (ticker) {
            // Handle multi-ticker format
            const tickers = ticker.split(',').map(t => t.trim());
            tickers.forEach(t => {
                if (t) {
                    ticker2022ToPermno.set(t, { permno, company });
                }
            });
        }
    });

    // Create 2022 snapshot with mapped PERMNOs
    const entries2022: Array<[string, string, string, string]> = [];
    const unmappedTickers: string[] = [];

    composition2022.forEach((companyName, ticker) => {
        const whartonData = ticker2022ToPermno.get(ticker);
        if (whartonData) {
            entries2022.push(['2022-12-31', whartonData.permno, ticker, companyName]);
        } else {
            entries2022.push(['2022-12-31', `TICKER_${ticker}`, ticker, companyName]);
            unmappedTickers.push(ticker);
        }
    });

    const insertMany2022 = db.transaction((entries: Array<[string, string, string, string]>) => {
        for (const [date, permno, ticker, company] of entries) {
            insertSnapshot.run(date, permno, ticker, company);
        }
    });
    insertMany2022(entries2022);

    const mappedCount = entries2022.length - unmappedTickers.length;
    console.log(`✓ 2022-12-31: ${entries2022.length} companies (${mappedCount} mapped to PERMNO, ${unmappedTickers.length} unmapped)`);
    if (unmappedTickers.length > 0 && unmappedTickers.length <= 20) {
        console.log(`  Sample unmapped: ${unmappedTickers.slice(0, 10).join(', ')}`);
    }
    console.log();

    // Now use Wharton data to work backwards from 2022
    console.log('Using Wharton data for 2000-2021...\n');

    // Get all Wharton changes
    const whartonChanges = db.prepare(`
        SELECT permno, ticker, company, start_date, end_date
        FROM sp500_wharton
        WHERE action = 'added'
        ORDER BY start_date DESC
    `).all() as Array<{ permno: string; ticker: string; company: string; start_date: string; end_date: string }>;

    // Start with 2022 composition (by PERMNO)
    let currentComposition = new Map<string, { ticker: string; company: string }>();
    entries2022.forEach(([_, permno, ticker, company]) => {
        currentComposition.set(permno, { ticker, company });
    });

    for (let year = 2021; year >= 2000; year--) {
        const snapshotDate = `${year}-12-31`;
        const targetDate = new Date(snapshotDate);

        // Remove companies that were added after this date
        // Add back companies that were removed after this date
        for (const change of whartonChanges) {
            const startDate = new Date(change.start_date);
            const endDate = new Date(change.end_date);

            // If company was added after target date (and on or before 2022-12-30), remove it
            if (startDate > targetDate && startDate <= new Date('2022-12-30')) {
                currentComposition.delete(change.permno);
            }

            // If company was removed after target date (and before 2022-12-30), add it back
            if (endDate > targetDate && endDate < new Date('2022-12-30') && startDate <= targetDate) {
                currentComposition.set(change.permno, {
                    ticker: change.ticker,
                    company: change.company
                });
            }
        }

        // Save this snapshot
        const insertMany = db.transaction((entries: Array<[string, string, string, string]>) => {
            for (const [date, permno, ticker, company] of entries) {
                insertSnapshot.run(date, permno, ticker, company);
            }
        });

        const entries: Array<[string, string, string, string]> = Array.from(currentComposition.entries())
            .map(([permno, { ticker, company }]) => [snapshotDate, permno, ticker, company]);

        insertMany(entries);

        console.log(`✓ ${snapshotDate}: ${currentComposition.size} companies`);
    }

    // Show summary
    console.log('\n' + '━'.repeat(70));
    console.log('✅ Snapshots Created!\n');

    const summary = db.prepare(`
        SELECT 
            snapshot_date,
            COUNT(*) as count
        FROM sp500_snapshots_wharton
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

createWhartonSnapshots();
