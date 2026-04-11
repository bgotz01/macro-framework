import { PercentileService } from '@/lib/percentile-service';
import PercentileAnalysisClient from './client';
import { prisma } from '@/lib/prisma';

const SERIES = [
    { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
    { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
    { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
    { asset_class: 'bonds', series_name: 'US/US-2yr-Monthly', key: 'us2yr' },
    { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
    { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
    { asset_class: 'valuations', series_name: 'PE-2yr', key: 'pe2yr' },
    { asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', key: 'ey5yr' },
    { asset_class: 'valuations', series_name: 'Earnings-Yield-2yr', key: 'ey2yr' },
    { asset_class: 'derived', series_name: 'Real-Yield', key: 'realYield' },
    { asset_class: 'derived', series_name: 'Yield-Curve', key: 'yieldCurve' },
    { asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', key: 'yieldCurve3M' },
    { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
    { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-2yr', key: 'eyp2yr' },
    { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },
    { asset_class: 'derived', series_name: 'Real-Earnings-Yield-2yr', key: 'rey2yr' },
];

async function getInitialData(year: number | 'latest') {
    const result: any = { year };

    for (const s of SERIES) {
        let row: any = null;

        if (year === 'latest') {
            row = await prisma.macro_percentile_analysis.findFirst({
                where: { asset_class: s.asset_class, series_name: s.series_name, column_name: 'Value' },
                orderBy: { date: 'desc' },
                select: { date: true, value: true, percentile_rank: true },
            });
        } else {
            const yearStart = `${year}-10-01`;
            const yearEnd = `${year}-12-31`;
            row = await prisma.macro_percentile_analysis.findFirst({
                where: { asset_class: s.asset_class, series_name: s.series_name, column_name: 'Value', date: { gte: yearStart, lte: yearEnd } },
                orderBy: { date: 'desc' },
                select: { date: true, value: true, percentile_rank: true },
            });
        }

        result[s.key] = row ? {
            assetClass: s.asset_class,
            seriesName: s.series_name,
            date: row.date,
            dateStr: row.date,
            value: row.value ?? 0,
            percentileRank: row.percentile_rank ?? 0,
        } : null;
    }

    return result;
}

export default async function PercentileAnalysisPage() {
    const availableYears = await PercentileService.getAvailableYears();
    const initialData = await getInitialData('latest');
    return <PercentileAnalysisClient initialData={initialData} availableYears={availableYears} />;
}
