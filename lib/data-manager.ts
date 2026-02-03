import { DataService, ChartData } from './data-service';

export interface DataValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}

export interface DatasetInfo {
    category: string;
    filename: string;
    path: string;
    columns: string[];
    rowCount: number;
    dateRange: {
        start: string | null;
        end: string | null;
    };
    lastUpdated?: Date;
}

export class DataManager {
    /**
     * Validate a CSV dataset for common issues
     */
    static validateDataset(data: ChartData): DataValidationResult {
        const result: DataValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: []
        };

        // Check for empty dataset
        if (!data.data || data.data.length === 0) {
            result.errors.push('Dataset is empty');
            result.isValid = false;
            return result;
        }

        // Check for date column
        const dateColumns = data.columns.filter(col =>
            col.toLowerCase().includes('date') ||
            col.toLowerCase().includes('time')
        );

        if (dateColumns.length === 0) {
            result.warnings.push('No date column detected - time series analysis may be limited');
            result.suggestions.push('Consider adding a Date column for better time series support');
        }

        // Check for numeric columns
        const numericColumns = data.columns.filter(col => {
            const sampleValue = data.data[0]?.[col];
            return typeof sampleValue === 'number';
        });

        if (numericColumns.length === 0) {
            result.errors.push('No numeric columns found - cannot create charts');
            result.isValid = false;
        }

        // Check for missing values
        const missingValueStats = this.analyzeMissingValues(data);
        if (missingValueStats.totalMissing > 0) {
            const missingPercentage = (missingValueStats.totalMissing / (data.data.length * data.columns.length)) * 100;

            if (missingPercentage > 20) {
                result.warnings.push(`High percentage of missing values: ${missingPercentage.toFixed(1)}%`);
            }

            // Report columns with high missing values
            Object.entries(missingValueStats.byColumn).forEach(([column, missing]) => {
                const columnMissingPercentage = (missing / data.data.length) * 100;
                if (columnMissingPercentage > 50) {
                    result.warnings.push(`Column '${column}' has ${columnMissingPercentage.toFixed(1)}% missing values`);
                }
            });
        }

        // Check date consistency
        if (dateColumns.length > 0) {
            const dateValidation = this.validateDateColumn(data, dateColumns[0]);
            result.errors.push(...dateValidation.errors);
            result.warnings.push(...dateValidation.warnings);
            result.suggestions.push(...dateValidation.suggestions);
        }

        // Check for duplicate dates
        if (dateColumns.length > 0) {
            const duplicates = this.findDuplicateDates(data, dateColumns[0]);
            if (duplicates.length > 0) {
                result.warnings.push(`Found ${duplicates.length} duplicate dates`);
                result.suggestions.push('Consider removing or consolidating duplicate date entries');
            }
        }

