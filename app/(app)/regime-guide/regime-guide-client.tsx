'use client';

import { useState } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/page-header';

interface RegimeInfo {
    id: string;
    name: string;
    color: string;
    category: string;
    description: string;
    entry: string;
    exit: string;
    guidance: string;
    chartSrc?: string;
}

const REGIMES: RegimeInfo[] = [
    {
        id: 'liquidity-shock',
        name: 'Liquidity Shock',
        color: '#a855f7',
        category: 'Liquidity',
        description: 'Massive money supply growth — liquidity shock conditions. Real M2 surges well above inflation, flooding the system with cheap capital.',
        entry: 'Real M2 ≥ 10%',
        exit: 'Real M2 < 8%',
        guidance: 'Massive liquidity injection — speculative assets thrive. Risk assets broadly outperform as capital seeks yield.',
        chartSrc: '/regime-guide/charts/Liquidity-Shock.png',
    },
    {
        id: 'crisis',
        name: 'Crisis',
        color: '#991b1b',
        category: 'Liquidity',
        description: 'Financial repression with low money growth — crisis conditions. Real rates are deeply negative while money supply is tight, a dangerous combination.',
        entry: 'Real 10Y < -1% AND Real M2 < 5%',
        exit: 'Real 10Y ≥ 0.5% OR Real M2 ≥ 7%',
        guidance: 'Real rates negative but money tight — defensive positioning critical. Gold and short-duration assets preferred.',
        chartSrc: '/regime-guide/charts/Crisis.png',
    },
    {
        id: 'bond-stress',
        name: 'Bond Stress',
        color: '#ea580c',
        category: 'Liquidity',
        description: 'Real rates deeply negative across the entire yield curve — bond market stress. Both short and long-end real yields are suppressed.',
        entry: 'Real 10Y < -0.5% AND Real 3M < -1%',
        exit: 'Real 10Y ≥ 0.25%',
        guidance: 'Severe financial repression — rotate to gold as bonds are structurally unattractive.',
    },
    {
        id: 'overvaluation',
        name: 'Overvaluation',
        color: '#eab308',
        category: 'Valuation',
        description: 'Extreme equity unattractiveness — equities far below the risk-free rate. Either the equity yield premium is deeply negative or real earnings yield is negative.',
        entry: 'EYP < -2.5% OR REY < -0.5%',
        exit: 'EYP > 0% AND REY > 0.5%',
        guidance: 'Rotate away from equities: favor bonds if Real 10Y > 0%, favor gold if Real 10Y < 0%.',
        chartSrc: '/regime-guide/charts/Overvaluation.png',
    },
    {
        id: 'long-duration',
        name: 'Long Duration',
        color: '#3b82f6',
        category: 'Valuation',
        description: 'Equities overvalued relative to bonds — duration growth regime. The equity yield premium is negative but real earnings yield is still positive.',
        entry: 'EYP ≤ 0% AND Real 10Y ≥ 1% AND REY > 0%',
        exit: 'EYP ≥ 0% OR EYP ≤ -2.5% OR REY < -0.5%',
        guidance: 'Negative equity yield premium — investors buying duration and growth. Long-duration bonds and growth equities outperform.',
        chartSrc: '/regime-guide/charts/Long-duration.png',
    },
    {
        id: 'broad-growth',
        name: 'Broad Growth',
        color: '#22c55e',
        category: 'Valuation',
        description: 'Strong real earnings environment — healthy equity expansion. Real earnings yield is high, meaning equities are genuinely cheap relative to inflation.',
        entry: 'REY > 3%',
        exit: 'REY < 1%',
        guidance: 'Earnings growing faster than inflation — lean into quality growth and broad equity exposure.',
        chartSrc: '/regime-guide/charts/Broad-growth.png',
    },
    {
        id: 'normal',
        name: 'Normal',
        color: '#6b7280',
        category: 'Default',
        description: 'Balanced conditions — no extreme triggers active. The market is in a standard environment without outlier signals in any direction.',
        entry: 'Default state when no outlier triggers are active',
        exit: '—',
        guidance: 'Standard market environment — maintain diversified positioning.',
    },
];

