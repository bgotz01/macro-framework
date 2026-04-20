import { NextRequest, NextResponse } from 'next/server';
import { DataServiceNew } from '@/lib/data-service-new';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const series = searchParams.get('series');

        if (!series) {
            // Return list of available series with display names
            const seriesInfo = await DataServiceNew.getDatasetsByAssetClass('fx');

            return NextResponse.json({
                datasets: seriesInfo.map(s => s.series_name),
                seriesInfo: seriesInfo
            }, {
                headers: {
                    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
                }
            });
        }

        // Load specific series
        const columnsParam = searchParams.get('columns');
        const columns = columnsParam ? columnsParam.split(',') : undefined;

        const data = await DataServiceNew.loadCSV(`fx/${series}`, columns);

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
            }
        });
    } catch (error) {
        console.error('FX API Error:', error);
        return NextResponse.json(
            { error: 'Failed to load FX data' },
            { status: 500 }
        );
    }
}