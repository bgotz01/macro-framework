import DivergenceChart from '@/components/charts/divergence-chart';
import TrendPressureChart from '@/components/charts/trend-pressure-chart';
import MaDivergenceChart from '@/components/charts/ma-divergence-chart';
import PageHeader from '@/components/page-header';
import { Suspense } from 'react';

export default function TrendPressurePage() {
    return (
        <div className="max-w-6xl mx-auto">
            <PageHeader title="TREND PRESSURE" subtitle="MA Divergence Analysis" />

            <Suspense fallback={<div className="text-center py-12">Loading chart...</div>}>
                <TrendPressureChart height={450} />
            </Suspense>

            <div className="mt-10">
                <Suspense fallback={<div className="text-center py-12">Loading chart...</div>}>
                    <DivergenceChart height={500} initialMAs={['200']} />
                </Suspense>
            </div>

            <div className="mt-10">
                <Suspense fallback={<div className="text-center py-12">Loading chart...</div>}>
                    <MaDivergenceChart height={450} />
                </Suspense>
            </div>
        </div>
    );
}
