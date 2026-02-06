import Database from 'better-sqlite3';
import path from 'path';

export interface DataPoint {
    date: number;  // Unix timestamp
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
}

class DatabaseService {
    private db: Database.Database | null = null;
    private dbPath: string;

    constructor() {
        this.dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    }

    private getDB(): Database.Database {
        if (!this.db) {
            this.db = new Database(this.dbPath, { readonly: true });
        }
        return this.db;
    }

    // Get all available series for an asset class
    getSeriesByAssetClass(assetClass: string): SeriesInfo[] {
        const db = this.getDB();

        const query = `
            SELECT DISTINCT 
                ts.asset_class,
                ts.series_name,
                ts.column_name,
                COALESCE(sm.display_name, ts.series_name) as display_name
            FROM time_series ts
            LEFT JOIN series_metadata sm 
                ON ts.asset_class = sm.asset_class 
                AND ts.series_name = sm.series_name
            WHERE ts.asset_class = ?
            ORDER BY ts.series_name, ts.column_name
        `;

        const rows = db.prepare(query).all(assetClass) as any[];

        // Group by series_name
        const seriesMap = new Map<string, SeriesInfo>();

        for (const row of rows) {
            if (!seriesMap.has(row.series_name)) {
                seriesMap.set(row.series_name, {
                    asset_class: row.asset_class,
                    series_name: row.series_name,
                    display_name: row.display_name,
                    columns: []
                });
            }
            seriesMap.get(row.series_name)!.columns.push(row.column_name);
        }

        return Array.from(seriesMap.values());
    }

    // Load data for a specific series
    loadSeries(assetClass: string, seriesName: string, columns?: string[]): ChartData {
        const db = this.getDB();

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

        const rows = db.prepare(query).all(...params) as any[];

        // Transform to chart format
        const dataMap = new Map<number, DataPoint>();
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
        const dateMap = new Map<number, DataPoint>();
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

        const combinedData = Array.from(dateMap.values()).sort((a, b) => a.date - b.date);

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
    getDateRange(assetClass: string, seriesName: string): { min: number; max: number } | null {
        const db = this.getDB();

        const query = `
            SELECT MIN(date) as min, MAX(date) as max
            FROM time_series
            WHERE asset_class = ? AND series_name = ?
        `;

        const result = db.prepare(query).get(assetClass, seriesName) as any;

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
