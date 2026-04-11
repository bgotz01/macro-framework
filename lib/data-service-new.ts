// Server-side data service using Postgres via Prisma
import { dbService, SeriesInfo } from './db-service';

export interface DataPoint {
    date: number | string;  // timestamp or ISO string
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

export class DataServiceNew {
    // Get available datasets by asset class
    static async getDatasetsByAssetClass(assetClass: string): Promise<SeriesInfo[]> {
        return dbService.getSeriesByAssetClass(assetClass);
    }

    // Load a single dataset
    static async loadCSV(filePath: string, columns?: string[]): Promise<ChartData> {
        // Split path: bonds/US/US-10yr.csv -> assetClass=bonds, seriesName=US/US-10yr
        const parts = filePath.split('/');
        const assetClass = parts[0];
        const seriesName = parts.slice(1).join('/').replace('.csv', '');

        const data = await dbService.loadSeries(assetClass, seriesName, columns);

        // Dates are already ISO strings in the database, no conversion needed
        return data;
    }

    // Load multiple datasets
    static async loadMultipleCSVs(filePaths: string[]): Promise<ChartData[]> {
        const promises = filePaths.map(path => this.loadCSV(path));
        return Promise.all(promises);
    }

    // Combine multiple datasets
    static combineDatasets(datasets: ChartData[], dateColumn = 'Date'): ChartData {
        if (datasets.length === 0) {
            throw new Error('No datasets provided');
        }

        if (datasets.length === 1) {
            return datasets[0];
        }

        // Create a map of dates to combined data points
        const dateMap = new Map<string, DataPoint>();
        const allColumns = new Set<string>();

        datasets.forEach((dataset) => {
            const prefix = dataset.metadata.filename;

            dataset.data.forEach(row => {
                const dateKey = String(row[dateColumn] || row.date);
                if (!dateKey) return;

                if (!dateMap.has(dateKey)) {
                    dateMap.set(dateKey, { date: dateKey, [dateColumn]: dateKey });
                }

                const combinedRow = dateMap.get(dateKey)!;

                // Add all numeric columns with prefixes to avoid conflicts
                Object.keys(row).forEach(key => {
                    if (key !== dateColumn && key !== 'date' && typeof row[key] === 'number') {
                        const newKey = datasets.length > 1 ? `${prefix}_${key}` : key;
                        combinedRow[newKey] = row[key];
                        allColumns.add(newKey);
                    }
                });
            });
        });

        // Convert map back to array and sort by date
        const combinedData = Array.from(dateMap.values()).sort((a, b) => {
            const dateA = new Date(a[dateColumn] as string);
            const dateB = new Date(b[dateColumn] as string);
            return dateA.getTime() - dateB.getTime();
        });

        return {
            data: combinedData,
            columns: [dateColumn, ...Array.from(allColumns)],
            metadata: {
                title: `Combined ${datasets.map(d => d.metadata.title).join(', ')}`,
                category: 'combined',
                filename: 'combined'
            }
        };
    }

    // Get available datasets (for compatibility)
    static async getAvailableDatasets(): Promise<{ category: string; files: SeriesInfo[] }[]> {
        const assetClasses = ['bonds', 'fx', 'equities', 'macro', 'moneysupply'];

        return Promise.all(
            assetClasses.map(async (category) => ({
                category,
                files: await this.getDatasetsByAssetClass(category)
            }))
        );
    }
}
