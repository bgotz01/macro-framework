import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';

export default function Cycle1972Page() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-4xl font-bold mb-6">1972 — Fiat Regime Price Discovery</h1>
            <p className="text-lg text-muted-foreground mb-8">Theme: Monetary freedom meets reality</p>

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={1972} />
                <CycleMetrics startYear={1971} endYear={1983} />
                <CycleNarrative year={1972} />
                <CycleDetails year={1972} />

            </div>
        </div>
    );
}
