#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

interface TimeSeriesRow {
    date: number;
    value: number;
}

console.log('Creating S&P 500 P/S Ratio metric...\n');

// Get SP500-Price data
const priceData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'SP500-Price'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${priceData.length} SP500-Price records`);

// Get SP500SPS data (Sales Per Share - quarterly)
const spsData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'SP500SPS'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${spsData.length} SP500SPS quarterly records`);

// Calculate TTM (Trailing Twelve Months) Sales Per Share
console.log('Calculating TTM Sales Per Share (sum of last 4 quarters)...');
const ttmSPSMap = new Map<number, number>();

for (let i = 3; i < spsData.length; i++) {
    // Sum the last 4 quarters (including current)
    const ttmSPS = spsData[i].value +
        spsData[i - 1].value +
        spsData[i - 2].value +
        spsData[i - 3].value;

    ttmSPSMap.set(spsData[i].date, ttmSPS);
}

console.log(`Calculated ${ttmSPSMap.size} TTM SPS values\n`);

// Function to find nearest TTM SPS value (for matching monthly price data with quarterly TTM SPS)
function findNearestTTMSPS(priceDate: number, ttmSPSMap: Map<number, number>): number | null {
    // Get all TTM SPS dates
    const spsDates = Array.from(ttmSPSMap.keys()).sort((a, b) => a - b);

    // Find the most recent SPS date that is <= price date
    let nearestDate: number | null = null;
    for (const spsDate of spsDates) {
        if (spsDate <= priceDate) {
            nearestDate = spsDate;
        } else {
            break;
        }
    }

    if (nearestDate !== null) {
        return ttmSPSMap.get(nearestDate) || null;
    }

    return null;
}

// Calculate SP500-PS = Price / TTM SPS
console.log('Calculating SP500-PS (using TTM Sales Per Share)...');
const sp500PSData: TimeSeriesRow[] = [];
let matchCount = 0;

priceData.forEach(priceRow => {
    const ttmSPS = findNearestTTMSPS(priceRow.date, ttmSPSMap);

    if (ttmSPS && ttmSPS > 0) {
        const ps = priceRow.value / ttmSPS;
        sp500PSData.push({
            date: priceRow.date,
            value: ps
        });
        matchCount++;
    }
});

console.log(`Calculated ${matchCount} SP500-PS values\n`);

// Delete existing data
console.log('Removing old S&P 500 P/S data...');
db.prepare(`
    DELETE FROM time_series 
    WHERE asset_class = 'valuations' 
      AND series_name = 'SP500-PS'
`).run();

// Insert SP500-PS data
console.log('Inserting SP500-PS data...');
const insertStmt = db.prepare(`
    INSERT INTO time_series (asset_class, series_name, column_name, date, value)
    VALUES (?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((data: TimeSeriesRow[]) => {
    for (const row of data) {
        insertStmt.run('valuations', 'SP500-PS', 'Value', row.date, row.value);
    }
});

insertMany(sp500PSData);
console.log(`✓ Inserted ${sp500PSData.length} SP500-PS records`);

// Update metadata
console.log('\nUpdating series metadata...');
const updateMetaStmt = db.prepare(`
    INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, geography, units, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

updateMetaStmt.run(
    'valuations',
    'SP500-PS',
    'S&P 500 P/S',
    'S&P 500 Price-to-Sales Ratio (Trailing 12 Months)',
    'US',
    'ratio',
    Date.now()
);

// Show sample of recent data
console.log('\nSample of recent P/S values:');
const recentPS = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'SP500-PS'
    ORDER BY date DESC 
    LIMIT 5
`).all() as TimeSeriesRow[];

console.log('\nSP500-PS (TTM):');
recentPS.forEach(row => {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    console.log(`  ${dateStr}: ${row.value.toFixed(2)}x`);
});

db.close();
console.log('\n✅ S&P 500 P/S Ratio metric created successfully!');
