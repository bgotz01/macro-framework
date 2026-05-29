import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';
import PageHeader from '@/components/page-header';

export default function Cycle1984Page() {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <PageHeader title="1984 — Credit Expansion" subtitle="Leverage becomes the growth engine" />

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={1984} />
                <CycleMetrics startYear={1983} endYear={1995} />
                <CycleNarrative year={1984} />
                <CycleDetails year={1984} />

            </div>
        </div>
    );
}
