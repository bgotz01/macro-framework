import Database from 'better-sqlite3';
import path from 'path';

interface PriceRow {
    date: string;
    value: number;
}

function calculateMovingAverage(data: PriceRow[], window: number): Map<string, number> {
    const result = new Map<string, number>();

    for (let i = window - 1; i < data.length; i++) {
        const windowData = data.slice(i - window + 1, i + 1);
        const sum = windowData.reduce((acc, row) => acc + row.value, 0);
        const avg = sum / window;
        result.set(data[i].date, avg);
    }

    return result;
}

function main() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    console.log('Fetching SP500 price data...');

    // Get all SP500 price data ordered by date
    const priceData = db.prepare(`
        SELECT date, value
        FROM time_series
        WHERE asset_class = 'equities' 
        AND series_name = 'US/GSPC'
        AND column_name = 'Value'
        ORDER BY date ASC
    `).all() as PriceRow[];

    console.log(`Found ${priceData.length} price records`);

    if (priceData.length === 0) {
        console.error('No SP500 price data found!');
        process.exit(1);
    }

    // Calculate moving averages
    console.log('Calculating 50-day moving average...');
    const ma50 = calculateMovingAverage(priceData, 50);

    console.log('Calculating 200-day moving average...');
    const ma200 = calculateMovingAverage(priceData, 200);

    console.log('Calculating 500-day moving average...');
    const ma500 = calculateMovingAverage(priceData, 500);

    // Prepare insert statements
    const insertTimeSeries = db.prepare(`
        INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, ?, ?)
    `);

    const insertPercentile = db.prepare(`
        INSERT OR REPLACE INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
        VALUES (?, ?, ?, ?, ?, NULL)
    `);

    // Insert MA50
    console.log('Inserting 50-day MA...');
    db.transaction(() => {
        for (const [date, value] of ma50.entries()) {
            insertTimeSeries.run(date, 'derived', 'SP500-MA50', 'value', value);
            insertPercentile.run(date, 'derived', 'SP500-MA50', 'value', value);
        }
    })();

    // Insert MA200
    console.log('Inserting 200-day MA...');
    db.transaction(() => {
        for (const [date, value] of ma200.entries()) {
            insertTimeSeries.run(date, 'derived', 'SP500-MA200', 'value', value);
            insertPercentile.run(date, 'derived', 'SP500-MA200', 'value', value);
        }
    })();

    // Insert MA500
    console.log('Inserting 500-day MA...');
    db.transaction(() => {
        for (const [date, value] of ma500.entries()) {
            insertTimeSeries.run(date, 'derived', 'SP500-MA500', 'value', value);
            insertPercentile.run(date, 'derived', 'SP500-MA500', 'value', value);
        }
    })();

    // Update metadata
    console.log('Updating metadata...');
    const upsertMetadata = db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, source, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = Math.floor(Date.now() / 1000);

    upsertMetadata.run(
        'derived',
        'SP500-MA50',
        'S&P 500 50-Day Moving Average',
        '50-day simple moving average of S&P 500 closing prices',
        'Calculated from SP500-Price',
        now
    );

    upsertMetadata.run(
        'derived',
        'SP500-MA200',
        'S&P 500 200-Day Moving Average',
        '200-day simple moving average of S&P 500 closing prices',
        'Calculated from SP500-Price',
        now
    );

    upsertMetadata.run(
        'derived',
        'SP500-MA500',
        'S&P 500 500-Day Moving Average',
        '500-day simple moving average of S&P 500 closing prices',
        'Calculated from SP500-Price',
        now
    );

    console.log('\nSummary:');
    console.log(`- MA50: ${ma50.size} records`);
    console.log(`- MA200: ${ma200.size} records`);
    console.log(`- MA500: ${ma500.size} records`);

    db.close();
    console.log('\nDone!');
}

main();
