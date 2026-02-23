import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';

export default function Cycle1948Page() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="page-title text-4xl font-bold mb-6">1948 — Institutional Reconstruction</h1>
            <p className="text-lg text-muted-foreground mb-8">Theme: Order rebuilt after collapse</p>

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={1948} />
                <CycleMetrics startYear={1947} endYear={1959} />
                <CycleNarrative year={1948} />
                <CycleDetails year={1948} />

            </div>
        </div>
    );
}
