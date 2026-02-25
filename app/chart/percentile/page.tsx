import { Suspense } from 'react';
import PercentileChart from '@/components/charts/percentile-chart';
import PercentileExplanation from '@/components/ui/percentile-explanation';

export default function PercentileChartPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Historical Percentile Analysis
                    </h1>
                    <p className="text-muted-foreground">
                        Track how key economic indicators rank compared to their historical values over time
                    </p>
                </div>

                <Suspense fallback={
                    <div className="p-6 rounded-xl border bg-card">
                        <div className="text-center text-muted-foreground">Loading chart...</div>
                    </div>
                }>
                    <PercentileChart height={600} />
                </Suspense>

                <PercentileExplanation />
            </div>
        </div>
    );
}
