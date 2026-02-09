import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

// Series to convert from millions to billions
const seriesToConvert = [
    'CMDEBT',      // Household Debt
    'BCNSDODNS',   // Corporate Debt
    'GFDEBTN',     // Total Public Debt
    'FYGFD'        // Gross Federal Debt
];

console.log('Converting series from millions to billions...\n');

db.exec('BEGIN TRANSACTION');

try {
    for (const seriesName of seriesToConvert) {
        console.log(`Converting ${seriesName}...`);

        // Get count before
        const countBefore = db.prepare(
            'SELECT COUNT(*) as count FROM time_series WHERE series_name = ?'
        ).get(seriesName) as { count: number };

        // Update all values by dividing by 1000
        const result = db.prepare(`
            UPDATE time_series 
            SET value = value / 1000.0
            WHERE series_name = ?
        `).run(seriesName);

        console.log(`  Updated ${result.changes} rows`);

        // Update metadata to billions
        db.prepare(`
            UPDATE series_metadata
            SET units = 'billions'
            WHERE series_name = ?
        `).run(seriesName);

        // Show sample of new values
        const sample = db.prepare(`
            SELECT date, value 
            FROM time_series 
            WHERE series_name = ? AND column_name = 'Value'
            ORDER BY date DESC 
            LIMIT 3
        `).all(seriesName) as Array<{ date: number; value: number }>;

        console.log('  Sample values after conversion:');
        sample.forEach(row => {
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            console.log(`    ${dateStr}: ${row.value.toFixed(2)}B`);
        });
        console.log();
    }

    db.exec('COMMIT');
    console.log('✓ Conversion completed successfully!');

} catch (error) {
    db.exec('ROLLBACK');
    console.error('Error during conversion:', error);
    throw error;
} finally {
    db.close();
}
