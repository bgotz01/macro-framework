import Database from 'better-sqlite3';
import path from 'path';

function createReal10YSeries() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Creating Real 10Y (10Y - CPI) series...\n');

        // First, check if the series already exists
        const existingCount = db.prepare(`
            SELECT COUNT(*) as count 
            FROM time_series 
            WHERE asset_class = 'derived' AND series_name = 'Real-10Y'
        `).get() as { count: number };

        if (existingCount.count > 0) {
            console.log(`⚠️  Found ${existingCount.count} existing Real-10Y records. Deleting...`);
            db.prepare(`
                DELETE FROM time_series 
                WHERE asset_class = 'derived' AND series_name = 'Real-10Y'
            `).run();
            console.log('✅ Deleted existing records\n');
        }

        // Calculate Real 10Y by joining 10Y Treasury with CPI
        // Match by year-month since they're both monthly data
        const query = `
            WITH real_10y AS (
                SELECT 
                    tnx.date,
                    tnx.value - cpi.value as real_yield
                FROM time_series tnx
                INNER JOIN time_series cpi 
                    ON strftime('%Y-%m', datetime(tnx.date / 1000, 'unixepoch')) = 
                       strftime('%Y-%m', datetime(cpi.date / 1000, 'unixepoch'))
                WHERE tnx.asset_class = 'bonds'
                  AND tnx.series_name = 'US/TNX-Monthly'
                  AND tnx.column_name = 'Value'
                  AND cpi.asset_class = 'economic'
                  AND cpi.series_name = 'CPI'
                  AND cpi.column_name = 'Value'
                  AND tnx.value IS NOT NULL
                  AND cpi.value IS NOT NULL
            )
            SELECT 
                date,
                real_yield
            FROM real_10y
            ORDER BY date
        `;

        const results = db.prepare(query).all() as Array<{ date: number; real_yield: number }>;
        console.log(`📈 Calculated ${results.length} Real 10Y data points`);

        if (results.length === 0) {
            console.log('❌ No data points calculated. Check that both 10Y and CPI data exist.');
            return;
        }

        // Show date range
        const firstDate = new Date(results[0].date).toISOString().split('T')[0];
        const lastDate = new Date(results[results.length - 1].date).toISOString().split('T')[0];
        console.log(`   Date range: ${firstDate} to ${lastDate}`);
        console.log(`   Latest value: ${results[results.length - 1].real_yield.toFixed(2)}%\n`);

        // Insert into time_series
        const insert = db.prepare(`
            INSERT INTO time_series (date, asset_class, series_name, column_name, value)
            VALUES (?, 'derived', 'Real-10Y', 'Value', ?)
        `);

        const insertMany = db.transaction((data: Array<{ date: number; real_yield: number }>) => {
            for (const row of data) {
                insert.run(row.date, row.real_yield);
            }
        });

        insertMany(results);
        console.log(`✅ Inserted ${results.length} records into time_series\n`);

        // Add or update metadata
        const metadataExists = db.prepare(`
            SELECT COUNT(*) as count 
            FROM series_metadata 
            WHERE asset_class = 'derived' AND series_name = 'Real-10Y'
        `).get() as { count: number };

        if (metadataExists.count > 0) {
            db.prepare(`
                UPDATE series_metadata 
                SET display_name = 'Real 10Y (10Y-CPI)',
                    description = 'Real 10-Year Treasury Yield adjusted for CPI inflation',
                    units = 'percent',
                    source = 'Calculated from US/TNX-Monthly and CPI',
                    last_updated = ?
                WHERE asset_class = 'derived' AND series_name = 'Real-10Y'
            `).run(Date.now());
            console.log('✅ Updated series metadata\n');
        } else {
            db.prepare(`
                INSERT INTO series_metadata (
                    asset_class, series_name, display_name, description, 
                    units, source, last_updated
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                'derived',
                'Real-10Y',
                'Real 10Y (10Y-CPI)',
                'Real 10-Year Treasury Yield adjusted for CPI inflation',
                'percent',
                'Calculated from US/TNX-Monthly and CPI',
                Date.now()
            );
            console.log('✅ Created series metadata\n');
        }

        // Show sample data
        console.log('📊 Sample data (latest 5 points):');
        const samples = results.slice(-5);
        samples.forEach(row => {
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            console.log(`   ${dateStr}: ${row.real_yield.toFixed(2)}%`);
        });

        console.log('\n✅ Real 10Y series created successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Run: npx tsx scripts/create-derived-percentiles.ts');
        console.log('   2. The Real 10Y will now appear in the yield chart dropdown');

    } catch (error) {
        console.error('❌ Error creating Real 10Y series:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
createReal10YSeries();
