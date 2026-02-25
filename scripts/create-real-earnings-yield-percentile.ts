import Database from 'better-sqlite3';
import path from 'path';

function createRealEarningsYieldPercentile() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Creating Real Earnings Yield (E/P - CPI) percentiles...\n');

        const reyQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as pe_value,
                    pa2.value as cpi_value,
                    (100.0 / pa1.value) - pa2.value as rey
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON strftime('%Y-%m', datetime(pa1.date / 1000, 'unixepoch')) = 
                       strftime('%Y-%m', datetime(pa2.date / 1000, 'unixepoch'))
                WHERE pa1.asset_class = 'valuations'
                  AND pa1.series_name = 'Shiller-PE'
                  AND pa2.asset_class = 'economic'
                  AND pa2.series_name = 'CPI'
                  AND pa1.value IS NOT NULL
                  AND pa1.value > 0
                  AND pa2.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    rey as value,
                    PERCENT_RANK() OVER (ORDER BY rey) * 100 as percentile_rank
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
        const reyResults = db.prepare(reyQuery).all() as any[];
        console.log(`Found ${reyResults.length} data points\n`);

        // Delete existing
        console.log('Deleting existing Real-Earnings-Yield percentiles...');
        const deleteResult = db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Real-Earnings-Yield'`).run();
        console.log(`Deleted ${deleteResult.changes} existing records\n`);

        // Insert new data
        console.log('Inserting new percentiles...');
        const insertREY = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Real-Earnings-Yield', 'Value', ?, ?)
        `);

        const insertManyREY = db.transaction((data: any[]) => {
            for (const row of data) {
                insertREY.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertManyREY(reyResults);
        console.log(`✅ Inserted ${reyResults.length} Real Earnings Yield percentiles\n`);

        // Show sample data
        console.log('📈 Sample data (latest 5 records):');
        const sample = db.prepare(`
            SELECT 
                datetime(date / 1000, 'unixepoch') as date_str,
                ROUND(value, 2) as value,
                ROUND(percentile_rank, 2) as percentile
            FROM percentile_analysis
            WHERE series_name = 'Real-Earnings-Yield'
            ORDER BY date DESC
            LIMIT 5
        `).all() as any[];

        sample.forEach(row => {
            console.log(`  ${row.date_str}: ${row.value}% (${row.percentile}th percentile)`);
        });

        console.log('\n✅ Real Earnings Yield percentiles created successfully!');

    } catch (error) {
        console.error('❌ Error creating Real Earnings Yield percentiles:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
createRealEarningsYieldPercentile();
