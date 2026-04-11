import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface TimeSeriesRow {
    date: number;
    value: number;
}

function calculateEarningsYield(peRatio: number): number {
    // Earnings Yield = 1 / PE Ratio, expressed as percentage
    return (1 / peRatio) * 100;
}

function addEarningsYield5yr() {
    const db = new Database(DB_PATH);

    console.log('Adding Earnings Yield 5yr series...\n');
    console.log('Database:', DB_PATH);

    // Fetch all PE-5yr data
    const stmt = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'valuations' 
      AND series_name = 'PE-5yr' 
      AND column_name = 'Value'
      AND value IS NOT NULL
      AND value > 0
    ORDER BY date ASC
  `);

    const peData = stmt.all() as TimeSeriesRow[];

    console.log(`Found ${peData.length} PE-5yr data points\n`);

    if (peData.length === 0) {
        console.log('⚠️  No PE-5yr data found');
        db.close();
        return;
    }

    // Prepare insert statement
    const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
    VALUES (?, ?, ?, ?, ?)
  `);

    // Calculate and insert earnings yield
    const insert = db.transaction(() => {
        let count = 0;
        for (const row of peData) {
            const earningsYield = calculateEarningsYield(row.value);

            insertStmt.run(
                row.date,
                'valuations',
                'Earnings-Yield-5yr',
                'Value',
                earningsYield
            );
            count++;
        }
        return count;
    });

    const inserted = insert();
    console.log(`✓ Inserted ${inserted} Earnings Yield 5yr values\n`);

    // Add metadata
    const metadataStmt = db.prepare(`
    INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, source, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    metadataStmt.run(
        'valuations',
        'Earnings-Yield-5yr',
        'Earnings Yield (5yr)',
        'Earnings Yield based on 5-year rolling P/E (1/PE ratio) - Inverse of 5-year rolling P/E ratio',
        'Calculated from PE-5yr',
        Date.now()
    );

    console.log('✓ Added series metadata\n');

    // Show sample data
    console.log('Sample data (most recent 5 points):');
    const sampleStmt = db.prepare(`
    SELECT datetime(date/1000, 'unixepoch') as date, ROUND(value, 2) as earnings_yield
    FROM time_series
    WHERE asset_class = 'valuations' AND series_name = 'Earnings-Yield-5yr' AND column_name = 'Value'
    ORDER BY date DESC
    LIMIT 5
  `);

    const samples = sampleStmt.all() as Array<{ date: string; earnings_yield: number }>;
    console.table(samples);

    console.log('\n✓ Done!');
    db.close();
}

addEarningsYield5yr();
