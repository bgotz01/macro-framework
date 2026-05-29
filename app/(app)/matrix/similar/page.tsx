import SimilarPeriods from '@/components/similar-periods';
import PeriodComparison from '@/components/period-comparison';
import PageHeader from '@/components/page-header';

export const metadata = {
    title: 'Similar Historical Periods | Macro Framework',
    description: 'Find historical periods with similar macro conditions based on percentile analysis',
};

export default function SimilarPeriodsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
                <PageHeader title="Historical Period Analysis" subtitle="Compare current conditions with historical periods" />

                <div className="space-y-4 sm:space-y-6">
                    <PeriodComparison />
                    <SimilarPeriods />
                </div>
            </div>
        </div>
    );
}
