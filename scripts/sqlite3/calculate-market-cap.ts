#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'NFLX'];

async function calculateMarketCap() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('🔄 Calculating Market Cap for stocks...\n');

        for (const ticker of STOCKS) {
            console.log(`Processing ${ticker}...`);

            // Get all dates for this stock
            const dates = db.prepare(`
                SELECT DISTINCT date
                FROM time_series
                WHERE asset_class = 'stocks' AND series_name = ?
                ORDER BY date
            `).all(ticker) as Array<{ date: number }>;

            let calculatedCount = 0;
            let skippedCount = 0;

            for (const { date } of dates) {
                // Get Price and Shares for this date
                const metrics = db.prepare(`
                    SELECT column_name, value
                    FROM time_series
                    WHERE asset_class = 'stocks' 
                      AND series_name = ?
                      AND date = ?
                      AND column_name IN ('Price', 'Shares')
                `).all(ticker, date) as Array<{ column_name: string; value: number }>;

                const metricsMap = new Map<string, number>();
                metrics.forEach(m => metricsMap.set(m.column_name, m.value));

                const price = metricsMap.get('Price');
                const shares = metricsMap.get('Shares');

                // Calculate Market Cap: Price × Shares (in millions)
                // Price is in dollars, Shares is in millions
                // Result is in millions of dollars
                if (price !== undefined && shares !== undefined) {
                    const marketCap = price * shares;

                    // Delete existing Market Cap for this date (if any)
                    db.prepare(`
                        DELETE FROM time_series
                        WHERE asset_class = 'stocks'
                          AND series_name = ?
                          AND column_name = 'Market-Cap'
                          AND date = ?
                    `).run(ticker, date);

                    // Insert new Market Cap
                    db.prepare(`
                        INSERT INTO time_series (asset_class, series_name, column_name, date, value)
                        VALUES ('stocks', ?, 'Market-Cap', ?, ?)
                    `).run(ticker, date, marketCap);

                    calculatedCount++;
                } else {
                    skippedCount++;
                }
            }

            console.log(`  ✅ Calculated ${calculatedCount} market caps`);
            if (skippedCount > 0) {
                console.log(`  ⚠️  Skipped ${skippedCount} records (missing data)`);
            }
        }

        console.log('\n✅ Successfully calculated market caps for all stocks!');
    } catch (error) {
        console.error('Error calculating market caps:', error);
        throw error;
    } finally {
        db.close();
    }
}

calculateMarketCap().catch(console.error);
