'use client';

import { useState } from 'react';

type Tab = 'overview' | 'liquidity' | 'valuation' | 'crisis' | 'precedence';

interface RegimeInfo {
    name: string;
    color: string;
    description: string;
    entry: string;
    exit: string;
    guidance: string;
}

const REGIMES: RegimeInfo[] = [
    {
        name: 'Liquidity Shock',
        color: '#a855f7',
        description: 'Massive money supply growth - liquidity shock',
        entry: 'Real M2 ≥ 10%',
        exit: 'Real M2 < 8%',
        guidance: 'Massive liquidity injection - speculative assets thrive'
    },
    {
        name: 'Crisis',
        color: '#991b1b',
        description: 'Financial repression with low money growth - crisis conditions',
        entry: 'Real 10Y < -1% AND Real M2 < 5%',
        exit: 'Real 10Y ≥ 0.5% OR Real M2 ≥ 7%',
        guidance: 'Real rates negative but money tight - defensive positioning critical'
    },
    {
        name: 'Bond Stress',
        color: '#ea580c',
        description: 'Real rates deeply negative across the curve - bond market stress',
        entry: 'Real 10Y < -0.5% AND Real 3M < -1%',
        exit: 'Real 10Y ≥ 0.25%',
        guidance: 'Severe financial repression - rotate to gold as bonds are unattractive'
    },
    {
        name: 'Overvaluation',
        color: '#eab308',
        description: 'Extreme equity unattractiveness - equities far below risk-free rate',
        entry: 'EYP < -2.5% OR REY < -0.5%',
        exit: 'EYP > 0% AND REY > 0.5%',
        guidance: 'Rotate away from equities: favor bonds if Real 10Y > 0%, favor gold if Real 10Y < 0%'
    },
    {
        name: 'Long Duration',
        color: '#3b82f6',
        description: 'Equities overvalued relative to bonds - duration growth',
        entry: 'EYP < 0% AND Real 10Y > 1%',
        exit: 'EYP ≥ 0% OR EYP ≤ -2.5%',
        guidance: 'Negative equity yield premium - investors buying duration/growth'
    },
    {
        name: 'Broad Growth',
        color: '#22c55e',
        description: 'Strong real earnings environment - healthy equity expansion',
        entry: 'REY > 3%',
        exit: 'REY < 1%',
        guidance: 'Earnings growing faster than inflation - lean into quality growth'
    },
    {
        name: 'Normal',
        color: '#6b7280',
        description: 'Balanced conditions - no extreme triggers active',
        entry: 'Default state when no outlier triggers are active',
        exit: '',
        guidance: 'Standard market environment - maintain diversified positioning'
    }
];

