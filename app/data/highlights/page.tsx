import { Top10ConcentrationChart } from '@/components/charts/top10-concentration-chart';

export default function HighlightsPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="page-title text-4xl font-bold mb-2">Market Highlights</h1>
                <p className="text-muted-foreground">
                    Key charts and insights on market concentration, cycles, and trends
                </p>
            </div>

            <div className="space-y-8">
                <Top10ConcentrationChart />
            </div>
        </div>
    );
}
