import Database from 'better-sqlite3';
import path from 'path';

interface RealYieldConfig {
    seriesName: string;
    displayName: string;
    description: string;
    sourceSeriesName: string;
    sourceDisplayName: string;
}

const REAL_YIELDS: RealYieldConfig[] = [
    {
        seriesName: 'Real-10Y',
        displayName: 'Real 10Y (10Y-CPI)',
        description: 'Real 10-Year Treasury Yield adjusted for CPI inflation',
        sourceSeriesName: 'US/TNX-Monthly',
        sourceDisplayName: '10Y Treasury'
    },
    {
        seriesName: 'Real-3M',
        displayName: 'Real 3M (3M-CPI)',
        description: 'Real 3-Month Treasury Yield adjusted for CPI inflation',
        sourceSeriesName: 'US/IRX-Monthly',
        sourceDisplayName: '3M Treasury'
    }
];

function createRealYields() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Creating Real Yield series...\n');

        for (const config of REAL_YIELDS) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Creating ${config.displayName}`);
            console.log('='.repeat(60));

            // Check if the series already exists
            const existingCount = db.prepare(`
                SELECT COUNT(*) as count 
                FROM time_series 
                WHERE asset_class = 'derived' AND series_name = ?
            `).get(config.seriesName) as { count: number };

            if (existingCount.count > 0) {
                console.log(`⚠️  Found ${existingCount.count} existing records. Deleting...`);
                db.prepare(`
                    DELETE FROM time_series 
                    WHERE asset_class = 'derived' AND series_name = ?
                `).run(config.seriesName);
                console.log('✅ Deleted existing records\n');
            }

            // Calculate Real Yield by joining Treasury with CPI on year-month
            // Use CPI date as the canonical date since it's the actual month-end
            const query = `
                WITH real_yield AS (
                    SELECT 
                        cpi.date,
                        treasury.value - cpi.value as real_yield
                    FROM time_series cpi
                    INNER JOIN time_series treasury
                        ON strftime('%Y-%m', datetime(cpi.date / 1000, 'unixepoch')) = 
                           strftime('%Y-%m', datetime(treasury.date / 1000, 'unixepoch'))
                    WHERE treasury.asset_class = 'bonds'
                      AND treasury.series_name = ?
                      AND treasury.column_name = 'Value'
                      AND cpi.asset_class = 'economic'
                      AND cpi.series_name = 'CPI'
                      AND cpi.column_name = 'Value'
                      AND treasury.value IS NOT NULL
                      AND cpi.value IS NOT NULL
                )
                SELECT 
                    date,
                    real_yield
                FROM real_yield
                ORDER BY date
            `;

            const results = db.prepare(query).all(config.sourceSeriesName) as Array<{ date: number; real_yield: number }>;
            console.log(`📈 Calculated ${results.length} data points`);

            if (results.length === 0) {
                console.log(`❌ No data points calculated for ${config.seriesName}. Skipping...`);
                continue;
            }

            // Show date range
            const firstDate = new Date(results[0].date).toISOString().split('T')[0];
            const lastDate = new Date(results[results.length - 1].date).toISOString().split('T')[0];
            console.log(`   Date range: ${firstDate} to ${lastDate}`);
            console.log(`   Latest value: ${results[results.length - 1].real_yield.toFixed(2)}%\n`);

            // Insert into time_series
            const insert = db.prepare(`
                INSERT INTO time_series (date, asset_class, series_name, column_name, value)
                VALUES (?, 'derived', ?, 'Value', ?)
            `);

            const insertMany = db.transaction((data: Array<{ date: number; real_yield: number }>, seriesName: string) => {
                for (const row of data) {
                    insert.run(row.date, seriesName, row.real_yield);
                }
            });

            insertMany(results, config.seriesName);
            console.log(`✅ Inserted ${results.length} records into time_series\n`);

            // Add or update metadata
            const metadataExists = db.prepare(`
                SELECT COUNT(*) as count 
                FROM series_metadata 
                WHERE asset_class = 'derived' AND series_name = ?
            `).get(config.seriesName) as { count: number };

            if (metadataExists.count > 0) {
                db.prepare(`
                    UPDATE series_metadata 
                    SET display_name = ?,
                        description = ?,
                        units = 'percent',
                        source = ?,
                        last_updated = ?
                    WHERE asset_class = 'derived' AND series_name = ?
                `).run(
                    config.displayName,
                    config.description,
                    `Calculated from ${config.sourceSeriesName} and CPI`,
                    Date.now(),
                    config.seriesName
                );
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
                    config.seriesName,
                    config.displayName,
                    config.description,
                    'percent',
                    `Calculated from ${config.sourceSeriesName} and CPI`,
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
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All Real Yield series created successfully!');
        console.log('='.repeat(60));
        console.log('\n💡 Next steps:');
        console.log('   1. Run: npx tsx scripts/create-derived-percentiles.ts');
        console.log('   2. Real yields will now appear in the yield chart dropdown');

    } catch (error) {
        console.error('❌ Error creating Real Yield series:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
createRealYields();
