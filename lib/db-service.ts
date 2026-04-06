import Database from 'better-sqlite3';
import path from 'path';

export interface DataPoint {
    date: string;  // ISO date string (YYYY-MM-DD)
    [key: string]: any;
}

export interface ChartData {
    data: DataPoint[];
    columns: string[];
    metadata: {
        title: string;
        category: string;
        filename: string;
    };
}

export interface SeriesInfo {
    asset_class: string;
    series_name: string;
    display_name: string;
    columns: string[];
    units?: string;
    geography?: string;
    currency?: string;
}

class DatabaseService {
    private db: Database.Database | null = null;
    private dbPath: string;
    private seriesCache = new Map<string, SeriesInfo[]>();
    private preparedStatements = new Map<string, Database.Statement>();

    constructor() {
        this.dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    }

    private getDB(): Database.Database {
        if (!this.db) {
            this.db = new Database(this.dbPath, { readonly: true });
            // Enable WAL mode for better read performance
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('cache_size = -64000'); // 64MB cache
        }
        return this.db;
    }

    private prepare(sql: string): Database.Statement {
        if (!this.preparedStatements.has(sql)) {
            this.preparedStatements.set(sql, this.getDB().prepare(sql));
        }
        return this.preparedStatements.get(sql)!;
    }

    // Get all available series for an asset class
    getSeriesByAssetClass(assetClass: string): SeriesInfo[] {
        if (this.seriesCache.has(assetClass)) {
            return this.seriesCache.get(assetClass)!;
        }

        const db = this.getDB();

        const query = `
            SELECT 
                asset_class,
                series_name,
                COALESCE(display_name, series_name) as display_name,
                units,
                geography,
                currency
            FROM series_metadata
            WHERE asset_class = ?
            ORDER BY display_name
        `;

        const rows = this.prepare(query).all(assetClass) as any[];

        const result = rows.map(row => ({
            asset_class: row.asset_class,
            series_name: row.series_name,
            display_name: row.display_name,
            columns: ['Value'],
            units: row.units,
            geography: row.geography,
            currency: row.currency
        }));

        this.seriesCache.set(assetClass, result);
        return result;
    }

    // Load data for a specific series
    loadSeries(assetClass: string, seriesName: string, columns?: string[]): ChartData {
        let query = `
            SELECT date, column_name, value
            FROM time_series
            WHERE asset_class = ? AND series_name = ?
        `;

        const params: any[] = [assetClass, seriesName];

        if (columns && columns.length > 0) {
            query += ` AND column_name IN (${columns.map(() => '?').join(',')})`;
            params.push(...columns);
        }

        query += ` ORDER BY date ASC`;

        const rows = this.prepare(query).all(...params) as any[];

        // Transform to chart format
        const dataMap = new Map<string, DataPoint>();
        const columnSet = new Set<string>();

        for (const row of rows) {
            if (!dataMap.has(row.date)) {
                dataMap.set(row.date, { date: row.date });
            }
            dataMap.get(row.date)![row.column_name] = row.value;
            columnSet.add(row.column_name);
        }

        return {
            data: Array.from(dataMap.values()),
            columns: ['date', ...Array.from(columnSet)],
            metadata: {
                title: seriesName.replace(/[-_]/g, ' '),
                category: assetClass,
                filename: seriesName
            }
        };
    }

    // Load multiple series and combine them
    loadMultipleSeries(requests: Array<{ assetClass: string; seriesName: string; columns?: string[] }>): ChartData {
        const datasets = requests.map(req =>
            this.loadSeries(req.assetClass, req.seriesName, req.columns)
        );

        if (datasets.length === 1) {
            return datasets[0];
        }

        // Combine datasets
        const dateMap = new Map<string, DataPoint>();
        const allColumns = new Set<string>();

        for (const dataset of datasets) {
            const prefix = dataset.metadata.filename;

            for (const row of dataset.data) {
                if (!dateMap.has(row.date)) {
                    dateMap.set(row.date, { date: row.date });
                }

                const combinedRow = dateMap.get(row.date)!;

                for (const [key, value] of Object.entries(row)) {
                    if (key === 'date') continue;
                    const newKey = datasets.length > 1 ? `${prefix}_${key}` : key;
                    combinedRow[newKey] = value;
                    allColumns.add(newKey);
                }
            }
        }

        const combinedData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        return {
            data: combinedData,
            columns: ['date', ...Array.from(allColumns)],
            metadata: {
                title: `Combined ${datasets.map(d => d.metadata.title).join(', ')}`,
                category: 'combined',
                filename: 'combined'
            }
        };
    }

    // Get date range for a series
    getDateRange(assetClass: string, seriesName: string): { min: string; max: string } | null {
        const query = `
            SELECT MIN(date) as min, MAX(date) as max
            FROM time_series
            WHERE asset_class = ? AND series_name = ?
        `;

        const result = this.prepare(query).get(assetClass, seriesName) as any;

        if (!result || !result.min) {
            return null;
        }

        return { min: result.min, max: result.max };
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

export const dbService = new DatabaseService();
