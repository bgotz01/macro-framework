import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface TimeSeriesRow {
    date: number;
    value: number;
}

interface SeriesConfig {
    asset_class: string;
    series_name: string;
    column_name: string;
}

function calculateRollingAverage(data: TimeSeriesRow[], window: number): Map<number, number> {
    const result = new Map<number, number>();

    // Sort by date ascending
    const sorted = [...data].sort((a, b) => a.date - b.date);

    for (let i = 0; i < sorted.length; i++) {
        // Need at least 'window' data points for a valid average
        if (i >= window - 1) {
            const windowData = sorted.slice(i - window + 1, i + 1);
            const sum = windowData.reduce((acc, row) => acc + row.value, 0);
            const avg = sum / window;
            result.set(sorted[i].date, avg);
        }
    }

    return result;
}

function addRollingAverageForSeries(db: Database.Database, config: SeriesConfig, window: number) {
    console.log(`\nProcessing ${config.series_name}...`);

    // Fetch all data for this series
    const stmt = db.prepare(`
    SELECT date, value 
    FROM time_series 
    WHERE asset_class = ? 
      AND series_name = ? 
      AND column_name = ?
      AND value IS NOT NULL
    ORDER BY date ASC
  `);

    const data = stmt.all(
        config.asset_class,
        config.series_name,
        config.column_name
    ) as TimeSeriesRow[];

    console.log(`  Found ${data.length} data points`);

    if (data.length < window) {
        console.log(`  ⚠️  Not enough data points for ${window}-period average (need at least ${window})`);
        return;
    }

    // Calculate rolling averages
    const rollingAverages = calculateRollingAverage(data, window);
    console.log(`  Calculated ${rollingAverages.size} rolling averages`);

    // Prepare insert statement
    const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
    VALUES (?, ?, ?, ?, ?)
  `);

    const newColumnName = `${config.column_name}_MA${window}`;

    // Insert rolling averages
    const insert = db.transaction(() => {
        let count = 0;
        for (const [date, avg] of rollingAverages) {
            insertStmt.run(
                date,
                config.asset_class,
                config.series_name,
                newColumnName,
                avg
            );
            count++;
        }
        return count;
    });

    const inserted = insert();
    console.log(`  ✓ Inserted ${inserted} rolling average values as '${newColumnName}'`);
}

function main() {
    const db = new Database(DB_PATH);

    console.log('Starting rolling average calculation for DAILY data...\n');
    console.log('Database:', DB_PATH);
    console.log('Window: 252 trading days (≈ 1 year)\n');

    // Configuration for daily series
    // 252 trading days = approximately 1 year
    const WINDOW = 252;

    const seriesConfigs: SeriesConfig[] = [
        // BONDS
        { asset_class: 'bonds', series_name: 'US/FVX', column_name: 'Value' },
        { asset_class: 'bonds', series_name: 'US/IRX', column_name: 'Value' },
        { asset_class: 'bonds', series_name: 'US/TNX', column_name: 'Value' },
        { asset_class: 'bonds', series_name: 'US/TYX', column_name: 'Value' },
        { asset_class: 'bonds', series_name: 'US/US-2yr', column_name: 'Value' },
        { asset_class: 'bonds', series_name: 'US/US-BankRate', column_name: 'Value' },

        // COMMODITIES
        { asset_class: 'commodities', series_name: 'CL=F', column_name: 'Value' },
        { asset_class: 'commodities', series_name: 'GC=F', column_name: 'Value' },
        { asset_class: 'commodities', series_name: 'SI=F', column_name: 'Value' },

        // CRYPTO
        { asset_class: 'crypto', series_name: 'BTCUSD', column_name: 'Value' },
        { asset_class: 'crypto', series_name: 'ETHUSD', column_name: 'Value' },

        // EQUITIES
        { asset_class: 'equities', series_name: 'DJI', column_name: 'Value' },
        { asset_class: 'equities', series_name: 'FTSE', column_name: 'Value' },
        { asset_class: 'equities', series_name: 'GDAXI', column_name: 'Value' },
        { asset_class: 'equities', series_name: 'HSI', column_name: 'Value' },
        { asset_class: 'equities', series_name: 'N225', column_name: 'Value' },
        { asset_class: 'equities', series_name: 'US/DJI', column_name: 'Value' },
        { asset_class: 'equities', series_name: 'US/GSPC', column_name: 'Value' },
        { asset_class: 'equities', series_name: 'US/IXIC', column_name: 'Value' },
        { asset_class: 'equities', series_name: 'US/RUT', column_name: 'Value' },

        // FX
        { asset_class: 'fx', series_name: 'EURUSD', column_name: 'Value' },
        { asset_class: 'fx', series_name: 'GBPUSD', column_name: 'Value' },
        { asset_class: 'fx', series_name: 'USDJPY', column_name: 'Value' },

        // VOLATILITY
        { asset_class: 'volatility', series_name: 'VIX', column_name: 'Value' },
    ];

    console.log(`Processing ${seriesConfigs.length} daily series...\n`);
    console.log('═'.repeat(60));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each series
    for (const config of seriesConfigs) {
        try {
            const beforeCount = db.prepare(
                'SELECT COUNT(*) as count FROM time_series WHERE asset_class = ? AND series_name = ? AND column_name LIKE ?'
            ).get(config.asset_class, config.series_name, '%_MA%') as { count: number };

            addRollingAverageForSeries(db, config, WINDOW);

            const afterCount = db.prepare(
                'SELECT COUNT(*) as count FROM time_series WHERE asset_class = ? AND series_name = ? AND column_name LIKE ?'
            ).get(config.asset_class, config.series_name, '%_MA%') as { count: number };

            if (afterCount.count > beforeCount.count) {
                successCount++;
            } else {
                skipCount++;
            }
        } catch (error) {
            console.error(`  ✗ Error processing ${config.series_name}:`, error);
            errorCount++;
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`  ✓ Successfully processed: ${successCount}`);
    console.log(`  ⚠️  Skipped (insufficient data): ${skipCount}`);
    console.log(`  ✗ Errors: ${errorCount}`);
    console.log(`  📈 Total series: ${seriesConfigs.length}`);

    console.log('\n✓ Done!');
    db.close();
}

main();