export default function RegimeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
                Regime Guide
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-background border border-border rounded-2xl max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">Market Regime Guide</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border bg-muted/30">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'overview'
                                    ? 'bg-background text-foreground border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('liquidity')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'liquidity'
                                    ? 'bg-background text-foreground border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Liquidity Regimes
                            </button>
                            <button
                                onClick={() => setActiveTab('valuation')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'valuation'
                                    ? 'bg-background text-foreground border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Valuation Regimes
                            </button>
                            <button
                                onClick={() => setActiveTab('crisis')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'crisis'
                                    ? 'bg-background text-foreground border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Other
                            </button>
                            <button
                                onClick={() => setActiveTab('precedence')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'precedence'
                                    ? 'bg-background text-foreground border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Precedence
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="overflow-y-auto p-6 space-y-6">
                            {activeTab === 'overview' && <OverviewContent />}
                            {activeTab === 'liquidity' && <LiquidityRegimesContent />}
                            {activeTab === 'valuation' && <ValuationRegimesContent />}
                            {activeTab === 'crisis' && <AllRegimesContent />}
                            {activeTab === 'precedence' && <PrecedenceContent />}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function OverviewContent() {
    return (
        <>
            <section>
                <h3 className="text-xl font-semibold mb-3">How Regimes Work</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                    Market regimes are persistent states that change only when specific trigger conditions are met.
                    This creates stable, meaningful classifications rather than monthly noise.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    Each regime has entry and exit triggers with hysteresis (wider exit thresholds) to prevent rapid flipping.
                    Higher priority regimes can override lower priority ones when their conditions are met.
                </p>
            </section>

            <section className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">Key Metrics</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div><span className="font-semibold text-foreground">REY (Real Earnings Yield):</span> S&P 500 earnings yield minus inflation - measures real equity returns</div>
                    <div><span className="font-semibold text-foreground">EYP (Equity Yield Premium):</span> Equity earnings yield minus 10Y Treasury - equity yield premium</div>
                    <div><span className="font-semibold text-foreground">Real 10Y:</span> 10Y Treasury yield minus inflation - real bond returns</div>
                    <div><span className="font-semibold text-foreground">Real M2:</span> M2 money supply growth minus inflation - real liquidity growth</div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">Regime Categories</h3>
                <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                        <h4 className="font-semibold mb-1">Liquidity Regimes</h4>
                        <p className="text-sm text-muted-foreground">Crisis, Bond Stress, Liquidity Shock - based on Real 10Y and Real M2</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                        <h4 className="font-semibold mb-1">Valuation Regimes</h4>
                        <p className="text-sm text-muted-foreground">Broad Growth, Long Duration, Overvaluation - based on REY and EYP</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                        <h4 className="font-semibold mb-1">Deterioration Regimes</h4>
                        <p className="text-sm text-muted-foreground">Fragile, Contraction - macro conditions worsening</p>
                    </div>
                </div>
            </section>
        </>
    );
}

function LiquidityRegimesContent() {
    const liquidityRegimes = REGIMES.filter(r =>
        ['Liquidity Shock', 'Crisis', 'Bond Stress'].includes(r.name)
    );

    return (
        <>
            <section>
                <h3 className="text-xl font-semibold mb-3">Liquidity-Based Regimes</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                    These regimes are determined by the combination of real interest rates (Real 10Y) and real money supply growth (Real M2).
                    They represent the monetary environment and its impact on asset prices.
                </p>
            </section>

            <div className="space-y-4">
                {liquidityRegimes.map((regime) => (
                    <RegimeCard key={regime.name} regime={regime} />
                ))}
            </div>

            <section className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <h4 className="text-sm font-semibold mb-2 text-amber-700 dark:text-amber-400">Precedence Order</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Liquidity Shock has highest priority, followed by Crisis, then Bond Stress. This means if multiple conditions are met,
                    the highest priority regime takes precedence.
                </p>
            </section>
        </>
    );
}

function ValuationRegimesContent() {
    const valuationRegimes = REGIMES.filter(r =>
        ['Broad Growth', 'Long Duration', 'Overvaluation'].includes(r.name)
    );

    return (
        <>
            <section>
                <h3 className="text-xl font-semibold mb-3">Valuation-Based Regimes</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                    These regimes are determined by real earnings yield (REY) and earnings yield premium (EYP).
                    They represent equity valuation relative to fundamentals and bonds.
                </p>
            </section>

            <div className="space-y-4">
                {valuationRegimes.map((regime) => (
                    <RegimeCard key={regime.name} regime={regime} />
                ))}
            </div>

            <section className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">Historical Context</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Overvaluation appeared during the 1973 oil crisis, early 1980s Volcker era, and the 2000-2001 tech bubble peak.
                    Deep Value typically follows major crashes when valuations become extremely attractive.
                </p>
            </section>
        </>
    );
}

function AllRegimesContent() {
    return (
        <>
            <section>
                <h3 className="text-xl font-semibold mb-3">Other Regimes</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                    Additional regimes that don't fit neatly into liquidity or valuation categories.
                </p>
            </section>

            <div className="space-y-4">
                {REGIMES.filter(r => !['Liquidity Shock', 'Crisis', 'Bond Stress', 'Broad Growth', 'Long Duration', 'Overvaluation'].includes(r.name)).map((regime) => (
                    <RegimeCard key={regime.name} regime={regime} />
                ))}
            </div>
        </>
    );
}

const PRECEDENCE_ORDER = [
    { rank: 1, name: 'Liquidity Shock', color: '#a855f7', metric: 'Real M2', reason: 'Massive liquidity injection overrides all other conditions — speculative dynamics dominate' },
    { rank: 2, name: 'Crisis', color: '#991b1b', metric: 'Real 10Y + Real M2', reason: 'Severe financial repression with tight money — system-level stress takes priority' },
    { rank: 3, name: 'Bond Stress', color: '#ea580c', metric: 'Real 10Y + Real 3M', reason: 'Deep negative real rates across the curve — bonds structurally broken' },
    { rank: 4, name: 'Overvaluation', color: '#eab308', metric: 'EYP + REY', reason: 'Extreme equity unattractiveness vs bonds or negative real earnings — valuation risk dominates' },
    { rank: 5, name: 'Broad Growth', color: '#22c55e', metric: 'REY', reason: 'Strong real earnings — healthy equity expansion environment' },
    { rank: 6, name: 'Long Duration', color: '#3b82f6', metric: 'EYP + Real 10Y', reason: 'Equities overvalued but functioning — duration/growth regime' },
    { rank: 7, name: 'Normal', color: '#6b7280', metric: '—', reason: 'Default fallback when no outlier triggers are active' },
];

function PrecedenceContent() {
    return (
        <>
            <section>
                <h3 className="text-xl font-semibold mb-3">Regime Precedence Order</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                    When multiple regime triggers fire simultaneously, the highest-priority regime wins.
                    This ordering reflects the severity and dominance of each condition — liquidity shocks and crises
                    override valuation signals because they represent system-level forces.
                </p>
            </section>

            <div className="space-y-2">
                {PRECEDENCE_ORDER.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-[180px]">
                            <span className="text-lg font-bold text-muted-foreground w-7 text-right">{item.rank}</span>
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="font-semibold">{item.name}</span>
                        </div>
                        <div className="flex-1 text-sm text-muted-foreground">
                            {item.reason}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground/70 min-w-[120px] text-right">
                            {item.metric}
                        </div>
                    </div>
                ))}
            </div>

            <section className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mt-2">
                <h4 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">How It Works</h4>
                <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <p>
                        The state machine checks triggers from rank 1 down. The first regime whose entry condition is met
                        (and whose exit condition has not fired) becomes the active regime.
                    </p>
                    <p>
                        Regimes use <span className="font-semibold text-foreground">hysteresis</span> — entry and exit thresholds differ —
                        so a regime won't deactivate the moment conditions slightly improve. This prevents noisy flip-flopping.
                    </p>
                </div>
            </section>
        </>
    );
}

function RegimeCard({ regime }: { regime: RegimeInfo }) {
    return (
        <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
                <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: regime.color }}
                />
                <h4 className="font-semibold text-lg">{regime.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{regime.description}</p>

            <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                    <span className="font-semibold text-green-600 dark:text-green-400 min-w-[60px]">Entry:</span>
                    <span className="text-muted-foreground">{regime.entry}</span>
                </div>
                {regime.exit && (
                    <div className="flex gap-2">
                        <span className="font-semibold text-red-600 dark:text-red-400 min-w-[60px]">Exit:</span>
                        <span className="text-muted-foreground">{regime.exit}</span>
                    </div>
                )}
                <div className="pt-2 mt-2 border-t border-border/50">
                    <span className="font-semibold text-foreground">Guidance: </span>
                    <span className="text-muted-foreground">{regime.guidance}</span>
                </div>
            </div>
        </div>
    );
}
