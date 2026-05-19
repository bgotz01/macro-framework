import PresidentialTerms from '@/components/12-year-cycle/presidential-terms';
import CycleMetrics from '@/components/12-year-cycle/cycle-metrics';
import CycleDetails from '@/components/12-year-cycle/cycle-details';
import CycleNarrative from '@/components/12-year-cycle/cycle-narrative';

export default function Cycle2008Page() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">2008 — Monetary Intervention Era</h1>
                <p className="page-subtitle">Liquidity replaces price signals</p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            <div className="space-y-8">
                <PresidentialTerms cycleStartYear={2008} />
                <CycleMetrics startYear={2007} endYear={2019} />
                <CycleNarrative year={2008} />
                <CycleDetails year={2008} />

            </div>
        </div>
    );
}
