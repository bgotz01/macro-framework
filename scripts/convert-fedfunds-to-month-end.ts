import Database from 'better-sqlite3';
import path from 'path';

function convertFedFundsToMonthEnd() {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { timeout: 10000 });
    db.pragma('journal_mode = WAL');

    try {
        console.log('📊 Converting Fed Funds dates to month-end...\n');

        // Get all Fed Funds data
        const query = `
            SELECT id, date, value
            FROM time_series
            WHERE asset_class = 'economic'
              AND series_name = 'US/FEDFUNDS'
              AND column_name = 'Value'
            ORDER BY date ASC
        `;

        const records = db.prepare(query).all() as Array<{ id: number; date: number; value: number }>;
        console.log(`Found ${records.length} Fed Funds records`);

        if (records.length === 0) {
            console.log('No data to convert');
            return;
        }

        // Convert each date to month-end
        const updateStmt = db.prepare(`
            UPDATE time_series
            SET date = ?
            WHERE id = ?
        `);

        const updates = db.transaction((data: Array<{ id: number; date: number; value: number }>) => {
            let updated = 0;
            for (const row of data) {
                const currentDate = new Date(row.date);

                // Get the last day of the month
                const year = currentDate.getUTCFullYear();
                const month = currentDate.getUTCMonth();
                const lastDay = new Date(Date.UTC(year, month + 1, 0)); // Day 0 of next month = last day of current month

                const monthEndTimestamp = lastDay.getTime();

                // Only update if the date changed
                if (monthEndTimestamp !== row.date) {
                    updateStmt.run(monthEndTimestamp, row.id);
                    updated++;
                }
            }
            return updated;
        });

        const updatedCount = updates(records);
        console.log(`✅ Updated ${updatedCount} records to month-end dates\n`);

        // Show sample data
        console.log('Sample data (latest 5 records):');
        const samples = db.prepare(`
            SELECT date, value
            FROM time_series
            WHERE asset_class = 'economic'
              AND series_name = 'US/FEDFUNDS'
              AND column_name = 'Value'
            ORDER BY date DESC
            LIMIT 5
        `).all() as Array<{ date: number; value: number }>;

        samples.reverse().forEach(row => {
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            console.log(`  ${dateStr}: ${row.value.toFixed(2)}%`);
        });

        console.log('\n✅ Fed Funds dates converted to month-end!');

    } catch (error) {
        console.error('❌ Error converting dates:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the script
convertFedFundsToMonthEnd();
