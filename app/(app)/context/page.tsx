import RegimeCyclesTimeline from '@/components/regime/regime-cycles-timeline';
import PageHeader from '@/components/page-header';

export default function ContextPage() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <PageHeader title="CAPITAL PHYSICS" subtitle="Capital Regime Cycles" />

            <RegimeCyclesTimeline />
        </div>
    );
}
