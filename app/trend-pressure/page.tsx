import DivergenceChart from '@/components/charts/divergence-chart';
import TrendPressureChart from '@/components/charts/trend-pressure-chart';
import MaDivergenceChart from '@/components/charts/ma-divergence-chart';
import { Suspense } from 'react';

export default function TrendPressurePage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h2
                    className="page-title text-3xl mb-1"
                >
                    TREND PRESSURE
                </h2>
                <p className="page-subtitle">
                    MA Divergence Analysis
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

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
