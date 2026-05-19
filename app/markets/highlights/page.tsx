import { Top10ConcentrationChart } from '@/components/charts/top10-concentration-chart';

export default function HighlightsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">Market Highlights</h1>
                <p className="page-subtitle">
                    Market concentration, cycles, and trends
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            <div className="space-y-8">
                <Top10ConcentrationChart />
            </div>
        </div>
    );
}
