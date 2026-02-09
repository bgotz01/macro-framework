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
    frequency: 'daily' | 'monthly';
    window: number; // number of periods for 1 year
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

function addRollingAverageForSeries(db: Database.Database, config: SeriesConfig) {
    console.log(`\nProcessing ${config.series_name} (${config.frequency})...`);

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

    if (data.length < config.window) {
        console.log(`  ⚠️  Not enough data points for ${config.window}-period average`);
        return;
    }

    // Calculate rolling averages
    const rollingAverages = calculateRollingAverage(data, config.window);
    console.log(`  Calculated ${rollingAverages.size} rolling averages`);

    // Prepare insert statement
    const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
    VALUES (?, ?, ?, ?, ?)
  `);

    const newColumnName = `${config.column_name}_MA${config.window}`;

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

    console.log('Starting rolling average calculation...\n');
    console.log('Database:', DB_PATH);

    // Configuration for series to process
    // Add more series here as needed
    const seriesConfigs: SeriesConfig[] = [
        // Monthly data (12 months = 1 year)
        {
            asset_class: 'economic',
            series_name: 'CPI',
            column_name: 'Value',
            frequency: 'monthly',
            window: 12
        },
        {
            asset_class: 'economic',
            series_name: 'CPINominal',
            column_name: 'Value',
            frequency: 'monthly',
            window: 12
        },
        {
            asset_class: 'economic',
            series_name: 'Shiller-PE',
            column_name: 'Value',
            frequency: 'monthly',
            window: 12
        },
        {
            asset_class: 'economic',
            series_name: 'Earnings-Yield',
            column_name: 'Value',
            frequency: 'monthly',
            window: 12
        },
        {
            asset_class: 'economic',
            series_name: 'US/FEDFUNDS',
            column_name: 'Value',
            frequency: 'monthly',
            window: 12
        },
    ];

    // Process each series
    for (const config of seriesConfigs) {
        try {
            addRollingAverageForSeries(db, config);
        } catch (error) {
            console.error(`  ✗ Error processing ${config.series_name}:`, error);
        }
    }

    console.log('\n✓ Done!');
    db.close();
}

main();
