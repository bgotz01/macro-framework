import Papa from 'papaparse';

export interface DataPoint {
    date?: string;
    value?: number;
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

export class DataService {
    private static cache = new Map<string, ChartData>();

    static async loadCSV(filePath: string): Promise<ChartData> {
        // Check cache first
        if (this.cache.has(filePath)) {
            return this.cache.get(filePath)!;
        }

        try {
            const response = await fetch(`/data/${filePath}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
            }

            const csvText = await response.text();

            const result = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                transformHeader: (header: string) => header.trim(),
            });

            if (result.errors.length > 0) {
                console.warn(`CSV parsing warnings for ${filePath}:`, result.errors);
            }

            const data = result.data as DataPoint[];
            const columns = result.meta.fields || [];

            // Extract metadata from file path
            const pathParts = filePath.split('/');
            const filename = pathParts[pathParts.length - 1].replace('.csv', '');
            const category = pathParts[pathParts.length - 2] || 'data';

            const chartData: ChartData = {
                data: this.processData(data, columns),
                columns,
                metadata: {
                    title: this.formatTitle(filename),
                    category: this.formatTitle(category),
                    filename,
                },
            };

            // Cache the result
            this.cache.set(filePath, chartData);

            return chartData;
        } catch (error) {
            console.error(`Error loading CSV ${filePath}:`, error);
            throw error;
        }
    }

    private static processData(data: DataPoint[], columns: string[]): DataPoint[] {
        return data.map((row, index) => {
            const processedRow: DataPoint = { ...row };

            // Try to identify and parse date columns
            for (const col of columns) {
                const value = row[col];
                if (typeof value === 'string') {
                    // Check if it looks like a date
                    if (this.isDateString(value)) {
                        processedRow[col] = value;
                        // Also create a standardized date field
                        if (col.toLowerCase().includes('date')) {
                            processedRow.date = value;
                        }
                    }
                }

                // Ensure numeric values are properly typed
                if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
                    processedRow[col] = Number(value);
                }
            }

            return processedRow;
        });
    }

    private static isDateString(value: string): boolean {
        // Simple date detection - can be enhanced
        const datePatterns = [
            /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
            /^\d{4}-\d{2}$/,        // YYYY-MM
        ];

        return datePatterns.some(pattern => pattern.test(value.trim()));
    }

    private static formatTitle(str: string): string {
        return str
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    static async getAvailableDatasets(): Promise<{ category: string; files: string[] }[]> {
        // This would ideally come from an API endpoint that scans the data directory
        // For now, we'll return a comprehensive list for macro data
        return [
            {
                category: 'bonds',
                files: [
                    'USmacro.csv',
                    'us-yields.csv',
                    'germany-yields.csv',
                    'japan-yields.csv',
                    'uk-yields.csv'
                ]
            },
            {
                category: 'fx',
                files: [
                    'major-pairs.csv',
                    'emerging-markets.csv',
                    'cross-rates.csv'
                ]
            },
            {
                category: 'equities',
                files: [
                    'SP500.csv',
                    'DJI.csv',
                    'ShillerPE.csv',
                    'us-indexes.csv',
                    'international.csv',
                    'sectors.csv'
                ]
            },
            {
                category: 'macro',
                files: [
                    'CPI.csv',
                    'MarginDebt.csv',
                    'inflation.csv',
                    'employment.csv',
                    'gdp.csv'
                ]
            },
            {
                category: 'moneysupply',
                files: [
                    'USmoney.csv',
                    'Euromoney.csv',
                    'Japanmoney.csv',
                    'UKmoney.csv'
                ]
            }
        ];
    }

    // New method for getting datasets by asset class
    static async getDatasetsByAssetClass(assetClass: string): Promise<string[]> {
        const datasets = await this.getAvailableDatasets();
        const category = datasets.find(d => d.category === assetClass);
        return category ? category.files : [];
    }

    // Method to load multiple related datasets (e.g., all bond yields)
    static async loadMultipleCSVs(filePaths: string[]): Promise<ChartData[]> {
        const promises = filePaths.map(path => this.loadCSV(path));
        return Promise.all(promises);
    }

    // Method to combine multiple datasets into one chart
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

        datasets.forEach((dataset, index) => {
            const prefix = dataset.metadata.filename;

            dataset.data.forEach(row => {
                const dateKey = row[dateColumn] || row.date;
                if (!dateKey) return;

                const dateStr = String(dateKey);

                if (!dateMap.has(dateStr)) {
                    dateMap.set(dateStr, { [dateColumn]: dateStr });
                }

                const combinedRow = dateMap.get(dateStr)!;

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
}