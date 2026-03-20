import DivergenceChart from '@/components/charts/divergence-chart';
import TrendPressureChart from '@/components/charts/trend-pressure-chart';
import { Suspense } from 'react';

export default function TrendPressurePage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h2
                    className="text-2xl font-light tracking-wider mb-2"
                    style={{
                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                        letterSpacing: '0.15em'
                    }}
                >
                    TREND PRESSURE
                </h2>
                <p
                    className="text-sm font-light text-muted-foreground tracking-widest uppercase"
                    style={{ letterSpacing: '0.2em' }}
                >
                    MA Divergence Analysis
                </p>
            </div>

            <Suspense fallback={<div className="text-center py-12">Loading chart...</div>}>
                <TrendPressureChart height={450} />
            </Suspense>

            <div className="mt-10">
                <Suspense fallback={<div className="text-center py-12">Loading chart...</div>}>
                    <DivergenceChart height={500} initialMAs={['200']} />
                </Suspense>
            </div>
        </div>
    );
}
