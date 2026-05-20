import { Top10ConcentrationChart } from '@/components/charts/top10-concentration-chart';
import PageHeader from '@/components/page-header';

export default function HighlightsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <PageHeader title="Market Highlights" subtitle="Market concentration, cycles, and trends" />

            <div className="space-y-8">
                <Top10ConcentrationChart />
            </div>
        </div>
    );
}
