import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';
import PageHeader from '@/components/page-header';

export default function Cycle2008Page() {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <PageHeader title="2008 — Monetary Intervention Era" subtitle="Liquidity replaces price signals" />

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={2008} />
                <CycleMetrics startYear={2007} endYear={2019} />
                <CycleNarrative year={2008} />
                <CycleDetails year={2008} />

            </div>
        </div>
    );
}
