#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

function testReconstruction() {
    console.log('\n🧪 Testing Historical Reconstruction with Wharton Data\n');
    console.log('━'.repeat(70));

    const db = new Database(DB_PATH);

    // Start with current 503 companies
    const current = db.prepare(`
        SELECT symbol FROM sp500_constituents
    `).all() as Array<{ symbol: string }>;

    console.log(`Starting with ${current.length} current companies\n`);

    // Test: Reconstruct 2022-12-30 (should match Wharton baseline closely)
    const targetDate = new Date('2022-12-30');
    const indexComposition = new Set(current.map(c => c.symbol));

    // Get all Wharton changes AFTER 2022-12-30
    const futureChanges = db.prepare(`
        SELECT date, ticker, action
        FROM sp500_changes_wharton
        WHERE date > '2022-12-30'
        ORDER BY date DESC
    `).all() as Array<{ date: string; ticker: string; action: string }>;

    console.log(`Found ${futureChanges.length} Wharton changes after 2022-12-30`);

    // Also get Wikipedia changes after 2022-12-30
    const wikipediaFuture = db.prepare(`
        SELECT date, added_ticker, removed_ticker
        FROM sp500_changes
        WHERE date > '22-Dec-22'
        ORDER BY date DESC
    `).all() as Array<{ date: string; added_ticker: string | null; removed_ticker: string | null }>;

    console.log(`Found ${wikipediaFuture.length} Wikipedia changes after Dec 2022\n`);

    // Reverse Wikipedia changes
    for (const change of wikipediaFuture) {
        if (change.added_ticker) {
            indexComposition.delete(change.added_ticker);
        }
        if (change.removed_ticker) {
            indexComposition.add(change.removed_ticker);
        }
    }

    console.log(`After reversing Wikipedia changes: ${indexComposition.size} companies`);

    // Reverse Wharton changes
    for (const change of futureChanges) {
        if (change.action === 'added') {
            indexComposition.delete(change.ticker);
        } else if (change.action === 'removed') {
            indexComposition.add(change.ticker);
        }
    }

    console.log(`After reversing Wharton changes: ${indexComposition.size} companies`);

    // Compare with Wharton baseline
    const whartonBaseline = db.prepare(`
        SELECT ticker FROM sp500_changes_wharton
        WHERE end_date = '2022-12-30' AND action = 'added'
    `).all() as Array<{ ticker: string }>;

    console.log(`Wharton baseline (2022-12-30): ${whartonBaseline.length} companies`);

    // Test reconstruction for 2010
    console.log(`\n${'─'.repeat(70)}\n`);
    console.log('Testing 2010-12-31 reconstruction:\n');

    const index2010 = new Set(current.map(c => c.symbol));

    // Get all changes after 2010-12-31
    const changesAfter2010 = db.prepare(`
        SELECT date, ticker, action
        FROM sp500_changes_wharton
        WHERE date > '2010-12-31'
        ORDER BY date DESC
    `).all() as Array<{ date: string; ticker: string; action: string }>;

    console.log(`Wharton changes after 2010: ${changesAfter2010.length}`);

    for (const change of changesAfter2010) {
        if (change.action === 'added') {
            index2010.delete(change.ticker);
        } else if (change.action === 'removed') {
            index2010.add(change.ticker);
        }
    }

    // Also reverse Wikipedia changes
    const wikipediaAll = db.prepare(`
        SELECT date, added_ticker, removed_ticker
        FROM sp500_changes
        ORDER BY date DESC
    `).all() as Array<{ date: string; added_ticker: string | null; removed_ticker: string | null }>;

    for (const change of wikipediaAll) {
        if (change.added_ticker) {
            index2010.delete(change.added_ticker);
        }
        if (change.removed_ticker) {
            index2010.add(change.removed_ticker);
        }
    }

    console.log(`Reconstructed 2010-12-31: ${index2010.size} companies`);

    console.log('\n' + '━'.repeat(70) + '\n');

    db.close();
}

testReconstruction();
