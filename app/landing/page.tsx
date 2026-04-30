import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─── Live data fetch ──────────────────────────────────────────────────────────

async function getLiveSnapshot() {
    try {
        const [regimeRows, reyRows, eypRows, sp500Rows] = await Promise.all([
            prisma.$queryRaw<{ regime: string; entry_date: string; date: string }[]>`
                SELECT regime, entry_date::text as entry_date, date::text as date
                FROM macro_regime_timeline ORDER BY date DESC LIMIT 1`,
            prisma.$queryRaw<{ value: number }[]>`
                SELECT value FROM macro_percentile_analysis
                WHERE asset_class = 'derived' AND series_name = 'Real-Earnings-Yield-5yr'
                ORDER BY date DESC LIMIT 1`,
            prisma.$queryRaw<{ value: number }[]>`
                SELECT value FROM macro_percentile_analysis
                WHERE asset_class = 'derived' AND series_name = 'Earnings-Yield-Premium-5yr'
                ORDER BY date DESC LIMIT 1`,
            prisma.$queryRaw<{ value: number; date: string }[]>`
                SELECT value, date::text as date FROM macro_time_series
                WHERE asset_class = 'equities' AND series_name = 'US/GSPC' AND column_name = 'Value'
                ORDER BY date DESC LIMIT 1`,
        ]);

        const regime = regimeRows[0];
        const rey = reyRows[0]?.value ?? null;
        const eyp = eypRows[0]?.value ?? null;
        const sp500 = sp500Rows[0] ?? null;

        if (!regime) return null;

        const meta = REGIME_METADATA[regime.regime as RegimeFamily];
        const entryDate = new Date(regime.entry_date);
        const currentDate = new Date(regime.date);
        const monthsInRegime =
            (currentDate.getFullYear() - entryDate.getFullYear()) * 12 +
            (currentDate.getMonth() - entryDate.getMonth());

        return {
            regime: regime.regime as RegimeFamily,
            color: meta?.color ?? '#6b7280',
            description: meta?.description ?? '',
            guidance: meta?.guidance ?? '',
            entryDate: regime.entry_date,
            monthsInRegime,
            rey,
            eyp,
            sp500,
        };
    } catch {
        return null;
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RegimeBadge({ regime, color }: { regime: string; color: string }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${color}20`, color }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: color }}
            />
            {regime}
        </span>
    );
}

function MetricPill({
    label,
    value,
    suffix = '%',
    warn,
}: {
    label: string;
    value: number | null;
    suffix?: string;
    warn?: boolean;
}) {
    if (value === null) return null;
    const color = warn ? 'text-amber-500' : 'text-foreground';
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
            <span className={`text-sm font-semibold tabular-nums ${color}`}>
                {value > 0 ? '+' : ''}{value.toFixed(2)}{suffix}
            </span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
    const snapshot = await getLiveSnapshot();

    return (
        <div className="max-w-5xl mx-auto px-4">

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section className="text-center pt-4 pb-14">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
                    Capital Physics
                </div>
                <h1 className="page-title text-5xl lg:text-6xl mb-4 leading-tight">
                    Read the Regime.<br />Allocate Accordingly.
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    A systematic macro framework that identifies where we are in the economic cycle,
                    detects regime transitions before they become obvious, and maps capital allocation
                    to the conditions that actually exist.
                </p>
            </section>

            {/* ── Live Status Strip ────────────────────────────────────────── */}
            {snapshot ? (
                <section className="mb-14">
                    <div
                        className="rounded-2xl border p-6"
                        style={{ borderColor: `${snapshot.color}30`, backgroundColor: `${snapshot.color}08` }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Active Regime
                                </div>
                                <RegimeBadge regime={snapshot.regime} color={snapshot.color} />
                                <span className="text-xs text-muted-foreground">
                                    {snapshot.monthsInRegime}mo
                                </span>
                            </div>
                            <div className="flex items-center gap-6">
                                <MetricPill
                                    label="Real EY"
                                    value={snapshot.rey}
                                    warn={snapshot.rey !== null && snapshot.rey < 0.5}
                                />
                                <MetricPill
                                    label="EY Premium"
                                    value={snapshot.eyp}
                                    warn={snapshot.eyp !== null && snapshot.eyp < -1}
                                />
                                {snapshot.sp500 && (
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">S&P 500</span>
                                        <span className="text-sm font-semibold tabular-nums">
                                            {snapshot.sp500.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{snapshot.description}</p>
                        <p className="text-sm font-medium" style={{ color: snapshot.color }}>
                            → {snapshot.guidance}
                        </p>
                        <div className="mt-4 flex gap-3">
                            <Link
                                href="/regime-active"
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                style={{ backgroundColor: `${snapshot.color}20`, color: snapshot.color }}
                            >
                                Full regime view →
                            </Link>
                            <Link
                                href="/cockpit"
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Open cockpit →
                            </Link>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="mb-14">
                    <div className="rounded-2xl border border-border/50 bg-card p-6 text-center text-sm text-muted-foreground">
                        Live regime data unavailable — check database connection.
                    </div>
                </section>
            )}

            {/* ── The 3-Step Framework ─────────────────────────────────────── */}
            <section className="mb-14">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
                        The Framework
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                        System → Change → Outliers
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                        Most investors start with visible winners and assume permanence. This framework reverses that.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        {
                            step: 'O1',
                            label: 'Define the Regime',
                            sub: 'What system are we in?',
                            items: ['Liquidity conditions', 'Real rates & yield curve', 'Valuation structure'],
                            color: 'text-violet-500',
                            bg: 'bg-violet-500/10',
                            border: 'border-violet-500/20',
                            href: '/regime-active',
                        },
                        {
                            step: 'O2',
                            label: 'Identify Inflection',
                            sub: 'What is about to change?',
                            items: ['Regime shift signals', 'Constraint breaking', 'Trend reversals'],
                            color: 'text-amber-500',
                            bg: 'bg-amber-500/10',
                            border: 'border-amber-500/20',
                            href: '/signals',
                        },
                        {
                            step: 'O3',
                            label: 'Allocate to Outliers',
                            sub: 'Who benefits before it\'s obvious?',
                            items: ['Style rotation (Growth/Value)', 'Sector leadership shifts', 'Specific asset expressions'],
                            color: 'text-emerald-500',
                            bg: 'bg-emerald-500/10',
                            border: 'border-emerald-500/20',
                            href: '/framework/process',
                        },
                    ].map((item) => (
                        <Link
                            key={item.step}
                            href={item.href}
                            className={`group relative p-6 rounded-2xl border ${item.border} bg-card hover:bg-accent/30 transition-all duration-200`}
                        >
                            <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                                <span className={`text-sm font-bold ${item.color}`}>{item.step}</span>
                            </div>
                            <h3 className="text-base font-semibold mb-1">{item.label}</h3>
                            <p className={`text-xs mb-4 ${item.color}`}>{item.sub}</p>
                            <ul className="space-y-1.5">
                                {item.items.map((i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className={`w-1 h-1 rounded-full shrink-0 ${item.bg}`} />
                                        {i}
                                    </li>
                                ))}
                            </ul>
                            <div className={`mt-4 text-xs font-semibold ${item.color} group-hover:translate-x-1 transition-transform duration-200`}>
                                Explore →
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Section Cards ────────────────────────────────────────────── */}
            <section className="mb-14">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
                        Sections
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                        What's in the app
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Cockpit */}
                    <Link
                        href="/cockpit"
                        className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-amber-500/40 transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-xs font-semibold uppercase tracking-widest text-amber-500">Live · Daily</div>
                            <svg className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Cockpit</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Full macro dashboard — liquidity regime, valuation regime, price regime, and trend pressure in one view. Updated daily.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {['Liquidity', 'Valuation', 'Trend', 'Signals'].map(t => (
                                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">{t}</span>
                            ))}
                        </div>
                    </Link>

                    {/* Regime Active */}
                    <Link
                        href="/regime-active"
                        className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/40 transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Monthly</div>
                            <svg className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Active Regime</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Current regime state with signal readings, proximity to transitions, and capital allocation guidance. Scrub back through history.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {['Regime Engine', 'Timeline', 'Proximity', 'Allocation'].map(t => (
                                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">{t}</span>
                            ))}
                        </div>
                    </Link>

                    {/* Signals */}
                    <Link
                        href="/signals"
                        className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-red-500/40 transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-xs font-semibold uppercase tracking-widest text-red-500">Priority-Ordered</div>
                            <svg className="w-4 h-4 text-muted-foreground group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Market Signals</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Six hierarchical signals — from System Stress to Normal — each with a defined trigger, allocation implication, and historical context.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {['System Stress', 'Real EY', 'Equity Danger', 'Growth', 'Value'].map(t => (
                                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-medium">{t}</span>
                            ))}
                        </div>
                    </Link>

                    {/* Matrix */}
                    <Link
                        href="/matrix"
                        className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-blue-500/40 transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-xs font-semibold uppercase tracking-widest text-blue-500">Historical</div>
                            <svg className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Regime Matrix</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Asset returns mapped to regime states across decades. Find similar historical periods to the current environment.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {['Returns by Regime', 'Decades', 'Percentile', 'Similar Periods'].map(t => (
                                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">{t}</span>
                            ))}
                        </div>
                    </Link>

                    {/* 12-Year Cycle */}
                    <Link
                        href="/12-year-cycle"
                        className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-violet-500/40 transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-xs font-semibold uppercase tracking-widest text-violet-500">Structural</div>
                            <svg className="w-4 h-4 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">12-Year Cycles</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Every 12 years the macro system reconfigures. Seven cycles from 1948 to 2020, each with a distinct structural theme and asset leadership.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {['1948', '1972', '1984', '1996', '2008', '2020'].map(t => (
                                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">{t}</span>
                            ))}
                        </div>
                    </Link>

                    {/* Markets */}
                    <Link
                        href="/markets"
                        className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="text-xs font-semibold uppercase tracking-widest text-primary">Data</div>
                            <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Market Data</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Historical annual returns across asset classes from 1928, market highlights, S&P 500 constituent tracking, and hedge fund positioning.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {['Annual Returns', 'Highlights', 'S&P 500', 'Hedge Funds'].map(t => (
                                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{t}</span>
                            ))}
                        </div>
                    </Link>
                </div>
            </section>

            {/* ── How to Use ───────────────────────────────────────────────── */}
            <section className="mb-14">
                <div className="rounded-2xl border border-border/50 bg-card p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
                            Start Here
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Suggested reading order</h2>
                        <p className="text-sm text-muted-foreground mt-2">New to the framework? Follow this path.</p>
                    </div>

                    <div className="space-y-3 max-w-2xl mx-auto">
                        {[
                            {
                                n: '1',
                                title: 'Understand the philosophy',
                                desc: 'Why regime-first thinking beats outcome-first investing.',
                                href: '/framework/process',
                                label: 'Framework Process',
                            },
                            {
                                n: '2',
                                title: 'Learn the signal system',
                                desc: 'Six prioritized signals that define risk-on vs risk-off.',
                                href: '/signals',
                                label: 'Market Signals',
                            },
                            {
                                n: '3',
                                title: 'Check the current regime',
                                desc: 'Where are we now? What does it mean for allocation?',
                                href: '/regime-active',
                                label: 'Active Regime',
                            },
                            {
                                n: '4',
                                title: 'Open the cockpit',
                                desc: 'See all four regime dimensions in one live dashboard.',
                                href: '/cockpit',
                                label: 'Cockpit',
                            },
                            {
                                n: '5',
                                title: 'Explore the cycles',
                                desc: 'Understand the structural context — where are we in the 12-year cycle?',
                                href: '/12-year-cycle',
                                label: '12-Year Cycles',
                            },
                        ].map((step) => (
                            <Link
                                key={step.n}
                                href={step.href}
                                className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-accent/30 transition-all duration-200 group"
                            >
                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-primary">{step.n}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-semibold">{step.title}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium hidden sm:inline">
                                            {step.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                                </div>
                                <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Paradigm Footer ──────────────────────────────────────────── */}
            <section className="mb-8 text-center">
                <div className="inline-block p-6 rounded-2xl border border-border/30 bg-card/50">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">The OS Paradigm</p>
                    <div className="flex items-center gap-4 text-sm font-medium text-card-foreground">
                        <span>Spot the Signal.</span>
                        <span className="text-border">·</span>
                        <span>Anticipate the Swing.</span>
                        <span className="text-border">·</span>
                        <span>Invest in the Story.</span>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                        <Link href="/paradigm" className="hover:text-primary transition-colors">Bridgewater</Link>
                        <span>+</span>
                        <Link href="/paradigm" className="hover:text-primary transition-colors">RenCap</Link>
                        <span>+</span>
                        <Link href="/paradigm" className="hover:text-primary transition-colors">Duquesne</Link>
                        <span className="text-border">→</span>
                        <Link href="/paradigm" className="hover:text-primary transition-colors font-semibold">The Synthesis →</Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
