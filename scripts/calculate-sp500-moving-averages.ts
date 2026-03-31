import Database from 'better-sqlite3';
import path from 'path';

interface PriceRow {
    date: string;
    value: number;
}

function main() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    console.log('Starting incremental SP500 moving average calculation...');

    // Find the latest MA date already computed (use MA200 as reference)
    const latestRow = db.prepare(`
        SELECT MAX(date) as max_date FROM time_series
        WHERE asset_class = 'derived' AND series_name = 'SP500-MA200'
    `).get() as { max_date: string | null };

    const latestComputed = latestRow?.max_date;

    // Load all SP500 price data (need full history for the lookback windows)
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

    // Find the starting index for new calculations
    let fromIndex = 0;
    if (latestComputed) {
        const idx = priceData.findIndex(d => d.date > latestComputed);
        if (idx === -1) {
            console.log('✓ Already up to date');
            db.close();
            return;
        }
        fromIndex = idx;
        console.log(`Incremental: processing ${priceData.length - fromIndex} new dates since ${latestComputed}`);
    } else {
        console.log('Full run: no existing data');
    }

    // Calculate MAs only for new dates, but use full price history for lookback
    const windows = [
        { period: 50, name: 'SP500-MA50', results: new Map<string, number>() },
        { period: 200, name: 'SP500-MA200', results: new Map<string, number>() },
        { period: 500, name: 'SP500-MA500', results: new Map<string, number>() },
    ];

    for (const w of windows) {
        // The earliest index we can compute this MA is (period - 1)
        const startIdx = Math.max(fromIndex, w.period - 1);

        for (let i = startIdx; i < priceData.length; i++) {
            // Only compute for new dates
            if (latestComputed && priceData[i].date <= latestComputed) continue;

            let sum = 0;
            for (let j = i - w.period + 1; j <= i; j++) {
                sum += priceData[j].value;
            }
            w.results.set(priceData[i].date, sum / w.period);
        }

        console.log(`${w.name}: ${w.results.size} new values`);
    }

    const totalNew = windows.reduce((s, w) => s + w.results.size, 0);
    if (totalNew === 0) {
        console.log('✓ Already up to date');
        db.close();
        return;
    }

    const insertTimeSeries = db.prepare(`
        INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, ?, ?)
    `);

    const insertPercentile = db.prepare(`
        INSERT OR REPLACE INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
        VALUES (?, ?, ?, ?, ?, NULL)
    `);

    db.transaction(() => {
        for (const w of windows) {
            for (const [date, value] of w.results.entries()) {
                insertTimeSeries.run(date, 'derived', w.name, 'value', value);
                insertPercentile.run(date, 'derived', w.name, 'value', value);
            }
        }
    })();

    // Update metadata
    const upsertMetadata = db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, source, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    const now = Math.floor(Date.now() / 1000);

    upsertMetadata.run('derived', 'SP500-MA50', 'S&P 500 50-Day Moving Average', '50-day simple moving average of S&P 500 closing prices', 'Calculated from SP500-Price', now);
    upsertMetadata.run('derived', 'SP500-MA200', 'S&P 500 200-Day Moving Average', '200-day simple moving average of S&P 500 closing prices', 'Calculated from SP500-Price', now);
    upsertMetadata.run('derived', 'SP500-MA500', 'S&P 500 500-Day Moving Average', '500-day simple moving average of S&P 500 closing prices', 'Calculated from SP500-Price', now);

    console.log(`\n✓ Inserted ${totalNew} moving average values`);
    db.close();
    console.log('Done!');
}

main();
