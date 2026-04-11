import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'macro-data.db');

/**
 * Compute expanding-window percentile rank for each vol series.
 * For each date, the percentile is: (count of prior values < current) / (total prior values) * 100
 * Uses binary search on a sorted array for O(n log n) per series.
 */

function binaryInsertIndex(sorted: number[], value: number): number {
    let lo = 0, hi = sorted.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (sorted[mid] < value) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

async function addVolatilityPercentiles() {
    console.log('Opening database...');
    const db = new Database(DB_PATH);

    try {
        // Find all vol series
        const volSeries = db.prepare(`
            SELECT DISTINCT asset_class, series_name, column_name
            FROM time_series
            WHERE column_name = 'Value_Vol252'
            ORDER BY asset_class, series_name, column_name
        `).all() as { asset_class: string; series_name: string; column_name: string }[];

        console.log(`Found ${volSeries.length} volatility series to process\n`);

        const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO percentile_analysis 
                (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        let totalInserted = 0;

        for (const { asset_class, series_name, column_name } of volSeries) {
            const label = `${asset_class}/${series_name}/${column_name}`;

            // Check if already computed
            const existing = db.prepare(`
                SELECT COUNT(*) as cnt FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ? AND column_name = ?
            `).get(asset_class, series_name, column_name) as { cnt: number };

            if (existing.cnt > 0) {
                console.log(`  ✓ ${label} — already has ${existing.cnt} percentile rows, skipping`);
                continue;
            }

            // Load vol data sorted by date
            const data = db.prepare(`
                SELECT date, value FROM time_series
                WHERE asset_class = ? AND series_name = ? AND column_name = ?
                  AND value IS NOT NULL
                ORDER BY date ASC
            `).all(asset_class, series_name, column_name) as { date: string; value: number }[];

            if (data.length === 0) {
                console.log(`  ⚠️ ${label} — no data`);
                continue;
            }

            // Compute expanding-window percentile using sorted array + binary search
            const sorted: number[] = [];
            const results: { date: string; value: number; pctile: number }[] = [];

            for (const { date, value } of data) {
                const idx = binaryInsertIndex(sorted, value);
                sorted.splice(idx, 0, value);
                // rank_below = number of values strictly less than current
                const rankBelow = idx;
                const total = sorted.length;
                const pctile = Math.round((rankBelow / total) * 10000) / 100; // 2 decimal places
                results.push({ date, value, pctile });
            }

            // Batch insert
            const transaction = db.transaction(() => {
                for (const { date, value, pctile } of results) {
                    insertStmt.run(date, asset_class, series_name, column_name, value, pctile);
                }
            });
            transaction();

            const latest = results[results.length - 1];
            console.log(`  ✅ ${label} — ${results.length} rows (latest: ${latest.value.toFixed(2)} → ${latest.pctile}th pctile)`);
            totalInserted += results.length;
        }

        console.log(`\n✅ Done! Inserted ${totalInserted} volatility percentile records.`);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        db.close();
    }
}

addVolatilityPercentiles().catch(console.error);
