import Database from 'better-sqlite3';
import path from 'path';

interface PercentileConfig {
    assetClass: string;
    seriesName: string;
    columnName: string;
    displayName: string;
}

const SERIES_TO_ANALYZE: PercentileConfig[] = [
    {
        assetClass: 'derived',
        seriesName: 'Real-10Y',
        columnName: 'Value',
        displayName: 'Real 10Y (10Y-CPI)'
    },
    {
        assetClass: 'derived',
        seriesName: 'Real-3M',
        columnName: 'Value',
        displayName: 'Real 3M (3M-CPI)'
    }
];

function calculateRealYieldPercentiles() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('📊 Calculating percentiles for Real Yield series...\n');

        for (const series of SERIES_TO_ANALYZE) {
            console.log(`Processing ${series.displayName}...`);

            // Delete existing percentile data for this series
            db.prepare(`
                DELETE FROM percentile_analysis 
                WHERE asset_class = ? 
                  AND series_name = ?
                  AND column_name = ?
            `).run(series.assetClass, series.seriesName, series.columnName);

            // Calculate percentiles using window function
            // For each date, calculate what percentile the value is compared to all data up to that date
            const query = `
                WITH ranked_data AS (
                    SELECT 
                        date,
                        asset_class,
                        series_name,
                        column_name,
                        value,
                        -- Count how many values are less than current value (up to current date)
                        (
                            SELECT COUNT(*)
                            FROM time_series t2
                            WHERE t2.asset_class = t1.asset_class
                              AND t2.series_name = t1.series_name
                              AND t2.column_name = t1.column_name
                              AND t2.date <= t1.date
                              AND t2.value < t1.value
                        ) as rank_below,
                        -- Count total values up to current date
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
                )
                SELECT 
                    date,
                    asset_class,
                    series_name,
                    column_name,
                    value,
                    -- Calculate percentile: (rank / total) * 100
                    ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
                FROM ranked_data
                ORDER BY date
            `;

            const results = db.prepare(query).all(
                series.assetClass,
                series.seriesName,
                series.columnName
            ) as any[];

            console.log(`  Found ${results.length} data points`);

            if (results.length === 0) {
                console.log(`  ⚠️  No data found for ${series.seriesName}`);
                continue;
            }

            // Insert percentile data
            const insert = db.prepare(`
                INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            const insertMany = db.transaction((data: any[]) => {
                for (const row of data) {
                    insert.run(
                        row.date,
                        row.asset_class,
                        row.series_name,
                        row.column_name,
                        row.value,
                        row.percentile_rank
                    );
                }
            });

            insertMany(results);

            // Show some sample data
            const samples = results.slice(-5);
            console.log('  Latest 5 percentiles:');
            samples.forEach(row => {
                const dateStr = new Date(row.date).toISOString().split('T')[0];
                console.log(`    ${dateStr}: ${row.value?.toFixed(2)}% → ${row.percentile_rank}th percentile`);
            });

            console.log(`  ✅ Inserted ${results.length} percentile records\n`);
        }

        console.log('✅ Real Yield percentile calculation complete!\n');

    } catch (error) {
        console.error('❌ Error calculating percentiles:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
calculateRealYieldPercentiles();
