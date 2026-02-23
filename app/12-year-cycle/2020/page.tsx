import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';

export default function Cycle2020Page() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="page-title text-4xl font-bold mb-6">2020 — Digital Economy</h1>
            <p className="text-lg text-muted-foreground mb-8">Theme: Reality goes virtual</p>

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={2020} />
                <CycleMetrics startYear={2019} endYear={2031} />
                <CycleNarrative year={2020} />
                <CycleDetails year={2020} />

            </div>
        </div>
    );
}
