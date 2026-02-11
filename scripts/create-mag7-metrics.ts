#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const MAG6_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];

async function createMag7Metrics() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('🔄 Creating Magnificent 6 Metrics...\n');

        const allDates = db.prepare(`
            SELECT DISTINCT date FROM time_series
            WHERE asset_class = 'stocks' AND series_name IN (${MAG6_STOCKS.map(() => '?').join(',')})
            ORDER BY date
        `).all(...MAG6_STOCKS) as Array<{ date: number }>;

        db.prepare(`DELETE FROM time_series WHERE asset_class = 'indices' AND series_name = 'MAG7'`).run();

        let baseMarketCap: number | null = null;

        for (const { date } of allDates) {
            const stockData = db.prepare(`
                SELECT ts1.series_name, ts1.value as market_cap, ts2.value as pe_ratio, 
                       ts3.value as ps_ratio, ts4.value as revenue
                FROM time_series ts1
                LEFT JOIN time_series ts2 ON ts1.asset_class = ts2.asset_class AND ts1.series_name = ts2.series_name AND ts1.date = ts2.date AND ts2.column_name = 'PE-Ratio'
                LEFT JOIN time_series ts3 ON ts1.asset_class = ts3.asset_class AND ts1.series_name = ts3.series_name AND ts1.date = ts3.date AND ts3.column_name = 'PS-Ratio'
                LEFT JOIN time_series ts4 ON ts1.asset_class = ts4.asset_class AND ts1.series_name = ts4.series_name AND ts1.date = ts4.date AND ts4.column_name = 'Revenue'
                WHERE ts1.asset_class = 'stocks' AND ts1.series_name IN (${MAG6_STOCKS.map(() => '?').join(',')}) AND ts1.column_name = 'Market-Cap' AND ts1.date = ?
            `).all(...MAG6_STOCKS, date) as Array<{ series_name: string; market_cap: number; pe_ratio: number | null; ps_ratio: number | null; revenue: number | null }>;

            if (stockData.length !== MAG6_STOCKS.length) continue;

            const totalMarketCap = stockData.reduce((sum, s) => sum + s.market_cap, 0);

            // Market Cap
            db.prepare(`INSERT INTO time_series (asset_class, series_name, column_name, date, value) VALUES ('indices', 'MAG7', 'Market-Cap', ?, ?)`).run(date, totalMarketCap);

            // Price Index (base 100)
            if (baseMarketCap === null) baseMarketCap = totalMarketCap;
            const priceIndex = (totalMarketCap / baseMarketCap) * 100;
            db.prepare(`INSERT INTO time_series (asset_class, series_name, column_name, date, value) VALUES ('indices', 'MAG7', 'Price', ?, ?)`).run(date, priceIndex);

            // Revenue
            if (stockData.every(s => s.revenue !== null)) {
                const totalRevenue = stockData.reduce((sum, s) => sum + s.revenue!, 0);
                db.prepare(`INSERT INTO time_series (asset_class, series_name, column_name, date, value) VALUES ('indices', 'MAG7', 'Revenue', ?, ?)`).run(date, totalRevenue);
            }

            // P/E Ratio
            if (stockData.every(s => s.pe_ratio !== null && s.pe_ratio > 0)) {
                const totalEarnings = stockData.reduce((sum, s) => sum + (s.market_cap / s.pe_ratio!), 0);
                const weightedPE = totalMarketCap / totalEarnings;
                db.prepare(`INSERT INTO time_series (asset_class, series_name, column_name, date, value) VALUES ('indices', 'MAG7', 'PE-Ratio', ?, ?)`).run(date, weightedPE);
            }

            // P/S Ratio
            if (stockData.every(s => s.ps_ratio !== null && s.ps_ratio > 0)) {
                const totalSales = stockData.reduce((sum, s) => sum + (s.market_cap / s.ps_ratio!), 0);
                const weightedPS = totalMarketCap / totalSales;
                db.prepare(`INSERT INTO time_series (asset_class, series_name, column_name, date, value) VALUES ('indices', 'MAG7', 'PS-Ratio', ?, ?)`).run(date, weightedPS);
            }
        }

        db.prepare(`INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, last_updated) VALUES ('indices', 'MAG7', 'Magnificent 6 (ex-NVDA)', 'index', ?)`).run(Date.now());

        const latest = {
            mc: db.prepare(`SELECT date, value FROM time_series WHERE asset_class = 'indices' AND series_name = 'MAG7' AND column_name = 'Market-Cap' ORDER BY date DESC LIMIT 1`).get() as any,
            price: db.prepare(`SELECT value FROM time_series WHERE asset_class = 'indices' AND series_name = 'MAG7' AND column_name = 'Price' ORDER BY date DESC LIMIT 1`).get() as any,
            revenue: db.prepare(`SELECT value FROM time_series WHERE asset_class = 'indices' AND series_name = 'MAG7' AND column_name = 'Revenue' ORDER BY date DESC LIMIT 1`).get() as any,
            pe: db.prepare(`SELECT value FROM time_series WHERE asset_class = 'indices' AND series_name = 'MAG7' AND column_name = 'PE-Ratio' ORDER BY date DESC LIMIT 1`).get() as any,
            ps: db.prepare(`SELECT value FROM time_series WHERE asset_class = 'indices' AND series_name = 'MAG7' AND column_name = 'PS-Ratio' ORDER BY date DESC LIMIT 1`).get() as any
        };

        console.log('\n📊 Latest Mag6 Metrics:');
        if (latest.mc) console.log(`Market Cap: $${(latest.mc.value / 1000000).toFixed(2)}T (${new Date(latest.mc.date).toISOString().split('T')[0]})`);
        if (latest.price) console.log(`Price Index: ${latest.price.value.toFixed(2)} (base 100)`);
        if (latest.revenue) console.log(`Total Revenue: $${(latest.revenue.value / 1000).toFixed(2)}B`);
        if (latest.pe) console.log(`P/E Ratio: ${latest.pe.value.toFixed(2)}x`);
        if (latest.ps) console.log(`P/S Ratio: ${latest.ps.value.toFixed(2)}x`);

        console.log('\n✅ Successfully created Magnificent 6 metrics!');
    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        db.close();
    }
}

createMag7Metrics().catch(console.error);