        return result;
    }

    /**
     * Analyze missing values in the dataset
     */
    private static analyzeMissingValues(data: ChartData) {
        const byColumn: Record<string, number> = {};
        let totalMissing = 0;

        data.columns.forEach(column => {
            byColumn[column] = 0;
        });

        data.data.forEach(row => {
            data.columns.forEach(column => {
                const value = row[column];
                if (value === null || value === undefined || value === '' ||
                    (typeof value === 'number' && isNaN(value))) {
                    byColumn[column]++;
                    totalMissing++;
                }
            });
        });

        return { byColumn, totalMissing };
    }

    /**
     * Validate date column format and consistency
     */
    private static validateDateColumn(data: ChartData, dateColumn: string) {
        const result = { errors: [] as string[], warnings: [] as string[], suggestions: [] as string[] };

        const dates = data.data.map(row => row[dateColumn]).filter(d => d != null);

        if (dates.length === 0) {
            result.errors.push(`Date column '${dateColumn}' contains no valid dates`);
            return result;
        }

        // Check date format consistency
        const dateFormats = new Set<string>();
        const invalidDates: string[] = [];

        dates.forEach((dateStr, index) => {
            if (typeof dateStr === 'string') {
                // Detect common date patterns
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    dateFormats.add('YYYY-MM-DD');
                } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                    dateFormats.add('MM/DD/YYYY');
                } else if (/^\d{4}-\d{2}$/.test(dateStr)) {
                    dateFormats.add('YYYY-MM');
                } else {
                    invalidDates.push(dateStr);
                }

                // Try to parse the date
                const parsedDate = new Date(dateStr);
                if (isNaN(parsedDate.getTime())) {
                    invalidDates.push(dateStr);
                }
            }
        });

        if (dateFormats.size > 1) {
            result.warnings.push(`Multiple date formats detected: ${Array.from(dateFormats).join(', ')}`);
            result.suggestions.push('Standardize date format to YYYY-MM-DD for consistency');
        }

        if (invalidDates.length > 0) {
            result.warnings.push(`Found ${invalidDates.length} invalid date entries`);
            if (invalidDates.length <= 5) {
                result.warnings.push(`Invalid dates: ${invalidDates.join(', ')}`);
            }
        }

        return result;
    }

    /**
     * Find duplicate dates in the dataset
     */
    private static findDuplicateDates(data: ChartData, dateColumn: string): string[] {
        const dateCount = new Map<string, number>();

        data.data.forEach(row => {
            const dateStr = String(row[dateColumn] || '');
            if (dateStr) {
                dateCount.set(dateStr, (dateCount.get(dateStr) || 0) + 1);
            }
        });

        return Array.from(dateCount.entries())
            .filter(([_, count]) => count > 1)
            .map(([date, _]) => date);
    }

    /**
     * Get comprehensive information about a dataset
     */
    static async getDatasetInfo(category: string, filename: string): Promise<DatasetInfo> {
        const path = `${category}/${filename}`;
        const data = await DataService.loadCSV(path);

        // Find date column and determine date range
        const dateColumn = data.columns.find(col =>
            col.toLowerCase().includes('date') ||
            col.toLowerCase().includes('time')
        );

        let dateRange = { start: null as string | null, end: null as string | null };

        if (dateColumn) {
            const dates = data.data
                .map(row => row[dateColumn])
                .filter(d => d != null)
                .map(d => String(d))
                .sort();

            if (dates.length > 0) {
                dateRange.start = dates[0];
                dateRange.end = dates[dates.length - 1];
            }
        }

        return {
            category,
            filename,
            path,
            columns: data.columns,
            rowCount: data.data.length,
            dateRange
        };
    }

    /**
     * Suggest optimal chart configurations for a dataset
     */
    static suggestChartConfig(data: ChartData) {
        const suggestions = {
            chartType: 'line' as 'line' | 'bar' | 'area',
            xAxis: '',
            yAxes: [] as string[],
            colors: [] as string[],
            timePeriod: '5yr' as any
        };

        // Find best X-axis (prefer date columns)
        const dateColumns = data.columns.filter(col =>
            col.toLowerCase().includes('date') ||
            col.toLowerCase().includes('time')
        );

        suggestions.xAxis = dateColumns[0] || data.columns[0];

        // Find numeric columns for Y-axes
        const numericColumns = data.columns.filter(col => {
            if (col === suggestions.xAxis) return false;
            const sampleValue = data.data[0]?.[col];
            return typeof sampleValue === 'number';
        });

        suggestions.yAxes = numericColumns.slice(0, 5); // Limit to 5 series for readability

        // Suggest colors based on data type
        const colorSchemes = {
            bonds: ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'],
            fx: ['#0891b2', '#c2410c', '#059669', '#7c2d12', '#7c3aed'],
            equities: ['#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#0891b2'],
            macro: ['#7c3aed', '#dc2626', '#16a34a', '#ca8a04', '#0891b2'],
            default: ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea']
        };

        const category = data.metadata.category.toLowerCase();
        suggestions.colors = colorSchemes[category as keyof typeof colorSchemes] || colorSchemes.default;

        return suggestions;
    }

    /**
     * Generate a data quality report for all datasets in a category
     */
    static async generateDataQualityReport(category: string) {
        const files = await DataService.getDatasetsByAssetClass(category as any);
        const reports = [];

        for (const filename of files) {
            try {
                const data = await DataService.loadCSV(`${category}/${filename}`);
                const validation = this.validateDataset(data);
                const info = await this.getDatasetInfo(category, filename);

                reports.push({
                    filename,
                    info,
                    validation,
                    suggestions: this.suggestChartConfig(data)
                });
            } catch (error) {
                reports.push({
                    filename,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    validation: { isValid: false, errors: ['Failed to load dataset'], warnings: [], suggestions: [] }
                });
            }
        }

        return reports;
    }
}