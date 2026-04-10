'use client';

import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';

const ALLOCATION_MAP: Record<RegimeFamily, { asset: string; ticker: string; rationale: string }> = {
    'Broad Growth': { asset: 'S&P 500', ticker: 'SPY', rationale: 'Strong real earnings support broad equity expansion' },
    'Long Duration': { asset: 'Nasdaq', ticker: 'QQQ', rationale: 'Negative EYP favors growth/duration over value' },
    'Liquidity Shock': { asset: 'Nasdaq', ticker: 'QQQ', rationale: 'Massive liquidity injection drives speculative growth' },
    'Overvaluation': { asset: 'Cash / Bonds', ticker: 'SHY', rationale: 'Equities unattractive vs risk-free — reduce equity exposure' },
    'Bond Stress': { asset: 'Gold / Cash', ticker: 'GLD', rationale: 'Deep negative real rates — gold as primary hedge, cash for optionality' },
    'Crisis': { asset: 'Long Gold / Short Growth', ticker: 'GLD/QQQ', rationale: 'Financial repression with tight money — reduce or short equity exposure' },
    'Normal': { asset: 'S&P 500', ticker: 'SPY', rationale: 'Balanced conditions — default to broad market exposure' },
};

interface Props {
    regime: RegimeFamily;
}

export default function CapitalAllocation({ regime }: Props) {
    const allocation = ALLOCATION_MAP[regime];
    const metadata = REGIME_METADATA[regime];
    const color = metadata?.color ?? '#6b7280';

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-4"
                style={{ letterSpacing: '0.15em' }}>
                Capital Allocation
            </p>

            <div className="flex items-center gap-4">
                {/* Color accent */}
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: color }} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-2xl font-semibold tracking-tight">{allocation.asset}</span>
                        <span
                            className="text-xs font-mono px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: `${color}20`, color }}
                        >
                            {allocation.ticker}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {allocation.rationale}
                    </p>
                </div>
            </div>
        </div>
    );
}
