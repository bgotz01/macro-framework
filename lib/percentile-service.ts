import Database from 'better-sqlite3';
import path from 'path';

export interface PercentileData {
    date: number;
    dateStr: string;
    value: number;
    percentileRank: number;
}

export interface LatestPercentile {
    assetClass: string;
    seriesName: string;
    date: number;
    dateStr: string;
    value: number;
    percentileRank: number;
}

export class PercentileService {
    private static getDB(): Database.Database {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        return new Database(dbPath, { readonly: true });
    }

    /**
     * Get the latest percentile for a specific series
     */
    static getLatestPercentile(assetClass: string, seriesName: string): LatestPercentile | null {
        const db = this.getDB();

        try {
            const query = `
                SELECT 
                    asset_class,
                    series_name,
                    date,
                    value,
                    percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ?
                ORDER BY date DESC
                LIMIT 1
            `;

            const result = db.prepare(query).get(assetClass, seriesName) as any;

            if (!result) return null;

            return {
                assetClass: result.asset_class,
                seriesName: result.series_name,
                date: result.date,
                dateStr: new Date(result.date).toISOString().split('T')[0],
                value: result.value,
                percentileRank: result.percentile_rank
            };
        } finally {
            db.close();
        }
    }

    /**
     * Get all percentile data for a specific series
     */
    static getPercentileHistory(
        assetClass: string,
        seriesName: string,
        startDate?: number,
        endDate?: number
    ): PercentileData[] {
        const db = this.getDB();

        try {
            let query = `
                SELECT 
                    date,
                    value,
                    percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ?
            `;

            const params: any[] = [assetClass, seriesName];

            if (startDate) {
                query += ` AND date >= ?`;
                params.push(startDate);
            }

            if (endDate) {
                query += ` AND date <= ?`;
                params.push(endDate);
            }

            query += ` ORDER BY date ASC`;

            const results = db.prepare(query).all(...params) as any[];

            return results.map(row => ({
                date: row.date,
                dateStr: new Date(row.date).toISOString().split('T')[0],
                value: row.value,
                percentileRank: row.percentile_rank
            }));
        } finally {
            db.close();
        }
    }

    /**
     * Get percentile at a specific date
     */
    static getPercentileAtDate(
        assetClass: string,
        seriesName: string,
        date: number
    ): PercentileData | null {
        const db = this.getDB();

        try {
            const query = `
                SELECT 
                    date,
                    value,
                    percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? 
                  AND series_name = ?
                  AND date = ?
            `;

            const result = db.prepare(query).get(assetClass, seriesName, date) as any;

            if (!result) return null;

            return {
                date: result.date,
                dateStr: new Date(result.date).toISOString().split('T')[0],
                value: result.value,
                percentileRank: result.percentile_rank
            };
        } finally {
            db.close();
        }
    }

    /**
     * Get percentile at year-end (December 31st or closest date)
     */
    static getYearEndPercentile(
        assetClass: string,
        seriesName: string,
        year: number
    ): LatestPercentile | null {
        const db = this.getDB();

        try {
            // Try to find data for December of the specified year
            // Look for dates in the last quarter of the year
            const yearStart = new Date(year, 0, 1).getTime();
            const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();
            const q4Start = new Date(year, 9, 1).getTime(); // October 1st

            const query = `
                SELECT 
                    asset_class,
                    series_name,
                    date,
                    value,
                    percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? 
                  AND series_name = ?
                  AND date >= ?
                  AND date <= ?
                ORDER BY date DESC
                LIMIT 1
            `;

            const result = db.prepare(query).get(assetClass, seriesName, q4Start, yearEnd) as any;

            if (!result) return null;

            return {
                assetClass: result.asset_class,
                seriesName: result.series_name,
                date: result.date,
                dateStr: new Date(result.date).toISOString().split('T')[0],
                value: result.value,
                percentileRank: result.percentile_rank
            };
        } finally {
            db.close();
        }
    }

    /**
     * Get available years with data
     */
    static getAvailableYears(): number[] {
        const db = this.getDB();

        try {
            const query = `
                SELECT DISTINCT strftime('%Y', date/1000, 'unixepoch') as year
                FROM percentile_analysis
                ORDER BY year DESC
            `;

            const results = db.prepare(query).all() as any[];
            return results.map(r => parseInt(r.year));
        } finally {
            db.close();
        }
    }

    /**
     * Get multiple latest percentiles at once
     */
    static getLatestPercentiles(
        series: Array<{ assetClass: string; seriesName: string }>
    ): LatestPercentile[] {
        const db = this.getDB();

        try {
            const results: LatestPercentile[] = [];

            for (const s of series) {
                const query = `
                    SELECT 
                        asset_class,
                        series_name,
                        date,
                        value,
                        percentile_rank
                    FROM percentile_analysis
                    WHERE asset_class = ? AND series_name = ?
                    ORDER BY date DESC
                    LIMIT 1
                `;

                const result = db.prepare(query).get(s.assetClass, s.seriesName) as any;

                if (result) {
                    results.push({
                        assetClass: result.asset_class,
                        seriesName: result.series_name,
                        date: result.date,
                        dateStr: new Date(result.date).toISOString().split('T')[0],
                        value: result.value,
                        percentileRank: result.percentile_rank
                    });
                }
            }

            return results;
        } finally {
            db.close();
        }
    }

    /**
     * Get historical extremes (highest and lowest percentiles)
     */
    static getHistoricalExtremes(
        assetClass: string,
        seriesName: string
    ): { highest: PercentileData | null; lowest: PercentileData | null } {
        const db = this.getDB();

        try {
            const highestQuery = `
                SELECT date, value, percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ?
                ORDER BY percentile_rank DESC
                LIMIT 1
            `;

            const lowestQuery = `
                SELECT date, value, percentile_rank
                FROM percentile_analysis
                WHERE asset_class = ? AND series_name = ?
                ORDER BY percentile_rank ASC
                LIMIT 1
            `;

            const highest = db.prepare(highestQuery).get(assetClass, seriesName) as any;
            const lowest = db.prepare(lowestQuery).get(assetClass, seriesName) as any;

            return {
                highest: highest ? {
                    date: highest.date,
                    dateStr: new Date(highest.date).toISOString().split('T')[0],
                    value: highest.value,
                    percentileRank: highest.percentile_rank
                } : null,
                lowest: lowest ? {
                    date: lowest.date,
                    dateStr: new Date(lowest.date).toISOString().split('T')[0],
                    value: lowest.value,
                    percentileRank: lowest.percentile_rank
                } : null
            };
        } finally {
            db.close();
        }
    }
}
