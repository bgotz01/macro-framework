#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
const db = new Database(dbPath);

console.log('🔄 Migrating Shiller P/E from economic to valuations...\n');

try {
    // Start transaction
    db.exec('BEGIN TRANSACTION');

    // Update time_series table
    const updateTimeSeries = db.prepare(`
        UPDATE time_series 
        SET asset_class = 'valuations' 
        WHERE asset_class = 'economic' 
        AND series_name = 'Shiller-PE'
    `);
    const timeSeriesResult = updateTimeSeries.run();
    console.log(`✓ Updated ${timeSeriesResult.changes} rows in time_series table`);

    // Update series_metadata table
    const updateMetadata = db.prepare(`
        UPDATE series_metadata 
        SET asset_class = 'valuations' 
        WHERE asset_class = 'economic' 
        AND series_name = 'Shiller-PE'
    `);
    const metadataResult = updateMetadata.run();
    console.log(`✓ Updated ${metadataResult.changes} rows in series_metadata table`);

    // Commit transaction
    db.exec('COMMIT');

    console.log('\n✅ Migration complete!');
    console.log('   Shiller-PE is now in the valuations category\n');

} catch (error) {
    db.exec('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}
