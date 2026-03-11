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

    // Load S&P 500 price data
    const priceData = db.prepare(`
        SELECT date, value
        FROM time_series
        WHERE asset_class = 'equities' AND series_name = 'US/GSPC' AND column_name = 'Value'
        ORDER BY date ASC
    `).all() as DataPoint[];

    // Load MA data
    const maSeriesName = `SP500-MA${maPeriod}`;
    const maData = db.prepare(`
        SELECT date, value
        FROM time_series
        WHERE asset_class = 'derived' AND series_name = ?
        ORDER BY date ASC
    `).all(maSeriesName) as DataPoint[];

    // Load slope data
    const slopeSeriesName = `SP500-${maPeriod}MA-Slope`;
    const slopeData = db.prepare(`
        SELECT date, value
        FROM time_series
        WHERE asset_class = 'derived' AND series_name = ?
        ORDER BY date ASC
    `).all(slopeSeriesName) as DataPoint[];

    console.log(`Loaded ${priceData.length} price points, ${maData.length} MA points, ${slopeData.length} slope points`);

    // Create maps for quick lookup
    const priceMap = new Map(priceData.map(p => [p.date, p.value]));
    const maMap = new Map(maData.map(p => [p.date, p.value]));
    const slopeMap = new Map(slopeData.map(p => [p.date, p.value]));

    // Get all dates that have all three values
    const allDates = Array.from(new Set([...priceMap.keys(), ...maMap.keys(), ...slopeMap.keys()]))
        .filter(date => priceMap.has(date) && maMap.has(date) && slopeMap.has(date))
        .sort();

    console.log(`Found ${allDates.length} dates with complete data`);

    // Calculate streaks
    const streakData: Array<{
        date: string;
        slopeStreak: number;
        priceAboveStreak: number;
    }> = [];

    let currentSlopeStreak = 0;
    let currentPriceAboveStreak = 0;

    for (const date of allDates) {
        const slope = slopeMap.get(date)!;
        const price = priceMap.get(date)!;
        const ma = maMap.get(date)!;

        // Calculate slope streak
        if (slope > 0) {
            // Positive slope
            if (currentSlopeStreak >= 0) {
                currentSlopeStreak++;
            } else {
                currentSlopeStreak = 1; // Reset to 1 when switching from negative to positive
            }
        } else if (slope < 0) {
            // Negative slope
            if (currentSlopeStreak <= 0) {
                currentSlopeStreak--;
            } else {
                currentSlopeStreak = -1; // Reset to -1 when switching from positive to negative
            }
        } else {
            // Slope is exactly 0 - keep current streak
            // (or you could reset to 0 if you prefer)
        }

        // Calculate price above MA streak
        if (price > ma) {
            // Price above MA
            if (currentPriceAboveStreak >= 0) {
                currentPriceAboveStreak++;
            } else {
                currentPriceAboveStreak = 1; // Reset to 1 when switching from below to above
            }
        } else if (price < ma) {
            // Price below MA
            if (currentPriceAboveStreak <= 0) {
                currentPriceAboveStreak--;
            } else {
                currentPriceAboveStreak = -1; // Reset to -1 when switching from above to below
            }
        } else {
            // Price exactly equals MA - keep current streak
        }

        streakData.push({
            date,
            slopeStreak: currentSlopeStreak,
            priceAboveStreak: currentPriceAboveStreak
        });
    }

    console.log(`Calculated ${streakData.length} streak values`);

    // Save slope streak data
    const slopeStreakSeriesName = `SP500-${maPeriod}MA-SlopeStreak`;
    const assetClass = 'derived';

    db.prepare(`
        DELETE FROM time_series 
        WHERE asset_class = ? AND series_name = ?
    `).run(assetClass, slopeStreakSeriesName);

    const insertStmt1 = db.prepare(`
        INSERT INTO time_series (asset_class, series_name, date, column_name, value)
        VALUES (?, ?, ?, 'value', ?)
    `);

    const insertSlopeStreak = db.transaction((data: typeof streakData) => {
        for (const point of data) {
            insertStmt1.run(assetClass, slopeStreakSeriesName, point.date, point.slopeStreak);
        }
    });

    insertSlopeStreak(streakData);

    db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, description)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        assetClass,
        slopeStreakSeriesName,
        `${maPeriod}-Day MA Slope Streak`,
        'days',
        `Consecutive days with positive (>0) or negative (<0) slope for ${maPeriod}-day MA`
    );

    console.log(`Saved ${streakData.length} values to ${slopeStreakSeriesName}`);

    // Save price above MA streak data
    const priceAboveStreakSeriesName = `SP500-${maPeriod}MA-PriceAboveStreak`;

    db.prepare(`
        DELETE FROM time_series 
        WHERE asset_class = ? AND series_name = ?
    `).run(assetClass, priceAboveStreakSeriesName);

    const insertStmt2 = db.prepare(`
        INSERT INTO time_series (asset_class, series_name, date, column_name, value)
        VALUES (?, ?, ?, 'value', ?)
    `);

    const insertPriceAboveStreak = db.transaction((data: typeof streakData) => {
        for (const point of data) {
            insertStmt2.run(assetClass, priceAboveStreakSeriesName, point.date, point.priceAboveStreak);
        }
    });

    insertPriceAboveStreak(streakData);

    db.prepare(`
        INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, units, description)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        assetClass,
        priceAboveStreakSeriesName,
        `Price vs ${maPeriod}-Day MA Streak`,
        'days',
        `Consecutive days with price above (>0) or below (<0) the ${maPeriod}-day MA`
    );

    console.log(`Saved ${streakData.length} values to ${priceAboveStreakSeriesName}`);

    // Show some statistics
    const maxPositiveSlopeStreak = Math.max(...streakData.map(p => p.slopeStreak));
    const maxNegativeSlopeStreak = Math.min(...streakData.map(p => p.slopeStreak));
    const maxPositivePriceStreak = Math.max(...streakData.map(p => p.priceAboveStreak));
    const maxNegativePriceStreak = Math.min(...streakData.map(p => p.priceAboveStreak));

    console.log(`Statistics for ${maPeriod}-day MA streaks:`);
    console.log(`  Max positive slope streak: ${maxPositiveSlopeStreak} days`);
    console.log(`  Max negative slope streak: ${maxNegativeSlopeStreak} days`);
    console.log(`  Max price above MA streak: ${maxPositivePriceStreak} days`);
    console.log(`  Max price below MA streak: ${maxNegativePriceStreak} days`);
}

// Calculate streaks for all three MAs
console.log('Starting MA streak calculation...');

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