const PRECEDENCE_ORDER = [
    { rank: 1, id: 'liquidity-shock', name: 'Liquidity Shock', color: '#a855f7', metric: 'Real M2', reason: 'Massive liquidity injection overrides all other conditions — speculative dynamics dominate' },
    { rank: 2, id: 'crisis', name: 'Crisis', color: '#991b1b', metric: 'Real 10Y + Real M2', reason: 'Severe financial repression with tight money — system-level stress takes priority' },
    { rank: 3, id: 'bond-stress', name: 'Bond Stress', color: '#ea580c', metric: 'Real 10Y + Real 3M', reason: 'Deep negative real rates across the curve — bonds structurally broken' },
    { rank: 4, id: 'overvaluation', name: 'Overvaluation', color: '#eab308', metric: 'EYP + REY', reason: 'Extreme equity unattractiveness vs bonds or negative real earnings — valuation risk dominates' },
    { rank: 5, id: 'broad-growth', name: 'Broad Growth', color: '#22c55e', metric: 'REY', reason: 'Strong real earnings — healthy equity expansion environment' },
    { rank: 6, id: 'long-duration', name: 'Long Duration', color: '#3b82f6', metric: 'EYP + Real 10Y', reason: 'Equities overvalued but functioning — duration/growth regime' },
    { rank: 7, id: 'normal', name: 'Normal', color: '#6b7280', metric: '—', reason: 'Default fallback when no outlier triggers are active' },
];

const NAV_ITEMS = [
    { id: 'overview', label: 'Overview' },
    { id: 'summary-table', label: 'Entry / Exit Table' },
    { id: 'key-metrics', label: 'Key Metrics' },
    ...REGIMES.map(r => ({ id: r.id, label: r.name, color: r.color })),
    { id: 'precedence', label: 'Precedence' },
];

