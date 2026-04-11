#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

interface DataPoint {
    date: number;
    value: number;
}

function calculateRollingAverage(data: DataPoint[], windowSize: number): DataPoint[] {
    const result: DataPoint[] = [];

    for (let i = 0; i < data.length; i++) {
        // Need at least windowSize points to calculate average
        if (i < windowSize - 1) {
            continue;
        }

        // Get the last windowSize points including current
        const windowData = data.slice(i - windowSize + 1, i + 1);
        const sum = windowData.reduce((acc, d) => acc + d.value, 0);
        const avg = sum / windowSize;

        result.push({ date: data[i].date, value: avg });
    }

    return result;
}

async function addRollingNDXEPS() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('Fetching NasdaqEPS data...');

        // Get existing EPS data (quarterly data)
        const epsData = db.prepare(`
            SELECT date, value 
            FROM time_series 
            WHERE asset_class = 'valuations' 
              AND series_name = 'NasdaqEPS' 
              AND column_name = 'Value'
            ORDER BY date
        `).all() as DataPoint[];

        console.log(`Found ${epsData.length} NasdaqEPS data points`);

        if (epsData.length === 0) {
            console.log('⚠️  No NasdaqEPS data found. Please import the data first.');
            return;
        }

        // Calculate rolling averages (quarterly data: 4 quarters per year)
        // 5-year = 20 quarters, 10-year = 40 quarters
        console.log('Calculating 5-year rolling average (20 quarters)...');
        const rolling5yr = calculateRollingAverage(epsData, 20);

        console.log('Calculating 10-year rolling average (40 quarters)...');
        const rolling10yr = calculateRollingAverage(epsData, 40);

        // Delete existing rolling EPS data if any
        console.log('Removing old rolling NasdaqEPS data...');
        db.prepare(`
            DELETE FROM time_series 
            WHERE asset_class = 'valuations' 
              AND series_name IN ('NasdaqEPS-5yr', 'NasdaqEPS-10yr')
        `).run();

        // Insert 5-year rolling average
        console.log('Inserting 5-year rolling NasdaqEPS...');
        const insert5yr = db.prepare(`
            INSERT INTO time_series (asset_class, series_name, column_name, date, value)
            VALUES ('valuations', 'NasdaqEPS-5yr', 'Value', ?, ?)
        `);

        const insert5yrMany = db.transaction((data: DataPoint[]) => {
            for (const point of data) {
                insert5yr.run(point.date, point.value);
            }
        });

        insert5yrMany(rolling5yr);
        console.log(`Inserted ${rolling5yr.length} 5-year rolling EPS points`);

        // Insert 10-year rolling average
        console.log('Inserting 10-year rolling NasdaqEPS...');
        const insert10yr = db.prepare(`
            INSERT INTO time_series (asset_class, series_name, column_name, date, value)
            VALUES ('valuations', 'NasdaqEPS-10yr', 'Value', ?, ?)
        `);

        const insert10yrMany = db.transaction((data: DataPoint[]) => {
            for (const point of data) {
                insert10yr.run(point.date, point.value);
            }
        });

        insert10yrMany(rolling10yr);
        console.log(`Inserted ${rolling10yr.length} 10-year rolling EPS points`);

        // Update metadata for the new series
        console.log('Updating series metadata...');
        const updateMetaStmt = db.prepare(`
            INSERT OR REPLACE INTO series_metadata (asset_class, series_name, display_name, description, geography, units, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        updateMetaStmt.run(
            'valuations',
            'NasdaqEPS-5yr',
            'NASDAQ 100 EPS (5yr Rolling Avg)',
            'NASDAQ 100 Earnings Per Share - 5-year rolling average (20 quarters)',
            'US',
            'usd',
            Date.now()
        );

        updateMetaStmt.run(
            'valuations',
            'NasdaqEPS-10yr',
            'NASDAQ 100 EPS (10yr Rolling Avg)',
            'NASDAQ 100 Earnings Per Share - 10-year rolling average (40 quarters)',
            'US',
            'usd',
            Date.now()
        );

        console.log('✅ Successfully added rolling NasdaqEPS data!');
    } catch (error) {
        console.error('Error adding rolling NasdaqEPS:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
addRollingNDXEPS().catch(console.error);
