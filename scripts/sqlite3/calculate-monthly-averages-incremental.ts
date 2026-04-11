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
    if (data.length === 0) return result;

    const minPoints = Math.floor(windowMonths * 0.7);
    let left = 0;
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
        sum += data[i].value;

        const windowStart = new Date(data[i].date);
        windowStart.setMonth(windowStart.getMonth() - windowMonths);
        const windowStartMs = windowStart.getTime();

        while (left < i && data[left].date < windowStartMs) {
            sum -= data[left].value;
            left++;
        }

        const count = i - left + 1;
        if (count >= minPoints) {
            result.set(data[i].date, sum / count);
        }
    }

    return result;
}

async function calculateMonthlyAveragesIncremental() {
    console.log('📊 Calculating 12-month rolling averages for monthly series (incremental)...\n');

    const db = new Database(DB_PATH);

    try {
        // Define monthly series to process
        const monthlySeries = [
            { asset_class: 'economic', series_name: 'CPI' },
            { asset_class: 'economic', series_name: 'CPINominal' },
            { asset_class: 'valuations', series_name: 'Shiller-PE' },
        ];

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
        let seriesProcessed = 0;

        for (const series of monthlySeries) {
            const { asset_class, series_name } = series;

            // Get all data points for this series
            const dataQuery = `
                SELECT date, value
                FROM time_series
                WHERE asset_class = ? AND series_name = ? AND column_name = 'Value'
                ORDER BY date ASC
            `;

            const data = db.prepare(dataQuery).all(asset_class, series_name) as DataPoint[];

            if (data.length === 0) {
                continue;
            }

            // Get existing MA12 dates
            const existingMA12Query = `
                SELECT date
                FROM time_series
                WHERE asset_class = ? AND series_name = ? AND column_name = 'Value_MA12'
            `;
            const existingMA12Dates = new Set(
                (db.prepare(existingMA12Query).all(asset_class, series_name) as { date: number }[])
                    .map(row => row.date)
            );

            const newDataCount = data.filter(point => !existingMA12Dates.has(point.date)).length;

            if (newDataCount === 0) {
                continue;
            }

            console.log(`Processing ${asset_class}/${series_name}...`);
            console.log(`  ${newDataCount} new data points need MA12 calculation`);

            // Calculate rolling averages on ALL data (needed for window lookback)
            const avg12m = calculateMonthlyRollingAverage(data, 12);

            // Prepare rows for insertion (only new dates)
            const rows: any[] = [];

            for (const [date, value] of avg12m.entries()) {
                if (!existingMA12Dates.has(date)) {
                    rows.push({
                        date,
                        asset_class,
                        series_name,
                        column_name: 'Value_MA12',
                        value
                    });
                }
            }

            if (rows.length > 0) {
                insertMany(rows);
                totalAverages += rows.length;
                seriesProcessed++;
                console.log(`  ✅ Inserted ${rows.length} MA12 values\n`);
            }
        }

        if (seriesProcessed === 0) {
            console.log('✅ All monthly series are up to date!\n');
        } else {
            console.log(`\n✅ Complete! Added ${totalAverages} new moving average values across ${seriesProcessed} series`);
        }

    } catch (error) {
        console.error('Error calculating monthly averages:', error);
        throw error;
    } finally {
        db.close();
    }
}

calculateMonthlyAveragesIncremental().catch(console.error);
