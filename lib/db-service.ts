import { prisma } from './prisma';

export interface DataPoint {
    date: string;
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
    private seriesCache = new Map<string, SeriesInfo[]>();

    async getSeriesByAssetClass(assetClass: string): Promise<SeriesInfo[]> {
        if (this.seriesCache.has(assetClass)) {
            return this.seriesCache.get(assetClass)!;
        }

        const rows = await prisma.macro_series_metadata.findMany({
            where: { asset_class: assetClass },
            orderBy: { display_name: 'asc' },
        });

        const result: SeriesInfo[] = rows.map(row => ({
            asset_class: row.asset_class,
            series_name: row.series_name,
            display_name: row.display_name ?? row.series_name,
            columns: ['Value'],
            units: row.units ?? undefined,
            geography: row.geography ?? undefined,
            currency: row.currency ?? undefined,
        }));

        this.seriesCache.set(assetClass, result);
        return result;
    }

    async loadSeries(assetClass: string, seriesName: string, columns?: string[]): Promise<ChartData> {
        const rows = await prisma.macro_time_series.findMany({
            where: {
                asset_class: assetClass,
                series_name: seriesName,
                ...(columns && columns.length > 0 ? { column_name: { in: columns } } : {}),
            },
            select: { date: true, column_name: true, value: true },
            orderBy: { date: 'asc' },
        });

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
                filename: seriesName,
            },
        };
    }

    async loadMultipleSeries(requests: Array<{ assetClass: string; seriesName: string; columns?: string[] }>): Promise<ChartData> {
        const datasets = await Promise.all(requests.map(req =>
            this.loadSeries(req.assetClass, req.seriesName, req.columns)
        ));

        if (datasets.length === 1) return datasets[0];

        const dateMap = new Map<string, DataPoint>();
        const allColumns = new Set<string>();

        for (const dataset of datasets) {
            const prefix = dataset.metadata.filename;
            for (const row of dataset.data) {
                if (!dateMap.has(row.date)) dateMap.set(row.date, { date: row.date });
                const combinedRow = dateMap.get(row.date)!;
                for (const [key, value] of Object.entries(row)) {
                    if (key === 'date') continue;
                    const newKey = datasets.length > 1 ? `${prefix}_${key}` : key;
                    combinedRow[newKey] = value;
                    allColumns.add(newKey);
                }
            }
        }

        return {
            data: Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
            columns: ['date', ...Array.from(allColumns)],
            metadata: {
                title: `Combined ${datasets.map(d => d.metadata.title).join(', ')}`,
                category: 'combined',
                filename: 'combined',
            },
        };
    }

    async getDateRange(assetClass: string, seriesName: string): Promise<{ min: string; max: string } | null> {
        const result = await prisma.macro_time_series.aggregate({
            where: { asset_class: assetClass, series_name: seriesName },
            _min: { date: true },
            _max: { date: true },
        });

        if (!result._min.date) return null;
        return { min: result._min.date, max: result._max.date! };
    }
}

export const dbService = new DatabaseService();
