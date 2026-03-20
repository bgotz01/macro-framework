import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

interface Row { date: string; value: number }

console.log('Creating PE-1yr (TTM) metric...\n');

// SP500-EPS is already annualized (TTM), dates are text month-end
const priceData = db.prepare(`
    SELECT date, value FROM time_series
    WHERE asset_class = 'valuations' AND series_name = 'SP500-Price'
    ORDER BY date
`).all() as Row[];
console.log(`Found ${priceData.length} SP500-Price records`);

const epsData = db.prepare(`
    SELECT date, value FROM time_series
    WHERE asset_class = 'valuations' AND series_name = 'SP500-EPS' AND column_name = 'Value'
    ORDER BY date
`).all() as Row[];
console.log(`Found ${epsData.length} SP500-EPS records`);

// Build EPS lookup by YYYY-MM
const epsMap = new Map<string, number>();
for (const row of epsData) {
    epsMap.set(row.date.slice(0, 7), row.value);
}

// Calculate PE-TTM = Price / EPS
const results: Row[] = [];
for (const p of priceData) {
    const eps = epsMap.get(p.date.slice(0, 7));
    if (eps && eps > 0) {
        results.push({ date: p.date, value: p.value / eps });
    }
}
console.log(`Calculated ${results.length} PE-1yr values\n`);

// Delete existing
db.prepare(`DELETE FROM time_series WHERE asset_class = 'valuations' AND series_name = 'PE-1yr'`).run();

// Insert
const insert = db.prepare(`
    INSERT INTO time_series (asset_class, series_name, column_name, date, value)
    VALUES ('valuations', 'PE-1yr', 'Value', ?, ?)
    ON CONFLICT(date, asset_class, series_name, column_name)
    DO UPDATE SET value = excluded.value
`);
const insertAll = db.transaction((data: Row[]) => {
    for (const r of data) insert.run(r.date, r.value);
});
insertAll(results);

// Update metadata
db.prepare(`
    INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, geography, units, last_updated)
    VALUES ('valuations', 'PE-1yr', 'S&P 500 P/E (TTM)', 'S&P 500 Price-to-Earnings ratio using trailing twelve months EPS', 'US', 'ratio', ?)
`).run(Date.now());

// Show recent
const recent = db.prepare(`
    SELECT date, value FROM time_series
    WHERE asset_class = 'valuations' AND series_name = 'PE-1yr'
    ORDER BY date DESC LIMIT 5
`).all() as Row[];
console.log('Recent PE-1yr values:');
recent.forEach(r => console.log(`  ${r.date}: ${r.value.toFixed(2)}x`));

db.close();
console.log('\n✓ PE-1yr (TTM) created successfully!');
