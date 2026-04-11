import Database from 'better-sqlite3';
import path from 'path';

function createReal3MSeries() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Creating Real 3M (3M - CPI) series...\n');

        // First, check if the series already exists
        const existingCount = db.prepare(`
            SELECT COUNT(*) as count 
            FROM time_series 
            WHERE asset_class = 'derived' AND series_name = 'Real-3M'
        `).get() as { count: number };

        if (existingCount.count > 0) {
            console.log(`⚠️  Found ${existingCount.count} existing Real-3M records. Deleting...`);
            db.prepare(`
                DELETE FROM time_series 
                WHERE asset_class = 'derived' AND series_name = 'Real-3M'
            `).run();
            console.log('✅ Deleted existing records\n');
        }

        // Calculate Real 3M by joining 3M Treasury with CPI
        // Match by year-month since they're both monthly data
        const query = `
            WITH real_3m AS (
                SELECT 
                    irx.date,
                    irx.value - cpi.value as real_yield
                FROM time_series irx
                INNER JOIN time_series cpi 
                    ON strftime('%Y-%m', datetime(irx.date / 1000, 'unixepoch')) = 
                       strftime('%Y-%m', datetime(cpi.date / 1000, 'unixepoch'))
                WHERE irx.asset_class = 'bonds'
                  AND irx.series_name = 'US/IRX-Monthly'
                  AND irx.column_name = 'Value'
                  AND cpi.asset_class = 'economic'
                  AND cpi.series_name = 'CPI'
                  AND cpi.column_name = 'Value'
                  AND irx.value IS NOT NULL
                  AND cpi.value IS NOT NULL
            )
            SELECT 
                date,
                real_yield
            FROM real_3m
            ORDER BY date
        `;

        const results = db.prepare(query).all() as Array<{ date: number; real_yield: number }>;
        console.log(`📈 Calculated ${results.length} Real 3M data points`);

        if (results.length === 0) {
            console.log('❌ No data points calculated. Check that both 3M and CPI data exist.');
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
            VALUES (?, 'derived', 'Real-3M', 'Value', ?)
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
            WHERE asset_class = 'derived' AND series_name = 'Real-3M'
        `).get() as { count: number };

        if (metadataExists.count > 0) {
            db.prepare(`
                UPDATE series_metadata 
                SET display_name = 'Real 3M (3M-CPI)',
                    description = 'Real 3-Month Treasury Yield adjusted for CPI inflation',
                    units = 'percent',
                    source = 'Calculated from US/IRX-Monthly and CPI',
                    last_updated = ?
                WHERE asset_class = 'derived' AND series_name = 'Real-3M'
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
                'Real-3M',
                'Real 3M (3M-CPI)',
                'Real 3-Month Treasury Yield adjusted for CPI inflation',
                'percent',
                'Calculated from US/IRX-Monthly and CPI',
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

        console.log('\n✅ Real 3M series created successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Run: npx tsx scripts/create-derived-percentiles.ts');
        console.log('   2. The Real 3M will now appear in the yield chart dropdown');

    } catch (error) {
        console.error('❌ Error creating Real 3M series:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
createReal3MSeries();
