import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';

export default function Cycle1996Page() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-4xl font-bold mb-6">1996 — Digital Infrastructure</h1>
            <p className="text-lg text-muted-foreground mb-8">Theme: Information → networked → scalable</p>

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={1996} />
                <CycleMetrics startYear={1995} endYear={2007} />
                <CycleNarrative year={1996} />
                <CycleDetails year={1996} />

            </div>
        </div>
    );
}
