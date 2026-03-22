import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const assetClass = searchParams.get('assetClass');
    const seriesName = searchParams.get('seriesName');

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        // If no parameters, fetch all data in wide format for the chart
        if (!assetClass && !seriesName) {
            const query = `
                SELECT 
                    date,
                    MAX(CASE WHEN series_name = 'CPI' THEN value END) as cpi_value,
                    MAX(CASE WHEN series_name = 'CPI' THEN percentile_rank END) as cpi_percentile,
                    MAX(CASE WHEN series_name = 'CPI' THEN yoy_percentile_change END) as cpi_yoy,
                    MAX(CASE WHEN series_name = 'US/FEDFUNDS' THEN value END) as fedfunds_value,
                    MAX(CASE WHEN series_name = 'US/FEDFUNDS' THEN percentile_rank END) as fedfunds_percentile,
                    MAX(CASE WHEN series_name = 'US/FEDFUNDS' THEN yoy_percentile_change END) as fedfunds_yoy,
                    MAX(CASE WHEN series_name = 'M1-YoY' THEN value END) as m1yoy_value,
                    MAX(CASE WHEN series_name = 'M1-YoY' THEN percentile_rank END) as m1yoy_percentile,
                    MAX(CASE WHEN series_name = 'M1-YoY' THEN yoy_percentile_change END) as m1yoy_yoy,
                    MAX(CASE WHEN series_name = 'M2-YoY' THEN value END) as m2yoy_value,
                    MAX(CASE WHEN series_name = 'M2-YoY' THEN percentile_rank END) as m2yoy_percentile,
                    MAX(CASE WHEN series_name = 'M2-YoY' THEN yoy_percentile_change END) as m2yoy_yoy,
                    MAX(CASE WHEN series_name = 'Real-M2-YoY' THEN value END) as realm2yoy_value,
                    MAX(CASE WHEN series_name = 'Real-M2-YoY' THEN percentile_rank END) as realm2yoy_percentile,
                    MAX(CASE WHEN series_name = 'Real-M2-YoY' THEN yoy_percentile_change END) as realm2yoy_yoy,
                    MAX(CASE WHEN series_name = 'US/TNX-Monthly' THEN value END) as tnx_value,
                    MAX(CASE WHEN series_name = 'US/TNX-Monthly' THEN percentile_rank END) as tnx_percentile,
                    MAX(CASE WHEN series_name = 'US/TNX-Monthly' THEN yoy_percentile_change END) as tnx_yoy,
                    MAX(CASE WHEN series_name = 'US/US-2yr-Monthly' THEN value END) as us2yr_value,
                    MAX(CASE WHEN series_name = 'US/US-2yr-Monthly' THEN percentile_rank END) as us2yr_percentile,
                    MAX(CASE WHEN series_name = 'US/US-2yr-Monthly' THEN yoy_percentile_change END) as us2yr_yoy,
                    MAX(CASE WHEN series_name = 'US/IRX-Monthly' THEN value END) as irx_value,
                    MAX(CASE WHEN series_name = 'US/IRX-Monthly' THEN percentile_rank END) as irx_percentile,
                    MAX(CASE WHEN series_name = 'US/IRX-Monthly' THEN yoy_percentile_change END) as irx_yoy,
                    MAX(CASE WHEN series_name = 'Real-10Y' THEN value END) as realyield_value,
                    MAX(CASE WHEN series_name = 'Real-10Y' THEN percentile_rank END) as realyield_percentile,
                    MAX(CASE WHEN series_name = 'Real-10Y' THEN yoy_percentile_change END) as realyield_yoy,
                    MAX(CASE WHEN series_name = 'Real-3M' THEN value END) as realyield3m_value,
                    MAX(CASE WHEN series_name = 'Real-3M' THEN percentile_rank END) as realyield3m_percentile,
                    MAX(CASE WHEN series_name = 'Real-3M' THEN yoy_percentile_change END) as realyield3m_yoy,
                    MAX(CASE WHEN series_name = 'Yield-Curve' THEN value END) as yieldcurve_value,
                    MAX(CASE WHEN series_name = 'Yield-Curve' THEN percentile_rank END) as yieldcurve_percentile,
                    MAX(CASE WHEN series_name = 'Yield-Curve' THEN yoy_percentile_change END) as yieldcurve_yoy,
                    MAX(CASE WHEN series_name = 'Yield-Curve-3M' THEN value END) as yieldcurve3m_value,
                    MAX(CASE WHEN series_name = 'Yield-Curve-3M' THEN percentile_rank END) as yieldcurve3m_percentile,
                    MAX(CASE WHEN series_name = 'Yield-Curve-3M' THEN yoy_percentile_change END) as yieldcurve3m_yoy,
                    MAX(CASE WHEN series_name = 'Shiller-PE' THEN value END) as shillerpe_value,
                    MAX(CASE WHEN series_name = 'Shiller-PE' THEN percentile_rank END) as shillerpe_percentile,
                    MAX(CASE WHEN series_name = 'Shiller-PE' THEN yoy_percentile_change END) as shillerpe_yoy,
                    MAX(CASE WHEN series_name = 'PE-5yr' THEN value END) as pe5yr_value,
                    MAX(CASE WHEN series_name = 'PE-5yr' THEN percentile_rank END) as pe5yr_percentile,
                    MAX(CASE WHEN series_name = 'PE-5yr' THEN yoy_percentile_change END) as pe5yr_yoy,
                    MAX(CASE WHEN series_name = 'PE-1yr' THEN value END) as pe1yr_value,
                    MAX(CASE WHEN series_name = 'PE-1yr' THEN percentile_rank END) as pe1yr_percentile,
                    MAX(CASE WHEN series_name = 'PE-1yr' THEN yoy_percentile_change END) as pe1yr_yoy,
                    MAX(CASE WHEN series_name = 'PE-2yr' THEN value END) as pe2yr_value,
                    MAX(CASE WHEN series_name = 'PE-2yr' THEN percentile_rank END) as pe2yr_percentile,
                    MAX(CASE WHEN series_name = 'PE-2yr' THEN yoy_percentile_change END) as pe2yr_yoy,
                    MAX(CASE WHEN series_name = 'Earnings-Yield' THEN value END) as eycape_value,
                    MAX(CASE WHEN series_name = 'Earnings-Yield' THEN percentile_rank END) as eycape_percentile,
                    MAX(CASE WHEN series_name = 'Earnings-Yield' THEN yoy_percentile_change END) as eycape_yoy,
                    MAX(CASE WHEN series_name = 'Earnings-Yield-5yr' THEN value END) as ey5yr_value,
                    MAX(CASE WHEN series_name = 'Earnings-Yield-5yr' THEN percentile_rank END) as ey5yr_percentile,
                    MAX(CASE WHEN series_name = 'Earnings-Yield-5yr' THEN yoy_percentile_change END) as ey5yr_yoy,
                    MAX(CASE WHEN series_name = 'Earnings-Yield-Premium-5yr' THEN value END) as eyp5yr_value,
                    MAX(CASE WHEN series_name = 'Earnings-Yield-Premium-5yr' THEN percentile_rank END) as eyp5yr_percentile,
                    MAX(CASE WHEN series_name = 'Earnings-Yield-Premium-5yr' THEN yoy_percentile_change END) as eyp5yr_yoy,
                    MAX(CASE WHEN series_name = 'Real-Earnings-Yield-5yr' THEN value END) as rey5yr_value,
                    MAX(CASE WHEN series_name = 'Real-Earnings-Yield-5yr' THEN percentile_rank END) as rey5yr_percentile,
                    MAX(CASE WHEN series_name = 'Real-Earnings-Yield-5yr' THEN yoy_percentile_change END) as rey5yr_yoy
                FROM percentile_analysis
                GROUP BY date
                ORDER BY date ASC
            `;

            const rows = db.prepare(query).all() as any[];
            db.close();
            return NextResponse.json({ data: rows });
        }

        // If parameters provided, fetch specific series
        if (!assetClass || !seriesName) {
            return NextResponse.json({ error: 'Missing assetClass or seriesName parameter' }, { status: 400 });
        }

        const columnName = searchParams.get('columnName');

        let query = `
            SELECT 
                date,
                value,
                percentile_rank
            FROM percentile_analysis
            WHERE asset_class = ?
              AND series_name = ?
        `;
        const params: any[] = [assetClass, seriesName];

        if (columnName) {
            query += ` AND column_name = ?`;
            params.push(columnName);
        }

        query += ` ORDER BY date ASC`;

        const rows = db.prepare(query).all(...params) as any[];

        db.close();

        return NextResponse.json({ data: rows });
    } catch (error) {
        console.error('Error fetching percentile history:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
