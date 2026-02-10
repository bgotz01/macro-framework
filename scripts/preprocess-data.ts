#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_DIR = path.join(process.cwd(), 'data');

interface DataRow {
    [key: string]: any;
}

// Configuration for special processing
const SPECIAL_PROCESSING = {
    'economic/CPIAUCSL.csv': {
        outputs: [
            {
                name: 'CPINominal.csv',
                transform: (data: DataRow[]) => {
                    return data.map(row => ({
                        Date: convertToEndOfMonth(row.observation_date),
                        Value: row.CPIAUCSL
                    }));
                }
            },
            {
                name: 'CPI.csv',
                transform: (data: DataRow[]) => {
                    // Calculate YoY change
                    const yoyData: Array<{ Date: string; Value: number }> = [];

                    for (let i = 12; i < data.length; i++) {
                        const currentRow = data[i];
                        const yearAgoRow = data[i - 12];

                        if (!currentRow || !yearAgoRow) continue;

                        const currentValue = currentRow.CPIAUCSL;
                        const yearAgoValue = yearAgoRow.CPIAUCSL;

                        if (currentValue && yearAgoValue && yearAgoValue !== 0) {
                            const yoyChange = ((currentValue - yearAgoValue) / yearAgoValue) * 100;

                            yoyData.push({
                                Date: convertToEndOfMonth(currentRow.observation_date),
                                Value: parseFloat(yoyChange.toFixed(2))
                            });
                        }
                    }

                    return yoyData;
                }
            }
        ]
    }
};

// Helper function to convert first-of-month dates to end-of-month
function convertToEndOfMonth(dateStr: string): string {
    // FRED uses first-of-month dates (e.g., 2025-12-01 for December 2025)
    // We need to convert to last day of that same month (e.g., 2025-12-31)
    const [year, month, day] = dateStr.split('-').map(Number);

    // Get last day of the same month by going to next month day 0
    const endOfMonth = new Date(year, month, 0); // month is 1-indexed in the string, so this gives us last day of that month
    const endYear = endOfMonth.getFullYear();
    const endMonth = String(endOfMonth.getMonth() + 1).padStart(2, '0');
    const endDay = String(endOfMonth.getDate()).padStart(2, '0');

    return `${endYear}-${endMonth}-${endDay}`;
}

async function preprocessData() {
    console.log('🔄 Preprocessing data files...\n');

    let processedCount = 0;

    for (const [relativePath, config] of Object.entries(SPECIAL_PROCESSING)) {
        const inputPath = path.join(DATA_DIR, relativePath);

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  Skipping ${relativePath} (file not found)`);
            continue;
        }

        console.log(`📁 Processing ${relativePath}...`);

        // Read the input file
        const csvContent = fs.readFileSync(inputPath, 'utf-8');
        const result = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
        });

        if (result.errors.length > 0) {
            console.error(`  ❌ Error parsing: ${result.errors[0].message}`);
            continue;
        }

        const data = result.data as DataRow[];
        console.log(`  ✓ Loaded ${data.length} rows`);

        // Process each output
        for (const output of config.outputs) {
            try {
                const transformedData = output.transform(data);
                const outputPath = path.join(path.dirname(inputPath), output.name);
                const csv = Papa.unparse(transformedData);
                fs.writeFileSync(outputPath, csv);
                console.log(`  ✓ Created ${output.name} (${transformedData.length} rows)`);
                processedCount++;
            } catch (err) {
                console.error(`  ❌ Error creating ${output.name}:`, err instanceof Error ? err.message : 'Unknown error');
            }
        }

        console.log('');
    }

    if (processedCount === 0) {
        console.log('ℹ️  No files needed preprocessing\n');
    } else {
        console.log(`✅ Preprocessed ${processedCount} file(s)\n`);
    }
}

preprocessData().catch(console.error);
