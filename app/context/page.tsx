import RegimeCyclesTimeline from '@/components/regime/regime-cycles-timeline';

export default function ContextPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">
                    CAPITAL PHYSICS
                </h1>
                <p className="page-subtitle">
                    Capital Regime Cycles
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            <RegimeCyclesTimeline />
        </div>
    );
}
