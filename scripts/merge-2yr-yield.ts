import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

const csvPath = path.join(process.cwd(), 'data', 'bonds', 'US', '2YY=F.csv');

console.log('Reading new 2-year yield data from yfinance...');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');
const header = lines[0];

// Parse CSV data
const newData: Array<{ date: string; value: number }> = [];
for (let i = 1; i < lines.length; i++) {
    const [dateStr, valueStr] = lines[i].split(',');
    if (dateStr && valueStr) {
        newData.push({
            date: dateStr,
            value: parseFloat(valueStr)
        });
    }
}

console.log(`Parsed ${newData.length} rows from yfinance data`);
console.log(`Date range: ${newData[0].date} to ${newData[newData.length - 1].date}`);

// Get existing data range
const existingRange = db.prepare(`
    SELECT 
        MIN(date) as min_date,
        MAX(date) as max_date,
        COUNT(*) as count
    FROM time_series 
    WHERE asset_class = 'bonds' 
    AND series_name = 'US/US-2yr' 
    AND column_name = 'Value'
`).get() as { min_date: number; max_date: number; count: number };

console.log('\nExisting data in database:');
console.log(`  Date range: ${new Date(existingRange.min_date).toISOString()} to ${new Date(existingRange.max_date).toISOString()}`);
console.log(`  Count: ${existingRange.count} rows`);

// Find the cutoff date - use the last date in existing data
const cutoffDate = new Date(existingRange.max_date);
console.log(`\nCutoff date: ${cutoffDate.toISOString()}`);

// Filter new data to only include dates after the cutoff
const dataToInsert = newData.filter(row => {
    const rowDate = new Date(row.date);
    return rowDate > cutoffDate;
});

console.log(`\nFiltered to ${dataToInsert.length} new rows to insert`);

if (dataToInsert.length === 0) {
    console.log('No new data to insert. Database is already up to date.');
    db.close();
    process.exit(0);
}

// Prepare insert statement
const insertStmt = db.prepare(`
    INSERT INTO time_series (asset_class, series_name, date, column_name, value)
    VALUES (?, ?, ?, ?, ?)
`);

// Insert new data
console.log('\nInserting new data...');
let inserted = 0;
const insertMany = db.transaction((rows: typeof dataToInsert) => {
    for (const row of rows) {
        const timestamp = new Date(row.date).getTime();
        insertStmt.run('bonds', 'US/US-2yr', timestamp, 'Value', row.value);
        inserted++;
    }
});

try {
    insertMany(dataToInsert);
    console.log(`✓ Successfully inserted ${inserted} rows`);

    // Verify the update
    const newRange = db.prepare(`
        SELECT 
            MIN(date) as min_date,
            MAX(date) as max_date,
            COUNT(*) as count
        FROM time_series 
        WHERE asset_class = 'bonds' 
        AND series_name = 'US/US-2yr' 
        AND column_name = 'Value'
    `).get() as { min_date: number; max_date: number; count: number };

    console.log('\nUpdated data in database:');
    console.log(`  Date range: ${new Date(newRange.min_date).toISOString()} to ${new Date(newRange.max_date).toISOString()}`);
    console.log(`  Count: ${newRange.count} rows`);

} catch (error) {
    console.error('Error inserting data:', error);
    process.exit(1);
} finally {
    db.close();
}

console.log('\n✓ Merge complete!');
