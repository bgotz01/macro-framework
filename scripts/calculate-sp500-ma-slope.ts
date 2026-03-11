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

    // Load MA data
    const maSeriesName = `SP500-MA${maPeriod}`;
    const maData = db.prepare(`
        SELECT date, value
        FROM time_series
        WHERE asset_class = 'derived' AND series_name = ?
        ORDER BY date ASC
    `).all(maSeriesName) as MADataPoint[];

    console.log(`Loaded ${maData.length} data points for ${maSeriesName}`);

    if (maData.length === 0) {
        console.log(`No data found for ${maSeriesName}`);
        return;
    }

    // Calculate daily percentage change (slope)
    const slopeData: Array<{ date: string; slope: number }> = [];

    for (let i = 1; i < maData.length; i++) {
        const currentMA = maData[i].value;
        const previousMA = maData[i - 1].value;

        // Calculate percentage change: (current - previous) / previous * 100
        const slope = ((currentMA - previousMA) / previousMA) * 100;

        slopeData.push({
            date: maData[i].date,
            slope: slope
        });
    }

    console.log(`Calculated ${slopeData.length} slope values`);

    // Save to database
    const slopeSeriesName = `SP500-${maPeriod}MA-Slope`;
    const assetClass = 'derived';

    // Delete existing data for this series
    db.prepare(`
        DELETE FROM time_series 
        WHERE asset_class = ? AND series_name = ?
    `).run(assetClass, slopeSeriesName);

    // Insert new data
    const insertStmt = db.prepare(`
        INSERT INTO time_series (asset_class, series_name, date, column_name, value)
        VALUES (?, ?, ?, 'value', ?)
    `);

    const insertMany = db.transaction((data: typeof slopeData) => {
        for (const point of data) {
            insertStmt.run(assetClass, slopeSeriesName, point.date, point.slope);
        }
    });

    insertMany(slopeData);

    console.log(`Saved ${slopeData.length} slope values to ${slopeSeriesName}`);

    // Add metadata
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

    console.log(`Added metadata for ${slopeSeriesName}`);

    // Show some statistics
    const avgSlope = slopeData.reduce((sum, p) => sum + p.slope, 0) / slopeData.length;
    const maxSlope = Math.max(...slopeData.map(p => p.slope));
    const minSlope = Math.min(...slopeData.map(p => p.slope));

    console.log(`Statistics for ${maPeriod}-day MA Slope:`);
    console.log(`  Average: ${avgSlope.toFixed(4)}% per day`);
    console.log(`  Max: ${maxSlope.toFixed(4)}% per day`);
    console.log(`  Min: ${minSlope.toFixed(4)}% per day`);
}

// Calculate slopes for all three MAs
console.log('Starting MA slope calculation...');

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
