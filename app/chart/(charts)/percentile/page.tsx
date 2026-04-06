import { Suspense } from 'react';
import PercentileChart from '@/components/charts/percentile-chart';
import PercentileExplanation from '@/components/ui/percentile-explanation';

export default function PercentileChartPage() {
    return (
        <>
            <Suspense fallback={
                <div className="p-6 rounded-xl border bg-card">
                    <div className="text-center text-muted-foreground">Loading chart...</div>
                </div>
            }>
                <PercentileChart height={600} />
            </Suspense>
            <PercentileExplanation />
        </>
    );
}
