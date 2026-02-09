import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface SeriesInfo {
    asset_class: string;
    series_name: string;
    column_name: string;
    count: number;
    min_date: number;
    max_date: number;
}

function main() {
    const db = new Database(DB_PATH);

    console.log('Available time series in database:\n');

    const stmt = db.prepare(`
    SELECT 
      asset_class,
      series_name,
      column_name,
      COUNT(*) as count,
      MIN(date) as min_date,
      MAX(date) as max_date
    FROM time_series
    WHERE column_name NOT LIKE '%_MA%'  -- Exclude already calculated moving averages
    GROUP BY asset_class, series_name, column_name
    ORDER BY asset_class, series_name, column_name
  `);

    const series = stmt.all() as SeriesInfo[];

    let currentAssetClass = '';

    for (const s of series) {
        if (s.asset_class !== currentAssetClass) {
            currentAssetClass = s.asset_class;
            console.log(`\n${currentAssetClass.toUpperCase()}:`);
        }

        const minDate = new Date(s.min_date).toISOString().split('T')[0];
        const maxDate = new Date(s.max_date).toISOString().split('T')[0];
        const years = ((s.max_date - s.min_date) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);

        // Estimate frequency
        const avgDaysBetween = (s.max_date - s.min_date) / (s.count * 24 * 60 * 60 * 1000);
        let frequency = 'unknown';
        if (avgDaysBetween < 2) frequency = 'daily';
        else if (avgDaysBetween < 10) frequency = 'weekly';
        else if (avgDaysBetween < 35) frequency = 'monthly';
        else if (avgDaysBetween < 100) frequency = 'quarterly';
        else frequency = 'yearly';

        console.log(`  ${s.series_name}.${s.column_name}`);
        console.log(`    ${s.count} points | ${frequency} | ${minDate} to ${maxDate} (${years} years)`);
    }

    console.log(`\n\nTotal: ${series.length} series`);

    db.close();
}

main();
