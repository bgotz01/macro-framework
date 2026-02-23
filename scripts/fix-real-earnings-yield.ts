import Database from 'better-sqlite3';
import path from 'path';

function fixRealEarningsYield() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 30000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Fixing Real Earnings Yield (EY-CPI using Shiller PE)...\n');

        // First, create the combined data
        console.log('Step 1: Combining Shiller PE and CPI data...');
        const combinedQuery = `
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
            ORDER BY pa1.date
        `;

        const combinedData = db.prepare(combinedQuery).all() as any[];
        console.log(`  Found ${combinedData.length} matching data points\n`);

        if (combinedData.length === 0) {
            console.log('❌ No data found. Exiting.');
            return;
        }

        // Calculate percentiles
        console.log('Step 2: Calculating percentiles...');
        const results: any[] = [];

        for (let i = 0; i < combinedData.length; i++) {
            const current = combinedData[i];

            // Get all data up to current date
            const historicalData = combinedData.slice(0, i + 1);

            // Count how many values are below current value
            const rankBelow = historicalData.filter(d => d.rey < current.rey).length;
            const totalCount = historicalData.length;

            // Calculate percentile
            const percentileRank = Math.round((rankBelow / totalCount) * 100 * 100) / 100;

            results.push({
                date: current.date,
                value: current.rey,
                percentile_rank: percentileRank
            });

            if ((i + 1) % 100 === 0) {
                console.log(`  Processed ${i + 1}/${combinedData.length} records...`);
            }
        }

        console.log(`  ✅ Calculated ${results.length} percentiles\n`);

        // Delete existing data
        console.log('Step 3: Clearing old data...');
        db.prepare(`DELETE FROM percentile_analysis WHERE series_name = 'Real-Earnings-Yield'`).run();
        console.log('  ✅ Cleared\n');

        // Insert new data
        console.log('Step 4: Inserting new data...');
        const insert = db.prepare(`
            INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
            VALUES (?, 'derived', 'Real-Earnings-Yield', 'Value', ?, ?)
        `);

        const insertMany = db.transaction((data: any[]) => {
            for (const row of data) {
                insert.run(row.date, row.value, row.percentile_rank);
            }
        });

        insertMany(results);
        console.log(`  ✅ Inserted ${results.length} records\n`);

        // Show sample data
        console.log('📈 Sample data (latest 5):');
        const samples = results.slice(-5);
        samples.forEach(row => {
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            console.log(`  ${dateStr}: ${row.value.toFixed(2)}% → ${row.percentile_rank}th percentile`);
        });

        console.log('\n✅ Real Earnings Yield percentiles restored successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
fixRealEarningsYield();
