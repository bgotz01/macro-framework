import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';
import PageHeader from '@/components/page-header';

export default function Cycle1996Page() {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <PageHeader title="1996 — Digital Infrastructure" subtitle="Information → networked → scalable" />

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={1996} />
                <CycleMetrics startYear={1995} endYear={2007} />
                <CycleNarrative year={1996} />
                <CycleDetails year={1996} />

            </div>
        </div>
    );
}
