import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

interface DataPoint {
    date: string;
    value: number;
}

function calculateMAStreaks(maPeriod: string) {
    console.log(`\nCalculating streaks for ${maPeriod}-day MA...`);

    const slopeStreakSeriesName = `SP500-${maPeriod}MA-SlopeStreak`;
    const priceAboveStreakSeriesName = `SP500-${maPeriod}MA-PriceAboveStreak`;
    const slopeSeriesName = `SP500-${maPeriod}MA-Slope`;
    const maSeriesName = `SP500-MA${maPeriod}`;
    const assetClass = 'derived';

    // Find the latest date already computed
    const latestRow = db.prepare(`
        SELECT MAX(date) as max_date FROM time_series
        WHERE asset_class = ? AND series_name = ?
    `).get(assetClass, slopeStreakSeriesName) as { max_date: string | null };

    const latestComputed = latestRow?.max_date;

    // Load the last streak values to continue counting
    let currentSlopeStreak = 0;
    let currentPriceAboveStreak = 0;

    if (latestComputed) {
        const lastSlopeStreak = db.prepare(`
            SELECT value FROM time_series
            WHERE asset_class = ? AND series_name = ? AND date = ?
        `).get(assetClass, slopeStreakSeriesName, latestComputed) as { value: number } | undefined;

        const lastPriceStreak = db.prepare(`
            SELECT value FROM time_series
            WHERE asset_class = ? AND series_name = ? AND date = ?
        `).get(assetClass, priceAboveStreakSeriesName, latestComputed) as { value: number } | undefined;

        currentSlopeStreak = lastSlopeStreak?.value ?? 0;
        currentPriceAboveStreak = lastPriceStreak?.value ?? 0;

        console.log(`  Incremental: resuming from ${latestComputed} (slopeStreak=${currentSlopeStreak}, priceStreak=${currentPriceAboveStreak})`);
    } else {
        console.log('  Full run: no existing data');
    }

    // Load only new data (dates after latestComputed)
    const dateFilter = latestComputed ? 'AND p.date > ?' : '';
    const params: string[] = [maSeriesName, slopeSeriesName];
    if (latestComputed) params.push(latestComputed);

    const rows = db.prepare(`
        SELECT p.date, p.value as price, ma.value as ma, sl.value as slope
        FROM time_series p
        JOIN time_series ma ON p.date = ma.date AND ma.asset_class = 'derived' AND ma.series_name = ?
        JOIN time_series sl ON p.date = sl.date AND sl.asset_class = 'derived' AND sl.series_name = ?
        WHERE p.asset_class = 'equities' AND p.series_name = 'US/GSPC' AND p.column_name = 'Value'
        ${dateFilter}
        ORDER BY p.date ASC
    `).all(...params) as Array<{ date: string; price: number; ma: number; slope: number }>;

    if (rows.length === 0) {
        console.log('  ✓ Already up to date');
        return;
    }

    console.log(`  Processing ${rows.length} new dates`);

    const streakData: Array<{ date: string; slopeStreak: number; priceAboveStreak: number }> = [];

    for (const row of rows) {
        // Slope streak
        if (row.slope > 0) {
            currentSlopeStreak = currentSlopeStreak >= 0 ? currentSlopeStreak + 1 : 1;
        } else if (row.slope < 0) {
            currentSlopeStreak = currentSlopeStreak <= 0 ? currentSlopeStreak - 1 : -1;
        }

        // Price above MA streak
        if (row.price > row.ma) {
            currentPriceAboveStreak = currentPriceAboveStreak >= 0 ? currentPriceAboveStreak + 1 : 1;
        } else if (row.price < row.ma) {
            currentPriceAboveStreak = currentPriceAboveStreak <= 0 ? currentPriceAboveStreak - 1 : -1;
        }

        streakData.push({ date: row.date, slopeStreak: currentSlopeStreak, priceAboveStreak: currentPriceAboveStreak });
    }

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO time_series (asset_class, series_name, date, column_name, value)
        VALUES (?, ?, ?, 'value', ?)
    `);

    db.transaction(() => {
        for (const point of streakData) {
            insertStmt.run(assetClass, slopeStreakSeriesName, point.date, point.slopeStreak);
            insertStmt.run(assetClass, priceAboveStreakSeriesName, point.date, point.priceAboveStreak);
        }
    })();

    db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, description)
        VALUES (?, ?, ?, ?, ?)
    `).run(assetClass, slopeStreakSeriesName, `${maPeriod}-Day MA Slope Streak`, 'days', `Consecutive days with positive or negative slope for ${maPeriod}-day MA`);

    db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, description)
        VALUES (?, ?, ?, ?, ?)
    `).run(assetClass, priceAboveStreakSeriesName, `Price vs ${maPeriod}-Day MA Streak`, 'days', `Consecutive days with price above or below the ${maPeriod}-day MA`);

    console.log(`  ✓ Inserted ${streakData.length} streak values`);
}

console.log('Starting incremental MA streak calculation...');

try {
    calculateMAStreaks('50');
    calculateMAStreaks('200');
    calculateMAStreaks('500');
    console.log('\n✅ All MA streaks calculated successfully!');
} catch (error) {
    console.error('Error calculating MA streaks:', error);
    throw error;
} finally {
    db.close();
}
