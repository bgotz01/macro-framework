import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

interface MADataPoint {
    date: string;
    value: number;
}

function calculateMASlope(maPeriod: string) {
    console.log(`\nCalculating slope for ${maPeriod}-day MA...`);

    const slopeSeriesName = `SP500-${maPeriod}MA-Slope`;
    const maSeriesName = `SP500-MA${maPeriod}`;
    const assetClass = 'derived';

    // Find the latest date already computed
    const latestRow = db.prepare(`
        SELECT MAX(date) as max_date FROM time_series
        WHERE asset_class = ? AND series_name = ?
    `).get(assetClass, slopeSeriesName) as { max_date: string | null };

    const latestComputed = latestRow?.max_date;

    // We need the previous day's MA value to compute slope for the first new day,
    // so fetch one row before the cutoff
    let maData: MADataPoint[];
    if (latestComputed) {
        maData = db.prepare(`
            SELECT date, value
            FROM time_series
            WHERE asset_class = 'derived' AND series_name = ? AND date >= ?
            ORDER BY date ASC
        `).all(maSeriesName, latestComputed) as MADataPoint[];
        console.log(`  Incremental: processing from ${latestComputed} (${maData.length} MA points loaded)`);
    } else {
        maData = db.prepare(`
            SELECT date, value
            FROM time_series
            WHERE asset_class = 'derived' AND series_name = ?
            ORDER BY date ASC
        `).all(maSeriesName) as MADataPoint[];
        console.log(`  Full run: ${maData.length} MA points loaded`);
    }

    if (maData.length < 2) {
        console.log('  ✓ Already up to date (or not enough data)');
        return;
    }

    // Calculate daily percentage change (slope) — skip index 0 since we need a previous value
    // When incremental, index 0 is the latestComputed date (already saved), so we start from 1
    const slopeData: Array<{ date: string; slope: number }> = [];
    const startIdx = latestComputed ? 1 : 1; // always start from 1

    for (let i = startIdx; i < maData.length; i++) {
        const currentMA = maData[i].value;
        const previousMA = maData[i - 1].value;
        const slope = ((currentMA - previousMA) / previousMA) * 100;

        // Only insert rows that are actually new
        if (!latestComputed || maData[i].date > latestComputed) {
            slopeData.push({ date: maData[i].date, slope });
        }
    }

    if (slopeData.length === 0) {
        console.log('  ✓ Already up to date');
        return;
    }

    console.log(`  Calculated ${slopeData.length} new slope values`);

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO time_series (asset_class, series_name, date, column_name, value)
        VALUES (?, ?, ?, 'value', ?)
    `);

    db.transaction((data: typeof slopeData) => {
        for (const point of data) {
            insertStmt.run(assetClass, slopeSeriesName, point.date, point.slope);
        }
    })(slopeData);

    db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, description)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        assetClass,
        slopeSeriesName,
        `S&P 500 ${maPeriod}-Day MA Slope`,
        '%',
        `Daily percentage change in the ${maPeriod}-day moving average of S&P 500`
    );

    console.log(`  ✓ Inserted ${slopeData.length} slope values`);
}

console.log('Starting incremental MA slope calculation...');

try {
    calculateMASlope('50');
    calculateMASlope('200');
    calculateMASlope('500');
    console.log('\n✅ All MA slopes calculated successfully!');
} catch (error) {
    console.error('Error calculating MA slopes:', error);
    throw error;
} finally {
    db.close();
}
