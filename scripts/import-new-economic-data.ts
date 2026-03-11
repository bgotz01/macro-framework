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
    },
    {
        filename: 'WRMFNS.csv',
        seriesName: 'Retail-Money-Market-Funds',
        displayName: 'Retail Money Market Funds',
        units: 'Billions',
        convertToBillions: false
    },
    {
        filename: 'MMMFFAQ027S.csv',
        seriesName: 'Money-Market-Funds-Total',
        displayName: 'Money Market Funds: Total Financial Assets',
        units: 'Billions',
        convertToBillions: false
    },
    {
        filename: 'W006RC1Q027SBEA.csv',
        seriesName: 'W006RC1Q027SBEA',
        displayName: 'Federal Tax Receipts',
        units: 'billions',
        convertToBillions: false
    },
    {
        filename: 'FDHBFIN.csv',
        seriesName: 'FDHBFIN',
        displayName: 'Federal Debt Held by Foreign Investors',
        units: 'billions',
        convertToBillions: false
    },
    {
        filename: 'US/M2SL.csv',
        seriesName: 'M2SL',
        displayName: 'M2 Money Supply',
        units: 'billions',
        convertToBillions: false
    }
];

function parseCSV(filePath: string, convertToBillions: boolean): Array<{ date: string; value: number }> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const data: Array<{ date: string; value: number }> = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [dateStr, valueStr] = line.split(',');
        const date = new Date(dateStr).toISOString().split('T')[0]; // Store as ISO string YYYY-MM-DD
        let value = parseFloat(valueStr);

        // Convert millions to billions if needed
        if (convertToBillions) {
            value = value / 1000;
        }

        if (date && !isNaN(value)) {
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

            // Get the latest date already in the database for this series
            const latestRow = db.prepare(`
                SELECT MAX(date) as max_date 
                FROM time_series 
                WHERE asset_class = 'economic' 
                  AND series_name = ?
            `).get(series.seriesName) as { max_date: string | null };

            const latestDate = latestRow?.max_date || '1900-01-01';
            console.log(`  Latest date in DB: ${latestDate}`);

            // Filter to only new data points
            const newData = data.filter(point => point.date > latestDate);

            if (newData.length === 0) {
                console.log(`  ✓ No new data to import`);
                continue;
            }

            console.log(`  Found ${newData.length} new data points to import`);

            // Insert new data only
            const insert = db.prepare(`
                INSERT INTO time_series (asset_class, series_name, column_name, date, value)
                VALUES ('economic', ?, 'Value', ?, ?)
            `);

            const insertMany = db.transaction((seriesName: string, dataPoints: Array<{ date: string; value: number }>) => {
                for (const point of dataPoints) {
                    insert.run(seriesName, point.date, point.value);
                }
            });

            insertMany(series.seriesName, newData);
            console.log(`  ✅ Inserted ${newData.length} new points for ${series.seriesName}`);

            // Insert or update metadata
            const existingMetadata = db.prepare(`
                SELECT * FROM series_metadata 
                WHERE asset_class = 'economic' 
                  AND series_name = ?
            `).get(series.seriesName);

            if (!existingMetadata) {
                db.prepare(`
                    INSERT INTO series_metadata (asset_class, series_name, display_name, units, last_updated)
                    VALUES ('economic', ?, ?, ?, ?)
                `).run(series.seriesName, series.displayName, series.units, Date.now());
                console.log(`  📝 Added metadata for ${series.seriesName}`);
            } else {
                db.prepare(`
                    UPDATE series_metadata 
                    SET last_updated = ?
                    WHERE asset_class = 'economic' 
                      AND series_name = ?
                `).run(Date.now(), series.seriesName);
            }

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
