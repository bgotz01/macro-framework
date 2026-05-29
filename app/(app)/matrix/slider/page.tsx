import MatrixSlider from '@/components/matrix-slider';
import { DataServiceNew } from '@/lib/data-service-new';

async function getLatestValue(assetClass: string, seriesName: string): Promise<{ value: number | null; date: string | null }> {
    try {
        const data = await DataServiceNew.loadCSV(`${assetClass}/${seriesName}`);
        if (data.data && data.data.length > 0) {
            const latest = data.data[data.data.length - 1];
            const columns = Object.keys(latest).filter(k => k !== 'date');
            const value = columns.length > 0 ? latest[columns[0]] : null;
            const dateStr = latest.date as string;
            return {
                value: typeof value === 'number' ? value : null,
                date: dateStr,
            };
        }
        return { value: null, date: null };
    } catch (error) {
        console.error(`Error fetching ${assetClass}/${seriesName}:`, error);
        return { value: null, date: null };
    }
}

export default async function MatrixSliderPage() {
    const [cpi, tenYear, twoYear, threeMonth, shillerPE, fedFunds, pe5yr, earningsYield5yr] = await Promise.all([
        getLatestValue('economic', 'CPI'),
        getLatestValue('bonds', 'US/TNX'),
        getLatestValue('bonds', 'US/US-2yr'),
        getLatestValue('bonds', 'US/IRX'),
        getLatestValue('valuations', 'Shiller-PE'),
        getLatestValue('economic', 'US/FEDFUNDS'),
        getLatestValue('valuations', 'PE-5yr'),
        getLatestValue('valuations', 'Earnings-Yield-5yr'),
    ]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Matrix Slider Test</h1>
                <p className="text-muted-foreground">Drag the timeline to explore historical regime data</p>
            </div>

            <MatrixSlider
                initialValues={{
                    inflation: cpi.value,
                    bondYieldNominal: tenYear.value,
                    bondYieldReal: tenYear.value !== null && cpi.value !== null ? tenYear.value - cpi.value : null,
                    yieldCurve: tenYear.value !== null && twoYear.value !== null ? tenYear.value - twoYear.value : null,
                    fedFunds: fedFunds.value,
                    equityPE: shillerPE.value,
                    earningsYieldPremium: shillerPE.value !== null && shillerPE.value > 0 && threeMonth.value !== null
                        ? (100 / shillerPE.value) - threeMonth.value
                        : null,
                    realEarningsYield: shillerPE.value !== null && shillerPE.value > 0 && cpi.value !== null
                        ? (100 / shillerPE.value) - cpi.value
                        : null,
                    equityPE5yr: pe5yr.value,
                    earningsYieldPremium5yr: earningsYield5yr.value !== null && threeMonth.value !== null
                        ? earningsYield5yr.value - threeMonth.value
                        : null,
                    realEarningsYield5yr: earningsYield5yr.value !== null && cpi.value !== null
                        ? earningsYield5yr.value - cpi.value
                        : null,
                }}
            />
        </div>
    );
}
