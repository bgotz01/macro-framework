#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

interface TimeSeriesRow {
    date: number;
    value: number;
}

console.log('Creating S&P 500 PE-10yr metric...\n');

// Get S&P 500 Price data
const priceData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'SP500-Price'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${priceData.length} S&P 500 Price records`);

// Get SP500-EPS-10yr data
const epsData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'SP500-EPS-10yr'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${epsData.length} SP500-EPS-10yr records`);

// Create a map for quick EPS lookup
const epsMap = new Map<number, number>();
epsData.forEach(row => {
    epsMap.set(row.date, row.value);
});

// Calculate PE-10yr = Price / EPS-10yr
const pe10yrData: TimeSeriesRow[] = [];
let matchCount = 0;

priceData.forEach(priceRow => {
    const eps = epsMap.get(priceRow.date);

    if (eps && eps > 0) {
        const pe10yr = priceRow.value / eps;
        pe10yrData.push({
            date: priceRow.date,
            value: pe10yr
        });
        matchCount++;
    }
});

console.log(`Calculated ${matchCount} PE-10yr values\n`);

// Check if PE-10yr already exists
const existingCount = db.prepare(`
    SELECT COUNT(*) as count 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'SP500-PE-10yr'
`).get() as { count: number };

if (existingCount.count > 0) {
    console.log(`Deleting ${existingCount.count} existing SP500-PE-10yr records...`);
    db.prepare(`
        DELETE FROM time_series 
        WHERE asset_class = 'valuations' AND series_name = 'SP500-PE-10yr'
    `).run();
}

// Insert PE-10yr data
console.log('Inserting SP500-PE-10yr data...');
const insertStmt = db.prepare(`
    INSERT INTO time_series (asset_class, series_name, column_name, date, value)
    VALUES (?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((data: TimeSeriesRow[]) => {
    for (const row of data) {
        insertStmt.run('valuations', 'SP500-PE-10yr', 'Value', row.date, row.value);
    }
});

insertMany(pe10yrData);

console.log(`✓ Inserted ${pe10yrData.length} SP500-PE-10yr records`);

// Update metadata
console.log('\nUpdating series metadata...');
const updateMetaStmt = db.prepare(`
    INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, geography, units, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

updateMetaStmt.run(
    'valuations',
    'SP500-PE-10yr',
    'S&P 500 P/E (10yr)',
    'S&P 500 Price-to-Earnings Ratio using 10-year rolling average earnings',
    'US',
    'ratio',
    Date.now()
);

// Show sample of recent data
console.log('\nSample of recent PE-10yr values:');
const recentData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'SP500-PE-10yr'
    ORDER BY date DESC 
    LIMIT 5
`).all() as TimeSeriesRow[];

recentData.forEach(row => {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    console.log(`  ${dateStr}: ${row.value.toFixed(2)}x`);
});

db.close();
console.log('\n✓ S&P 500 PE-10yr metric created successfully!');
