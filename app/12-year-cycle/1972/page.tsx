import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';
import PageHeader from '@/components/page-header';

export default function Cycle1972Page() {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <PageHeader title="1972 — Fiat Regime Price Discovery" subtitle="Monetary freedom meets reality" />

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={1972} />
                <CycleMetrics startYear={1971} endYear={1983} />
                <CycleNarrative year={1972} />
                <CycleDetails year={1972} />

            </div>
        </div>
    );
}
