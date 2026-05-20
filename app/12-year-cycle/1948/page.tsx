import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';
import PageHeader from '@/components/page-header';

export default function Cycle1948Page() {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <PageHeader title="1948 — Institutional Reconstruction" subtitle="Order rebuilt after collapse" />

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={1948} />
                <CycleMetrics startYear={1947} endYear={1959} />
                <CycleNarrative year={1948} />
                <CycleDetails year={1948} />

            </div>
        </div>
    );
}
