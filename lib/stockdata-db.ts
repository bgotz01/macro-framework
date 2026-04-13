import { Pool } from 'pg';

// Separate connection pool for the stockdata database.
// Set STOCKDATA_DATABASE_URL in .env to enable — routes will return empty
// data gracefully when this is not configured.

let pool: Pool | null = null;

export function getStockdataPool(): Pool | null {
    if (!process.env.STOCKDATA_DATABASE_URL) return null;
    if (!pool) {
        pool = new Pool({ connectionString: process.env.STOCKDATA_DATABASE_URL });
    }
    return pool;
}
