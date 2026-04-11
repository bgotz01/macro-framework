import { prisma } from './prisma';

export interface PercentileData {
    date: string;
    dateStr: string;
    value: number;
    percentileRank: number;
}

export interface LatestPercentile {
    assetClass: string;
    seriesName: string;
    date: string;
    dateStr: string;
    value: number;
    percentileRank: number;
}

function toLatest(row: { date: string; value: number | null; percentile_rank: number | null }, assetClass: string, seriesName: string): LatestPercentile {
    return { assetClass, seriesName, date: row.date, dateStr: row.date, value: row.value ?? 0, percentileRank: row.percentile_rank ?? 0 };
}

function toData(row: { date: string; value: number | null; percentile_rank: number | null }): PercentileData {
    return { date: row.date, dateStr: row.date, value: row.value ?? 0, percentileRank: row.percentile_rank ?? 0 };
}

export class PercentileService {
    static async getLatestPercentile(assetClass: string, seriesName: string): Promise<LatestPercentile | null> {
        const row = await prisma.macro_percentile_analysis.findFirst({
            where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value' },
            orderBy: { date: 'desc' },
            select: { date: true, value: true, percentile_rank: true },
        });
        return row ? toLatest(row, assetClass, seriesName) : null;
    }

    static async getPercentileHistory(assetClass: string, seriesName: string, startDate?: string, endDate?: string): Promise<PercentileData[]> {
        const rows = await prisma.macro_percentile_analysis.findMany({
            where: {
                asset_class: assetClass, series_name: seriesName, column_name: 'Value',
                ...(startDate || endDate ? { date: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } } : {}),
            },
            orderBy: { date: 'asc' },
            select: { date: true, value: true, percentile_rank: true },
        });
        return rows.map(toData);
    }

    static async getPercentileAtDate(assetClass: string, seriesName: string, date: string): Promise<PercentileData | null> {
        const row = await prisma.macro_percentile_analysis.findFirst({
            where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value', date },
            select: { date: true, value: true, percentile_rank: true },
        });
        return row ? toData(row) : null;
    }

    static async getYearEndPercentile(assetClass: string, seriesName: string, year: number): Promise<LatestPercentile | null> {
        const row = await prisma.macro_percentile_analysis.findFirst({
            where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value', date: { gte: `${year}-10-01`, lte: `${year}-12-31` } },
            orderBy: { date: 'desc' },
            select: { date: true, value: true, percentile_rank: true },
        });
        return row ? toLatest(row, assetClass, seriesName) : null;
    }

    static async getAvailableYears(): Promise<number[]> {
        const rows = await prisma.macro_percentile_analysis.findMany({
            where: { column_name: 'Value' },
            distinct: ['date'],
            select: { date: true },
            orderBy: { date: 'desc' },
        });
        const years = [...new Set(rows.map(r => parseInt(r.date.substring(0, 4))))];
        return years.sort((a, b) => b - a);
    }

    static async getLatestPercentiles(series: Array<{ assetClass: string; seriesName: string }>): Promise<LatestPercentile[]> {
        const results: LatestPercentile[] = [];
        for (const s of series) {
            const row = await prisma.macro_percentile_analysis.findFirst({
                where: { asset_class: s.assetClass, series_name: s.seriesName, column_name: 'Value' },
                orderBy: { date: 'desc' },
                select: { date: true, value: true, percentile_rank: true },
            });
            if (row) results.push(toLatest(row, s.assetClass, s.seriesName));
        }
        return results;
    }

    static async getHistoricalExtremes(assetClass: string, seriesName: string): Promise<{ highest: PercentileData | null; lowest: PercentileData | null }> {
        const [highest, lowest] = await Promise.all([
            prisma.macro_percentile_analysis.findFirst({
                where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value' },
                orderBy: { percentile_rank: 'desc' },
                select: { date: true, value: true, percentile_rank: true },
            }),
            prisma.macro_percentile_analysis.findFirst({
                where: { asset_class: assetClass, series_name: seriesName, column_name: 'Value' },
                orderBy: { percentile_rank: 'asc' },
                select: { date: true, value: true, percentile_rank: true },
            }),
        ]);
        return { highest: highest ? toData(highest) : null, lowest: lowest ? toData(lowest) : null };
    }
}
