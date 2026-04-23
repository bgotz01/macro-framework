//components/regime/regime-flags-bar.tsx
'use client';

interface Signal {
    type: 'warning' | 'extreme';
    short: string;
    message: string;
}

interface RegimeFlagsBarProps {
    signals: Signal[];
    percentileFlags: Array<{ label: string; delta: number }>;
}

function FlagBadge({ flag }: { flag: Signal }) {
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold select-none ${flag.type === 'warning'
            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500'
            : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500'
            }`}>
            {flag.short}
        </span>
    );
}

function MomBadge({ pf }: { pf: { label: string; delta: number } }) {
    const sign = pf.delta > 0 ? '+' : '';
    const isUp = pf.delta > 0;
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold select-none ${isUp
            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500'
            : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500'
            }`}>
            {pf.label} {sign}{pf.delta.toFixed(0)}
        </span>
    );
}

export default function RegimeFlagsBar({ signals, percentileFlags }: RegimeFlagsBarProps) {
    const hasFlags = signals.length > 0 || percentileFlags.length > 0;

    return (
        <div className="w-full py-3 px-4 bg-muted/10 border-t border-border">
            <div className="max-w-7xl mx-auto">
                {/* Mobile: Single horizontal row */}
                <div className="block sm:hidden">
                    <div className="flex justify-center gap-1 flex-wrap">
                        {signals.map((flag, i) => <FlagBadge key={`signal-${i}`} flag={flag} />)}
                        {percentileFlags.map((pf, i) => <MomBadge key={`mom-${i}`} pf={pf} />)}
                        {!hasFlags && (
                            <span className="text-[9px] text-muted-foreground/40 italic">no active flags</span>
                        )}
                    </div>
                </div>

                {/* Desktop: Two columns with labels */}
                <div className="hidden sm:flex justify-center gap-8">
                    <div className="flex flex-col gap-1 items-center">
                        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Signals</div>
                        <div className="flex gap-1 flex-wrap justify-center">
                            {signals.length > 0
                                ? signals.map((flag, i) => <FlagBadge key={i} flag={flag} />)
                                : <span className="text-[9px] text-muted-foreground/40 italic">none</span>
                            }
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">MoM Moves</div>
                        <div className="flex gap-1 flex-wrap justify-center">
                            {percentileFlags.length > 0
                                ? percentileFlags.map((pf, i) => <MomBadge key={i} pf={pf} />)
                                : <span className="text-[9px] text-muted-foreground/40 italic">none</span>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
