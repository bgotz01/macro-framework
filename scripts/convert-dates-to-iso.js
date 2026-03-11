#!/usr/bin/env node

/**
 * Convert date columns from milliseconds to ISO date strings (YYYY-MM-DD)
 * Only converts time_series and percentile_analysis tables
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'macro-data.db');
const db = new Database(dbPath);

console.log('Starting date conversion from milliseconds to ISO strings...\n');

// Helper function to convert milliseconds to ISO date string
function msToISODate(ms) {
    if (ms === null || ms === undefined) return null;
    const date = new Date(ms);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

try {
    db.exec('BEGIN TRANSACTION');

    // 1. Convert time_series table
    console.log('Converting time_series.date...');

    // Sort by date to ensure we keep the earliest timestamp for each day
    const timeSeriesRows = db.prepare('SELECT * FROM time_series ORDER BY date ASC').all();

    db.exec(`DROP TABLE IF EXISTS time_series_new`);
    db.exec(`
        CREATE TABLE time_series_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            asset_class TEXT NOT NULL,
            series_name TEXT NOT NULL,
            column_name TEXT NOT NULL,
            value REAL,
            UNIQUE(date, asset_class, series_name, column_name)
        )
    `);

    const insertTimeSeries = db.prepare(`
        INSERT OR REPLACE INTO time_series_new (id, date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    let duplicates = 0;
    const seen = new Set();

    for (const row of timeSeriesRows) {
        const isoDate = msToISODate(row.date);
        const key = `${isoDate}|${row.asset_class}|${row.series_name}|${row.column_name}`;

        if (seen.has(key)) {
            duplicates++;
            continue; // Skip duplicate, keep first occurrence
        }
        seen.add(key);

        insertTimeSeries.run(
            row.id,
            isoDate,
            row.asset_class,
            row.series_name,
            row.column_name,
            row.value
        );
    }

    if (duplicates > 0) {
        console.log(`  ⚠️  Skipped ${duplicates} duplicate rows (same date after conversion)`);
    }

    db.exec(`DROP TABLE time_series`);
    db.exec(`ALTER TABLE time_series_new RENAME TO time_series`);

    // Recreate indexes
    db.exec(`CREATE INDEX idx_date ON time_series(date)`);
    db.exec(`CREATE INDEX idx_asset_class ON time_series(asset_class)`);
    db.exec(`CREATE INDEX idx_series ON time_series(series_name)`);
    db.exec(`CREATE INDEX idx_composite ON time_series(asset_class, series_name, date)`);

    console.log(`✓ Converted ${timeSeriesRows.length} rows in time_series\n`);

    // 2. Convert percentile_analysis table
    console.log('Converting percentile_analysis.date...');

    const percentileRows = db.prepare('SELECT * FROM percentile_analysis').all();

    db.exec(`DROP TABLE IF EXISTS percentile_analysis_new`);
    db.exec(`
        CREATE TABLE percentile_analysis_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            asset_class TEXT NOT NULL,
            series_name TEXT NOT NULL,
            column_name TEXT NOT NULL,
            value REAL,
            percentile_rank REAL,
            yoy_percentile_change REAL,
            UNIQUE(date, asset_class, series_name, column_name)
        )
    `);

    const insertPercentile = db.prepare(`
        INSERT OR REPLACE INTO percentile_analysis_new (id, date, asset_class, series_name, column_name, value, percentile_rank, yoy_percentile_change)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let duplicatesPA = 0;
    const seenPA = new Set();

    for (const row of percentileRows) {
        const isoDate = msToISODate(row.date);
        const key = `${isoDate}|${row.asset_class}|${row.series_name}|${row.column_name}`;

        if (seenPA.has(key)) {
            duplicatesPA++;
            continue; // Skip duplicate, keep first occurrence
        }
        seenPA.add(key);

        insertPercentile.run(
            row.id,
            isoDate,
            row.asset_class,
            row.series_name,
            row.column_name,
            row.value,
            row.percentile_rank,
            row.yoy_percentile_change
        );
    }

    if (duplicatesPA > 0) {
        console.log(`  ⚠️  Skipped ${duplicatesPA} duplicate rows (same date after conversion)`);
    }

    db.exec(`DROP TABLE percentile_analysis`);
    db.exec(`ALTER TABLE percentile_analysis_new RENAME TO percentile_analysis`);

    // Recreate indexes
    db.exec(`CREATE INDEX idx_percentile_date ON percentile_analysis(date)`);
    db.exec(`CREATE INDEX idx_percentile_composite ON percentile_analysis(asset_class, series_name, date)`);

    console.log(`✓ Converted ${percentileRows.length} rows in percentile_analysis\n`);

    db.exec('COMMIT');

    console.log('✅ Date conversion completed successfully!');
    console.log('\nVerifying conversion...');

    // Verify the conversion
    const sampleTS = db.prepare('SELECT date FROM time_series ORDER BY date DESC LIMIT 5').all();
    console.log('\nSample dates from time_series:');
    sampleTS.forEach(row => console.log(`  ${row.date}`));

    const samplePA = db.prepare('SELECT date FROM percentile_analysis ORDER BY date DESC LIMIT 5').all();
    console.log('\nSample dates from percentile_analysis:');
    samplePA.forEach(row => console.log(`  ${row.date}`));

} catch (error) {
    db.exec('ROLLBACK');
    console.error('❌ Error during conversion:', error);
    console.error('\nTransaction rolled back. Database unchanged.');
    process.exit(1);
} finally {
    db.close();
}
