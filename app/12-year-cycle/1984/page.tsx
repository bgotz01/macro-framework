import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';

export default function Cycle1984Page() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-4xl font-bold mb-6">1984 — Credit Expansion</h1>
            <p className="text-lg text-muted-foreground mb-8">Theme: Leverage becomes the growth engine</p>

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={1984} />
                <CycleMetrics startYear={1983} endYear={1995} />
                <CycleNarrative year={1984} />
                <CycleDetails year={1984} />

            </div>
        </div>
    );
}
