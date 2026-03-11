#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

/**
 * Calculate Year-over-Year percentile changes
 * For each data point, calculate the change in percentile rank compared to 12 months ago
 */

async function calculateYoYPercentileChange() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath);

    try {
        console.log('📊 Calculating Year-over-Year Percentile Changes...\n');

        // Add yoy_percentile_change column if it doesn't exist
        console.log('Adding yoy_percentile_change column...');
        try {
            db.exec(`
                ALTER TABLE percentile_analysis 
                ADD COLUMN yoy_percentile_change REAL
            `);
            console.log('✅ Column added\n');
        } catch (error: any) {
            if (error.message.includes('duplicate column name')) {
                console.log('✅ Column already exists\n');
            } else {
                throw error;
            }
        }

        // Get all unique series
        const seriesQuery = `
            SELECT DISTINCT asset_class, series_name
            FROM percentile_analysis
            ORDER BY asset_class, series_name
        `;
        const series = db.prepare(seriesQuery).all() as Array<{ asset_class: string; series_name: string }>;

        console.log(`Found ${series.length} series to process\n`);

        let totalUpdated = 0;

        for (const s of series) {
            console.log(`Processing ${s.asset_class}/${s.series_name}...`);

            // Get all records for this series
            type PercentileRecord = { id: number; date: string; percentile_rank: number };

            const records = db.prepare(`
                SELECT id, date, percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ?
                  AND series_name = ?
                ORDER BY date ASC
            `).all(s.asset_class, s.series_name) as PercentileRecord[];

            // Calculate YoY change for each record
            const updateStmt = db.prepare(`
                UPDATE percentile_analysis
                SET yoy_percentile_change = ?
                WHERE id = ?
            `);

            const updates = db.transaction((recordsToProcess: PercentileRecord[]) => {
                let updated = 0;
                for (let i = 0; i < recordsToProcess.length; i++) {
                    const current = recordsToProcess[i];

                    // Skip if date is not in YYYY-MM-DD format
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(current.date)) {
                        continue;
                    }

                    // Calculate date 12 months ago
                    const currentDate = new Date(current.date);

                    // Skip if invalid date
                    if (isNaN(currentDate.getTime())) {
                        continue;
                    }

                    const targetDate = new Date(currentDate);
                    targetDate.setFullYear(targetDate.getFullYear() - 1);

                    // Format as YYYY-MM-DD
                    const targetDateStr = targetDate.toISOString().split('T')[0];

                    // Find record within ±15 days of target date
                    const minDate = new Date(targetDate);
                    minDate.setDate(minDate.getDate() - 15);
                    const maxDate = new Date(targetDate);
                    maxDate.setDate(maxDate.getDate() + 15);

                    const minDateStr = minDate.toISOString().split('T')[0];
                    const maxDateStr = maxDate.toISOString().split('T')[0];

                    // Find closest record within the range
                    let closestRecord = null;
                    let minDiff = Infinity;

                    for (const prev of recordsToProcess) {
                        if (prev.date >= minDateStr && prev.date <= maxDateStr) {
                            const prevDate = new Date(prev.date);
                            if (isNaN(prevDate.getTime())) continue;

                            const diff = Math.abs(prevDate.getTime() - targetDate.getTime());
                            if (diff < minDiff) {
                                minDiff = diff;
                                closestRecord = prev;
                            }
                        }
                    }

                    if (closestRecord) {
                        const yoyChange = current.percentile_rank - closestRecord.percentile_rank;
                        updateStmt.run(yoyChange, current.id);
                        updated++;
                    }
                }
                return updated;
            });

            const updatedCount = updates(records);
            totalUpdated += updatedCount;

            console.log(`  ✅ Updated ${updatedCount} records\n`);
        }

        console.log(`\n✅ Successfully calculated YoY percentile changes for ${totalUpdated} records!`);
        console.log('\n📝 Summary:');
        console.log(`   - Total series processed: ${series.length}`);
        console.log(`   - Total records updated: ${totalUpdated}`);
        console.log('\n💡 The yoy_percentile_change column now contains:');
        console.log('   - Positive values: percentile increased (moved higher in distribution)');
        console.log('   - Negative values: percentile decreased (moved lower in distribution)');
        console.log('   - NULL: no data available 12 months ago');

        // Show some examples
        console.log('\n📊 Example YoY Changes (CPI, most recent):');
        const examples = db.prepare(`
            SELECT 
                date,
                value,
                percentile_rank,
                yoy_percentile_change,
                CASE 
                    WHEN yoy_percentile_change > 0 THEN '↑ Rising'
                    WHEN yoy_percentile_change < 0 THEN '↓ Falling'
                    ELSE '→ Stable'
                END as trend
            FROM percentile_analysis
            WHERE asset_class = 'economic'
              AND series_name = 'CPI'
              AND yoy_percentile_change IS NOT NULL
            ORDER BY date DESC
            LIMIT 10
        `).all() as any[];

        console.log('\n   Date         | Value | Percentile | YoY Change | Trend');
        console.log('   ' + '-'.repeat(70));
        for (const row of examples) {
            const dateStr = row.date;
            const value = row.value.toFixed(2).padStart(5);
            const percentile = row.percentile_rank.toFixed(1).padStart(5);
            const yoyChange = row.yoy_percentile_change.toFixed(1).padStart(6);
            console.log(`   ${dateStr} | ${value}% | ${percentile}th | ${yoyChange} pts | ${row.trend}`);
        }

    } catch (error) {
        console.error('Error calculating YoY percentile changes:', error);
        throw error;
    } finally {
        db.close();
    }
}

calculateYoYPercentileChange();
