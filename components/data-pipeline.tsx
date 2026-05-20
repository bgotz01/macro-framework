const PIPELINE_STEPS = [
    {
        label: 'Market Prices',
        detail: 'Yahoo Finance',
        description: 'Equities, bonds, FX, commodities — fetched daily',
    },
    {
        label: 'Economic Data',
        detail: 'BLS · FRED · Manual',
        description: 'CPI-U, M2, SP500 EPS — entered monthly',
    },
    {
        label: 'Derived Series',
        detail: 'Calculated',
        description: 'Real yields, yield curves, earnings yield spreads',
    },
    {
        label: 'Percentile Ranks',
        detail: 'Historical context',
        description: 'Every metric ranked against its full history',
    },
    {
        label: 'Regime Model',
        detail: 'Classification',
        description: 'Liquidity, valuation & growth signals → regime state',
    },
    {
        label: 'Capital Allocation',
        detail: 'Portfolio signals',
        description: 'Asset weights derived from regime state',
    },
];

export default function DataPipeline() {
    return (
        <div className="p-6 sm:p-8 rounded-2xl border border-border/50 bg-card">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-1">Data Pipeline</h3>
                <p className="text-sm text-muted-foreground">How raw data becomes regime signals</p>
            </div>

            {/* Mobile: vertical list */}
            <div className="flex flex-col sm:hidden">
                {PIPELINE_STEPS.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                        {/* Left: dot + vertical line */}
                        <div className="flex flex-col items-center shrink-0 pt-0.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-foreground/40" />
                            {i < PIPELINE_STEPS.length - 1 && (
                                <div className="w-px flex-1 bg-border my-1" style={{ minHeight: '2rem' }} />
                            )}
                        </div>
                        {/* Right: content */}
                        <div className="pb-4">
                            <div className="text-xs font-semibold text-card-foreground">{step.label}</div>
                            <div className="text-xs font-medium mt-0.5 text-muted-foreground">{step.detail}</div>
                            <div className="text-xs text-muted-foreground/70 mt-1 leading-snug">{step.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop: horizontal */}
            <div className="hidden sm:flex items-start gap-0">
                {PIPELINE_STEPS.map((step, i) => (
                    <div key={i} className="flex items-start flex-1 min-w-0">
                        <div className="flex flex-col items-center flex-1 min-w-0">
                            {/* Top row: dot + connector */}
                            <div className="flex items-center w-full">
                                <div className="w-2.5 h-2.5 rounded-full bg-foreground/40 shrink-0" />
                                {i < PIPELINE_STEPS.length - 1 && (
                                    <>
                                        <div className="flex-1 h-px bg-border" />
                                        <div className="text-muted-foreground/40 text-xs mx-1">→</div>
                                    </>
                                )}
                            </div>
                            {/* Content below dot */}
                            <div className="mt-3 pr-2 w-full">
                                <div className="text-xs font-semibold text-card-foreground">{step.label}</div>
                                <div className="text-xs font-medium mt-0.5 text-muted-foreground">{step.detail}</div>
                                <div className="text-xs text-muted-foreground/70 mt-1 leading-snug">{step.description}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
