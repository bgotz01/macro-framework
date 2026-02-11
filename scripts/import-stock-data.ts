#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';

interface StockConfig {
    ticker: string;
    displayName: string;
}

const STOCKS: StockConfig[] = [
    { ticker: 'AAPL', displayName: 'Apple' },
    { ticker: 'MSFT', displayName: 'Microsoft' },
    { ticker: 'GOOGL', displayName: 'Alphabet (Google)' },
    { ticker: 'AMZN', displayName: 'Amazon' },
    { ticker: 'NVDA', displayName: 'NVIDIA' },
    { ticker: 'META', displayName: 'Meta (Facebook)' },
    { ticker: 'TSLA', displayName: 'Tesla' },
    { ticker: 'AVGO', displayName: 'Broadcom' },
    { ticker: 'NFLX', displayName: 'Netflix' }
];

interface StockRow {
    Date: string;
    Price: string;
    EPS: string;
    TTM: string;
    'PE-Ratio': string;
    Revenue: string;
    Shares: string;
}

async function importStockData() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('🔄 Importing stock valuation data...\n');

        for (const stock of STOCKS) {
            console.log(`Processing ${stock.displayName} (${stock.ticker})...`);

            const filePath = path.join(process.cwd(), 'data', 'stocks', `${stock.ticker}.csv`);

            if (!fs.existsSync(filePath)) {
                console.log(`  ⚠️  File not found: ${filePath}`);
                continue;
            }

            // Read and parse CSV
            const csvContent = fs.readFileSync(filePath, 'utf-8');
            const result = Papa.parse<StockRow>(csvContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false
            });

            if (result.errors.length > 0) {
                console.error(`  ❌ Error parsing CSV: ${result.errors[0].message}`);
                continue;
            }

            const data = result.data;
            console.log(`  Found ${data.length} data points`);

            // Delete existing data for this stock
            db.prepare(`
                DELETE FROM time_series 
                WHERE asset_class = 'stocks' 
                  AND series_name = ?
            `).run(stock.ticker);

            // Prepare insert statements for each metric
            const insertStmt = db.prepare(`
                INSERT INTO time_series (asset_class, series_name, column_name, date, value)
                VALUES ('stocks', ?, ?, ?, ?)
            `);

            const insertMany = db.transaction((ticker: string, dataPoints: StockRow[]) => {
                for (const row of dataPoints) {
                    const date = new Date(row.Date).getTime();
                    if (isNaN(date)) continue;

                    // Insert Price
                    const price = parseFloat(row.Price);
                    if (!isNaN(price)) {
                        insertStmt.run(ticker, 'Price', date, price);
                    }

                    // Insert EPS
                    const eps = parseFloat(row.EPS);
                    if (!isNaN(eps)) {
                        insertStmt.run(ticker, 'EPS', date, eps);
                    }

                    // Insert TTM
                    const ttm = parseFloat(row.TTM);
                    if (!isNaN(ttm)) {
                        insertStmt.run(ticker, 'TTM', date, ttm);
                    }

                    // Insert PE Ratio
                    const peRatio = parseFloat(row['PE-Ratio']);
                    if (!isNaN(peRatio)) {
                        insertStmt.run(ticker, 'PE-Ratio', date, peRatio);
                    }

                    // Insert Revenue
                    const revenue = parseFloat(row.Revenue);
                    if (!isNaN(revenue)) {
                        insertStmt.run(ticker, 'Revenue', date, revenue);
                    }

                    // Insert Shares
                    const shares = parseFloat(row.Shares);
                    if (!isNaN(shares)) {
                        insertStmt.run(ticker, 'Shares', date, shares);
                    }
                }
            });

            insertMany(stock.ticker, data);
            console.log(`  ✅ Inserted data for ${stock.ticker}`);

            // Insert or update metadata
            db.prepare(`
                INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, last_updated)
                VALUES ('stocks', ?, ?, ?)
            `).run(stock.ticker, stock.displayName, Date.now());
        }

        console.log('\n✅ Successfully imported all stock data!');
    } catch (error) {
        console.error('Error importing stock data:', error);
        throw error;
    } finally {
        db.close();
    }
}

importStockData().catch(console.error);
