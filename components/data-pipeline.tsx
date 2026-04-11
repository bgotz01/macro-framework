const PIPELINE_STEPS = [
    {
        label: 'Market Prices',
        detail: 'Yahoo Finance',
        description: 'Equities, bonds, FX, commodities — fetched daily',
        color: 'bg-blue-500',
    },
    {
        label: 'Economic Data',
        detail: 'BLS · FRED · Manual',
        description: 'CPI-U, M2, SP500 EPS — entered monthly',
        color: 'bg-violet-500',
    },
    {
        label: 'Derived Series',
        detail: 'Calculated',
        description: 'Real yields, yield curves, earnings yield spreads',
        color: 'bg-amber-500',
    },
    {
        label: 'Percentile Ranks',
        detail: 'Historical context',
        description: 'Every metric ranked against its full history',
        color: 'bg-emerald-500',
    },
    {
        label: 'Regime Model',
        detail: 'Classification',
        description: 'Liquidity, valuation & growth signals → regime state',
        color: 'bg-rose-500',
    },
    {
        label: 'Capital Allocation',
        detail: 'Portfolio signals',
        description: 'Asset weights derived from regime state',
        color: 'bg-orange-500',
    },
];

export default function DataPipeline() {
    return (
        <div className="p-8 rounded-2xl border border-border/50 bg-card">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-1">Data Pipeline</h3>
                <p className="text-sm text-muted-foreground">How raw data becomes regime signals</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-0">
                {PIPELINE_STEPS.map((step, i) => (
                    <div key={i} className="flex sm:flex-col items-center flex-1">
                        {/* Node */}
                        <div className="flex sm:flex-col items-center w-full">
                            <div className={`w-2.5 h-2.5 rounded-full ${step.color} shrink-0`} />
                            {/* Connector */}
                            {i < PIPELINE_STEPS.length - 1 && (
                                <div className="sm:hidden h-px w-full bg-border mx-1" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 sm:mt-3 ml-3 sm:ml-0 sm:text-center">
                            <div className="text-xs font-semibold text-card-foreground">{step.label}</div>
                            <div className={`text-xs font-medium mt-0.5 ${step.color.replace('bg-', 'text-')}`}>{step.detail}</div>
                            <div className="text-xs text-muted-foreground mt-1 leading-snug hidden sm:block">{step.description}</div>
                        </div>

                        {/* Horizontal connector for desktop */}
                        {i < PIPELINE_STEPS.length - 1 && (
                            <div className="hidden sm:flex items-center self-start mt-1.5 w-full">
                                <div className="flex-1 h-px bg-border" />
                                <div className="text-muted-foreground/40 text-xs mx-1">→</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
