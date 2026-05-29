'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1 },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};

// ─── Hero Section ─────────────────────────────────────────────────────────────

export function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px]"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[80px]" />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
                {/* Eyebrow */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm mb-8"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground tracking-wide">
                        Systematic Macro Framework
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                >
                    <span className="block">Stop timing the market.</span>
                    <span className="block bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                        Start reading the regime.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
                >
                    Capital Physics maps valuation, liquidity, inflation, and trend into a regime
                    framework — helping investors understand when risk is being rewarded, when it
                    is being punished, and when the environment is changing.
                </motion.p>

                {/* CTA */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="flex items-center justify-center gap-4"
                >
                    <Link
                        href="/cockpit"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                        Open Cockpit
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                    <Link
                        href="/regime-active"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/50 backdrop-blur-sm font-semibold text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
                    >
                        View Active Regime
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Live Regime Strip ────────────────────────────────────────────────────────

interface RegimeData {
    regime: string;
    color: string;
    guidance: string;
    monthsInRegime: number;
    rey: number | null;
    eyp: number | null;
    sp500: { value: number; date: string } | null;
}

export function LiveRegimeStrip({ snapshot }: { snapshot: RegimeData }) {
    return (
        <motion.section
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative max-w-5xl mx-auto px-6 -mt-4 mb-24"
        >
            <div
                className="rounded-2xl border p-6 backdrop-blur-sm"
                style={{
                    borderColor: `${snapshot.color}25`,
                    backgroundColor: `color-mix(in srgb, ${snapshot.color} 4%, transparent)`,
                }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: snapshot.color }}
                            />
                            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Active Regime
                            </span>
                        </div>
                        <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                            style={{ backgroundColor: `${snapshot.color}15`, color: snapshot.color }}
                        >
                            {snapshot.regime}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {snapshot.monthsInRegime} months
                        </span>
                    </div>
                    <div className="flex items-center gap-8">
                        {snapshot.rey !== null && (
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Real EY</span>
                                <span className="text-sm font-bold tabular-nums">
                                    {snapshot.rey > 0 ? '+' : ''}{snapshot.rey.toFixed(2)}%
                                </span>
                            </div>
                        )}
                        {snapshot.eyp !== null && (
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">EY Premium</span>
                                <span className="text-sm font-bold tabular-nums">
                                    {snapshot.eyp > 0 ? '+' : ''}{snapshot.eyp.toFixed(2)}%
                                </span>
                            </div>
                        )}
                        {snapshot.sp500 && (
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">S&P 500</span>
                                <span className="text-sm font-bold tabular-nums">
                                    {snapshot.sp500.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <p className="mt-3 text-sm font-medium" style={{ color: snapshot.color }}>
                    → {snapshot.guidance}
                </p>
            </div>
        </motion.section>
    );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

export function StatsBar() {
    const stats = [
        { value: '75+', label: 'Years of Data' },
        { value: '6', label: 'Regime States' },
        { value: '9', label: 'Signal Layers' },
        { value: 'Daily', label: 'Updates' },
    ];

    return (
        <motion.section
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="max-w-5xl mx-auto px-6 mb-24"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat) => (
                    <motion.div key={stat.label} variants={fadeUp} transition={{ duration: 0.5 }} className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">{stat.value}</div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}

// ─── Framework Section ────────────────────────────────────────────────────────

export function FrameworkSection() {
    const steps = [
        {
            step: '01',
            label: 'Define the Regime',
            sub: 'What system are we in?',
            items: ['Liquidity conditions', 'Real rates & yield curve', 'Valuation structure'],
            color: '#8b5cf6',
            href: '/regime-active',
        },
        {
            step: '02',
            label: 'Identify Inflection',
            sub: 'What is about to change?',
            items: ['Regime shift signals', 'Constraint breaking', 'Trend reversals'],
            color: '#f59e0b',
            href: '/signals',
        },
        {
            step: '03',
            label: 'Allocate to Outliers',
            sub: 'Who benefits before consensus?',
            items: ['Style rotation', 'Sector leadership shifts', 'Specific expressions'],
            color: '#10b981',
            href: '/framework/process',
        },
    ];

    return (
        <section className="max-w-5xl mx-auto px-6 mb-24">
            <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    The Framework
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    System → Change → Outliers
                </h2>
            </motion.div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="grid md:grid-cols-3 gap-5"
            >
                {steps.map((item) => (
                    <motion.div key={item.step} variants={fadeUp} transition={{ duration: 0.5 }}>
                        <Link
                            href={item.href}
                            className="group relative block p-7 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-all duration-300 h-full"
                        >
                            {/* Hover glow */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{ background: `radial-gradient(ellipse at center, ${item.color}08 0%, transparent 70%)` }}
                            />
                            <div className="relative">
                                <span className="text-xs font-bold tracking-widest" style={{ color: item.color }}>
                                    {item.step}
                                </span>
                                <h3 className="text-lg font-semibold mt-3 mb-1">{item.label}</h3>
                                <p className="text-sm mb-5" style={{ color: item.color }}>{item.sub}</p>
                                <ul className="space-y-2">
                                    {item.items.map((i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                            {i}
                                        </li>
                                    ))}
                                </ul>
                                <div
                                    className="mt-6 text-xs font-semibold group-hover:translate-x-1 transition-transform duration-200"
                                    style={{ color: item.color }}
                                >
                                    Explore →
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}

// ─── Features Grid ────────────────────────────────────────────────────────────

export function FeaturesGrid() {
    const features = [
        {
            title: 'Cockpit',
            desc: 'Full macro dashboard — liquidity regime, valuation regime, price regime, and trend pressure. Updated daily.',
            href: '/cockpit',
            badge: 'Live · Daily',
            color: '#f59e0b',
        },
        {
            title: 'Active Regime',
            desc: 'Current regime state with signal readings, proximity to transitions, and capital allocation guidance.',
            href: '/regime-active',
            badge: 'Monthly',
            color: '#10b981',
        },
        {
            title: 'Market Signals',
            desc: 'Six hierarchical signals — from System Stress to Normal — each with defined triggers and allocation implications.',
            href: '/signals',
            badge: 'Priority-Ordered',
            color: '#ef4444',
        },
        {
            title: 'Regime Matrix',
            desc: 'Asset returns mapped to regime states across decades. Find similar historical periods to the current environment.',
            href: '/matrix',
            badge: 'Historical',
            color: '#3b82f6',
        },
        {
            title: '12-Year Cycles',
            desc: 'Every 12 years the macro system reconfigures. Seven cycles from 1948 to 2020, each with distinct structural themes.',
            href: '/12-year-cycle',
            badge: 'Structural',
            color: '#8b5cf6',
        },
        {
            title: 'Market Data',
            desc: 'Historical annual returns across asset classes from 1928, market highlights, and positioning data.',
            href: '/markets',
            badge: 'Data',
            color: '#6366f1',
        },
    ];

    return (
        <section className="max-w-5xl mx-auto px-6 mb-24">
            <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Platform
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    Everything in one view
                </h2>
            </motion.div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="grid md:grid-cols-2 gap-4"
            >
                {features.map((item) => (
                    <motion.div key={item.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                        <Link
                            href={item.href}
                            className="group block p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/60 hover:border-border transition-all duration-300 h-full"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: item.color }}>
                                    {item.badge}
                                </span>
                                <svg className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}

// ─── Reading Order ────────────────────────────────────────────────────────────

export function ReadingOrder() {
    const steps = [
        { n: '1', title: 'Understand the philosophy', desc: 'Why regime-first thinking beats outcome-first investing.', href: '/framework/process' },
        { n: '2', title: 'Learn the signal system', desc: 'Six prioritized signals that define risk-on vs risk-off.', href: '/signals' },
        { n: '3', title: 'Check the current regime', desc: 'Where are we now? What does it mean for allocation?', href: '/regime-active' },
        { n: '4', title: 'Open the cockpit', desc: 'See all four regime dimensions in one live dashboard.', href: '/cockpit' },
        { n: '5', title: 'Explore the cycles', desc: 'Understand the structural context — the 12-year cycle.', href: '/12-year-cycle' },
    ];

    return (
        <section className="max-w-3xl mx-auto px-6 mb-24">
            <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="text-center mb-10"
            >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    Start Here
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Suggested reading order
                </h2>
            </motion.div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="space-y-3"
            >
                {steps.map((step) => (
                    <motion.div key={step.n} variants={fadeUp} transition={{ duration: 0.4 }}>
                        <Link
                            href={step.href}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border/40 hover:border-border hover:bg-card/50 transition-all duration-200 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-border/50 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-muted-foreground">{step.n}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold">{step.title}</span>
                                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                            </div>
                            <svg className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}

// ─── CTA Footer ──────────────────────────────────────────────────────────────

export function CTAFooter() {
    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
            </div>
            <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7 }}
                className="relative max-w-3xl mx-auto px-6 py-20 text-center"
            >
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">The Paradigm</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                    Spot the Signal. Anticipate the Swing. Invest in the Story.
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                    A synthesis of Bridgewater, Renaissance, and Duquesne thinking — systematized.
                </p>
                <Link
                    href="/cockpit"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                    Enter the Framework
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </motion.div>
        </section>
    );
}
