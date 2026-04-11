import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface TimeSeriesRow {
    date: string;
    value: number;
}

interface SeriesConfig {
    asset_class: string;
    series_name: string;
    column_name: string;
    frequency: 'daily' | 'monthly';
}

function calculateCyclicalReturns(
    data: TimeSeriesRow[],
    frequency: 'daily' | 'monthly',
    fromIndex: number
): {
    returns2Y: Map<string, number>;
    returns5Y: Map<string, number>;
    returns10Y: Map<string, number>;
} {
    const returns2Y = new Map<string, number>();
    const returns5Y = new Map<string, number>();
    const returns10Y = new Map<string, number>();

    const periodsPerYear = frequency === 'daily' ? 252 : 12;
    const periods2Y = periodsPerYear * 2;
    const periods5Y = periodsPerYear * 5;
    const periods10Y = periodsPerYear * 10;

    // Only iterate from fromIndex onwards (new data), but we need full array for lookbacks
    for (let i = fromIndex; i < data.length; i++) {
        const currentValue = data[i].value;
        const currentDate = data[i].date;

        if (i >= periods2Y) {
            const pastValue = data[i - periods2Y].value;
            if (pastValue !== 0) {
                returns2Y.set(currentDate, ((currentValue - pastValue) / pastValue) * 100);
            }
        }

        if (i >= periods5Y) {
            const pastValue = data[i - periods5Y].value;
            if (pastValue !== 0) {
                returns5Y.set(currentDate, ((currentValue - pastValue) / pastValue) * 100);
            }
        }

        if (i >= periods10Y) {
            const pastValue = data[i - periods10Y].value;
            if (pastValue !== 0) {
                returns10Y.set(currentDate, ((currentValue - pastValue) / pastValue) * 100);
            }
        }
    }

    return { returns2Y, returns5Y, returns10Y };
}

function addCyclicalReturnsForSeries(db: Database.Database, config: SeriesConfig) {
    console.log(`\nProcessing ${config.series_name} (${config.frequency})...`);

    // Find the latest date already computed for this series
    const latestComputed = (db.prepare(`
        SELECT MAX(date) as max_date FROM time_series
        WHERE asset_class = ? AND series_name = ? AND column_name = ?
    `).get(config.asset_class, config.series_name, `${config.column_name}_Return2Y`) as { max_date: string | null }).max_date;

    // Fetch all source data (need full history for lookback windows)
    const data = db.prepare(`
        SELECT date, value 
        FROM time_series 
        WHERE asset_class = ? AND series_name = ? AND column_name = ?
          AND value IS NOT NULL
        ORDER BY date ASC
    `).all(config.asset_class, config.series_name, config.column_name) as TimeSeriesRow[];

    console.log(`  Found ${data.length} data points`);

    const periodsPerYear = config.frequency === 'daily' ? 252 : 12;
    if (data.length < periodsPerYear * 10) {
        console.log(`  ⚠️  Not enough data for 10Y returns`);
        return;
    }

    // Find the index where new data starts
    let fromIndex = 0;
    if (latestComputed) {
        const idx = data.findIndex(d => d.date > latestComputed);
        if (idx === -1) {
            console.log(`  ✓ Already up to date`);
            return;
        }
        fromIndex = idx;
        console.log(`  Incremental: processing ${data.length - fromIndex} new rows since ${latestComputed}`);
    } else {
        console.log(`  Full run: no existing data`);
    }

    const { returns2Y, returns5Y, returns10Y } = calculateCyclicalReturns(data, config.frequency, fromIndex);

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, ?, ?)
    `);

    const inserted = db.transaction(() => {
        let count = 0;
        for (const [date, val] of returns2Y) {
            insertStmt.run(date, config.asset_class, config.series_name, `${config.column_name}_Return2Y`, val);
            count++;
        }
        for (const [date, val] of returns5Y) {
            insertStmt.run(date, config.asset_class, config.series_name, `${config.column_name}_Return5Y`, val);
            count++;
        }
        for (const [date, val] of returns10Y) {
            insertStmt.run(date, config.asset_class, config.series_name, `${config.column_name}_Return10Y`, val);
            count++;
        }
        return count;
    })();

    console.log(`  ✓ Inserted ${inserted} cyclical return values`);
}

function main() {
    const db = new Database(DB_PATH);
    console.log('Starting incremental cyclical returns calculation...\n');

    const assetClasses = ['equities', 'commodities', 'crypto', 'volatility'];

    const allSeries = db.prepare(`
        SELECT DISTINCT asset_class, series_name, column_name
        FROM time_series
        WHERE asset_class IN (${assetClasses.map(() => '?').join(',')})
          AND column_name = 'Value'
        ORDER BY asset_class, series_name
    `).all(...assetClasses) as Array<{ asset_class: string; series_name: string; column_name: string }>;

    console.log(`Found ${allSeries.length} series to process\n`);

    for (const series of allSeries) {
        try {
            addCyclicalReturnsForSeries(db, { ...series, frequency: 'daily' });
        } catch (error) {
            console.error(`  ✗ Error processing ${series.series_name}:`, error);
        }
    }

    console.log('\n✓ Done!');
    db.close();
}

main();
