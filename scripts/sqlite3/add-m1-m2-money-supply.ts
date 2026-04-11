import Database from 'better-sqlite3';
import path from 'path';

interface DataPoint {
    date: string;
    value: number;
}

function calculateYoYGrowth(data: DataPoint[]): DataPoint[] {
    const result: DataPoint[] = [];
    data.sort((a, b) => a.date.localeCompare(b.date));

    for (let i = 12; i < data.length; i++) {
        const current = data[i];
        const yearAgo = data[i - 12];

        if (current.value && yearAgo.value && yearAgo.value !== 0) {
            const yoyGrowth = ((current.value - yearAgo.value) / yearAgo.value) * 100;
            result.push({ date: current.date, value: yoyGrowth });
        }
    }

    return result;
}

function processMoneySupply(db: Database.Database, seriesName: string, displayName: string) {
    console.log(`\nProcessing ${displayName}...`);

    const data = db.prepare(`
        SELECT date, value FROM time_series WHERE series_name = ? ORDER BY date ASC
    `).all(seriesName) as Array<{ date: string; value: number }>;

    if (data.length === 0) {
        console.log(`  No ${seriesName} data found`);
        return;
    }

    console.log(`  Found ${data.length} records`);

    const yoyData = calculateYoYGrowth(data);
    console.log(`  Calculated ${yoyData.length} YoY growth points`);

    const yoySeriesName = `${seriesName.replace('SL', '')}-YoY`;

    db.prepare(`DELETE FROM time_series WHERE series_name = ?`).run(yoySeriesName);

    const insert = db.prepare(`
        INSERT INTO time_series (asset_class, series_name, column_name, date, value)
        VALUES ('economic', ?, 'Value', ?, ?)
    `);

    const insertMany = db.transaction((dataPoints: DataPoint[]) => {
        for (const point of dataPoints) {
            insert.run(yoySeriesName, point.date, point.value);
        }
    });

    insertMany(yoyData);
    console.log(`  Inserted ${yoyData.length} time_series records`);

    db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, last_updated)
        VALUES ('economic', ?, ?, '%', ?)
    `).run(yoySeriesName, `${displayName} YoY Growth`, Date.now());

    db.prepare(`DELETE FROM percentile_analysis WHERE series_name = ?`).run(yoySeriesName);

    const percentileQuery = `
        WITH ranked_data AS (
            SELECT date, asset_class, series_name, column_name, value,
                (SELECT COUNT(*) FROM time_series t2
                 WHERE t2.series_name = t1.series_name AND t2.date <= t1.date AND t2.value < t1.value) as rank_below,
                (SELECT COUNT(*) FROM time_series t2
                 WHERE t2.series_name = t1.series_name AND t2.date <= t1.date) as total_count
            FROM time_series t1
            WHERE t1.series_name = ? AND t1.value IS NOT NULL
        )
        SELECT date, asset_class, series_name, column_name, value,
               ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
        FROM ranked_data ORDER BY date
    `;

    const percentileResults = db.prepare(percentileQuery).all(yoySeriesName) as any[];
    console.log(`  Calculated ${percentileResults.length} percentiles`);

    const insertPercentile = db.prepare(`
        INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertPercentileMany = db.transaction((data: any[]) => {
        for (const row of data) {
            insertPercentile.run(row.date, row.asset_class, row.series_name, row.column_name, row.value, row.percentile_rank);
        }
    });

    insertPercentileMany(percentileResults);
    console.log(`  Inserted ${percentileResults.length} percentile_analysis records`);

    const records = db.prepare(`
        SELECT id, date, percentile_rank FROM percentile_analysis WHERE series_name = ? ORDER BY date ASC
    `).all(yoySeriesName) as Array<{ id: number; date: string; percentile_rank: number }>;

    const updateStmt = db.prepare(`UPDATE percentile_analysis SET yoy_percentile_change = ? WHERE id = ?`);
    const updates: Array<{ id: number; change: number }> = [];

    for (let i = 12; i < records.length; i++) {
        const current = records[i];
        const yearAgo = records[i - 12];
        if (current.percentile_rank !== null && yearAgo.percentile_rank !== null) {
            updates.push({ id: current.id, change: current.percentile_rank - yearAgo.percentile_rank });
        }
    }

    const updateMany = db.transaction((updates: Array<{ id: number; change: number }>) => {
        for (const update of updates) {
            updateStmt.run(update.change, update.id);
        }
    });

    updateMany(updates);
    console.log(`  Updated ${updates.length} YoY percentile changes`);

    const latest = db.prepare(`
        SELECT date, value, percentile_rank FROM percentile_analysis WHERE series_name = ? ORDER BY date DESC LIMIT 3
    `).all(yoySeriesName) as any[];

    console.log(`  Latest values:`);
    latest.reverse().forEach(row => {
        console.log(`    ${row.date}: ${row.value?.toFixed(2)}% (${row.percentile_rank}th percentile)`);
    });
}

