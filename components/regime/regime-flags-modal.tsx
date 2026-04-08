'use client';

import { useState } from 'react';

const SIGNAL_DEFINITIONS = [
    {
        short: 'YC INV',
        type: 'warning' as const,
        title: 'Yield Curve Inverted',
        description: 'The 10Y–3M yield spread is negative. Historically, yield curve inversions have preceded every US recession since the 1960s, typically with a 12–24 month lag. Active when the spread is below 0%.'
    },
    {
        short: 'YC -Nmo',
        type: 'warning' as const,
        title: 'Yield Curve Recently Uninverted',
        description: 'The yield curve inverted recently and has since normalised, but the 18-month recession watch window is still open. Historical data shows recessions most commonly begin within 18 months of uninversion.'
    },
    {
        short: 'EYP X.X%',
        type: 'warning' as const,
        title: 'Earnings Yield Premium Negative',
        description: 'The Earnings Yield Premium (equity earnings yield minus 10Y Treasury) is below –2%. Equities are significantly below the risk-free rate, indicating stocks are expensive relative to bonds. Historically correlates with poor forward equity returns.'
    },
    {
        short: 'Overvalued',
        type: 'warning' as const,
        title: '500-Day MA Slope Elevated',
        description: 'The 500-Day Moving Average slope is above the 85th historical percentile. Trend pressure is historically elevated — markets at this level of trend extension have shown increased vulnerability to mean reversion.'
    },
    {
        short: '200MA ↓',
        type: 'extreme' as const,
        title: '200-Day MA Slope Negative',
        description: 'The 200-Day Moving Average slope has turned negative. A declining 200MA is a classic bear market signal and often precedes sustained drawdowns. Active when slope < –0.02.'
    },
];

const MOM_DEFINITION = {
    title: 'Month-over-Month Percentile Move',
    description: 'Any input metric whose historical percentile rank shifts by more than ±10 points in a single month. Large percentile moves signal rapid changes in macro conditions that may not yet be reflected in the active regime. Positive moves (>+10) are flagged yellow; negative moves (<–10) are flagged red.',
    examples: ['Fed Rate +12', 'Real M2 –15', 'EYP +11']
};

function Badge({ short, type }: { short: string; type: 'warning' | 'extreme' }) {
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${type === 'warning'
                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500'
                : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500'
            }`}>
            {short}
        </span>
    );
}

export default function RegimeFlagsModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
                Flag Guide
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                    <div className="absolute inset-0 bg-black/50" />
                    <div
                        className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h3 className="text-base font-semibold">Flag Reference Guide</h3>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-5 space-y-6">
                            {/* Signals section */}
                            <div>
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Signals</div>
                                <div className="space-y-3">
                                    {SIGNAL_DEFINITIONS.map((def, i) => (
                                        <div key={i} className={`flex gap-3 p-3 rounded-lg border ${def.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-red-500/5 border-red-500/30'
                                            }`}>
                                            <Badge short={def.short} type={def.type} />
                                            <div>
                                                <p className="text-sm font-medium text-foreground mb-0.5">{def.title}</p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{def.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* MoM Moves section */}
                            <div>
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">MoM Moves</div>
                                <div className="flex gap-3 p-3 rounded-lg border bg-yellow-500/5 border-yellow-500/30">
                                    <div className="flex flex-col gap-1 flex-shrink-0">
                                        {MOM_DEFINITION.examples.map((ex, i) => (
                                            <Badge key={i} short={ex} type={i === 1 ? 'extreme' : 'warning'} />
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground mb-0.5">{MOM_DEFINITION.title}</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{MOM_DEFINITION.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
