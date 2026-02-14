import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';

export default function Cycle2008Page() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-4xl font-bold mb-6">2008 — Monetary Intervention Era</h1>
            <p className="text-lg text-muted-foreground mb-8">Theme: Liquidity replaces price signals</p>

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={2008} />
                <CycleMetrics startYear={2007} endYear={2019} />
                <CycleNarrative year={2008} />
                <CycleDetails year={2008} />

            </div>
        </div>
    );
}
