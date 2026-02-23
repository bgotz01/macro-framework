import TwelveYearCycleTable from '@/components/twelve-year-cycle-table';
import TwelveYearOTable from '@/components/twelve-year-o-table';
import TwelveYearSystemTable from '@/components/twelve-year-system-table';
import TwelveYearSummary from '@/components/twelve-year-summary';
import WhyTwelve from '@/components/12-year-cycle/why-twelve';

export default function TwelveYearCyclePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="page-title text-4xl text-center font-bold mb-6">12-Year Macro Reconfiguration Cycles</h1>

            <div className="mb-12">


                {/* One-Line Summaries */}
                <div className="mb-8">
                    <TwelveYearSummary />
                </div>

                {/* Expanded Table */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Expanded Overview</h2>
                    <TwelveYearCycleTable />
                </div>


                {/* O-Framework Table */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">OS-Framework Analysis</h2>
                    <TwelveYearOTable />
                </div>

                {/* Visual Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <a href="/12-year-cycle/1948" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1948</div>
                        <div className="text-sm font-semibold mb-2">Institutional Reconstruction</div>
                        <div className="text-xs italic text-muted-foreground">Order rebuilt after collapse</div>
                    </a>

                    <a href="/12-year-cycle/1960" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1960</div>
                        <div className="text-sm font-semibold mb-2">Institutional Capital & Brand Consolidation</div>
                        <div className="text-xs italic text-muted-foreground">Permanence as an investment thesis</div>
                    </a>

                    <a href="/12-year-cycle/1972" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1972</div>
                        <div className="text-sm font-semibold mb-2">Fiat Regime Price Discovery</div>
                        <div className="text-xs italic text-muted-foreground">Monetary freedom meets reality</div>
                    </a>

                    <a href="/12-year-cycle/1984" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1984</div>
                        <div className="text-sm font-semibold mb-2">Credit Expansion</div>
                        <div className="text-xs italic text-muted-foreground">Leverage becomes the growth engine</div>
                    </a>

                    <a href="/12-year-cycle/1996" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1996</div>
                        <div className="text-sm font-semibold mb-2">Digital Infrastructure</div>
                        <div className="text-xs italic text-muted-foreground">Information → networked → scalable</div>
                    </a>

                    <a href="/12-year-cycle/2008" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">2008</div>
                        <div className="text-sm font-semibold mb-2">Monetary Intervention Era</div>
                        <div className="text-xs italic text-muted-foreground">Liquidity replaces price signals</div>
                    </a>

                    <a href="/12-year-cycle/2020" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">2020</div>
                        <div className="text-sm font-semibold mb-2">Digital Economy</div>
                        <div className="text-xs italic text-muted-foreground">Reality goes virtual</div>
                    </a>
                </div>
            </div>


        </div>
    );
}
