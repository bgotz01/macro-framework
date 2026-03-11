import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface TimeSeriesRow {
    date: string;  // ISO date string
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
    frequency: 'daily' | 'monthly'
): {
    returns2Y: Map<string, number>;
    returns5Y: Map<string, number>;
    returns10Y: Map<string, number>;
} {
    const returns2Y = new Map<string, number>();
    const returns5Y = new Map<string, number>();
    const returns10Y = new Map<string, number>();

    // Sort by date ascending
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

    // Calculate periods based on frequency
    const periodsPerYear = frequency === 'daily' ? 252 : 12;
    const periods2Y = periodsPerYear * 2;
    const periods5Y = periodsPerYear * 5;
    const periods10Y = periodsPerYear * 10;

    for (let i = 0; i < sorted.length; i++) {
        const currentValue = sorted[i].value;
        const currentDate = sorted[i].date;

        // 2-year return
        if (i >= periods2Y) {
            const pastValue = sorted[i - periods2Y].value;
            if (pastValue !== 0) {
                const returnPct = ((currentValue - pastValue) / pastValue) * 100;
                returns2Y.set(currentDate, returnPct);
            }
        }

        // 5-year return
        if (i >= periods5Y) {
            const pastValue = sorted[i - periods5Y].value;
            if (pastValue !== 0) {
                const returnPct = ((currentValue - pastValue) / pastValue) * 100;
                returns5Y.set(currentDate, returnPct);
            }
        }

        // 10-year return
        if (i >= periods10Y) {
            const pastValue = sorted[i - periods10Y].value;
            if (pastValue !== 0) {
                const returnPct = ((currentValue - pastValue) / pastValue) * 100;
                returns10Y.set(currentDate, returnPct);
            }
        }
    }

    return { returns2Y, returns5Y, returns10Y };
}

function addCyclicalReturnsForSeries(db: Database.Database, config: SeriesConfig) {
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

    const periodsPerYear = config.frequency === 'daily' ? 252 : 12;
    const minDataPoints = periodsPerYear * 10; // Need at least 10 years for 10Y returns

    if (data.length < minDataPoints) {
        console.log(`  ⚠️  Not enough data points for 10-year returns (need ${minDataPoints}, have ${data.length})`);
        return;
    }

    // Calculate cyclical returns
    const { returns2Y, returns5Y, returns10Y } = calculateCyclicalReturns(data, config.frequency);
    console.log(`  Calculated returns: 2Y=${returns2Y.size}, 5Y=${returns5Y.size}, 10Y=${returns10Y.size}`);

    // Prepare insert statement
    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, ?, ?)
    `);

    // Insert returns
    const insert = db.transaction(() => {
        let count = 0;

        // Insert 2-year returns
        for (const [date, returnPct] of returns2Y) {
            insertStmt.run(
                date,
                config.asset_class,
                config.series_name,
                `${config.column_name}_Return2Y`,
                returnPct
            );
            count++;
        }

        // Insert 5-year returns
        for (const [date, returnPct] of returns5Y) {
            insertStmt.run(
                date,
                config.asset_class,
                config.series_name,
                `${config.column_name}_Return5Y`,
                returnPct
            );
            count++;
        }

        // Insert 10-year returns
        for (const [date, returnPct] of returns10Y) {
            insertStmt.run(
                date,
                config.asset_class,
                config.series_name,
                `${config.column_name}_Return10Y`,
                returnPct
            );
            count++;
        }

        return count;
    });

    const inserted = insert();
    console.log(`  ✓ Inserted ${inserted} cyclical return values`);
}

function main() {
    const db = new Database(DB_PATH);

    console.log('Starting cyclical returns calculation...\n');
    console.log('Database:', DB_PATH);

    // Get all series from equities, commodities, crypto, and volatility
    const assetClasses = ['equities', 'commodities', 'crypto', 'volatility'];

    const seriesStmt = db.prepare(`
        SELECT DISTINCT asset_class, series_name, column_name
        FROM time_series
        WHERE asset_class IN (${assetClasses.map(() => '?').join(',')})
          AND column_name = 'Value'
        ORDER BY asset_class, series_name
    `);

    const allSeries = seriesStmt.all(...assetClasses) as Array<{
        asset_class: string;
        series_name: string;
        column_name: string;
    }>;

    console.log(`Found ${allSeries.length} series to process (all daily frequency)\n`);

    // All these asset classes use daily data
    const seriesConfigs: SeriesConfig[] = allSeries.map(series => ({
        asset_class: series.asset_class,
        series_name: series.series_name,
        column_name: series.column_name,
        frequency: 'daily' as const
    }));

    // Process each series
    for (const config of seriesConfigs) {
        try {
            addCyclicalReturnsForSeries(db, config);
        } catch (error) {
            console.error(`  ✗ Error processing ${config.series_name}:`, error);
        }
    }

    console.log('\n✓ Done!');
    db.close();
}

main();
