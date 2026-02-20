#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

/**
 * This script removes duplicate monthly data points.
 * For each month, we keep only the END of month date and remove the START of month date.
 * This fixes the issue where FRED data (start of month) and preprocessed data (end of month)
 * both get imported, creating duplicates.
 */

async function deduplicateMonthlyData() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('🔄 Deduplicating monthly data...\n');

        // Get all series that have monthly data with duplicates
        const series = [
            { asset_class: 'economic', series_name: 'CPI' },
            { asset_class: 'economic', series_name: 'CPINominal' },
            { asset_class: 'economic', series_name: 'US/FEDFUNDS' },
        ];

        for (const s of series) {
            console.log(`Processing ${s.asset_class}/${s.series_name}...`);

            // For each month, find duplicates and keep only the end-of-month date
            const query = `
                WITH monthly_data AS (
                    SELECT 
                        date,
                        column_name,
                        value,
                        strftime('%Y-%m', datetime(date/1000, 'unixepoch')) as year_month,
                        strftime('%d', datetime(date/1000, 'unixepoch')) as day_of_month
                    FROM time_series
                    WHERE asset_class = ?
                      AND series_name = ?
                      AND column_name = 'Value'
                ),
                duplicates AS (
                    SELECT 
                        year_month,
                        COUNT(*) as count,
                        MIN(date) as start_of_month_date,
                        MAX(date) as end_of_month_date
                    FROM monthly_data
                    GROUP BY year_month
                    HAVING COUNT(*) > 1
                )
                SELECT 
                    d.year_month,
                    d.start_of_month_date,
                    d.end_of_month_date,
                    datetime(d.start_of_month_date/1000, 'unixepoch') as start_date_str,
                    datetime(d.end_of_month_date/1000, 'unixepoch') as end_date_str
                FROM duplicates d
                ORDER BY d.year_month DESC
                LIMIT 10
            `;

            const duplicates = db.prepare(query).all(s.asset_class, s.series_name) as any[];

            if (duplicates.length === 0) {
                console.log(`  ✅ No duplicates found\n`);
                continue;
            }

            console.log(`  Found ${duplicates.length} months with duplicates (showing first 10)`);
            console.log(`  Example: ${duplicates[0].year_month} has both ${duplicates[0].start_date_str} and ${duplicates[0].end_date_str}`);

            // Delete all start-of-month dates where an end-of-month date exists
            const deleteQuery = `
                DELETE FROM time_series
                WHERE asset_class = ?
                  AND series_name = ?
                  AND column_name = 'Value'
                  AND date IN (
                      SELECT MIN(date)
                      FROM time_series
                      WHERE asset_class = ?
                        AND series_name = ?
                        AND column_name = 'Value'
                      GROUP BY strftime('%Y-%m', datetime(date/1000, 'unixepoch'))
                      HAVING COUNT(*) > 1
                  )
            `;

            const result = db.prepare(deleteQuery).run(
                s.asset_class,
                s.series_name,
                s.asset_class,
                s.series_name
            );

            console.log(`  ✅ Removed ${result.changes} duplicate start-of-month entries\n`);
        }

        console.log('✅ Deduplication complete!');
        console.log('\n⚠️  Remember to recalculate percentiles after this:');
        console.log('   npm run calculate-percentiles');

    } catch (error) {
        console.error('Error deduplicating data:', error);
        throw error;
    } finally {
        db.close();
    }
}

deduplicateMonthlyData();
