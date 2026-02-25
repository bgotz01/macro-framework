import Database from 'better-sqlite3';
import path from 'path';

function createRealYieldPercentile() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Creating Real Yield (10Y - CPI) percentiles...\n');

        const realYieldQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as tnx_value,
                    pa2.value as cpi_value,
                    pa1.value - pa2.value as real_yield
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON strftime('%Y-%m', datetime(pa1.date / 1000, 'unixepoch')) = 
                       strftime('%Y-%m', datetime(pa2.date / 1000, 'unixepoch'))
                WHERE pa1.asset_class = 'bonds'
                  AND pa1.series_name = 'US/TNX-Monthly'
                  AND pa2.asset_class = 'economic'
                  AND pa2.series_name = 'CPI'
                  AND pa1.value IS NOT NULL
                  AND pa2.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    real_yield as value,
                    PERCENT_RANK() OVER (ORDER BY real_yield) * 100 as percentile_rank
                FROM combined
            )
            SELECT 
                date,
                value,
                ROUND(percentile_rank, 2) as percentile_rank
            FROM ranked
            ORDER BY date
        `;

        console.log('Calculating percentiles...');
        const realYieldResults = db.prepare(realYieldQuery).all() as any[];
        console.log(`Found ${realYieldResults.length} data points\n`);

        // Delete existing
        console.log('Deleting existing Real-Yield percentiles...');
        const deleteResult = db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Real-Yield'`).run();
        console.log(`Deleted ${deleteResult.changes} existing records\n`);

        // Insert new data
        console.log('Inserting new percentiles...');
        const insertRealYield = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Real-Yield', 'Value', ?, ?)
        `);

        const insertManyRealYield = db.transaction((data: any[]) => {
            for (const row of data) {
                insertRealYield.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertManyRealYield(realYieldResults);
        console.log(`✅ Inserted ${realYieldResults.length} Real Yield percentiles\n`);

        // Show sample data
        console.log('📈 Sample data (latest 5 records):');
        const sample = db.prepare(`
            SELECT 
                datetime(date / 1000, 'unixepoch') as date_str,
                ROUND(value, 2) as value,
                ROUND(percentile_rank, 2) as percentile
            FROM percentile_analysis
            WHERE series_name = 'Real-Yield'
            ORDER BY date DESC
            LIMIT 5
        `).all() as any[];

        sample.forEach(row => {
            console.log(`  ${row.date_str}: ${row.value}% (${row.percentile}th percentile)`);
        });

        console.log('\n✅ Real Yield percentiles created successfully!');

    } catch (error) {
        console.error('❌ Error creating Real Yield percentiles:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
createRealYieldPercentile();
