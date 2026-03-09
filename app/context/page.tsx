import RegimeCyclesTimeline from '@/components/regime/regime-cycles-timeline';

export default function ContextPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-light tracking-wider mb-1" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}>
                    CAPITAL PHYSICS
                </h1>
                <p className="text-sm font-light text-muted-foreground tracking-widest uppercase" style={{ letterSpacing: '0.2em' }}>
                    Capital Regime Cycles
                </p>
            </div>

            <RegimeCyclesTimeline />
        </div>
    );
}
