import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface QueryParams {
    assetClass?: string;
    seriesName?: string;
    columnName?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    pageSize: number;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const params: QueryParams = {
            assetClass: searchParams.get('assetClass') || undefined,
            seriesName: searchParams.get('seriesName') || undefined,
            columnName: searchParams.get('columnName') || 'Value',
            startDate: searchParams.get('startDate') || undefined,
            endDate: searchParams.get('endDate') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            pageSize: parseInt(searchParams.get('pageSize') || '20'),
        };

        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        // Build query
        let query = `
            SELECT 
                ts.date,
                ts.asset_class,
                ts.series_name,
                COALESCE(sm.display_name, ts.series_name) as display_name,
                ts.column_name,
                ts.value,
                sm.units,
                sm.geography
            FROM time_series ts
            LEFT JOIN series_metadata sm 
                ON ts.asset_class = sm.asset_class 
                AND ts.series_name = sm.series_name
            WHERE 1=1
        `;

        const queryParams: any[] = [];

        if (params.assetClass) {
            query += ` AND ts.asset_class = ?`;
            queryParams.push(params.assetClass);
        }

        if (params.seriesName) {
            query += ` AND ts.series_name = ?`;
            queryParams.push(params.seriesName);
        }

        if (params.columnName) {
            query += ` AND ts.column_name = ?`;
            queryParams.push(params.columnName);
        }

        if (params.startDate) {
            const startTimestamp = new Date(params.startDate).getTime();
            query += ` AND ts.date >= ?`;
            queryParams.push(startTimestamp);
        }

        if (params.endDate) {
            const endTimestamp = new Date(params.endDate).getTime();
            query += ` AND ts.date <= ?`;
            queryParams.push(endTimestamp);
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
        const countResult = db.prepare(countQuery).get(...queryParams) as { total: number };
        const total = countResult.total;

        // Add pagination
        query += ` ORDER BY ts.date DESC, ts.series_name ASC`;
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(params.pageSize, (params.page - 1) * params.pageSize);

        const rows = db.prepare(query).all(...queryParams) as any[];

        // Transform data
        const data = rows.map(row => ({
            date: new Date(row.date).toISOString().split('T')[0],
            timestamp: row.date,
            assetClass: row.asset_class,
            seriesName: row.series_name,
            displayName: row.display_name,
            columnName: row.column_name,
            value: row.value,
            units: row.units,
            geography: row.geography,
        }));

        db.close();

        return NextResponse.json({
            data,
            pagination: {
                page: params.page,
                pageSize: params.pageSize,
                total,
                totalPages: Math.ceil(total / params.pageSize),
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to load data' },
            { status: 500 }
        );
    }
}
