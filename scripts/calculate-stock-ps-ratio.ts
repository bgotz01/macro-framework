#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'NFLX'];

async function calculatePSRatio() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('🔄 Calculating P/S Ratio for stocks (using TTM Revenue)...\n');

        for (const ticker of STOCKS) {
            console.log(`Processing ${ticker}...`);

            // Get all dates for this stock, ordered chronologically
            const dates = db.prepare(`
                SELECT DISTINCT date
                FROM time_series
                WHERE asset_class = 'stocks' AND series_name = ?
                ORDER BY date
            `).all(ticker) as Array<{ date: number }>;

            // Get all revenue data for this stock
            const revenueData = db.prepare(`
                SELECT date, value as revenue
                FROM time_series
                WHERE asset_class = 'stocks' 
                  AND series_name = ?
                  AND column_name = 'Revenue'
                ORDER BY date
            `).all(ticker) as Array<{ date: number; revenue: number }>;

            // Create a map for quick revenue lookup
            const revenueMap = new Map<number, number>();
            revenueData.forEach(r => revenueMap.set(r.date, r.revenue));

            let calculatedCount = 0;
            let skippedCount = 0;

            for (let i = 0; i < dates.length; i++) {
                const currentDate = dates[i].date;

                // Calculate TTM Revenue (sum of last 4 quarters including current)
                let ttmRevenue = 0;
                let quartersFound = 0;

                for (let j = 0; j < 4 && (i - j) >= 0; j++) {
                    const quarterDate = dates[i - j].date;
                    const revenue = revenueMap.get(quarterDate);
                    if (revenue !== undefined) {
                        ttmRevenue += revenue;
                        quartersFound++;
                    }
                }

                // Only calculate if we have all 4 quarters
                if (quartersFound < 4) {
                    skippedCount++;
                    continue;
                }

                // Get Price and Shares for current date
                const metrics = db.prepare(`
                    SELECT column_name, value
                    FROM time_series
                    WHERE asset_class = 'stocks' 
                      AND series_name = ?
                      AND date = ?
                      AND column_name IN ('Price', 'Shares')
                `).all(ticker, currentDate) as Array<{ column_name: string; value: number }>;

                const metricsMap = new Map<string, number>();
                metrics.forEach(m => metricsMap.set(m.column_name, m.value));

                const price = metricsMap.get('Price');
                const shares = metricsMap.get('Shares');

                // Calculate P/S Ratio: Price / (TTM Revenue / Shares)
                // TTM Revenue is in millions, Shares is in millions
                // So TTM Revenue/Shares gives us TTM revenue per share
                if (price !== undefined && shares !== undefined && shares > 0 && ttmRevenue > 0) {
                    const revenuePerShare = ttmRevenue / shares;
                    const psRatio = price / revenuePerShare;

                    // Delete existing P/S Ratio for this date (if any)
                    db.prepare(`
                        DELETE FROM time_series
                        WHERE asset_class = 'stocks'
                          AND series_name = ?
                          AND column_name = 'PS-Ratio'
                          AND date = ?
                    `).run(ticker, currentDate);

                    // Insert new P/S Ratio
                    db.prepare(`
                        INSERT INTO time_series (asset_class, series_name, column_name, date, value)
                        VALUES ('stocks', ?, 'PS-Ratio', ?, ?)
                    `).run(ticker, currentDate, psRatio);

                    calculatedCount++;
                } else {
                    skippedCount++;
                }
            }

            console.log(`  ✅ Calculated ${calculatedCount} P/S ratios (TTM)`);
            if (skippedCount > 0) {
                console.log(`  ⚠️  Skipped ${skippedCount} records (missing data or < 4 quarters)`);
            }
        }

        console.log('\n✅ Successfully calculated P/S ratios (TTM) for all stocks!');
    } catch (error) {
        console.error('Error calculating P/S ratios:', error);
        throw error;
    } finally {
        db.close();
    }
}

calculatePSRatio().catch(console.error);
