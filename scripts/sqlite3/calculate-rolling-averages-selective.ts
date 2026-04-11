#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface DataPoint {
    date: number;
    value: number;
}

// Define which series should have moving averages calculated
const SERIES_TO_PROCESS = [
    // Add only the series you actually want MA12 for
    { asset_class: 'equities', series_name: 'US/GSPC' },
    { asset_class: 'equities', series_name: 'US/IXIC' },
    { asset_class: 'equities', series_name: 'US/DJI' },
    { asset_class: 'equities', series_name: 'NDX' },
    { asset_class: 'equities', series_name: 'Turkey/XU100.IS' },
    { asset_class: 'equities', series_name: 'Argentina/MERV' },
    // Add more series as needed
];

function calculateRollingAverage(data: DataPoint[], windowMonths: number): Map<number, number> {
    const result = new Map<number, number>();
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

async function calculateSelectiveRollingAverages() {
    console.log('📊 Calculating rolling averages for selected series...\n');

    const db = new Database(DB_PATH);

    try {
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

        for (const series of SERIES_TO_PROCESS) {
            const { asset_class, series_name } = series;
            console.log(`Processing ${asset_class}/${series_name}...`);

            const dataQuery = `
                SELECT date, value
                FROM time_series
                WHERE asset_class = ? AND series_name = ? AND column_name = 'Value'
                ORDER BY date ASC
            `;

            const data = db.prepare(dataQuery).all(asset_class, series_name) as DataPoint[];

            if (data.length === 0) {
                console.log(`  ⚠️  No data found\n`);
                continue;
            }

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
            console.log(`  ${data.length} total points, ${newDataCount} need MA12`);

            if (newDataCount === 0) {
                console.log(`  ✓ Already up to date\n`);
                continue;
            }

            console.log(`  Calculating...`);
            const startTime = Date.now();
            const avg1yr = calculateRollingAverage(data, 12);
            const calcTime = Date.now() - startTime;

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
                console.log(`  ✅ Added ${rows.length} MA12 values (${calcTime}ms)\n`);
            }
        }

        console.log(`\n✅ Complete! Added ${totalAverages} moving average values`);

    } catch (error) {
        console.error('Error:', error);
        throw error;
    } finally {
        db.close();
    }
}

calculateSelectiveRollingAverages().catch(console.error);
