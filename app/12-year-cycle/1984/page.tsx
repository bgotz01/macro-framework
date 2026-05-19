import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';

export default function Cycle1984Page() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">1984 — Credit Expansion</h1>
                <p className="page-subtitle">Leverage becomes the growth engine</p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={1984} />
                <CycleMetrics startYear={1983} endYear={1995} />
                <CycleNarrative year={1984} />
                <CycleDetails year={1984} />

            </div>
        </div>
    );
}
