import Database from 'better-sqlite3';
import path from 'path';

interface PercentileConfig {
    assetClass: string;
    seriesName: string;
    columnName: string;
}

const SERIES_TO_ANALYZE: PercentileConfig[] = [
    // Inflation
    {
        assetClass: 'economic',
        seriesName: 'CPI',
        columnName: 'Value'
    },
    // Policy Rate
    {
        assetClass: 'economic',
        seriesName: 'US/FEDFUNDS',
        columnName: 'Value'
    },
    // 10-Year Treasury (Nominal Yield) - Monthly Average
    {
        assetClass: 'bonds',
        seriesName: 'US/TNX-Monthly',
        columnName: 'Value'
    },
    // 2-Year Treasury - Monthly Average
    {
        assetClass: 'bonds',
        seriesName: 'US/US-2yr-Monthly',
        columnName: 'Value'
    },
    // 3-Month Treasury - Monthly Average
    {
        assetClass: 'bonds',
        seriesName: 'US/IRX-Monthly',
        columnName: 'Value'
    },
    // Shiller PE (CAPE)
    {
        assetClass: 'valuations',
        seriesName: 'Shiller-PE',
        columnName: 'Value'
    },
    // PE-5yr (Price / 5-year rolling EPS)
    {
        assetClass: 'valuations',
        seriesName: 'PE-5yr',
        columnName: 'Value'
    },
    // Earnings Yield 5yr (1 / PE-5yr)
    {
        assetClass: 'valuations',
        seriesName: 'Earnings-Yield-5yr',
        columnName: 'Value'
    },
    // Earnings Yield CAPE (1 / Shiller PE)
    {
        assetClass: 'valuations',
        seriesName: 'Earnings-Yield',
        columnName: 'Value'
    }
];

function calculatePercentiles() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('📊 Starting percentile calculation...\n');

        // Create percentile_analysis table if it doesn't exist
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

        console.log('✅ Created/verified percentile_analysis table\n');

        for (const series of SERIES_TO_ANALYZE) {
            console.log(`Processing ${series.assetClass}/${series.seriesName}...`);

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
                console.log(`    ${dateStr}: ${row.value?.toFixed(2)} → ${row.percentile_rank}th percentile`);
            });

            console.log(`  ✅ Inserted ${results.length} percentile records\n`);
        }

        console.log('✅ Percentile calculation complete!\n');

        // Summary statistics
        console.log('📈 Summary:');
        const summary = db.prepare(`
            SELECT 
                asset_class,
                series_name,
                COUNT(*) as total_records,
                MIN(percentile_rank) as min_percentile,
                MAX(percentile_rank) as max_percentile,
                ROUND(AVG(percentile_rank), 2) as avg_percentile
            FROM percentile_analysis
            GROUP BY asset_class, series_name
        `).all() as any[];

        summary.forEach(row => {
            console.log(`  ${row.asset_class}/${row.series_name}:`);
            console.log(`    Records: ${row.total_records}`);
            console.log(`    Percentile range: ${row.min_percentile} - ${row.max_percentile}`);
            console.log(`    Average percentile: ${row.avg_percentile}`);
        });

    } catch (error) {
        console.error('❌ Error calculating percentiles:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
calculatePercentiles();
