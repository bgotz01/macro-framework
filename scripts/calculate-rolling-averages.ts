#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface DataPoint {
    date: number;
    value: number;
}

function calculateRollingAverage(data: DataPoint[], windowMonths: number): Map<number, number> {
    const result = new Map<number, number>();

    // Determine if data is daily or monthly by checking the interval between first two points
    const isDaily = data.length > 1 && (data[1].date - data[0].date) < 40 * 24 * 60 * 60 * 1000; // Less than 40 days

    // For daily data, use actual days; for monthly data, use months
    const windowDays = isDaily ? windowMonths * 30 : null; // Approximate 30 days per month for daily data

    for (let i = 0; i < data.length; i++) {
        const currentDate = new Date(data[i].date);
        let windowStart: Date;

        if (isDaily && windowDays) {
            // For daily data, go back by days
            windowStart = new Date(currentDate);
            windowStart.setDate(windowStart.getDate() - windowDays);
        } else {
            // For monthly data, go back by months
            windowStart = new Date(currentDate);
            windowStart.setMonth(windowStart.getMonth() - windowMonths);
        }

        // Get all points within the window
        const windowData = data.filter(point => {
            const pointDate = new Date(point.date);
            return pointDate >= windowStart && pointDate <= currentDate;
        });

        // Require minimum number of points for a valid average
        const minPoints = isDaily ? Math.floor(windowDays! * 0.7) : Math.floor(windowMonths * 0.7); // At least 70% of expected points

        if (windowData.length >= minPoints) {
            const sum = windowData.reduce((acc, point) => acc + point.value, 0);
            const average = sum / windowData.length;
            result.set(data[i].date, average);
        }
    }

    return result;
}

async function calculateAllRollingAverages() {
    console.log('📊 Calculating rolling averages for all series...\n');

    const db = new Database(DB_PATH);

    try {
        // Get all unique series
        const seriesQuery = `
            SELECT DISTINCT asset_class, series_name
            FROM time_series
            ORDER BY asset_class, series_name
        `;

        const allSeries = db.prepare(seriesQuery).all() as Array<{ asset_class: string; series_name: string }>;

        console.log(`Found ${allSeries.length} series to process\n`);

        // Prepare insert statement
        const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
            VALUES (?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((rows: any[]) => {
            for (const row of rows) {
                insertStmt.run(row.date, row.asset_class, row.series_name, row.column_name, row.value);
            }
        });

        let totalProcessed = 0;
        let totalAverages = 0;

        for (const series of allSeries) {
            const { asset_class, series_name } = series;
            console.log(`\n  Processing ${asset_class}/${series_name}...`);

            // Get all data points for this series (only 'Value' column)
            const dataQuery = `
                SELECT date, value
                FROM time_series
                WHERE asset_class = ? AND series_name = ? AND column_name = 'Value'
                ORDER BY date ASC
            `;

            const data = db.prepare(dataQuery).all(asset_class, series_name) as DataPoint[];

            if (data.length === 0) {
                console.log(`    ⚠️  No data found`);
                continue;
            }

            console.log(`    Found ${data.length} data points`);

            // Get existing MA12 dates to skip them
            const existingMA12Query = `
                SELECT date
                FROM time_series
                WHERE asset_class = ? AND series_name = ? AND column_name = 'MA12'
            `;
            const existingMA12Dates = new Set(
                (db.prepare(existingMA12Query).all(asset_class, series_name) as { date: number }[])
                    .map(row => row.date)
            );

            // Filter data to only include dates that don't have MA12 yet
            const dataToProcess = data.filter(point => !existingMA12Dates.has(point.date));

            if (dataToProcess.length === 0) {
                console.log(`    ✓ Already up to date (${existingMA12Dates.size} MA12 values exist)`);
                continue;
            }

            console.log(`    Need to calculate ${dataToProcess.length} new MA12 values (${existingMA12Dates.size} already exist)`);

            // Calculate rolling averages on ALL data (needed for window lookback)
            console.log(`    Calculating 12-month average...`);
            const avg1yr = calculateRollingAverage(data, 12);

            // Prepare rows for insertion (only new dates, only MA12)
            const rows: any[] = [];

            for (const [date, value] of avg1yr.entries()) {
                if (!existingMA12Dates.has(date)) {
                    rows.push({
                        date,
                        asset_class,
                        series_name,
                        column_name: 'MA12',
                        value
                    });
                }
            }

            // Insert all averages
            if (rows.length > 0) {
                console.log(`    Inserting ${rows.length} averages into database...`);
                insertMany(rows);
                totalAverages += rows.length;
                console.log(`    ✓ Complete: ${data.length} points → ${rows.length} averages`);
            }

            totalProcessed++;
        }

        console.log('\n━'.repeat(50));
        console.log(`✅ Rolling averages calculated!`);
        console.log(`   Series processed: ${totalProcessed}`);
        console.log(`   Averages created: ${totalAverages.toLocaleString()}`);
        console.log('━'.repeat(50));

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        db.close();
    }
}

calculateAllRollingAverages().catch(console.error);
