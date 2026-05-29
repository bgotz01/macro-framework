'use client';

import { motion } from 'framer-motion';
import {
    Activity,
    ArrowRight,
    BarChart3,
    Brain,
    Clock3,
    Compass,
    LineChart,
    Radar,
    Shield,
    Sparkles,
    Zap,
} from 'lucide-react';

const regimes = [
    {
        label: 'Broad Growth',
        category: 'buy' as const,
        color: '#22c55e',
        detail: 'Strong real earnings environment — healthy equity expansion.',
    },
    {
        label: 'Long Duration',
        category: 'buy' as const,
        color: '#3b82f6',
        detail: 'Equities overvalued relative to bonds — investors buying duration/growth.',
    },
    {
        label: 'Liquidity Shock',
        category: 'buy' as const,
        color: '#a855f7',
        detail: 'Financial repression with high money growth — speculative assets thrive.',
    },
    {
        label: 'Overvaluation',
        category: 'sell' as const,
        color: '#eab308',
        detail: 'Extreme equity unattractiveness — equities far below risk-free rate.',
    },
    {
        label: 'Crisis',
        category: 'sell' as const,
        color: '#991b1b',
        detail: 'Financial repression with low money growth — defensive positioning critical.',
    },
    {
        label: 'Bond Stress',
        category: 'sell' as const,
        color: '#ea580c',
        detail: 'Real rates deeply negative across the curve — bond market stress.',
    },
];

const archetypes = [
    {
        name: 'Broad Growth',
        icon: Zap,
        regime: 'Lean into quality growth — earnings growing faster than inflation.',
        examples: 'Quality compounders, profitable growth, market leaders',
    },
    {
        name: 'Long Duration',
        icon: Compass,
        regime: 'Duration and growth favored — negative equity risk premium.',
        examples: 'High-growth tech, long-duration equities, momentum plays',
    },
    {
        name: 'Liquidity Shock',
        icon: Activity,
        regime: 'Massive liquidity injection — speculative assets thrive.',
        examples: 'Small caps, beaten-down risk assets, high-beta names',
    },
    {
        name: 'Overvaluation',
        icon: Shield,
        regime: 'Rotate away from equities — favor bonds or gold depending on real rates.',
        examples: 'Bonds (if Real 10Y > 0%), gold (if Real 10Y < 0%)',
    },
];

const replayEvents = [
    { year: '2000', event: 'Overvaluation → Crisis', signal: 'Dot-com bubble burst as equity yields collapsed' },
    { year: '2008', event: 'Crisis → Liquidity Shock', signal: 'GFC followed by massive monetary expansion' },
    { year: '2020', event: 'Liquidity Shock', signal: 'COVID response flooded markets with M2 growth' },
    { year: '2022', event: 'Bond Stress', signal: 'Real rates surged, repricing duration assets' },
];

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

