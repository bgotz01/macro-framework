import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const assetClass = searchParams.get('assetClass') || 'economic';
    const seriesName = searchParams.get('seriesName') || 'CPI';
    const year = searchParams.get('year') || 'all';

    if (page < 1 || pageSize < 1 || pageSize > 100) {
        return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        const offset = (page - 1) * pageSize;

        // Build WHERE clause with optional year filter
        let whereClause = `
            WHERE asset_class = ?
              AND series_name = ?
        `;
        const params: any[] = [assetClass, seriesName];

        if (year !== 'all') {
            const yearNum = parseInt(year);
            const yearStart = new Date(yearNum, 0, 1).getTime();
            const yearEnd = new Date(yearNum, 11, 31, 23, 59, 59).getTime();
            whereClause += ` AND date >= ? AND date <= ?`;
            params.push(yearStart, yearEnd);
        }

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM percentile_analysis
            ${whereClause}
        `;
        const countResult = db.prepare(countQuery).get(...params) as any;
        const totalRecords = countResult.total;
        const totalPages = Math.ceil(totalRecords / pageSize);

        // Get paginated data
        const dataQuery = `
            SELECT 
                date,
                value,
                percentile_rank,
                yoy_percentile_change
            FROM percentile_analysis
            ${whereClause}
            ORDER BY date DESC
            LIMIT ? OFFSET ?
        `;

        const rows = db.prepare(dataQuery).all(...params, pageSize, offset) as any[];

        const data = rows.map(row => ({
            date: row.date,
            dateStr: new Date(row.date).toISOString().split('T')[0],
            value: row.value,
            percentileRank: row.percentile_rank,
            yoyPercentileChange: row.yoy_percentile_change
        }));

        // Get available years for this series
        const yearsQuery = `
            SELECT DISTINCT strftime('%Y', datetime(date/1000, 'unixepoch')) as year
            FROM percentile_analysis
            WHERE asset_class = ?
              AND series_name = ?
            ORDER BY year DESC
        `;
        const yearsResult = db.prepare(yearsQuery).all(assetClass, seriesName) as any[];
        const availableYears = yearsResult.map(r => parseInt(r.year));

        db.close();

        return NextResponse.json({
            data,
            pagination: {
                page,
                pageSize,
                totalRecords,
                totalPages
            },
            series: {
                assetClass,
                seriesName
            },
            availableYears
        });
    } catch (error) {
        console.error('Error fetching percentile data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
