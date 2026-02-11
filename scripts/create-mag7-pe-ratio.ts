#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

// Magnificent 7: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA
// Using Mag6 (excluding NVDA) due to different fiscal calendar
const MAG6_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];

async function createMag7PERatio() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('🔄 Creating Magnificent 6 Market-Cap-Weighted P/E Ratio...\n');
        console.log('(Excluding NVDA due to different fiscal calendar)\n');

        // Get all unique dates across all Mag6 stocks
        const allDates = db.prepare(`
            SELECT DISTINCT date
            FROM time_series
            WHERE asset_class = 'stocks' 
              AND series_name IN (${MAG6_STOCKS.map(() => '?').join(',')})
            ORDER BY date
        `).all(...MAG6_STOCKS) as Array<{ date: number }>;

        console.log(`Found ${allDates.length} unique dates\n`);

        // Delete existing Mag7 P/E data
        db.prepare(`
            DELETE FROM time_series
            WHERE asset_class = 'indices'
              AND series_name = 'MAG7'
              AND column_name = 'PE-Ratio'
        `).run();

        let calculatedCount = 0;
        let skippedCount = 0;

        for (const { date } of allDates) {
            // Get market caps and P/E ratios for all Mag6 stocks on this date
            const stockData = db.prepare(`
                SELECT 
                    ts1.series_name,
                    ts1.value as market_cap,
                    ts2.value as pe_ratio
                FROM time_series ts1
                LEFT JOIN time_series ts2 
                    ON ts1.asset_class = ts2.asset_class 
                    AND ts1.series_name = ts2.series_name 
                    AND ts1.date = ts2.date
                    AND ts2.column_name = 'PE-Ratio'
                WHERE ts1.asset_class = 'stocks'
                  AND ts1.series_name IN (${MAG6_STOCKS.map(() => '?').join(',')})
                  AND ts1.column_name = 'Market-Cap'
                  AND ts1.date = ?
            `).all(...MAG6_STOCKS, date) as Array<{
                series_name: string;
                market_cap: number;
                pe_ratio: number | null
            }>;

            // Only calculate if we have all 6 stocks with both market cap and P/E ratio
            if (stockData.length !== MAG6_STOCKS.length) {
                skippedCount++;
                continue;
            }

            // Check if all have P/E ratios
            const allHavePE = stockData.every(s => s.pe_ratio !== null && s.pe_ratio > 0);
            if (!allHavePE) {
                skippedCount++;
                continue;
            }

            // Calculate market-cap-weighted P/E ratio
            // Formula: Sum(Market Cap) / Sum(Market Cap / P/E Ratio)
            // This is equivalent to: Total Market Cap / Total Earnings
            const totalMarketCap = stockData.reduce((sum, s) => sum + s.market_cap, 0);
            const totalEarnings = stockData.reduce((sum, s) => {
                // Earnings = Market Cap / P/E Ratio
                return sum + (s.market_cap / s.pe_ratio!);
            }, 0);

            const weightedPE = totalMarketCap / totalEarnings;

            // Insert weighted P/E ratio
            db.prepare(`
                INSERT INTO time_series (asset_class, series_name, column_name, date, value)
                VALUES ('indices', 'MAG7', 'PE-Ratio', ?, ?)
            `).run(date, weightedPE);

            calculatedCount++;
        }

        console.log(`✅ Calculated ${calculatedCount} P/E ratio values`);
        if (skippedCount > 0) {
            console.log(`⚠️  Skipped ${skippedCount} dates (incomplete data)`);
        }

        // Update metadata
        db.prepare(`
            INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, last_updated)
            VALUES ('indices', 'MAG7', 'Magnificent 6 (ex-NVDA)', 'index', ?)
        `).run(Date.now());

        // Show latest P/E ratio
        const latestValue = db.prepare(`
            SELECT date, value
            FROM time_series
            WHERE asset_class = 'indices' AND series_name = 'MAG7' AND column_name = 'PE-Ratio'
            ORDER BY date DESC
            LIMIT 1
        `).get() as { date: number; value: number } | undefined;

        if (latestValue) {
            console.log(`\nLatest Mag6 P/E Ratio: ${latestValue.value.toFixed(2)}x (${new Date(latestValue.date).toISOString().split('T')[0]})`);
        }

        // Show historical range
        const stats = db.prepare(`
            SELECT 
                MIN(value) as min_pe,
                MAX(value) as max_pe,
                AVG(value) as avg_pe
            FROM time_series
            WHERE asset_class = 'indices' AND series_name = 'MAG7' AND column_name = 'PE-Ratio'
        `).get() as { min_pe: number; max_pe: number; avg_pe: number } | undefined;

        if (stats) {
            console.log(`Historical range: ${stats.min_pe.toFixed(2)}x - ${stats.max_pe.toFixed(2)}x`);
            console.log(`Historical average: ${stats.avg_pe.toFixed(2)}x`);
        }

        console.log('\n✅ Successfully created Magnificent 6 P/E Ratio!');
    } catch (error) {
        console.error('Error creating Mag7 P/E ratio:', error);
        throw error;
    } finally {
        db.close();
    }
}

createMag7PERatio().catch(console.error);
