import Database from 'better-sqlite3';
import path from 'path';

function createRealEYP5yrPercentile() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Creating Real EYP-5yr (EY5yr - CPI - 3M) percentiles...\n');

        const reyp5yrQuery = `
            WITH combined AS (
                SELECT 
                    pa1.date,
                    pa1.value as ey5yr_value,
                    pa2.value as cpi_value,
                    pa3.value as irx_value,
                    pa1.value - pa2.value - pa3.value as reyp5yr
                FROM percentile_analysis pa1
                INNER JOIN percentile_analysis pa2 
                    ON strftime('%Y-%m', datetime(pa1.date / 1000, 'unixepoch')) = 
                       strftime('%Y-%m', datetime(pa2.date / 1000, 'unixepoch'))
                INNER JOIN percentile_analysis pa3
                    ON strftime('%Y-%m', datetime(pa1.date / 1000, 'unixepoch')) = 
                       strftime('%Y-%m', datetime(pa3.date / 1000, 'unixepoch'))
                WHERE pa1.asset_class = 'valuations'
                  AND pa1.series_name = 'Earnings-Yield-5yr'
                  AND pa2.asset_class = 'economic'
                  AND pa2.series_name = 'CPI'
                  AND pa3.asset_class = 'bonds'
                  AND pa3.series_name = 'US/IRX-Monthly'
                  AND pa1.value IS NOT NULL
                  AND pa2.value IS NOT NULL
                  AND pa3.value IS NOT NULL
            ),
            ranked AS (
                SELECT 
                    date,
                    reyp5yr as value,
                    PERCENT_RANK() OVER (ORDER BY reyp5yr) * 100 as percentile_rank
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
        const reyp5yrResults = db.prepare(reyp5yrQuery).all() as any[];
        console.log(`Found ${reyp5yrResults.length} data points\n`);

        // Delete existing
        console.log('Deleting existing Real-EYP-5yr percentiles...');
        const deleteResult = db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Real-EYP-5yr'`).run();
        console.log(`Deleted ${deleteResult.changes} existing records\n`);

        // Insert new data
        console.log('Inserting new percentiles...');
        const insertREYP5yr = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Real-EYP-5yr', 'Value', ?, ?)
        `);

        const insertManyREYP5yr = db.transaction((data: any[]) => {
            for (const row of data) {
                insertREYP5yr.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertManyREYP5yr(reyp5yrResults);
        console.log(`✅ Inserted ${reyp5yrResults.length} Real EYP-5yr percentiles\n`);

        // Show sample data
        console.log('📈 Sample data (latest 5 records):');
        const sample = db.prepare(`
            SELECT 
                datetime(date / 1000, 'unixepoch') as date_str,
                ROUND(value, 2) as value,
                ROUND(percentile_rank, 2) as percentile
            FROM percentile_analysis
            WHERE series_name = 'Real-EYP-5yr'
            ORDER BY date DESC
            LIMIT 5
        `).all() as any[];

        sample.forEach(row => {
            console.log(`  ${row.date_str}: ${row.value}% (${row.percentile}th percentile)`);
        });

        console.log('\n✅ Real EYP-5yr percentiles created successfully!');

    } catch (error) {
        console.error('❌ Error creating Real EYP-5yr percentiles:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
createRealEYP5yrPercentile();
