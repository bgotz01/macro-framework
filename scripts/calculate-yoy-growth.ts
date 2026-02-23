import Database from 'better-sqlite3';
import path from 'path';

interface DataPoint {
    date: number;
    value: number;
}

async function calculateYoYGrowth() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    console.log('📊 Calculating Year-over-Year Growth Rates...\n');

    const seriesToProcess = [
        { assetClass: 'valuations', seriesName: 'SP500-EPS', displayName: 'S&P 500 EPS', newSeriesName: 'SP500-EPS-YoY' },
        { assetClass: 'valuations', seriesName: 'SP500SPS', displayName: 'S&P 500 Sales Per Share', newSeriesName: 'SP500SPS-YoY' }
    ];

    for (const series of seriesToProcess) {
        console.log(`Processing ${series.displayName}...`);

        // Get all data points for this series
        const dataPoints = db.prepare(`
            SELECT date, value 
            FROM time_series 
            WHERE asset_class = ? AND series_name = ?
            ORDER BY date
        `).all(series.assetClass, series.seriesName) as DataPoint[];

        console.log(`  Found ${dataPoints.length} data points`);

        // Calculate YoY growth
        const yoyGrowthPoints: Array<{ date: number; value: number }> = [];

        for (let i = 0; i < dataPoints.length; i++) {
            const current = dataPoints[i];
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
                yoyGrowthPoints.push({
                    date: current.date,
                    value: yoyGrowth
                });
            }
        }

        console.log(`  Calculated ${yoyGrowthPoints.length} YoY growth values`);

        // Check if series already exists
        const existingSeries = db.prepare(`
            SELECT 1 FROM series_metadata 
            WHERE asset_class = 'derived' AND series_name = ?
        `).get(series.newSeriesName);

        if (!existingSeries) {
            // Insert metadata for new series
            db.prepare(`
                INSERT INTO series_metadata (asset_class, series_name, display_name, description, source, units)
                VALUES ('derived', ?, ?, ?, 'Calculated', 'percent')
            `).run(
                series.newSeriesName,
                `${series.displayName} YoY Growth`,
                `Year-over-Year growth rate for ${series.displayName}`
            );
            console.log(`  ✅ Created metadata for ${series.newSeriesName}`);
        } else {
            console.log(`  ℹ️  Metadata already exists for ${series.newSeriesName}`);
        }

        // Delete existing data for this series
        const deleteResult = db.prepare(`
            DELETE FROM time_series 
            WHERE asset_class = 'derived' AND series_name = ? AND column_name = 'Value'
        `).run(series.newSeriesName);

        if (deleteResult.changes > 0) {
            console.log(`  🗑️  Deleted ${deleteResult.changes} existing records`);
        }

        // Insert new YoY growth data
        const insertStmt = db.prepare(`
            INSERT INTO time_series (asset_class, series_name, column_name, date, value)
            VALUES ('derived', ?, 'Value', ?, ?)
        `);

        const insertMany = db.transaction((points: Array<{ date: number; value: number }>) => {
            for (const point of points) {
                insertStmt.run(series.newSeriesName, point.date, point.value);
            }
        });

        insertMany(yoyGrowthPoints);
        console.log(`  ✅ Inserted ${yoyGrowthPoints.length} YoY growth records\n`);

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
                orig.date = ts.date
            WHERE ts.asset_class = 'derived' AND ts.series_name = ?
            ORDER BY ts.date DESC
            LIMIT 8
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
    console.log('✅ YoY growth calculation complete!');
}

calculateYoYGrowth().catch(console.error);
