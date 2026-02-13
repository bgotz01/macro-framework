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

function getConstituentsAtDate(db: any, asOfDate: string): string[] {
    const targetDate = new Date(asOfDate);

    // Start with ALL current constituents
    const currentConstituents = db.prepare(`
        SELECT symbol FROM sp500_constituents
    `).all() as Array<{ symbol: string }>;

    const indexComposition = new Set<string>();
    currentConstituents.forEach(({ symbol }) => {
        indexComposition.add(symbol);
    });

    // Get all changes that happened AFTER the target date
    const futureChanges = db.prepare(`
        SELECT date, added_ticker, removed_ticker
        FROM sp500_changes
        ORDER BY date DESC
    `).all() as Array<{
        date: string;
        added_ticker: string | null;
        removed_ticker: string | null;
    }>;

    // Work backwards
    for (const change of futureChanges) {
        const changeDate = parseDate(change.date);
        if (changeDate <= targetDate) break;

        if (change.added_ticker) {
            indexComposition.delete(change.added_ticker);
        }

        if (change.removed_ticker) {
            indexComposition.add(change.removed_ticker);
        }
    }

    return Array.from(indexComposition);
}

function analyzeYearlyCounts() {
    const db = new Database(DB_PATH, { readonly: true });

    console.log('\n📊 S&P 500 Constituent Count by Year\n');
    console.log('━'.repeat(60));

    // Get all unique years from changes
    const years = db.prepare(`
        SELECT DISTINCT CAST(SUBSTR(date, -2) AS INTEGER) as year_num
        FROM sp500_changes
        WHERE date LIKE '%-%'
        ORDER BY year_num ASC
    `).all() as Array<{ year_num: number }>;

    console.log('\nYear-End Counts:\n');
    console.log('Year    Dec 31 Count   Change from Prior');
    console.log('─'.repeat(60));

    let previousCount = 0;

    for (const { year_num } of years) {
        const fullYear = year_num > 50 ? 1900 + year_num : 2000 + year_num;
        const dateStr = `${fullYear}-12-31`;

        const constituents = getConstituentsAtDate(db, dateStr);
        const count = constituents.length;
        const change = previousCount > 0 ? count - previousCount : 0;
        const changeStr = change > 0 ? `+${change}` : change < 0 ? `${change}` : '  0';

        console.log(`${fullYear}      ${count.toString().padStart(3)}            ${changeStr.padStart(4)}`);
        previousCount = count;
    }

    // Show current
    const currentCount = db.prepare(`SELECT COUNT(*) as count FROM sp500_constituents`).get() as { count: number };
    const currentYear = new Date().getFullYear();
    const change = currentCount.count - previousCount;
    const changeStr = change > 0 ? `+${change}` : change < 0 ? `${change}` : '  0';
    console.log(`${currentYear}      ${currentCount.count.toString().padStart(3)}            ${changeStr.padStart(4)} (current)`);

    // Show monthly breakdown for 2008 to understand the 506
    console.log('\n\n📅 Monthly Breakdown for 2008:\n');
    console.log('Date           Count   Change   Notes');
    console.log('─'.repeat(60));

    const months = [
        '2008-01-31', '2008-02-29', '2008-03-31', '2008-04-30',
        '2008-05-31', '2008-06-30', '2008-07-31', '2008-08-31',
        '2008-09-30', '2008-10-31', '2008-11-30', '2008-12-31'
    ];

    let prevMonthCount = getConstituentsAtDate(db, '2007-12-31').length;

    for (const monthEnd of months) {
        const constituents = getConstituentsAtDate(db, monthEnd);
        const count = constituents.length;
        const change = count - prevMonthCount;
        const changeStr = change > 0 ? `+${change}` : change < 0 ? `${change}` : '  0';

        // Check for changes in this month
        const monthChanges = db.prepare(`
            SELECT COUNT(*) as changes
            FROM sp500_changes
            WHERE date LIKE ?
        `).get(`%-${monthEnd.substring(5, 7)}-08`) as { changes: number };

        const note = monthChanges.changes > 0 ? `${monthChanges.changes} changes` : '';

        console.log(`${monthEnd}     ${count.toString().padStart(3)}     ${changeStr.padStart(4)}   ${note}`);
        prevMonthCount = count;
    }

    console.log('\n' + '━'.repeat(60));
    console.log('\nNote: The S&P 500 can temporarily have more or fewer than 500');
    console.log('companies due to spin-offs, mergers, and timing of replacements.\n');

    db.close();
}

analyzeYearlyCounts();
