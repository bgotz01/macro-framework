import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

interface DataPoint {
    date: string;
    value: number;
}

function calculatePercentilesForSeries(assetClass: string, seriesName: string) {
    console.log(`\nCalculating percentiles for ${seriesName}...`);

    // Load all data for this series
    const data = db.prepare(`
        SELECT date, value
        FROM time_series
        WHERE asset_class = ? AND series_name = ?
        ORDER BY date ASC
    `).all(assetClass, seriesName) as DataPoint[];

    if (data.length === 0) {
        console.log(`No data found for ${seriesName}`);
        return;
    }

    console.log(`Loaded ${data.length} data points`);

    // Sort by value to calculate percentiles
    const sortedByValue = [...data].sort((a, b) => a.value - b.value);

    // Delete existing percentiles
    db.prepare(`
        DELETE FROM percentile_analysis 
        WHERE asset_class = ? AND series_name = ?
    `).run(assetClass, seriesName);

    // Insert percentiles
    const insertStmt = db.prepare(`
        INSERT INTO percentile_analysis (asset_class, series_name, date, column_name, value, percentile_rank)
        VALUES (?, ?, ?, 'value', ?, ?)
    `);

    const insertPercentiles = db.transaction((data: DataPoint[]) => {
        for (const point of data) {
            // Find percentile rank
            const rank = sortedByValue.findIndex(p => p.date === point.date && p.value === point.value);
            const percentile = (rank / (sortedByValue.length - 1)) * 100;

            insertStmt.run(assetClass, seriesName, point.date, point.value, percentile);
        }
    });

    insertPercentiles(data);

    console.log(`Saved ${data.length} percentile values for ${seriesName}`);

    // Show some statistics
    const minValue = sortedByValue[0].value;
    const maxValue = sortedByValue[sortedByValue.length - 1].value;
    const medianValue = sortedByValue[Math.floor(sortedByValue.length / 2)].value;

    console.log(`Statistics for ${seriesName}:`);
    console.log(`  Min: ${minValue.toFixed(4)}`);
    console.log(`  Median: ${medianValue.toFixed(4)}`);
    console.log(`  Max: ${maxValue.toFixed(4)}`);
}

// List of all MA-related series to calculate percentiles for
const series = [
    // Moving Averages
    { assetClass: 'derived', seriesName: 'SP500-MA50' },
    { assetClass: 'derived', seriesName: 'SP500-MA200' },
    { assetClass: 'derived', seriesName: 'SP500-MA500' },

    // Divergences
    { assetClass: 'derived', seriesName: 'SP500-50MA-Div' },
    { assetClass: 'derived', seriesName: 'SP500-200MA-Div' },
    { assetClass: 'derived', seriesName: 'SP500-500MA-Div' },

    // Slopes
    { assetClass: 'derived', seriesName: 'SP500-50MA-Slope' },
    { assetClass: 'derived', seriesName: 'SP500-200MA-Slope' },
    { assetClass: 'derived', seriesName: 'SP500-500MA-Slope' },

    // Streaks
    { assetClass: 'derived', seriesName: 'SP500-50MA-SlopeStreak' },
    { assetClass: 'derived', seriesName: 'SP500-200MA-SlopeStreak' },
    { assetClass: 'derived', seriesName: 'SP500-500MA-SlopeStreak' },
    { assetClass: 'derived', seriesName: 'SP500-50MA-PriceAboveStreak' },
    { assetClass: 'derived', seriesName: 'SP500-200MA-PriceAboveStreak' },
    { assetClass: 'derived', seriesName: 'SP500-500MA-PriceAboveStreak' }
];

console.log('Starting MA percentile calculation...');

try {
    for (const s of series) {
        calculatePercentilesForSeries(s.assetClass, s.seriesName);
    }

    console.log('\n✅ All MA percentiles calculated successfully!');
} catch (error) {
    console.error('Error calculating MA percentiles:', error);
    throw error;
} finally {
    db.close();
}
