import Database from 'better-sqlite3';
import path from 'path';

interface BondSeries {
    seriesName: string;
    displayName: string;
}

const BOND_SERIES: BondSeries[] = [
    { seriesName: 'US/TNX', displayName: '10-Year Treasury Yield (Monthly Avg)' },
    { seriesName: 'US/US-2yr', displayName: '2-Year Treasury Yield (Monthly Avg)' },
    { seriesName: 'US/IRX', displayName: '3-Month Treasury Yield (Monthly Avg)' },
];

function createMonthlyAverages() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');

    // Add timeout to handle locks
    const db = new Database(dbPath, { timeout: 10000 });

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Creating monthly average bond yields...\n');

        for (const series of BOND_SERIES) {
            console.log(`Processing ${series.seriesName}...`);

            // Calculate monthly averages from daily data
            const query = `
                WITH monthly_data AS (
                    SELECT 
                        strftime('%Y-%m-01', date/1000, 'unixepoch') as month_start,
                        AVG(value) as avg_value,
                        COUNT(*) as data_points
                    FROM time_series
                    WHERE asset_class = 'bonds'
                      AND series_name = ?
                      AND column_name = 'Value'
                      AND value IS NOT NULL
                    GROUP BY month_start
                )
                SELECT 
                    strftime('%s', month_start) * 1000 as date,
                    avg_value,
                    data_points
                FROM monthly_data
                ORDER BY date
            `;

            const results = db.prepare(query).all(series.seriesName) as any[];
            console.log(`  Found ${results.length} months of data`);

            if (results.length === 0) {
                console.log(`  ⚠️  No data found for ${series.seriesName}`);
                continue;
            }

            // Create new series name with -Monthly suffix
            const newSeriesName = `${series.seriesName}-Monthly`;

            // Delete existing monthly data if any
            db.prepare(`
                DELETE FROM time_series 
                WHERE asset_class = 'bonds' 
                  AND series_name = ?
            `).run(newSeriesName);

            // Insert monthly averages
            const insert = db.prepare(`
                INSERT INTO time_series (asset_class, series_name, column_name, date, value)
                VALUES ('bonds', ?, 'Value', ?, ?)
            `);

            const insertMany = db.transaction((seriesName: string, data: any[]) => {
                for (const row of data) {
                    insert.run(seriesName, row.date, row.avg_value);
                }
            });

            insertMany(newSeriesName, results);

            // Add metadata
            db.prepare(`
                INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, description)
                VALUES ('bonds', ?, ?, 'percent', 'Monthly average of daily values')
            `).run(newSeriesName, series.displayName);

            console.log(`  ✅ Created ${newSeriesName} with ${results.length} monthly data points`);

            // Show sample data
            const samples = results.slice(-3);
            console.log('  Latest 3 months:');
            samples.forEach(row => {
                const dateStr = new Date(row.date).toISOString().split('T')[0];
                console.log(`    ${dateStr}: ${row.avg_value.toFixed(2)}% (${row.data_points} days)`);
            });
            console.log('');
        }

        console.log('✅ Monthly bond yield series created!\n');

        // Summary
        console.log('📈 Summary:');
        const summary = db.prepare(`
            SELECT 
                series_name,
                COUNT(*) as total_months,
                MIN(date) as first_date,
                MAX(date) as last_date,
                ROUND(AVG(value), 2) as avg_value
            FROM time_series
            WHERE asset_class = 'bonds'
              AND series_name LIKE '%-Monthly'
            GROUP BY series_name
        `).all() as any[];

        summary.forEach(row => {
            const firstDate = new Date(row.first_date).toISOString().split('T')[0];
            const lastDate = new Date(row.last_date).toISOString().split('T')[0];
            console.log(`  ${row.series_name}:`);
            console.log(`    Months: ${row.total_months}`);
            console.log(`    Period: ${firstDate} to ${lastDate}`);
            console.log(`    Average: ${row.avg_value}%`);
        });

    } catch (error) {
        console.error('❌ Error creating monthly averages:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
createMonthlyAverages();
