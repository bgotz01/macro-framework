#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

function reconcileData() {
    console.log('\n🔍 Reconciling S&P 500 Data Sources\n');
    console.log('━'.repeat(70));

    const db = new Database(DB_PATH);

    // Get Wharton baseline (2022-12-30)
    const whartonBaseline = db.prepare(`
        SELECT DISTINCT ticker
        FROM sp500_changes_wharton
        WHERE end_date = '2022-12-30' AND action = 'added'
        ORDER BY ticker
    `).all() as Array<{ ticker: string }>;

    console.log(`\n📊 Wharton Data (as of 2022-12-30):`);
    console.log(`   Companies in index: ${whartonBaseline.length}`);

    // Get current constituents
    const currentConstituents = db.prepare(`
        SELECT symbol FROM sp500_constituents ORDER BY symbol
    `).all() as Array<{ symbol: string }>;

    console.log(`\n📊 Current Data (2026):`);
    console.log(`   Companies in index: ${currentConstituents.length}`);

    // Find companies in Wharton but not in current
    const whartonSet = new Set(whartonBaseline.map(r => r.ticker));
    const currentSet = new Set(currentConstituents.map(r => r.symbol));

    const inWhartonNotCurrent = whartonBaseline.filter(r => !currentSet.has(r.ticker));
    const inCurrentNotWharton = currentConstituents.filter(r => !whartonSet.has(r.symbol));

    console.log(`\n🔄 Differences:`);
    console.log(`   In Wharton (2022) but not Current: ${inWhartonNotCurrent.length}`);
    console.log(`   In Current (2026) but not Wharton: ${inCurrentNotWharton.length}`);

    if (inWhartonNotCurrent.length > 0) {
        console.log(`\n   Removed since 2022 (first 20):`);
        inWhartonNotCurrent.slice(0, 20).forEach(({ ticker }) => {
            console.log(`     ${ticker}`);
        });
    }

    if (inCurrentNotWharton.length > 0) {
        console.log(`\n   Added since 2022 (first 20):`);
        inCurrentNotWharton.slice(0, 20).forEach(({ symbol }) => {
            // Check if in Wikipedia changes
            const inWikipedia = db.prepare(`
                SELECT date, added_company
                FROM sp500_changes
                WHERE added_ticker = ?
                ORDER BY date DESC LIMIT 1
            `).get(symbol) as { date: string; added_company: string } | undefined;

            if (inWikipedia) {
                console.log(`     ${symbol} (added ${inWikipedia.date})`);
            } else {
                console.log(`     ${symbol} (not in Wikipedia changes)`);
            }
        });
    }

    // Check Wikipedia changes date range
    const wikipediaRange = db.prepare(`
        SELECT MIN(date) as earliest, MAX(date) as latest, COUNT(*) as count
        FROM sp500_changes
    `).get() as { earliest: string; latest: string; count: number };

    console.log(`\n📊 Wikipedia Changes:`);
    console.log(`   Date range: ${wikipediaRange.earliest} to ${wikipediaRange.latest}`);
    console.log(`   Total changes: ${wikipediaRange.count}`);

    // Expected: Wharton baseline (376) + Wikipedia net changes = Current (503)
    const wikipediaAdded = db.prepare(`
        SELECT COUNT(DISTINCT added_ticker) as count
        FROM sp500_changes
        WHERE added_ticker IS NOT NULL
    `).get() as { count: number };

    const wikipediaRemoved = db.prepare(`
        SELECT COUNT(DISTINCT removed_ticker) as count
        FROM sp500_changes
        WHERE removed_ticker IS NOT NULL
    `).get() as { count: number };

    console.log(`\n📊 Wikipedia Net Changes:`);
    console.log(`   Unique tickers added: ${wikipediaAdded.count}`);
    console.log(`   Unique tickers removed: ${wikipediaRemoved.count}`);
    console.log(`   Net change: ${wikipediaAdded.count - wikipediaRemoved.count}`);

    const expected = whartonBaseline.length + (wikipediaAdded.count - wikipediaRemoved.count);
    console.log(`\n🧮 Math Check:`);
    console.log(`   Wharton baseline (2022): ${whartonBaseline.length}`);
    console.log(`   + Wikipedia net change: ${wikipediaAdded.count - wikipediaRemoved.count}`);
    console.log(`   = Expected current: ${expected}`);
    console.log(`   Actual current: ${currentConstituents.length}`);
    console.log(`   Difference: ${currentConstituents.length - expected}`);

    console.log('\n' + '━'.repeat(70) + '\n');

    db.close();
}

reconcileData();
