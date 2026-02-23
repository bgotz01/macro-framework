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
    const isDaily = data.length > 1 && (data[1].date - data[0].date) < 40 * 24 * 60 * 60 * 1000;

    const windowDays = isDaily ? windowMonths * 30 : null;

    for (let i = 0; i < data.length; i++) {
        const currentDate = new Date(data[i].date);
        let windowStart: Date;

        if (isDaily && windowDays) {
            windowStart = new Date(currentDate);
            windowStart.setDate(windowStart.getDate() - windowDays);
        } else {
            windowStart = new Date(currentDate);
            windowStart.setMonth(windowStart.getMonth() - windowMonths);
        }

        const windowData = data.filter(point => {
            const pointDate = new Date(point.date);
            return pointDate >= windowStart && pointDate <= currentDate;
        });

        const minPoints = isDaily ? Math.floor(windowDays! * 0.7) : Math.floor(windowMonths * 0.7);

        if (windowData.length >= minPoints) {
            const sum = windowData.reduce((acc, point) => acc + point.value, 0);
            const average = sum / windowData.length;
            result.set(data[i].date, average);
        }
    }

    return result;
}

async function calculateIncrementalRollingAverages() {
    console.log('📊 Calculating rolling averages for series with new data...\n');

    const db = new Database(DB_PATH);

    try {
        // Find series that have data points without MA12 values
        const seriesWithNewDataQuery = `
            SELECT DISTINCT ts.asset_class, ts.series_name
            FROM time_series ts
            WHERE ts.column_name = 'Value'
            AND NOT EXISTS (
                SELECT 1 FROM time_series ma
                WHERE ma.asset_class = ts.asset_class
                AND ma.series_name = ts.series_name
                AND ma.column_name = 'MA12'
                AND ma.date = ts.date
            )
            ORDER BY ts.asset_class, ts.series_name
        `;

        const seriesToProcess = db.prepare(seriesWithNewDataQuery).all() as Array<{ asset_class: string; series_name: string }>;

        if (seriesToProcess.length === 0) {
            console.log('✅ All series are up to date!\n');
            db.close();
            return;
        }

        console.log(`Found ${seriesToProcess.length} series with new data to process\n`);

        const insertStmt = db.prepare(`
            INSERT OR REPLACE INTO time_series (date, asset_class, series_name, column_name, value)
            VALUES (?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((rows: any[]) => {
            for (const row of rows) {
                insertStmt.run(row.date, row.asset_class, row.series_name, row.column_name, row.value);
            }
        });

        let totalAverages = 0;

        for (const series of seriesToProcess) {
            const { asset_class, series_name } = series;
            console.log(`Processing ${asset_class}/${series_name}...`);

            // Get all data points for this series
            const dataQuery = `
                SELECT date, value
                FROM time_series
                WHERE asset_class = ? AND series_name = ? AND column_name = 'Value'
                ORDER BY date ASC
            `;

            const data = db.prepare(dataQuery).all(asset_class, series_name) as DataPoint[];

            if (data.length === 0) {
                console.log(`  ⚠️  No data found`);
                continue;
            }

            // Get existing MA12 dates
            const existingMA12Query = `
                SELECT date
                FROM time_series
                WHERE asset_class = ? AND series_name = ? AND column_name = 'MA12'
            `;
            const existingMA12Dates = new Set(
                (db.prepare(existingMA12Query).all(asset_class, series_name) as { date: number }[])
                    .map(row => row.date)
            );

            const newDataCount = data.filter(point => !existingMA12Dates.has(point.date)).length;
            console.log(`  ${data.length} total points, ${newDataCount} need MA12 calculation`);

            if (newDataCount === 0) {
                console.log(`  ✓ Already up to date\n`);
                continue;
            }

            // Calculate rolling averages on ALL data (needed for window lookback)
            console.log(`  Calculating MA12...`);
            const startTime = Date.now();
            const avg1yr = calculateRollingAverage(data, 12);
            const calcTime = Date.now() - startTime;
            console.log(`  Calculation took ${calcTime}ms`);

            // Prepare rows for insertion (only new dates)
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

            if (rows.length > 0) {
                insertMany(rows);
                totalAverages += rows.length;
                console.log(`  ✅ Inserted ${rows.length} MA12 values\n`);
            } else {
                console.log(`  ✓ Already up to date\n`);
            }
        }

        console.log(`\n✅ Complete! Added ${totalAverages} new moving average values across ${seriesToProcess.length} series`);

    } catch (error) {
        console.error('Error calculating rolling averages:', error);
        throw error;
    } finally {
        db.close();
    }
}

calculateIncrementalRollingAverages().catch(console.error);
