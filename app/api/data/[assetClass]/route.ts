import { NextRequest, NextResponse } from 'next/server';
import { DataServiceNew } from '@/lib/data-service-new';

export const dynamic = 'force-dynamic';

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
            let seriesInfo = await DataServiceNew.getDatasetsByAssetClass(assetClass);

            // If requesting valuations, also include related derived series
            if (assetClass === 'valuations') {
                const derivedSeries = await DataServiceNew.getDatasetsByAssetClass('derived');
                // Filter for valuation-related derived series (YoY growth rates)
                const valuationDerived = derivedSeries.filter(s =>
                    s.series_name.includes('SP500-EPS-YoY') ||
                    s.series_name.includes('SP500SPS-YoY')
                );
                seriesInfo = [...seriesInfo, ...valuationDerived];
            }

            return NextResponse.json({
                datasets: seriesInfo.map(s => s.series_name),
                seriesInfo: seriesInfo
            }, {
                headers: {
                    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
                }
            });
        }

        // Load specific series - check both the requested asset class and derived
        const columnsParam = searchParams.get('columns');
        const columns = columnsParam ? columnsParam.split(',') : undefined;

        // Try loading from the requested asset class first
        let data = await DataServiceNew.loadCSV(`${assetClass}/${series}`, columns);

        // If no data found and this is valuations, try derived asset class
        if (data.data.length === 0 && assetClass === 'valuations') {
            data = await DataServiceNew.loadCSV(`derived/${series}`, columns);
        }

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
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
