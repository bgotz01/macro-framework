#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

// Magnificent 7: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA
// Note: NVDA reports on different fiscal quarters, so we use Mag6 (excluding NVDA)
const MAG6_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];

async function createMag7Index() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('🔄 Creating Magnificent 6 Market-Cap-Weighted Index...\n');
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

        // Delete existing Mag7 index data
        db.prepare(`
            DELETE FROM time_series
            WHERE asset_class = 'indices'
              AND series_name = 'MAG7'
        `).run();

        let calculatedCount = 0;
        let skippedCount = 0;
        const baseIndexValue = 100;
        let baseMarketCap: number | null = null;

        for (const { date } of allDates) {
            // Get market caps for all Mag6 stocks on this date
            const marketCaps = db.prepare(`
                SELECT series_name, value as market_cap
                FROM time_series
                WHERE asset_class = 'stocks'
                  AND series_name IN (${MAG6_STOCKS.map(() => '?').join(',')})
                  AND column_name = 'Market-Cap'
                  AND date = ?
            `).all(...MAG6_STOCKS, date) as Array<{ series_name: string; market_cap: number }>;

            // Only calculate if we have all 6 stocks
            if (marketCaps.length !== MAG6_STOCKS.length) {
                skippedCount++;
                continue;
            }

            // Calculate total market cap
            const totalMarketCap = marketCaps.reduce((sum, stock) => sum + stock.market_cap, 0);

            // Set base market cap on first valid date
            if (baseMarketCap === null) {
                baseMarketCap = totalMarketCap;
                console.log(`Base date: ${new Date(date).toISOString().split('T')[0]}`);
                console.log(`Base market cap: $${(baseMarketCap / 1000).toFixed(2)}B`);
                console.log(`Base index value: ${baseIndexValue}\n`);
            }

            // Calculate index value: (Current Total Market Cap / Base Total Market Cap) * 100
            const indexValue = (totalMarketCap / baseMarketCap) * baseIndexValue;

            // Insert index value
            db.prepare(`
                INSERT INTO time_series (asset_class, series_name, column_name, date, value)
                VALUES ('indices', 'MAG7', 'Index', ?, ?)
            `).run(date, indexValue);

            calculatedCount++;
        }

        console.log(`✅ Calculated ${calculatedCount} index values`);
        if (skippedCount > 0) {
            console.log(`⚠️  Skipped ${skippedCount} dates (incomplete data)`);
        }

        // Insert metadata
        db.prepare(`
            INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, last_updated)
            VALUES ('indices', 'MAG7', 'Magnificent 7 Index', 'index', ?)
        `).run(Date.now());

        // Show latest index value
        const latestValue = db.prepare(`
            SELECT date, value
            FROM time_series
            WHERE asset_class = 'indices' AND series_name = 'MAG7'
            ORDER BY date DESC
            LIMIT 1
        `).get() as { date: number; value: number } | undefined;

        if (latestValue) {
            console.log(`\nLatest index value: ${latestValue.value.toFixed(2)} (${new Date(latestValue.date).toISOString().split('T')[0]})`);

            // Calculate return since inception
            const returnPct = ((latestValue.value - baseIndexValue) / baseIndexValue) * 100;
            console.log(`Return since inception: ${returnPct.toFixed(2)}%`);
        }

        console.log('\n✅ Successfully created Magnificent 7 Index!');
    } catch (error) {
        console.error('Error creating Mag7 index:', error);
        throw error;
    } finally {
        db.close();
    }
}

createMag7Index().catch(console.error);
