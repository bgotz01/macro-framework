import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'macro-data.db');

interface DataPoint {
    date: string;  // ISO date string
    value: number;
}

/**
 * Calculate rolling standard deviation (annualized)
 * @param values Array of daily returns
 * @param window Window size in days
 * @returns Annualized standard deviation as percentage
 */
function calculateRollingStdDev(values: number[], window: number): number | null {
    if (values.length < window) return null;

    const windowValues = values.slice(-window);
    const mean = windowValues.reduce((sum, val) => sum + val, 0) / window;
    const variance = windowValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window;
    const stdDev = Math.sqrt(variance);

    // Annualize: multiply by sqrt(252) for daily data
    const annualizedStdDev = stdDev * Math.sqrt(252);

    return annualizedStdDev * 100; // Convert to percentage
}

/**
 * Calculate daily returns from price series
 */
function calculateDailyReturns(prices: DataPoint[]): Map<string, number> {
    const returns = new Map<string, number>();

    for (let i = 1; i < prices.length; i++) {
        const prevPrice = prices[i - 1].value;
        const currPrice = prices[i].value;

        if (prevPrice && currPrice && prevPrice > 0) {
            const dailyReturn = (currPrice - prevPrice) / prevPrice;
            returns.set(prices[i].date, dailyReturn);
        }
    }

    return returns;
}

async function addVolatilityMetrics() {
    console.log('Opening database...');
    const db = new Database(DB_PATH);

    try {
        // Get all equity series
        const equitySeries = db.prepare(`
      SELECT DISTINCT series_name 
      FROM series_metadata 
      WHERE asset_class = 'equities'
      ORDER BY series_name
    `).all() as { series_name: string }[];

        console.log(`Found ${equitySeries.length} equity series`);

        for (const { series_name } of equitySeries) {
            console.log(`\nProcessing ${series_name}...`);

            // Get all price data for this series, ordered by date
            const priceData = db.prepare(`
        SELECT date, value
        FROM time_series
        WHERE asset_class = 'equities'
          AND series_name = ?
          AND column_name = 'Value'
          AND value IS NOT NULL
        ORDER BY date ASC
      `).all(series_name) as DataPoint[];

            if (priceData.length === 0) {
                console.log(`  No price data found for ${series_name}`);
                continue;
            }

            console.log(`  Found ${priceData.length} price points`);

            // Calculate daily returns
            const dailyReturns = calculateDailyReturns(priceData);
            console.log(`  Calculated ${dailyReturns.size} daily returns`);

            // Calculate rolling volatilities
            const returnsArray = Array.from(dailyReturns.entries()).sort((a, b) => a[0].localeCompare(b[0]));
            let insertCount = 0;

            const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, 'equities', ?, ?, ?)
      `);

            const transaction = db.transaction(() => {
                for (let i = 0; i < returnsArray.length; i++) {
                    const [date] = returnsArray[i];
                    const returnValues = returnsArray.slice(0, i + 1).map(([, ret]) => ret);

                    // Calculate 63-day (3 month) volatility
                    const vol63 = calculateRollingStdDev(returnValues, 63);
                    if (vol63 !== null) {
                        insertStmt.run(date, series_name, 'Value_Vol63', vol63);
                        insertCount++;
                    }

                    // Calculate 126-day (6 month) volatility
                    const vol126 = calculateRollingStdDev(returnValues, 126);
                    if (vol126 !== null) {
                        insertStmt.run(date, series_name, 'Value_Vol126', vol126);
                        insertCount++;
                    }

                    // Calculate 252-day (1 year) volatility
                    const vol252 = calculateRollingStdDev(returnValues, 252);
                    if (vol252 !== null) {
                        insertStmt.run(date, series_name, 'Value_Vol252', vol252);
                        insertCount++;
                    }

                    // Calculate 504-day (2 year) volatility
                    const vol504 = calculateRollingStdDev(returnValues, 504);
                    if (vol504 !== null) {
                        insertStmt.run(date, series_name, 'Value_Vol504', vol504);
                        insertCount++;
                    }
                }
            });

            transaction();
            console.log(`  Inserted ${insertCount} volatility data points`);
        }

        console.log('\n✅ Volatility metrics calculation complete!');

    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
addVolatilityMetrics().catch(console.error);