function calculateRealM2(db: Database.Database) {
    console.log('\nCalculating Real M2 YoY (M2 YoY - CPI)...');

    // Get M2 YoY and CPI data, join by date
    const query = `
        SELECT 
            m2.date,
            m2.value as m2_yoy,
            cpi.value as cpi_value
        FROM time_series m2
        INNER JOIN time_series cpi ON m2.date = cpi.date
        WHERE m2.series_name = 'M2-YoY'
          AND m2.column_name = 'Value'
          AND cpi.series_name = 'CPI'
          AND cpi.column_name = 'Value'
          AND m2.value IS NOT NULL
          AND cpi.value IS NOT NULL
        ORDER BY m2.date ASC
    `;

    const data = db.prepare(query).all() as Array<{ date: string; m2_yoy: number; cpi_value: number }>;
    console.log(`  Found ${data.length} matching records`);

    if (data.length === 0) {
        console.log('  ⚠️  No matching M2 and CPI data found');
        return;
    }

    // Calculate Real M2 YoY = M2 YoY - CPI
    const realM2Data = data.map(row => ({
        date: row.date,
        value: row.m2_yoy - row.cpi_value
    }));

    const seriesName = 'Real-M2-YoY';

    // Delete existing data
    db.prepare(`DELETE FROM time_series WHERE series_name = ?`).run(seriesName);

    // Insert Real M2 YoY data
    const insert = db.prepare(`
        INSERT INTO time_series (asset_class, series_name, column_name, date, value)
        VALUES ('economic', ?, 'Value', ?, ?)
    `);

    const insertMany = db.transaction((dataPoints: Array<{ date: string; value: number }>) => {
        for (const point of dataPoints) {
            insert.run(seriesName, point.date, point.value);
        }
    });

    insertMany(realM2Data);
    console.log(`  Inserted ${realM2Data.length} time_series records`);

    // Add metadata
    db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, last_updated)
        VALUES ('economic', ?, 'Real M2 YoY Growth (M2 YoY - CPI)', '%', ?)
    `).run(seriesName, Date.now());

    // Delete existing percentiles
    db.prepare(`DELETE FROM percentile_analysis WHERE series_name = ?`).run(seriesName);

    // Calculate percentiles
    const percentileQuery = `
        WITH ranked_data AS (
            SELECT date, asset_class, series_name, column_name, value,
                (SELECT COUNT(*) FROM time_series t2
                 WHERE t2.series_name = t1.series_name AND t2.date <= t1.date AND t2.value < t1.value) as rank_below,
                (SELECT COUNT(*) FROM time_series t2
                 WHERE t2.series_name = t1.series_name AND t2.date <= t1.date) as total_count
            FROM time_series t1
            WHERE t1.series_name = ? AND t1.value IS NOT NULL
        )
        SELECT date, asset_class, series_name, column_name, value,
               ROUND((CAST(rank_below AS REAL) / CAST(total_count AS REAL)) * 100, 2) as percentile_rank
        FROM ranked_data ORDER BY date
    `;

    const percentileResults = db.prepare(percentileQuery).all(seriesName) as any[];
    console.log(`  Calculated ${percentileResults.length} percentiles`);

    const insertPercentile = db.prepare(`
        INSERT INTO percentile_analysis (date, asset_class, series_name, column_name, value, percentile_rank)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertPercentileMany = db.transaction((data: any[]) => {
        for (const row of data) {
            insertPercentile.run(row.date, row.asset_class, row.series_name, row.column_name, row.value, row.percentile_rank);
        }
    });

    insertPercentileMany(percentileResults);
    console.log(`  Inserted ${percentileResults.length} percentile_analysis records`);

    // Calculate YoY percentile changes
    const records = db.prepare(`
        SELECT id, date, percentile_rank FROM percentile_analysis WHERE series_name = ? ORDER BY date ASC
    `).all(seriesName) as Array<{ id: number; date: string; percentile_rank: number }>;

    const updateStmt = db.prepare(`UPDATE percentile_analysis SET yoy_percentile_change = ? WHERE id = ?`);
    const updates: Array<{ id: number; change: number }> = [];

    for (let i = 12; i < records.length; i++) {
        const current = records[i];
        const yearAgo = records[i - 12];
        if (current.percentile_rank !== null && yearAgo.percentile_rank !== null) {
            updates.push({ id: current.id, change: current.percentile_rank - yearAgo.percentile_rank });
        }
    }

    const updateMany = db.transaction((updates: Array<{ id: number; change: number }>) => {
        for (const update of updates) {
            updateStmt.run(update.change, update.id);
        }
    });

    updateMany(updates);
    console.log(`  Updated ${updates.length} YoY percentile changes`);

    // Show latest values
    const latest = db.prepare(`
        SELECT date, value, percentile_rank FROM percentile_analysis WHERE series_name = ? ORDER BY date DESC LIMIT 3
    `).all(seriesName) as any[];

    console.log(`  Latest values:`);
    latest.reverse().forEach(row => {
        console.log(`    ${row.date}: ${row.value?.toFixed(2)}% (${row.percentile_rank}th percentile)`);
    });
}

async function addMoneySupplyData() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('💰 Adding M1 and M2 YoY Growth Data...');
        processMoneySupply(db, 'M1SL', 'M1 Money Supply');
        processMoneySupply(db, 'M2SL', 'M2 Money Supply');
        calculateRealM2(db);
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        db.close();
    }
}

addMoneySupplyData().catch(console.error);
