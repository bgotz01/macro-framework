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

    // Find the latest date already computed
    const latestRow = db.prepare(`
        SELECT MAX(date) as max_date FROM percentile_analysis
        WHERE asset_class = ? AND series_name = ? AND percentile_rank IS NOT NULL
    `).get(assetClass, seriesName) as { max_date: string | null };

    const latestComputed = latestRow?.max_date;

    // Load ALL data (needed for correct percentile ranking)
    const allData = db.prepare(`
        SELECT date, value
        FROM time_series
        WHERE asset_class = ? AND series_name = ?
        ORDER BY date ASC
    `).all(assetClass, seriesName) as DataPoint[];

    if (allData.length === 0) {
        console.log(`  No data found`);
        return;
    }

    // Determine which dates are new
    const newData = latestComputed
        ? allData.filter(d => d.date > latestComputed)
        : allData;

    if (newData.length === 0) {
        console.log(`  ✓ Already up to date`);
        return;
    }

    if (latestComputed) {
        console.log(`  Incremental: ${newData.length} new rows since ${latestComputed}`);
    } else {
        console.log(`  Full run: ${allData.length} rows`);
    }

    // Sort full dataset by value for percentile ranking
    const sortedByValue = [...allData].sort((a, b) => a.value - b.value);

    // Build a rank map: for each data point, its position in the sorted array
    // Using a Map keyed by date for O(1) lookup
    const rankMap = new Map<string, number>();
    for (let i = 0; i < sortedByValue.length; i++) {
        rankMap.set(sortedByValue[i].date, i);
    }

    const totalCount = sortedByValue.length - 1;

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO percentile_analysis (asset_class, series_name, date, column_name, value, percentile_rank)
        VALUES (?, ?, ?, 'value', ?, ?)
    `);

    db.transaction(() => {
        for (const point of newData) {
            const rank = rankMap.get(point.date) ?? 0;
            const percentile = totalCount > 0 ? (rank / totalCount) * 100 : 0;
            insertStmt.run(assetClass, seriesName, point.date, point.value, percentile);
        }
    })();

    console.log(`  ✓ Inserted ${newData.length} percentile values`);
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

console.log('Starting incremental MA percentile calculation...');

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
