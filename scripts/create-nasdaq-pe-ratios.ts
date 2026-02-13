#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

interface TimeSeriesRow {
    date: number;
    value: number;
}

console.log('Creating NASDAQ 100 P/E Ratio metrics...\n');

// Get NDX (NASDAQ 100) Price data
const priceData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'equities' AND series_name = 'NDX'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${priceData.length} NDX Price records`);

// Get NasdaqEPS data (current)
const epsData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'NasdaqEPS'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${epsData.length} NasdaqEPS records`);

// Get NasdaqEPS-5yr data
const eps5yrData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'NasdaqEPS-5yr'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${eps5yrData.length} NasdaqEPS-5yr records`);

// Get NasdaqEPS-10yr data
const eps10yrData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'NasdaqEPS-10yr'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${eps10yrData.length} NasdaqEPS-10yr records\n`);

// Create maps for quick EPS lookup
const epsMap = new Map<number, number>();
epsData.forEach(row => {
    epsMap.set(row.date, row.value);
});

const eps5yrMap = new Map<number, number>();
eps5yrData.forEach(row => {
    eps5yrMap.set(row.date, row.value);
});

const eps10yrMap = new Map<number, number>();
eps10yrData.forEach(row => {
    eps10yrMap.set(row.date, row.value);
});

// Function to find nearest EPS value (for matching daily price data with quarterly EPS)
function findNearestEPS(priceDate: number, epsMap: Map<number, number>): number | null {
    // Get all EPS dates
    const epsDates = Array.from(epsMap.keys()).sort((a, b) => a - b);

    // Find the most recent EPS date that is <= price date
    let nearestDate: number | null = null;
    for (const epsDate of epsDates) {
        if (epsDate <= priceDate) {
            nearestDate = epsDate;
        } else {
            break;
        }
    }

    if (nearestDate !== null) {
        return epsMap.get(nearestDate) || null;
    }

    return null;
}

// Calculate Nasdaq-PE = Price / EPS (current)
console.log('Calculating Nasdaq-PE (current)...');
const nasdaqPEData: TimeSeriesRow[] = [];
let matchCount = 0;

priceData.forEach(priceRow => {
    const eps = findNearestEPS(priceRow.date, epsMap);

    if (eps && eps > 0) {
        const pe = priceRow.value / eps;
        nasdaqPEData.push({
            date: priceRow.date,
            value: pe
        });
        matchCount++;
    }
});

console.log(`Calculated ${matchCount} Nasdaq-PE values`);

// Calculate Nasdaq-PE-5yr = Price / EPS-5yr
console.log('Calculating Nasdaq-PE-5yr...');
const nasdaqPE5yrData: TimeSeriesRow[] = [];
matchCount = 0;

priceData.forEach(priceRow => {
    const eps5yr = findNearestEPS(priceRow.date, eps5yrMap);

    if (eps5yr && eps5yr > 0) {
        const pe5yr = priceRow.value / eps5yr;
        nasdaqPE5yrData.push({
            date: priceRow.date,
            value: pe5yr
        });
        matchCount++;
    }
});

console.log(`Calculated ${matchCount} Nasdaq-PE-5yr values`);

// Calculate Nasdaq-PE-10yr = Price / EPS-10yr
console.log('Calculating Nasdaq-PE-10yr...');
const nasdaqPE10yrData: TimeSeriesRow[] = [];
matchCount = 0;

priceData.forEach(priceRow => {
    const eps10yr = findNearestEPS(priceRow.date, eps10yrMap);

    if (eps10yr && eps10yr > 0) {
        const pe10yr = priceRow.value / eps10yr;
        nasdaqPE10yrData.push({
            date: priceRow.date,
            value: pe10yr
        });
        matchCount++;
    }
});

console.log(`Calculated ${matchCount} Nasdaq-PE-10yr values\n`);

// Delete existing data
console.log('Removing old Nasdaq P/E data...');
db.prepare(`
    DELETE FROM time_series 
    WHERE asset_class = 'valuations' 
      AND series_name IN ('Nasdaq-PE', 'Nasdaq-PE-5yr', 'Nasdaq-PE-10yr')
`).run();

// Insert Nasdaq-PE data
console.log('Inserting Nasdaq-PE data...');
const insertStmt = db.prepare(`
    INSERT INTO time_series (asset_class, series_name, column_name, date, value)
    VALUES (?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((seriesName: string, data: TimeSeriesRow[]) => {
    for (const row of data) {
        insertStmt.run('valuations', seriesName, 'Value', row.date, row.value);
    }
});

insertMany('Nasdaq-PE', nasdaqPEData);
console.log(`✓ Inserted ${nasdaqPEData.length} Nasdaq-PE records`);

insertMany('Nasdaq-PE-5yr', nasdaqPE5yrData);
console.log(`✓ Inserted ${nasdaqPE5yrData.length} Nasdaq-PE-5yr records`);

insertMany('Nasdaq-PE-10yr', nasdaqPE10yrData);
console.log(`✓ Inserted ${nasdaqPE10yrData.length} Nasdaq-PE-10yr records`);

// Update metadata
console.log('\nUpdating series metadata...');
const updateMetaStmt = db.prepare(`
    INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, geography, units, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

updateMetaStmt.run(
    'valuations',
    'Nasdaq-PE',
    'NASDAQ 100 P/E Ratio',
    'NASDAQ 100 Price-to-Earnings Ratio (Trailing 12 Months)',
    'US',
    'ratio',
    Date.now()
);

updateMetaStmt.run(
    'valuations',
    'Nasdaq-PE-5yr',
    'NASDAQ 100 P/E Ratio (5yr)',
    'NASDAQ 100 Price-to-Earnings Ratio using 5-year rolling average earnings',
    'US',
    'ratio',
    Date.now()
);

updateMetaStmt.run(
    'valuations',
    'Nasdaq-PE-10yr',
    'NASDAQ 100 P/E Ratio (10yr)',
    'NASDAQ 100 Price-to-Earnings Ratio using 10-year rolling average earnings',
    'US',
    'ratio',
    Date.now()
);

// Show sample of recent data
console.log('\nSample of recent P/E values:');
const recentPE = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'Nasdaq-PE'
    ORDER BY date DESC 
    LIMIT 3
`).all() as TimeSeriesRow[];

console.log('\nNasdaq-PE (current):');
recentPE.forEach(row => {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    console.log(`  ${dateStr}: ${row.value.toFixed(2)}x`);
});

const recentPE5yr = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'Nasdaq-PE-5yr'
    ORDER BY date DESC 
    LIMIT 3
`).all() as TimeSeriesRow[];

console.log('\nNasdaq-PE-5yr:');
recentPE5yr.forEach(row => {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    console.log(`  ${dateStr}: ${row.value.toFixed(2)}x`);
});

const recentPE10yr = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'Nasdaq-PE-10yr'
    ORDER BY date DESC 
    LIMIT 3
`).all() as TimeSeriesRow[];

console.log('\nNasdaq-PE-10yr:');
recentPE10yr.forEach(row => {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    console.log(`  ${dateStr}: ${row.value.toFixed(2)}x`);
});

db.close();
console.log('\n✅ NASDAQ 100 P/E Ratio metrics created successfully!');
