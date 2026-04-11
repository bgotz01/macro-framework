import Database from 'better-sqlite3';
import path from 'path';

interface PercentileConfig {
    assetClass: string;
    seriesName: string;
    columnName: string;
}

const SERIES_TO_ANALYZE: PercentileConfig[] = [
    { assetClass: 'economic', seriesName: 'CPI', columnName: 'Value' },
    { assetClass: 'economic', seriesName: 'US/FEDFUNDS', columnName: 'Value' },
    { assetClass: 'bonds', seriesName: 'US/TNX-Monthly', columnName: 'Value' },
    { assetClass: 'bonds', seriesName: 'US/US-2yr-Monthly', columnName: 'Value' },
    { assetClass: 'bonds', seriesName: 'US/IRX-Monthly', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'Shiller-PE', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'PE-5yr', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'Earnings-Yield-5yr', columnName: 'Value' },
    { assetClass: 'valuations', seriesName: 'Earnings-Yield', columnName: 'Value' },
];

function calculatePercentiles() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('📊 Starting incremental percentile calculation...\n');

        db.exec(`
            CREATE TABLE IF NOT EXISTS percentile_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date INTEGER NOT NULL,
                asset_class TEXT NOT NULL,
                series_name TEXT NOT NULL,
                column_name TEXT NOT NULL,
                value REAL,
                percentile_rank REAL,
                UNIQUE(date, asset_class, series_name, column_name)
            );
            CREATE INDEX IF NOT EXISTS idx_percentile_date ON percentile_analysis(date);
            CREATE INDEX IF NOT EXISTS idx_percentile_composite ON percentile_analysis(asset_class, series_name, date);
        `);

        for (const series of SERIES_TO_ANALYZE) {
            console.log(`Processing ${series.assetClass}/${series.seriesName}...`);

            // Find the latest date already in percentile_analysis for this series
            const latestComputed = (db.prepare(`
                SELECT MAX(date) as max_date FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ? AND column_name = ?
            `).get(series.assetClass, series.seriesName, series.columnName) as { max_date: number | null }).max_date;

            if (latestComputed) {
                console.log(`  Incremental: only processing dates after ${new Date(latestComputed).toISOString().split('T')[0]}`);
            } else {
                console.log(`  Full run: no existing data`);
            }

            // For new dates, we still need the full history to compute correct percentile ranks.
            // We fetch all source data, but only insert rows for new dates.
            const query = `
                WITH ranked_data AS (
                    SELECT 
                        date,
                        asset_class,
                        series_name,
                        column_name,
                        value,
                        (
                            SELECT COUNT(*)
                            FROM time_series t2
                            WHERE t2.asset_class = t1.asset_class
                              AND t2.series_name = t1.series_name
                              AND t2.column_name = t1.column_name
                              AND t2.date <= t1.date
                              AND t2.value < t1.value
                        ) as rank_below,
                        (
                            SELECT COUNT(*)
                            FROM time_series t2
                            WHERE t2.asset_class = t1.asset_class
                              AND t2.series_name = t1.series_name
                              AND t2.column_name = t1.column_name
                              AND t2.date <= t1.date
                        ) as total_count
                    FROM time_series t1
                    WHERE t1.asset_class = ?
                      AND t1.series_name = ?
                      AND t1.column_name = ?
                      AND t1.value IS NOT NULL
                      ${latestComputed ? 'AND t1.date > ?' : ''}
                )
                SELECT 
                    date, asset_class, series_name, column_name, value,
                    ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
                FROM ranked_data
                ORDER BY date
            `;

            const params: (string | number)[] = [series.assetClass, series.seriesName, series.columnName];
            if (latestComputed) params.push(latestComputed);

            const results = db.prepare(query).all(...params) as any[];

            if (results.length === 0) {
                console.log(`  ✓ Already up to date\n`);
                continue;
            }

            console.log(`  Found ${results.length} new data points`);

            const insert = db.prepare(`
                INSERT OR REPLACE INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            db.transaction((data: any[]) => {
                for (const row of data) {
                    insert.run(row.date, row.asset_class, row.series_name, row.column_name, row.value, row.percentile_rank);
                }
            })(results);

            const samples = results.slice(-3);
            samples.forEach(row => {
                const dateStr = new Date(row.date).toISOString().split('T')[0];
                console.log(`    ${dateStr}: ${row.value?.toFixed(2)} → ${row.percentile_rank}th percentile`);
            });

            console.log(`  ✅ Inserted ${results.length} records\n`);
        }

        console.log('✅ Percentile calculation complete!');

    } catch (error) {
        console.error('❌ Error calculating percentiles:', error);
        throw error;
    } finally {
        db.close();
    }
}

calculatePercentiles();
