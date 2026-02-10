import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

interface SeriesConfig {
    filename: string;
    seriesName: string;
    displayName: string;
    units: string;
    convertToBillions: boolean;
}

const SERIES_TO_IMPORT: SeriesConfig[] = [
    {
        filename: 'BOGZ1FL153064486Q.csv',
        seriesName: 'Corporate-Equities-Pct-Assets',
        displayName: 'Corporate Equities % of Assets',
        units: '%',
        convertToBillions: false
    },
    {
        filename: 'BOGZ1FL594090005Q.csv',
        seriesName: 'Pension-Funds-Assets',
        displayName: 'Pension Funds: Total Financial Assets',
        units: 'Billions',
        convertToBillions: true
    },
    {
        filename: 'BOGZ1LM654090000Q.csv',
        seriesName: 'Mutual-Fund-Assets',
        displayName: 'Mutual Fund: Total Financial Assets',
        units: 'Billions',
        convertToBillions: true
    }
];

function parseCSV(filePath: string, convertToBillions: boolean): Array<{ date: number; value: number }> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const data: Array<{ date: number; value: number }> = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [dateStr, valueStr] = line.split(',');
        const date = new Date(dateStr).getTime();
        let value = parseFloat(valueStr);

        // Convert millions to billions if needed
        if (convertToBillions) {
            value = value / 1000;
        }

        if (!isNaN(date) && !isNaN(value)) {
            data.push({ date, value });
        }
    }

    return data;
}

async function importEconomicData() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        for (const series of SERIES_TO_IMPORT) {
            console.log(`\nProcessing ${series.displayName}...`);

            const filePath = path.join(process.cwd(), 'data', 'economic', series.filename);

            if (!fs.existsSync(filePath)) {
                console.log(`  ⚠️  File not found: ${filePath}`);
                continue;
            }

            // Parse CSV
            const data = parseCSV(filePath, series.convertToBillions);
            console.log(`  Found ${data.length} data points`);

            // Delete existing data for this series
            db.prepare(`
                DELETE FROM time_series 
                WHERE asset_class = 'economic' 
                  AND series_name = ?
            `).run(series.seriesName);

            // Insert new data
            const insert = db.prepare(`
                INSERT INTO time_series (asset_class, series_name, column_name, date, value)
                VALUES ('economic', ?, 'Value', ?, ?)
            `);

            const insertMany = db.transaction((seriesName: string, dataPoints: Array<{ date: number; value: number }>) => {
                for (const point of dataPoints) {
                    insert.run(seriesName, point.date, point.value);
                }
            });

            insertMany(series.seriesName, data);
            console.log(`  ✅ Inserted ${data.length} points for ${series.seriesName}`);

            if (series.convertToBillions) {
                console.log(`  💰 Converted from millions to billions`);
            }
        }

        console.log('\n✅ Successfully imported all economic data!');
    } catch (error) {
        console.error('Error importing economic data:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
importEconomicData().catch(console.error);
