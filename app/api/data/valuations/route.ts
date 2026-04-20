import { NextRequest, NextResponse } from 'next/server';
import { DataServiceNew } from '@/lib/data-service-new';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const series = searchParams.get('series');

        if (!series) {
            // Return list of available series with display names
            let seriesInfo = await DataServiceNew.getDatasetsByAssetClass('valuations');

            // Also include related derived series
            const derivedSeries = await DataServiceNew.getDatasetsByAssetClass('derived');
            // Filter for valuation-related derived series (YoY growth rates)
            const valuationDerived = derivedSeries.filter(s =>
                s.series_name.includes('SP500-EPS-YoY') ||
                s.series_name.includes('SP500SPS-YoY')
            );
            seriesInfo = [...seriesInfo, ...valuationDerived];

            return NextResponse.json({
                datasets: seriesInfo.map(s => s.series_name),
                seriesInfo: seriesInfo
            }, {
                headers: {
                    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
                }
            });
        }

        // Load specific series - check both valuations and derived
        const columnsParam = searchParams.get('columns');
        const columns = columnsParam ? columnsParam.split(',') : undefined;

        // Try loading from valuations first
        let data = await DataServiceNew.loadCSV(`valuations/${series}`, columns);

        // If no data found, try derived asset class
        if (data.data.length === 0) {
            data = await DataServiceNew.loadCSV(`derived/${series}`, columns);
        }

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
            }
        });
    } catch (error) {
        console.error('Valuations API Error:', error);
        return NextResponse.json(
            { error: 'Failed to load valuations data' },
            { status: 500 }
        );
    }
}