export default function CapitalPhysicsLandingPage() {
    return (
        <main className="min-h-screen overflow-hidden bg-[#050507] text-white">
            <BackgroundField />

            <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-blue-500/10">
                        <Radar className="h-4 w-4 text-blue-200" />
                    </div>
                    <span className="text-sm font-medium tracking-[0.28em] text-white/80">
                        CAPITAL PHYSICS
                    </span>
                </div>
                <div className="hidden items-center gap-8 text-sm text-white/55 md:flex">
                    <a href="#regime" className="transition hover:text-white">Regimes</a>
                    <a href="#archetypes" className="transition hover:text-white">Guidance</a>
                    <a href="#history" className="transition hover:text-white">History</a>
                </div>
                <button className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:bg-white/10">
                    Request access
                </button>
            </nav>

            <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:pt-28">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-300/[0.06] px-4 py-2 text-xs uppercase tracking-[0.24em] text-blue-100/80"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Regime intelligence for markets
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.75 }}
                        className="max-w-4xl text-5xl font-medium tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl"
                    >
                        Stop timing every move. Start reading the regime.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.75 }}
                        className="mt-7 max-w-2xl text-lg leading-8 text-white/58"
                    >
                        Capital Physics maps valuation, liquidity, inflation, and trend into a system-level market framework — showing what environment we are in, what tends to perform, and which signal matters most right now.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.75 }}
                        className="mt-10 flex flex-col gap-3 sm:flex-row"
                    >
                        <button className="group inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-blue-100">
                            Explore the system
                            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                        </button>
                        <button className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/75 backdrop-blur transition hover:bg-white/[0.08]">
                            Watch historical replay
                        </button>
                    </motion.div>
                </div>

                <DemoConsole />
            </section>

            <section id="regime" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"
                >
                    <div>
                        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-blue-200/60">Market regimes</p>
                        <h2 className="max-w-3xl text-3xl font-medium tracking-[-0.04em] text-white sm:text-5xl">
                            Know the environment before choosing the trade.
                        </h2>
                    </div>
                    <p className="max-w-md text-sm leading-6 text-white/45">
                        Instead of reacting to every headline, Capital Physics identifies the dominant regime shaping returns.
                    </p>
                </motion.div>

                <div className="mb-6 flex gap-4">
                    <div className="flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs text-green-100">
                        <span className="h-2 w-2 rounded-full bg-green-400" />
                        Buy regimes
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs text-red-100">
                        <span className="h-2 w-2 rounded-full bg-red-400" />
                        Sell regimes
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {regimes.map((regime, index) => (
                        <motion.div
                            key={regime.label}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.06, duration: 0.5 }}
                            className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-[0.22em] text-white/35">{regime.category === 'buy' ? 'Buy' : 'Sell'}</p>
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: regime.color }} />
                            </div>
                            <h3 className="mt-5 text-2xl font-medium tracking-tight text-white">{regime.label}</h3>
                            <p className="mt-4 text-sm leading-6 text-white/45">{regime.detail}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-7xl px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-xl md:p-10"
                >
                    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                        <div>
                            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-blue-200/60">Regime detection</p>
                            <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                                Five metrics. One regime.
                            </h2>
                            <p className="mt-6 text-sm leading-7 text-white/48">
                                Capital Physics maps Real Earnings Yield, Earnings Yield Premium, Real 10Y, Real 3M, and Real M2 into a single regime classification — telling you what environment we are in and what tends to work.
                            </p>
                        </div>

                        <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">Input signals</p>
                                    <h3 className="mt-2 text-2xl font-medium">Regime inputs</h3>
                                </div>
                                <div className="rounded-full border border-green-300/20 bg-green-300/10 px-3 py-1 text-xs text-green-100">
                                    Broad Growth
                                </div>
                            </div>
                            <div className="space-y-3">
                                {['Real Earnings Yield (5yr PE)', 'Earnings Yield Premium vs bonds', 'Real 10Y yield', 'Real 3M yield', 'Real M2 money growth'].map((item, index) => (
                                    <motion.div
                                        key={item}
                                        initial={{ opacity: 0, x: -12 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08, duration: 0.4 }}
                                        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4"
                                    >
                                        <div className={cn('h-2.5 w-2.5 rounded-full', index === 0 && 'bg-green-300', index === 1 && 'bg-blue-200', index === 2 && 'bg-amber-200', index === 3 && 'bg-purple-200', index === 4 && 'bg-white/50')} />
                                        <span className="text-sm text-white/65">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <section id="archetypes" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 max-w-3xl"
                >
                    <p className="mb-3 text-xs uppercase tracking-[0.28em] text-blue-200/60">Regime guidance</p>
                    <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                        Each regime tells you what to own.
                    </h2>
                </motion.div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {archetypes.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08, duration: 0.5 }}
                                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]"
                            >
                                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                                    <Icon className="h-5 w-5 text-blue-100/80" />
                                </div>
                                <h3 className="text-xl font-medium tracking-tight">{item.name}</h3>
                                <p className="mt-4 text-sm leading-6 text-white/48">{item.regime}</p>
                                <p className="mt-5 border-t border-white/10 pt-5 text-xs leading-5 text-white/35">{item.examples}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-7xl px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 max-w-3xl"
                >
                    <p className="mb-3 text-xs uppercase tracking-[0.28em] text-blue-200/60">See it in action</p>
                    <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                        AI-powered regime analysis, live.
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-white/48">
                        Watch Capital Physics identify the current regime and surface what matters — from Long Duration expansions to Overvaluation warnings.
                    </p>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
                    >
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full"
                            src="/videos/ai-chat.mp4"
                        />
                        <div className="p-5">
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs text-blue-100">
                                <span className="h-2 w-2 rounded-full bg-blue-400" />
                                Long Duration
                            </div>
                            <p className="mt-2 text-sm leading-6 text-white/50">
                                Regime chat identifies a Long Duration environment — equities favored over bonds, growth and momentum leading.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
                    >
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full"
                            src="/videos/ai-chat-overvaluation.mp4"
                        />
                        <div className="p-5">
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs text-yellow-100">
                                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                                Overvaluation
                            </div>
                            <p className="mt-2 text-sm leading-6 text-white/50">
                                Regime chat flags Overvaluation — equities far below risk-free rate, rotation toward bonds or gold warranted.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section id="history" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-blue-200/60">Historical replay</p>
                        <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                            Ask what happened last time conditions looked like this.
                        </h2>
                        <p className="mt-6 text-sm leading-7 text-white/48">
                            Replay past regimes and watch the signals evolve — not as prediction, but as context for what the market has rewarded and punished before.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
                    >
                        <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <Clock3 className="h-4 w-4" />
                                Regime memory
                            </div>
                            <span className="text-xs text-white/35">80-year replay</span>
                        </div>
                        <div className="space-y-3">
                            {replayEvents.map((item, index) => (
                                <motion.div
                                    key={item.year}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                    className="grid grid-cols-[64px_1fr] gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4"
                                >
                                    <div className="text-sm font-medium text-blue-100">{item.year}</div>
                                    <div>
                                        <div className="text-sm font-medium text-white/85">{item.event}</div>
                                        <div className="mt-1 text-xs text-white/38">{item.signal}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="rounded-[2.5rem] border border-white/10 bg-white/[0.06] px-6 py-14 text-center shadow-2xl shadow-blue-950/30 backdrop-blur-xl md:px-12"
                >
                    <p className="mb-4 text-xs uppercase tracking-[0.28em] text-blue-200/60">Capital Physics</p>
                    <h2 className="mx-auto max-w-3xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
                        Markets are not random. They are conditional.
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/48">
                        Build from regime awareness to asset selection to company archetypes — and stop treating every market move like an isolated event.
                    </p>
                    <button className="mt-9 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-blue-100">
                        Request early access
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </motion.div>
            </section>
        </main>
    );
}

function DemoConsole() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="relative"
        >
            <div className="absolute -inset-8 rounded-[3rem] bg-blue-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090A0F]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div className="flex gap-2">
                        <span className="h-3 w-3 rounded-full bg-white/20" />
                        <span className="h-3 w-3 rounded-full bg-white/12" />
                        <span className="h-3 w-3 rounded-full bg-white/8" />
                    </div>
                    <div className="text-xs uppercase tracking-[0.22em] text-white/32">Live regime query</div>
                </div>

                <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white/70">
                            What regime are we in now, and what tends to perform here?
                        </div>
                        <div className="mt-4 rounded-2xl border border-blue-300/15 bg-blue-300/[0.06] p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-100">
                                <Brain className="h-4 w-4" />
                                Capital Physics
                            </div>
                            <p className="text-sm leading-6 text-white/58">
                                Current conditions resemble a restrictive-liquidity expansion. Quality cash flows and selective growth are favored, while long-duration risk remains sensitive to real rates.
                            </p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <MiniStat label="Regime" value="Broad Growth" />
                            <MiniStat label="Watch" value="Real 10Y" />
                            <MiniStat label="Guidance" value="Quality Growth" />
                            <MiniStat label="Risk" value="Overvaluation" />
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <LineChart className="h-4 w-4" />
                                Historical replay
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/40">
                                2000 → 2026
                            </div>
                        </div>
                        <AnimatedChart />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">{label}</p>
            <p className="mt-2 text-sm font-medium text-white/75">{value}</p>
        </div>
    );
}

function AnimatedChart() {
    const bars = [28, 34, 30, 42, 46, 39, 52, 58, 49, 62, 66, 54, 71, 76, 69, 83, 78, 86];

    return (
        <div className="relative h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-black/35 p-5">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="relative flex h-full items-end gap-2">
                {bars.map((height, index) => (
                    <motion.div
                        key={index}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${height}%`, opacity: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.5 }}
                        className="relative flex-1 rounded-t-md bg-gradient-to-t from-blue-500/25 to-blue-100/70"
                    >
                        {[6, 11, 15].includes(index) && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 + 0.4 }}
                                className="absolute -top-10 left-1/2 w-max -translate-x-1/2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] text-amber-100 shadow-lg shadow-amber-500/10"
                            >
                                regime flag
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex justify-between text-[10px] uppercase tracking-[0.2em] text-white/25">
                <span>2000</span>
                <span>2008</span>
                <span>2022</span>
                <span>Now</span>
            </div>
        </div>
    );
}

function BackgroundField() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute inset-0 bg-[#050507]" />
        </div>
    );
}
