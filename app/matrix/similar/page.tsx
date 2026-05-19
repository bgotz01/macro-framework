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
                <div className="text-center mb-8">
                    <h1 className="page-title text-3xl mb-1">
                        Historical Period Analysis
                    </h1>
                    <p className="page-subtitle">
                        Compare current conditions with historical periods
                    </p>
                    <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <PeriodComparison />
                    <SimilarPeriods />
                </div>
            </div>
        </div>
    );
}
