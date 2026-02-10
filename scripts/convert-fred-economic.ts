#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const DATA_DIR = path.join(process.cwd(), 'data', 'economic');

interface DataRow {
    [key: string]: any;
}

// List of FRED series to convert
const FRED_SERIES = [
    'GFDEBTN',
    'GFDEGDQ188S',
    'GDP',
    'CMDEBT',
    'BCNSDODNS',
    'A091RC1Q027SBEA',
    'DPI',
    'PCE',
    'FYGFD',
    'FYFSD',
    'FYFSGDA188S',
    'M1SL',
    'M2SL'
];

async function convertFREDData() {
    console.log('🔄 Converting FRED economic data files...\n');

    let convertedCount = 0;
    let skippedCount = 0;

    for (const seriesCode of FRED_SERIES) {
        const inputPath = path.join(DATA_DIR, `${seriesCode}.csv`);

        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  Skipping ${seriesCode} (file not found)`);
            skippedCount++;
            continue;
        }

        try {
            // Read the input file
            const csvContent = fs.readFileSync(inputPath, 'utf-8');
            const result = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            });

            if (result.errors.length > 0) {
                console.error(`  ❌ ${seriesCode}: Error parsing - ${result.errors[0].message}`);
                continue;
            }

            const data = result.data as DataRow[];

            // Check if already in correct format
            const fields = result.meta.fields || [];
            if (fields.includes('Date') && fields.includes('Value')) {
                console.log(`  ✓ ${seriesCode}: Already in correct format (${data.length} rows)`);
                convertedCount++;
                continue;
            }

            // Convert from FRED format (observation_date, SERIESCODE) to (Date, Value)
            const transformedData = data
                .filter(row => {
                    const dateField = row.observation_date || row.DATE || row.date;
                    const valueField = row[seriesCode] || row.value || row.Value;
                    return dateField && valueField !== null && valueField !== undefined && valueField !== '';
                })
                .map(row => {
                    const dateField = row.observation_date || row.DATE || row.date;
                    const valueField = row[seriesCode] || row.value || row.Value;
                    return {
                        Date: dateField,
                        Value: valueField
                    };
                });

            if (transformedData.length === 0) {
                console.log(`  ⚠️  ${seriesCode}: No valid data found`);
                continue;
            }

            // Write the converted file
            const csv = Papa.unparse(transformedData);
            fs.writeFileSync(inputPath, csv);
            console.log(`  ✓ ${seriesCode}: Converted ${transformedData.length} rows`);
            convertedCount++;
        } catch (err) {
            console.error(`  ❌ ${seriesCode}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }

    console.log('\n' + '━'.repeat(50));
    console.log(`✅ Conversion complete!`);
    console.log(`   Converted: ${convertedCount}`);
    if (skippedCount > 0) {
        console.log(`   Skipped: ${skippedCount}`);
    }
    console.log('━'.repeat(50));
}

convertFREDData().catch(console.error);
