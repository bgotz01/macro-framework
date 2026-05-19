import Link from 'next/link';

export default function SignalsPage() {
    const riskOffSignals = [
        {
            id: 'system-stress',
            title: 'System Stress',
            description: 'Financial system unanchored → Gold / real assets',
            trigger: 'Real 10Y < -0.5%',
            priority: 1,
        },
        {
            id: 'real-earnings-yield',
            title: 'Negative Real Earnings Yield',
            description: 'Multi-level equity valuation signal (Warning / Sell / Exit)',
            trigger: 'Real EY < +0.5% / -1% / -2%',
            priority: 2,
            isMultiLevel: true,
        },
        {
            id: 'equity-danger',
            title: 'Equity Danger',
            description: 'Liquidity broken → Bonds or gold',
            trigger: 'EYP < -1% AND Yield Curve < 0%',
            priority: 3,
        },
    ];

    const riskOnSignals = [
        {
            id: 'growth-regime',
            title: 'Growth Signal',
            description: 'Liquidity supports duration → High-growth equities',
            trigger: 'EYP < -1% AND Yield Curve > 0%',
            priority: 4,
        },
        {
            id: 'equity-value',
            title: 'Equity Value Window',
            description: 'Attractive valuations → BUY equities',
            trigger: 'Real EY ≥ +3.0%',
            priority: 5,
        },
        {
            id: 'normal',
            title: 'Normal',
            description: 'All metrics healthy → Balanced portfolio',
            trigger: 'No stress signals active',
            priority: 6,
        },
    ];

    const SignalCard = ({ signal }: { signal: typeof riskOffSignals[0] }) => (
        <Link
            href={`/signals/${signal.id}`}
            className="block border border-border rounded-lg hover:border-primary/50 transition-colors overflow-hidden"
        >
            <div className="flex items-center">
                {/* Priority indicator */}
                <div className="w-14 flex-shrink-0 bg-muted/50 h-full flex items-center justify-center border-r border-border py-5">
                    <div className="text-center">
                        <div className="text-xl font-bold">{signal.priority}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Priority</div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                    <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold">{signal.title}</h3>
                            {signal.isMultiLevel && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-muted/50 text-muted-foreground border-border">
                                    Multi-Level
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">{signal.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Trigger:</span>
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{signal.trigger}</code>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">MARKET SIGNALS</h1>
                <p className="page-subtitle">
                    Hierarchical framework for market conditions
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Risk-Off Column */}
                <div>
                    <div className="mb-4 pb-3 border-b border-red-500/30">
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Risk-Off / Defensive</h2>
                        <p className="text-sm text-muted-foreground mt-1">Signals indicating elevated risk or unfavorable conditions</p>
                    </div>
                    <div className="space-y-3">
                        {riskOffSignals.map((signal) => (
                            <SignalCard key={signal.id} signal={signal} />
                        ))}
                    </div>
                </div>

                {/* Risk-On Column */}
                <div>
                    <div className="mb-4 pb-3 border-b border-green-500/30">
                        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Risk-On / Constructive</h2>
                        <p className="text-sm text-muted-foreground mt-1">Signals indicating favorable conditions for risk assets</p>
                    </div>
                    <div className="space-y-3">
                        {riskOnSignals.map((signal) => (
                            <SignalCard key={signal.id} signal={signal} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
