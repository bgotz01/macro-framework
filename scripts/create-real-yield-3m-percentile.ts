import Database from 'better-sqlite3';
import path from 'path';

function createRealYield3MPercentile() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Creating Real Yield 3M (3M - CPI) percentile...\n');

        const realYield3MQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as irx_value,
                    pa2.value as cpi_value,
                    pa1.value - pa2.value as real_yield_3m
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON strftime('%Y-%m', datetime(pa1.date / 1000, 'unixepoch')) = 
                       strftime('%Y-%m', datetime(pa2.date / 1000, 'unixepoch'))
                WHERE pa1.asset_class = 'bonds'
                  AND pa1.series_name = 'US/IRX-Monthly'
                  AND pa2.asset_class = 'economic'
                  AND pa2.series_name = 'CPI'
                  AND pa1.value IS NOT NULL
                  AND pa2.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    real_yield_3m as value,
                    PERCENT_RANK() OVER (ORDER BY real_yield_3m) * 100 as percentile_rank
                FROM combined
            )
            SELECT 
                date,
                value,
                ROUND(percentile_rank, 2) as percentile_rank
            FROM ranked
            ORDER BY date
        `;

        const results = db.prepare(realYield3MQuery).all() as any[];
        console.log(`Found ${results.length} data points`);

        // Delete existing
        db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Real-Yield-3M'`).run();

        // Insert
        const insertStmt = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Real-Yield-3M', 'Value', ?, ?)
        `);

        const insertMany = db.transaction((data: any[]) => {
            for (const row of data) {
                insertStmt.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertMany(results);
        console.log(`✅ Inserted ${results.length} Real Yield 3M percentiles\n`);

        // Show sample data
        console.log('Sample data (last 5 records):');
        const sample = results.slice(-5);
        sample.forEach(row => {
            const date = new Date(row.date).toISOString().split('T')[0];
            console.log(`  ${date}: ${row.value.toFixed(2)}% (${row.percentile_rank}th percentile)`);
        });

    } catch (error) {
        console.error('❌ Error creating Real Yield 3M percentile:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
createRealYield3MPercentile();
