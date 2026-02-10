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

async function addRollingEPS() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('Fetching SP500-EPS data...');

        // Get existing EPS data
        const epsData = db.prepare(`
            SELECT date, value 
            FROM time_series 
            WHERE asset_class = 'valuations' 
              AND series_name = 'SP500-EPS' 
              AND column_name = 'Value'
            ORDER BY date
        `).all() as DataPoint[];

        console.log(`Found ${epsData.length} EPS data points`);

        // Calculate rolling averages
        console.log('Calculating 2-year rolling average...');
        const rolling2yr = calculateRollingAverage(epsData, 24);

        console.log('Calculating 5-year rolling average...');
        const rolling5yr = calculateRollingAverage(epsData, 60);

        console.log('Calculating 10-year rolling average...');
        const rolling10yr = calculateRollingAverage(epsData, 120);

        // Delete existing rolling EPS data if any
        console.log('Removing old rolling EPS data...');
        db.prepare(`
            DELETE FROM time_series 
            WHERE asset_class = 'valuations' 
              AND series_name IN ('SP500-EPS-2yr', 'SP500-EPS-5yr', 'SP500-EPS-10yr')
        `).run();

        // Insert 2-year rolling average
        console.log('Inserting 2-year rolling EPS...');
        const insert2yr = db.prepare(`
            INSERT INTO time_series (asset_class, series_name, column_name, date, value)
            VALUES ('valuations', 'SP500-EPS-2yr', 'Value', ?, ?)
        `);

        const insert2yrMany = db.transaction((data: DataPoint[]) => {
            for (const point of data) {
                insert2yr.run(point.date, point.value);
            }
        });

        insert2yrMany(rolling2yr);
        console.log(`Inserted ${rolling2yr.length} 2-year rolling EPS points`);

        // Insert 5-year rolling average
        console.log('Inserting 5-year rolling EPS...');
        const insert5yr = db.prepare(`
            INSERT INTO time_series (asset_class, series_name, column_name, date, value)
            VALUES ('valuations', 'SP500-EPS-5yr', 'Value', ?, ?)
        `);

        const insert5yrMany = db.transaction((data: DataPoint[]) => {
            for (const point of data) {
                insert5yr.run(point.date, point.value);
            }
        });

        insert5yrMany(rolling5yr);
        console.log(`Inserted ${rolling5yr.length} 5-year rolling EPS points`);

        // Insert 10-year rolling average
        console.log('Inserting 10-year rolling EPS...');
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

        console.log('✅ Successfully added rolling EPS data!');
    } catch (error) {
        console.error('Error adding rolling EPS:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
addRollingEPS().catch(console.error);
