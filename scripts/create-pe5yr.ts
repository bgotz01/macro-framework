import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

interface TimeSeriesRow {
    date: number;
    value: number;
}

console.log('Creating PE-5yr metric (converting to month-end dates)...\n');

// Get S&P 500 Price data and convert month-start to month-end
// Include all available data (the month-start dates represent complete prior months)
const priceData = db.prepare(`
    SELECT 
        CAST(strftime('%s', date(date/1000, 'unixepoch'), '-1 day') AS INTEGER) * 1000 as date,
        value 
    FROM time_series 
    WHERE asset_class = 'valuations' 
      AND series_name = 'SP500-Price'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${priceData.length} S&P 500 Price records (converted to month-end)`);

// Get SP500-EPS-5yr data and convert month-start to month-end
const epsData = db.prepare(`
    SELECT 
        CAST(strftime('%s', date(date/1000, 'unixepoch'), '-1 day') AS INTEGER) * 1000 as date,
        value 
    FROM time_series 
    WHERE asset_class = 'valuations' 
      AND series_name = 'SP500-EPS-5yr'
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${epsData.length} SP500-EPS-5yr records (converted to month-end)`);

// Create a map for quick EPS lookup
const epsMap = new Map<number, number>();
epsData.forEach(row => {
    epsMap.set(row.date, row.value);
});

// Calculate PE-5yr = Price / EPS-5yr
const pe5yrData: TimeSeriesRow[] = [];
let matchCount = 0;

priceData.forEach(priceRow => {
    const eps = epsMap.get(priceRow.date);

    if (eps && eps > 0) {
        const pe5yr = priceRow.value / eps;
        pe5yrData.push({
            date: priceRow.date,
            value: pe5yr
        });
        matchCount++;
    }
});

console.log(`Calculated ${matchCount} PE-5yr values\n`);

// Check if PE-5yr already exists
const existingCount = db.prepare(`
    SELECT COUNT(*) as count 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'PE-5yr'
`).get() as { count: number };

if (existingCount.count > 0) {
    console.log(`Deleting ${existingCount.count} existing PE-5yr records...`);
    db.prepare(`
        DELETE FROM time_series 
        WHERE asset_class = 'valuations' AND series_name = 'PE-5yr'
    `).run();
}

// Insert PE-5yr data
console.log('Inserting PE-5yr data...');
const insertStmt = db.prepare(`
    INSERT INTO time_series (asset_class, series_name, column_name, date, value)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(date, asset_class, series_name, column_name)
    DO UPDATE SET value = excluded.value
`);

const insertMany = db.transaction((data: TimeSeriesRow[]) => {
    for (const row of data) {
        insertStmt.run('valuations', 'PE-5yr', 'Value', row.date, row.value);
    }
});

insertMany(pe5yrData);

console.log(`✓ Inserted ${pe5yrData.length} PE-5yr records`);

// Show sample of recent data
console.log('\nSample of recent PE-5yr values:');
const recentData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'PE-5yr'
    ORDER BY date DESC 
    LIMIT 5
`).all() as TimeSeriesRow[];

recentData.forEach(row => {
    const dateStr = new Date(row.date).toISOString().split('T')[0];
    console.log(`  ${dateStr}: ${row.value.toFixed(2)}x`);
});

db.close();
console.log('\n✓ PE-5yr metric created successfully!');
