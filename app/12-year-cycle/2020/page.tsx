import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';
import PageHeader from '@/components/page-header';

export default function Cycle2020Page() {
    return (
        <div className="container mx-auto px-4 max-w-6xl">
            <PageHeader title="2020 — Digital Economy" subtitle="Reality goes virtual" />

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={2020} />
                <CycleMetrics startYear={2019} endYear={2031} />
                <CycleNarrative year={2020} />
                <CycleDetails year={2020} />

            </div>
        </div>
    );
}