export default function RegimeGuideClient() {
    const [activeSection, setActiveSection] = useState('overview');

    const scrollTo = (id: string) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <PageHeader title="REGIME GUIDE" />

            <div className="flex gap-8 items-start">
                {/* Sidebar Nav */}
                <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-6">
                    <nav className="space-y-1">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollTo(item.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeSection === item.id
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                {'color' in item && item.color && (
                                    <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                )}
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-12">

                    {/* Overview */}
                    <section id="overview" className="scroll-mt-6">
                        <h2 className="text-2xl font-bold mb-4">How Regimes Work</h2>
                        <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                Market regimes are persistent states that change only when specific trigger conditions are met.
                                This creates stable, meaningful classifications rather than monthly noise.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Each regime has entry and exit triggers with <span className="text-foreground font-medium">hysteresis</span> — wider exit thresholds — to prevent rapid flipping.
                                Higher priority regimes override lower priority ones when their conditions are met simultaneously.
                            </p>
                            <div className="grid sm:grid-cols-3 gap-4 pt-2">
                                {[
                                    { label: 'Liquidity Regimes', desc: 'Crisis, Bond Stress, Liquidity Shock — driven by Real 10Y and Real M2', color: '#ea580c' },
                                    { label: 'Valuation Regimes', desc: 'Broad Growth, Long Duration, Overvaluation — driven by REY and EYP', color: '#3b82f6' },
                                    { label: 'Default', desc: 'Normal — fallback when no outlier triggers are active', color: '#6b7280' },
                                ].map(c => (
                                    <div key={c.label} className="p-4 rounded-xl bg-muted/40 border border-border/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                                            <span className="font-semibold text-sm">{c.label}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{c.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Compact Summary Table */}
                    <section id="summary-table" className="scroll-mt-6">
                        <h2 className="text-2xl font-bold mb-4">Entry / Exit Summary</h2>
                        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/50 bg-muted/40">
                                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-36">Regime</th>
                                            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
                                            <th className="text-left px-4 py-3 font-semibold text-green-600 dark:text-green-400">Entry</th>
                                            <th className="text-left px-4 py-3 font-semibold text-red-600 dark:text-red-400">Exit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {REGIMES.map((regime, i) => (
                                            <tr
                                                key={regime.id}
                                                className={`border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
                                                onClick={() => scrollTo(regime.id)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: regime.color }} />
                                                        <span className="font-medium">{regime.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{regime.category}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-foreground/80">{regime.entry}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-foreground/80">{regime.exit}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-4 py-3 border-t border-border/30 bg-muted/20">
                                <p className="text-xs text-muted-foreground">Click any row to jump to the full regime detail. Regimes are checked in precedence order — highest priority wins.</p>
                            </div>
                        </div>
                    </section>

                    {/* Key Metrics */}
                    <section id="key-metrics" className="scroll-mt-6">
                        <h2 className="text-2xl font-bold mb-4">Key Metrics</h2>
                        <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-3">
                            {[
                                { abbr: 'REY', full: 'Real Earnings Yield', def: 'S&P 500 earnings yield minus inflation — measures real equity returns. Uses trailing 5-year EPS.' },
                                { abbr: 'EYP', full: 'Equity Yield Premium', def: 'Equity earnings yield minus 10Y Treasury — equity yield premium over bonds. Uses trailing 5-year EPS.' },
                                { abbr: 'Real 10Y', full: '10Y Real Rate', def: '10Y Treasury yield minus inflation — real bond returns' },
                                { abbr: 'Real 3M', full: '3M Real Rate', def: '3M Treasury yield minus inflation — short-end real rate' },
                                { abbr: 'Real M2', full: 'Real M2 Growth', def: 'M2 money supply growth minus inflation — real liquidity growth' },
                            ].map(m => (
                                <div key={m.abbr} className="flex gap-3 text-sm">
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 min-w-[90px]">{m.abbr}</span>
                                    <span className="text-muted-foreground"><span className="text-foreground font-medium">{m.full}:</span> {m.def}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Individual Regime Sections */}
                    {REGIMES.map((regime) => (
                        <section key={regime.id} id={regime.id} className="scroll-mt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: regime.color }} />
                                <h2 className="text-2xl font-bold">{regime.name}</h2>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{regime.category}</span>
                            </div>

                            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                                <div className="h-1 w-full" style={{ backgroundColor: regime.color }} />
                                <div className="p-6 space-y-6">
                                    <p className="text-muted-foreground leading-relaxed">{regime.description}</p>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                                            <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1 uppercase tracking-wide">Entry</div>
                                            <div className="font-mono text-sm">{regime.entry}</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                            <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wide">Exit</div>
                                            <div className="font-mono text-sm">{regime.exit}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
                                        <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Guidance</div>
                                        <p className="text-sm">{regime.guidance}</p>
                                    </div>

                                    {/* Chart */}
                                    {regime.chartSrc && (
                                        <div className="rounded-xl overflow-hidden border border-border/40">
                                            <Image
                                                src={regime.chartSrc}
                                                alt={`${regime.name} chart`}
                                                width={900}
                                                height={400}
                                                className="w-full h-auto"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    ))}

                    {/* Precedence */}
                    <section id="precedence" className="scroll-mt-6">
                        <h2 className="text-2xl font-bold mb-4">Precedence Order</h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            When multiple regime triggers fire simultaneously, the highest-priority regime wins.
                            This ordering reflects severity — liquidity shocks and crises override valuation signals
                            because they represent system-level forces.
                        </p>
                        <div className="space-y-2">
                            {PRECEDENCE_ORDER.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                                    onClick={() => scrollTo(item.id)}
                                >
                                    <span className="text-lg font-bold text-muted-foreground w-6 text-right flex-shrink-0">{item.rank}</span>
                                    <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: item.color }} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">{item.reason}</div>
                                    </div>
                                    <div className="text-xs font-mono text-muted-foreground/60 flex-shrink-0 text-right">{item.metric}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-3 text-sm text-muted-foreground">
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

                </div>
            </div>
        </div>
    );
}
