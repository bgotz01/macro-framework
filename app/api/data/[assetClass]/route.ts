import { NextRequest, NextResponse } from 'next/server';
import { DataServiceNew } from '@/lib/data-service-new';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ assetClass: string }> }
) {
    try {
        const { assetClass } = await params;
        const { searchParams } = new URL(request.url);
        const series = searchParams.get('series');

        if (!series) {
            // Return list of available series with display names
            const seriesInfo = await DataServiceNew.getDatasetsByAssetClass(assetClass);
            return NextResponse.json({
                datasets: seriesInfo.map(s => s.series_name),
                seriesInfo: seriesInfo
            }, {
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                }
            });
        }

        // Load specific series
        const columnsParam = searchParams.get('columns');
        const columns = columnsParam ? columnsParam.split(',') : undefined;

        const data = await DataServiceNew.loadCSV(`${assetClass}/${series}`, columns);
        return NextResponse.json(data, {
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
