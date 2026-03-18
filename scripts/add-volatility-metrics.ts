import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'macro-data.db');

interface DataPoint {
    date: string;
    value: number;
}

function calculateRollingStdDev(values: number[], window: number): number | null {
    if (values.length < window) return null;
    const windowValues = values.slice(-window);
    const mean = windowValues.reduce((sum, val) => sum + val, 0) / window;
    const variance = windowValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window;
    return Math.sqrt(variance) * Math.sqrt(252) * 100; // annualized %
}

async function addVolatilityMetrics() {
    console.log('Opening database...');
    const db = new Database(DB_PATH);

    try {
        const equitySeries = db.prepare(`
            SELECT DISTINCT series_name 
            FROM series_metadata 
            WHERE asset_class = 'equities'
            ORDER BY series_name
        `).all() as { series_name: string }[];

        console.log(`Found ${equitySeries.length} equity series`);

        const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
            VALUES (?, 'equities', ?, ?, ?)
        `);

        for (const { series_name } of equitySeries) {
            console.log(`\nProcessing ${series_name}...`);

            // Find the latest date already computed
            const latestComputed = (db.prepare(`
                SELECT MAX(date) as max_date FROM time_series
                WHERE asset_class = 'equities' AND series_name = ? AND column_name = 'Value_Vol63'
            `).get(series_name) as { max_date: string | null }).max_date;

            // Always fetch full price history (needed for lookback windows)
            const priceData = db.prepare(`
                SELECT date, value
                FROM time_series
                WHERE asset_class = 'equities' AND series_name = ? AND column_name = 'Value'
                  AND value IS NOT NULL
                ORDER BY date ASC
            `).all(series_name) as DataPoint[];

            if (priceData.length === 0) {
                console.log(`  No price data found`);
                continue;
            }

            // Build daily returns array
            const returnsArray: { date: string; ret: number }[] = [];
            for (let i = 1; i < priceData.length; i++) {
                const prev = priceData[i - 1].value;
                const curr = priceData[i].value;
                if (prev > 0 && curr) {
                    returnsArray.push({ date: priceData[i].date, ret: (curr - prev) / prev });
                }
            }

            // Find where new data starts
            let fromIndex = 0;
            if (latestComputed) {
                const idx = returnsArray.findIndex(r => r.date > latestComputed);
                if (idx === -1) {
                    console.log(`  ✓ Already up to date`);
                    continue;
                }
                fromIndex = idx;
                console.log(`  Incremental: processing ${returnsArray.length - fromIndex} new rows since ${latestComputed}`);
            } else {
                console.log(`  Full run: no existing data`);
            }

            let insertCount = 0;

            const transaction = db.transaction(() => {
                for (let i = fromIndex; i < returnsArray.length; i++) {
                    const { date } = returnsArray[i];
                    // Slice only up to current index for the rolling window
                    const retValues = returnsArray.slice(0, i + 1).map(r => r.ret);

                    const vol63 = calculateRollingStdDev(retValues, 63);
                    if (vol63 !== null) { insertStmt.run(date, series_name, 'Value_Vol63', vol63); insertCount++; }

                    const vol126 = calculateRollingStdDev(retValues, 126);
                    if (vol126 !== null) { insertStmt.run(date, series_name, 'Value_Vol126', vol126); insertCount++; }

                    const vol252 = calculateRollingStdDev(retValues, 252);
                    if (vol252 !== null) { insertStmt.run(date, series_name, 'Value_Vol252', vol252); insertCount++; }

                    const vol504 = calculateRollingStdDev(retValues, 504);
                    if (vol504 !== null) { insertStmt.run(date, series_name, 'Value_Vol504', vol504); insertCount++; }
                }
            });

            transaction();
            console.log(`  ✓ Inserted ${insertCount} volatility data points`);
        }

        console.log('\n✅ Volatility metrics calculation complete!');
    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        db.close();
    }
}

addVolatilityMetrics().catch(console.error);
