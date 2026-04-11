import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

interface TimeSeriesRow {
    date: string;
    value: number;
}

console.log('Creating PE-5yr metric...\n');

const priceData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' 
      AND series_name = 'SP500-Price'
      AND column_name = 'Value'
      AND value IS NOT NULL
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${priceData.length} S&P 500 Price records`);

const epsData = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' 
      AND series_name = 'SP500-EPS-5yr'
      AND column_name = 'Value'
      AND value IS NOT NULL
    ORDER BY date
`).all() as TimeSeriesRow[];

console.log(`Found ${epsData.length} SP500-EPS-5yr records`);

// Create a map for quick EPS lookup by date
const epsMap = new Map<string, number>();
epsData.forEach(row => epsMap.set(row.date, row.value));

// Calculate PE-5yr = Price / EPS-5yr
const pe5yrData: TimeSeriesRow[] = [];

priceData.forEach(priceRow => {
    const eps = epsMap.get(priceRow.date);
    if (eps && eps > 0) {
        pe5yrData.push({ date: priceRow.date, value: priceRow.value / eps });
    }
});

console.log(`Calculated ${pe5yrData.length} PE-5yr values\n`);

// Delete existing
db.prepare(`DELETE FROM time_series WHERE asset_class = 'valuations' AND series_name = 'PE-5yr'`).run();

// Insert
const insertStmt = db.prepare(`
    INSERT INTO time_series (asset_class, series_name, column_name, date, value)
    VALUES ('valuations', 'PE-5yr', 'Value', ?, ?)
`);

const insertMany = db.transaction((data: TimeSeriesRow[]) => {
    for (const row of data) {
        insertStmt.run(row.date, row.value);
    }
});

insertMany(pe5yrData);
console.log(`✓ Inserted ${pe5yrData.length} PE-5yr records`);

// Show recent data
const recent = db.prepare(`
    SELECT date, value FROM time_series 
    WHERE asset_class = 'valuations' AND series_name = 'PE-5yr'
    ORDER BY date DESC LIMIT 5
`).all() as TimeSeriesRow[];

console.log('\nRecent PE-5yr values:');
recent.forEach(row => console.log(`  ${row.date}: ${row.value.toFixed(2)}x`));

db.close();
console.log('\n✓ Done!');
