#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

interface DataPoint {
    date: number;
    value: number;
}

function calculateMonthlyRollingAverage(data: DataPoint[], windowMonths: number): Map<number, number> {
    const result = new Map<number, number>();

    for (let i = 0; i < data.length; i++) {
        const currentDate = new Date(data[i].date);

        // Go back by the specified number of months
        const windowStart = new Date(currentDate);
        windowStart.setMonth(windowStart.getMonth() - windowMonths);

        // Get all points within the window (inclusive of current point)
        const windowData = data.filter(point => {
            const pointDate = new Date(point.date);
            return pointDate >= windowStart && pointDate <= currentDate;
        });

        // For monthly data, require at least 70% of expected months
        const minPoints = Math.floor(windowMonths * 0.7);

        if (windowData.length >= minPoints) {
            const sum = windowData.reduce((acc, point) => acc + point.value, 0);
            const average = sum / windowData.length;
            result.set(data[i].date, average);
        }
    }

    return result;
}

async function calculateMonthlyAverages() {
    console.log('📊 Calculating 12-month rolling averages for monthly series...\n');

    const db = new Database(DB_PATH);

    try {
        // Define monthly series to process
        const monthlySeries = [
            { asset_class: 'economic', series_name: 'CPI' },
            { asset_class: 'economic', series_name: 'CPINominal' },
            { asset_class: 'valuations', series_name: 'Shiller-PE' },
        ];

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

        for (const series of monthlySeries) {
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

            // Calculate 12-month rolling average on ALL data (needed for window lookback)
            console.log(`    Calculating 12-month average...`);
            const avg12mo = calculateMonthlyRollingAverage(data, 12);

            // Prepare rows for insertion (only new dates)
            const rows: any[] = [];

            for (const [date, value] of avg12mo.entries()) {
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
            } else {
                console.log(`    ⚠️  No averages calculated (insufficient data)`);
            }

            totalProcessed++;
        }

        console.log('\n━'.repeat(50));
        console.log(`✅ Monthly rolling averages calculated!`);
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

calculateMonthlyAverages().catch(console.error);
