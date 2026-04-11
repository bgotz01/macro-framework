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

async function addRollingSP500EPS() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('Fetching SP500-EPS data...');

        // Get existing EPS data (monthly data)
        const epsData = db.prepare(`
            SELECT date, value 
            FROM time_series 
            WHERE asset_class = 'valuations' 
              AND series_name = 'SP500-EPS' 
              AND column_name = 'Value'
            ORDER BY date
        `).all() as DataPoint[];

        console.log(`Found ${epsData.length} SP500-EPS data points`);

        if (epsData.length === 0) {
            console.log('⚠️  No SP500-EPS data found. Please import the data first.');
            return;
        }

        // Calculate rolling averages (monthly data: 12 months per year)
        // 10-year = 120 months
        console.log('Calculating 10-year rolling average (120 months)...');
        const rolling10yr = calculateRollingAverage(epsData, 120);

        // Delete existing rolling EPS data if any
        console.log('Removing old rolling SP500-EPS data...');
        db.prepare(`
            DELETE FROM time_series 
            WHERE asset_class = 'valuations' 
              AND series_name = 'SP500-EPS-10yr'
        `).run();

        // Insert 10-year rolling average
        console.log('Inserting 10-year rolling SP500-EPS...');
        const insert10yr = db.prepare(`
            INSERT INTO time_series (asset_class, series_name, column_name, date, value)
            VALUES ('valuations', 'SP500-EPS-10yr', 'Value', ?, ?)
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
            'SP500-EPS-10yr',
            'S&P 500 EPS (10yr Rolling Avg)',
            'S&P 500 Earnings Per Share - 10-year rolling average (120 months)',
            'US',
            'usd',
            Date.now()
        );

        console.log('✅ Successfully added rolling SP500-EPS data!');
    } catch (error) {
        console.error('Error adding rolling SP500-EPS:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
addRollingSP500EPS().catch(console.error);
