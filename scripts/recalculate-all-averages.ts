#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'macro-data.db');

console.log('🗑️  Deleting all existing MA3, MA6, and MA12 values...\n');

const db = new Database(DB_PATH);

try {
    const deleteStmt = db.prepare(`
        DELETE FROM time_series 
        WHERE column_name IN ('MA3', 'MA6', 'MA12')
    `);

    const result = deleteStmt.run();
    console.log(`✓ Deleted ${result.changes} moving average rows\n`);

    console.log('Now run:');
    console.log('  pnpm calc-averages');
    console.log('  pnpm calc-monthly-averages');

} catch (error) {
    console.error('❌ Error:', error);
    throw error;
} finally {
    db.close();
}
