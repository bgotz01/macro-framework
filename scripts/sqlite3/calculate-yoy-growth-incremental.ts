import Database from 'better-sqlite3';
import path from 'path';

interface DataPoint {
    date: number;
    value: number;
}

async function calculateYoYGrowthIncremental() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    console.log('📊 Calculating Year-over-Year Growth Rates (Incremental)...\n');

    const seriesToProcess = [
        { assetClass: 'valuations', seriesName: 'SP500-EPS', displayName: 'S&P 500 EPS', newSeriesName: 'SP500-EPS-YoY' },
        { assetClass: 'valuations', seriesName: 'SP500SPS', displayName: 'S&P 500 Sales Per Share', newSeriesName: 'SP500SPS-YoY' }
    ];

    for (const series of seriesToProcess) {
        console.log(`Processing ${series.displayName}...`);

        // Check if metadata exists, create if not
        const existingSeries = db.prepare(`
            SELECT 1 FROM series_metadata 
            WHERE asset_class = 'derived' AND series_name = ?
        `).get(series.newSeriesName);

        if (!existingSeries) {
            db.prepare(`
                INSERT INTO series_metadata (asset_class, series_name, display_name, description, source, units)
                VALUES ('derived', ?, ?, ?, 'Calculated', 'percent')
            `).run(
                series.newSeriesName,
                `${series.displayName} YoY Growth`,
                `Year-over-Year growth rate for ${series.displayName}`
            );
            console.log(`  ✅ Created metadata for ${series.newSeriesName}`);
        }

        // Get the latest date that already has YoY data
        const latestYoY = db.prepare(`
            SELECT MAX(date) as max_date
            FROM time_series
            WHERE asset_class = 'derived' AND series_name = ? AND column_name = 'Value'
        `).get(series.newSeriesName) as { max_date: number | null };

        const latestYoYDate = latestYoY?.max_date || 0;
        console.log(`  Latest YoY date: ${latestYoYDate ? new Date(latestYoYDate).toISOString().split('T')[0] : 'none'}`);

        // Get all data points for the source series
        const dataPoints = db.prepare(`
            SELECT date, value 
            FROM time_series 
            WHERE asset_class = ? AND series_name = ? AND column_name = 'Value'
            ORDER BY date
        `).all(series.assetClass, series.seriesName) as DataPoint[];

        console.log(`  Found ${dataPoints.length} source data points`);

        // Calculate YoY growth only for dates after the latest YoY date
        const newYoYPoints: Array<{ date: number; value: number }> = [];

        for (let i = 0; i < dataPoints.length; i++) {
            const current = dataPoints[i];

            // Skip if we already have YoY data for this date
            if (current.date <= latestYoYDate) {
                continue;
            }

            const currentDate = new Date(current.date);

            // Look for data point from 12 months ago (±15 days tolerance for quarterly data)
            const targetDate = new Date(currentDate);
            targetDate.setFullYear(targetDate.getFullYear() - 1);
            const targetTimestamp = targetDate.getTime();

            const tolerance = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds

            const priorPoint = dataPoints.find(dp =>
                Math.abs(dp.date - targetTimestamp) <= tolerance
            );

            if (priorPoint && priorPoint.value !== 0) {
                const yoyGrowth = ((current.value - priorPoint.value) / priorPoint.value) * 100;
                newYoYPoints.push({
                    date: current.date,
                    value: yoyGrowth
                });
            }
        }

        if (newYoYPoints.length === 0) {
            console.log(`  ✅ No new data points to calculate\n`);
            continue;
        }

        console.log(`  📈 Calculating ${newYoYPoints.length} new YoY growth values`);

        // Insert new YoY growth data
        const insertStmt = db.prepare(`
            INSERT OR IGNORE INTO time_series (asset_class, series_name, column_name, date, value)
            VALUES ('derived', ?, 'Value', ?, ?)
        `);

        const insertMany = db.transaction((points: Array<{ date: number; value: number }>) => {
            for (const point of points) {
                insertStmt.run(series.newSeriesName, point.date, point.value);
            }
        });

        insertMany(newYoYPoints);
        console.log(`  ✅ Inserted ${newYoYPoints.length} new YoY growth records\n`);

        // Show sample of recent data
        const recentData = db.prepare(`
            SELECT 
                datetime(ts.date/1000, 'unixepoch') as date,
                ts.value as yoy_growth,
                orig.value as original_value
            FROM time_series ts
            LEFT JOIN time_series orig ON 
                orig.asset_class = ? AND 
                orig.series_name = ? AND 
                orig.date = ts.date AND
                orig.column_name = 'Value'
            WHERE ts.asset_class = 'derived' AND ts.series_name = ? AND ts.column_name = 'Value'
            ORDER BY ts.date DESC
            LIMIT 5
        `).all(series.assetClass, series.seriesName, series.newSeriesName);

        console.log(`  Recent ${series.displayName} YoY Growth:`);
        console.log('  Date         | Value    | YoY Growth');
        console.log('  ' + '-'.repeat(45));
        for (const row of recentData) {
            const r = row as { date: string; original_value: number; yoy_growth: number };
            console.log(`  ${r.date.substring(0, 10)} | ${r.original_value.toFixed(2).padStart(8)} | ${r.yoy_growth >= 0 ? '+' : ''}${r.yoy_growth.toFixed(2)}%`);
        }
        console.log('');
    }

    db.close();
    console.log('✅ Incremental YoY growth calculation complete!');
}

calculateYoYGrowthIncremental().catch(console.error);
