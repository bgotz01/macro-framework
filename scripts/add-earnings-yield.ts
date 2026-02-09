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

function addEarningsYield() {
    const db = new Database(DB_PATH);

    console.log('Adding Earnings Yield series...\n');
    console.log('Database:', DB_PATH);

    // Fetch all Shiller-PE data
    const stmt = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = 'economic' 
      AND series_name = 'Shiller-PE' 
      AND column_name = 'Value'
      AND value IS NOT NULL
      AND value > 0
    ORDER BY date ASC
  `);

    const peData = stmt.all() as TimeSeriesRow[];

    console.log(`Found ${peData.length} Shiller-PE data points\n`);

    if (peData.length === 0) {
        console.log('⚠️  No Shiller-PE data found');
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
                'economic',
                'Earnings-Yield',
                'Value',
                earningsYield
            );
            count++;
        }
        return count;
    });

    const inserted = insert();
    console.log(`✓ Inserted ${inserted} Earnings Yield values\n`);

    // Add metadata
    const metadataStmt = db.prepare(`
    INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, source, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    metadataStmt.run(
        'economic',
        'Earnings-Yield',
        'Earnings Yield',
        'Earnings Yield (1/PE ratio) - Inverse of Shiller PE ratio, expressed as percentage',
        'Calculated from Shiller-PE',
        Date.now()
    );

    console.log('✓ Added series metadata\n');

    // Show sample data
    console.log('Sample data (most recent 5 points):');
    const sampleStmt = db.prepare(`
    SELECT datetime(date/1000, 'unixepoch') as date, ROUND(value, 2) as earnings_yield
    FROM time_series
    WHERE asset_class = 'economic' AND series_name = 'Earnings-Yield' AND column_name = 'Value'
    ORDER BY date DESC
    LIMIT 5
  `);

    const samples = sampleStmt.all() as Array<{ date: string; earnings_yield: number }>;
    console.table(samples);

    console.log('\n✓ Done!');
    db.close();
}

addEarningsYield();
