#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface TimeSeriesRow {
    date: number;
    value: number;
}

function calculateRollingAverage(data: TimeSeriesRow[], window: number): Map<number, number> {
    const result = new Map<number, number>();
    const sorted = [...data].sort((a, b) => a.date - b.date);

    for (let i = 0; i < sorted.length; i++) {
        if (i >= window - 1) {
            const windowData = sorted.slice(i - window + 1, i + 1);
            const sum = windowData.reduce((acc, row) => acc + row.value, 0);
            const avg = sum / window;
            result.set(sorted[i].date, avg);
        }
    }

    return result;
}

function addRollingAverageForSeries(
    db: Database.Database,
    assetClass: string,
    seriesName: string,
    window: number
) {
    console.log(`\nProcessing ${seriesName} (quarterly, ${window}-period MA)...`);

    const stmt = db.prepare(`
        SELECT date, value 
        FROM time_series 
        WHERE asset_class = ? 
          AND series_name = ? 
          AND column_name = 'Value'
          AND value IS NOT NULL
        ORDER BY date ASC
    `);

    const data = stmt.all(assetClass, seriesName) as TimeSeriesRow[];
    console.log(`  Found ${data.length} data points`);

    if (data.length < window) {
        console.log(`  ⚠️  Not enough data points for ${window}-period average`);
        return;
    }

    const rollingAverages = calculateRollingAverage(data, window);
    console.log(`  Calculated ${rollingAverages.size} rolling averages`);

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
        VALUES (?, ?, ?, ?, ?)
    `);

    const newColumnName = `Value_MA${window}`;

    const insert = db.transaction(() => {
        let count = 0;
        for (const [date, avg] of rollingAverages) {
            insertStmt.run(date, assetClass, seriesName, newColumnName, avg);
            count++;
        }
        return count;
    });

    const inserted = insert();
    console.log(`  ✓ Inserted ${inserted} rolling average values as '${newColumnName}'`);
}

function main() {
    const db = new Database(DB_PATH);

    console.log('🔄 Adding rolling averages for quarterly economic data...\n');

    // Quarterly series - 4 quarters = 1 year
    const quarterlySeries = [
        'GFDEBTN',
        'GFDEGDQ188S',
        'GDP',
        'CMDEBT',
        'BCNSDODNS',
        'A091RC1Q027SBEA',
        'DPI'
    ];

    for (const series of quarterlySeries) {
        addRollingAverageForSeries(db, 'economic', series, 4);
    }

    db.close();

    console.log('\n' + '━'.repeat(50));
    console.log('✅ Rolling averages calculation complete!');
    console.log('━'.repeat(50));
}

main();
