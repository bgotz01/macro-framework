import SimilarPeriods from '@/components/similar-periods';
import PeriodComparison from '@/components/period-comparison';

export const metadata = {
    title: 'Similar Historical Periods | Macro Framework',
    description: 'Find historical periods with similar macro conditions based on percentile analysis',
};

export default function SimilarPeriodsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
                <div className="mb-6 sm:mb-8">
                    <h1 className="page-title text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                        Historical Period Analysis
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Compare current conditions with historical periods using percentiles and analyze macro similarities
                    </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <PeriodComparison />
                    <SimilarPeriods />
                </div>
            </div>
        </div>
    );
}
