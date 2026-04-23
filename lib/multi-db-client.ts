/**
 * Multi-database client for importing data to multiple databases simultaneously
 * Supports: SQLite, macro-framework (Postgres), and stockdata (Postgres)
 */
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';

export interface MultiDbClient {
    sqlite: Database.Database | null;
    macroFramework: PrismaClient | null;
    stockData: PrismaClient | null;
}

export interface DbConfig {
    useSqlite?: boolean;
    useMacroFramework?: boolean;
    useStockData?: boolean;
}

/**
 * Create clients for multiple databases based on configuration
 */
export function createMultiDbClient(config: DbConfig = {}): MultiDbClient {
    const {
        useSqlite = false,
        useMacroFramework = true,
        useStockData = false,
    } = config;

    const clients: MultiDbClient = {
        sqlite: null,
        macroFramework: null,
        stockData: null,
    };

    // SQLite client
    if (useSqlite) {
        const sqlitePath = process.env.SQLITE_DATABASE_PATH || path.join(process.cwd(), 'data', 'macro-data.db');
        try {
            clients.sqlite = new Database(sqlitePath);
            console.log('✓ Connected to SQLite database');
        } catch (err) {
            console.error('❌ Failed to connect to SQLite:', err);
        }
    }

    // Macro-framework Postgres client
    if (useMacroFramework) {
        const macroUrl = process.env.MACRO_DATABASE_URL || process.env.DATABASE_URL;
        if (macroUrl) {
            try {
                clients.macroFramework = new PrismaClient({
                    datasources: { db: { url: macroUrl } },
                });
                console.log('✓ Connected to macro-framework database');
            } catch (err) {
                console.error('❌ Failed to connect to macro-framework:', err);
            }
        }
    }

    // StockData Postgres client
    if (useStockData) {
        const stockDataUrl = process.env.STOCKDATA_DATABASE_URL;
        if (stockDataUrl) {
            try {
                clients.stockData = new PrismaClient({
                    datasources: { db: { url: stockDataUrl } },
                });
                console.log('✓ Connected to stockdata database');
            } catch (err) {
                console.error('❌ Failed to connect to stockdata:', err);
            }
        } else {
            console.warn('⚠️  STOCKDATA_DATABASE_URL not configured');
        }
    }

    return clients;
}

/**
 * Disconnect all database clients
 */
export async function disconnectMultiDb(clients: MultiDbClient): Promise<void> {
    const promises: Promise<void>[] = [];

    if (clients.sqlite) {
        try {
            clients.sqlite.close();
            console.log('✓ Disconnected from SQLite');
        } catch (err) {
            console.error('❌ Error disconnecting SQLite:', err);
        }
    }

    if (clients.macroFramework) {
        promises.push(
            clients.macroFramework.$disconnect()
                .then(() => console.log('✓ Disconnected from macro-framework'))
                .catch(err => console.error('❌ Error disconnecting macro-framework:', err))
        );
    }

    if (clients.stockData) {
        promises.push(
            clients.stockData.$disconnect()
                .then(() => console.log('✓ Disconnected from stockdata'))
                .catch(err => console.error('❌ Error disconnecting stockdata:', err))
        );
    }

    await Promise.all(promises);
}

/**
 * Check which databases are available/configured
 */
export function getAvailableDatabases(): string[] {
    const available: string[] = [];

    const sqlitePath = process.env.SQLITE_DATABASE_PATH || path.join(process.cwd(), 'data', 'macro-data.db');
    const fs = require('fs');
    if (fs.existsSync(sqlitePath)) {
        available.push('sqlite');
    }

    if (process.env.MACRO_DATABASE_URL || process.env.DATABASE_URL) {
        available.push('macro-framework');
    }

    if (process.env.STOCKDATA_DATABASE_URL) {
        available.push('stockdata');
    }

    return available;
}
