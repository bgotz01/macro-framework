#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

function parseDate(dateStr: string): Date {
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

function getConstituentsAtDate(db: any, asOfDate: string): any[] {
    const targetDate = new Date(asOfDate);

    // Start with ALL current constituents
    const currentConstituents = db.prepare(`
        SELECT symbol, security, gics_sector, date_added
        FROM sp500_constituents
    `).all();

    // Create a map of the index composition
    const indexComposition = new Map<string, any>();
    currentConstituents.forEach((company: any) => {
        indexComposition.set(company.symbol, company);
    });

    // Get all changes that happened AFTER the target date (in reverse chronological order)
    const futureChanges = db.prepare(`
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

    // Work backwards: reverse changes that happened after target date
    for (const change of futureChanges) {
        const changeDate = parseDate(change.date);
        if (changeDate <= targetDate) break;

        // REVERSE the change:
        // If company was added after target date, remove it
        if (change.added_ticker) {
            indexComposition.delete(change.added_ticker);
        }

        // If company was removed after target date, add it back
        if (change.removed_ticker && change.removed_company) {
            indexComposition.set(change.removed_ticker, {
                symbol: change.removed_ticker,
                security: change.removed_company,
                gics_sector: null,
                date_added: null
            });
        }
    }

    return Array.from(indexComposition.values());
}

function analyzeHistoricalSnapshots() {
    const db = new Database(DB_PATH, { readonly: true });

    console.log('\n📸 S&P 500 Historical Snapshots\n');
    console.log('━'.repeat(70));

    const snapshots = [
        { date: '2008-12-31', label: 'Financial Crisis (Earliest)' },
        { date: '2009-12-31', label: 'Post-Crisis Recovery' },
        { date: '2012-12-31', label: 'Post-QE Era' },
        { date: '2015-12-31', label: 'Mid-2010s' },
        { date: '2019-12-31', label: 'Pre-COVID' },
        { date: '2020-12-31', label: 'COVID Year' },
        { date: '2023-12-31', label: 'Post-COVID' },
        { date: '2025-12-31', label: 'Recent' },
    ];

    console.log('\n📊 Index Size Over Time:\n');
    console.log('Date           Event                    Companies  Change');
    console.log('─'.repeat(70));

    let previousCount = 0;
    snapshots.forEach(({ date, label }) => {
        const constituents = getConstituentsAtDate(db, date);
        const count = constituents.length;
        const change = previousCount > 0 ? count - previousCount : 0;
        const changeStr = change > 0 ? `+${change}` : change < 0 ? `${change}` : '  0';

        console.log(
            `${date}   ${label.padEnd(24)} ${count.toString().padStart(3)}        ${changeStr.padStart(4)}`
        );
        previousCount = count;
    });

    // Sector composition at key dates
    console.log('\n\n🎨 Sector Composition at Key Dates:\n');

    const keyDates = [
        { date: '2008-12-31', label: '2008 (Crisis)' },
        { date: '2012-12-31', label: '2012 (Recovery)' },
        { date: '2019-12-31', label: '2019 (Pre-COVID)' },
        { date: '2025-12-31', label: '2025 (Recent)' },
    ];

    keyDates.forEach(({ date, label }) => {
        console.log(`\n${label}:`);
        const constituents = getConstituentsAtDate(db, date);

        // Count by sector
        const sectorCounts = new Map<string, number>();
        constituents.forEach((c: any) => {
            if (c.gics_sector) {
                sectorCounts.set(c.gics_sector, (sectorCounts.get(c.gics_sector) || 0) + 1);
            }
        });

        // Sort and display top 5
        const sorted = Array.from(sectorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        sorted.forEach(([sector, count], idx) => {
            const pct = ((count / constituents.length) * 100).toFixed(1);
            console.log(`  ${idx + 1}. ${sector.padEnd(30)} ${count.toString().padStart(2)} (${pct}%)`);
        });
    });

    // Companies that were in 2008 but not in 2025
    console.log('\n\n📉 Notable Companies Lost Since 2008:\n');
    const constituents2008 = getConstituentsAtDate(db, '2008-12-31');
    const constituents2025 = getConstituentsAtDate(db, '2025-12-31');

    const symbols2025 = new Set(constituents2025.map((c: any) => c.symbol));
    const lost = constituents2008
        .filter((c: any) => !symbols2025.has(c.symbol))
        .slice(0, 20);

    lost.forEach((c: any) => {
        // Find when they were removed
        const removal = db.prepare(`
            SELECT date, reason
            FROM sp500_changes
            WHERE removed_ticker = ?
            ORDER BY date DESC
            LIMIT 1
        `).get(c.symbol) as { date: string; reason: string } | undefined;

        if (removal) {
            console.log(`${c.symbol.padEnd(6)} ${c.security.padEnd(35)} (${removal.date})`);
            console.log(`       ${removal.reason.substring(0, 60)}...`);
        }
    });

    // Companies added in last 5 years
    console.log('\n\n🆕 Recent Additions (2020-2025):\n');
    const recentAdditions = db.prepare(`
        SELECT symbol, security, gics_sector, date_added
        FROM sp500_constituents
        WHERE date_added >= '2020-01-01'
        ORDER BY date_added DESC
        LIMIT 20
    `).all() as Array<{ symbol: string; security: string; gics_sector: string; date_added: string }>;

    recentAdditions.forEach(({ symbol, security, gics_sector, date_added }) => {
        console.log(`${date_added}  ${symbol.padEnd(6)} ${security.padEnd(35)} ${gics_sector}`);
    });

    console.log('\n' + '━'.repeat(70) + '\n');
    db.close();
}

analyzeHistoricalSnapshots();
