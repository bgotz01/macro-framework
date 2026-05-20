'use client';

import { useState } from 'react';
import PageHeader from '@/components/page-header';

// Reusable Law Header Component
interface LawHeaderProps {
    title: string;
    lawName: string;
    axiom: string;
    description: string;
    colorClass: 'primary' | 'accent' | 'secondary';
}

function LawHeader({ title, lawName, axiom, description, colorClass }: LawHeaderProps) {
    const colorClasses = {
        primary: 'text-[#0ea5e9] dark:text-[#38bdf8]',
        accent: 'text-[#0ea5e9] dark:text-[#38bdf8]',
        secondary: 'text-[#0ea5e9] dark:text-[#38bdf8]'
    };

    return (
        <div className="p-6 rounded-2xl border border-border/50 bg-card mb-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-2">{title}</h2>
            <p className={`text-base ${colorClasses[colorClass]} italic mb-3`}>{lawName}</p>
            <p className="text-base text-muted-foreground mb-3">{axiom}</p>
            <p className="text-base text-muted-foreground">{description}</p>
        </div>
    );
}

// Reusable Criteria Card Component
interface CriteriaCardProps {
    number: number;
    title: string;
    subtitle?: string;
    description: string;
    test: string;
    why: string;
    colorClass: 'primary' | 'accent' | 'secondary';
}

function CriteriaCard({ number, title, subtitle, description, test, why, colorClass }: CriteriaCardProps) {
    const bgColorClasses = {
        primary: 'bg-[#0ea5e9]/10 dark:bg-[#38bdf8]/10',
        accent: 'bg-[#0ea5e9]/10 dark:bg-[#38bdf8]/10',
        secondary: 'bg-[#0ea5e9]/10 dark:bg-[#38bdf8]/10'
    };

    const textColorClasses = {
        primary: 'text-[#0ea5e9] dark:text-[#38bdf8]',
        accent: 'text-[#0ea5e9] dark:text-[#38bdf8]',
        secondary: 'text-[#0ea5e9] dark:text-[#38bdf8]'
    };

    return (
        <div className="p-6 rounded-xl border border-border/50 bg-card hover:border-border transition-colors flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-3">
                <div className={`h-7 w-7 rounded-lg ${bgColorClasses[colorClass]} ${textColorClasses[colorClass]} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-sm font-bold">{number}</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-card-foreground leading-tight">
                        {title}
                    </h3>
                    {subtitle && (
                        <span className="text-xs text-muted-foreground">{subtitle}</span>
                    )}
                </div>
            </div>

            {/* Description */}
            <p className="text-base text-muted-foreground mb-4 flex-grow">
                {description}
            </p>

            {/* Test & Why - Bottom Section */}
            <div className="space-y-2 pt-4 border-t border-border/30">
                <div className="flex items-start space-x-2">
                    <span className="font-semibold text-card-foreground text-sm min-w-[45px]">Test:</span>
                    <span className="text-sm text-muted-foreground">{test}</span>
                </div>
                <div className="flex items-start space-x-2">
                    <span className="font-semibold text-card-foreground text-sm min-w-[45px]">Why:</span>
                    <span className="text-sm text-muted-foreground">{why}</span>
                </div>
            </div>
        </div>
    );
}

export default function FrameworkPage() {
    const [activeTab, setActiveTab] = useState<'signal' | 'swing' | 'outlier'>('signal');

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <PageHeader title="POWER LAW" subtitle="Three Laws of Market Behavior" />

            {/* Tabs */}
            <div className="flex space-x-2 mb-8 border-b border-border">
                <button
                    onClick={() => setActiveTab('signal')}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === 'signal'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <span className="mr-2">◉</span>
                    O1: Signal
                </button>
                <button
                    onClick={() => setActiveTab('swing')}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === 'swing'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <span className="mr-2">⟜</span>
                    O2: Swing
                </button>
                <button
                    onClick={() => setActiveTab('outlier')}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === 'outlier'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <span className="mr-2">✦</span>
                    O3: Story
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'signal' && <SignalContent />}
                {activeTab === 'swing' && <SwingContent />}
                {activeTab === 'outlier' && <OutlierContent />}
            </div>
        </div>
    );
}

// O1: Signal Content
function SignalContent() {
    return (
        <div>
            <LawHeader
                title="Signal"
                lawName="Law of the Obvious"
                axiom="When something becomes undeniably visible, capital must react."
                description="The measurable trigger that forces attention."
                colorClass="primary"
            />

            {/* Criteria */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-card-foreground mb-6">Criteria (tests)</h2>
                <p className="text-base text-muted-foreground mb-6">
                    These four criteria are the gate: if a trend fails them, it's noise.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                    Note: A Structural Signal can be a cycle-within-cycle (sector/budget shift) or a full cycle reset — the gate is the same.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    <CriteriaCard
                        number={1}
                        title="Novelty"
                        description="Hasn't happened in recent history / breaks the local pattern library."
                        test="Outside recent cycle memory (last cycle / ~5–15y)?"
                        why="If common, already priced."
                        colorClass="primary"
                    />
                    <CriteriaCard
                        number={2}
                        title="Observability"
                        description="Measurable, verifiable, not vibe-based."
                        test="Hard data, rule change, or price move?"
                        why="Keeps you from narrative chasing."
                        colorClass="primary"
                    />
                    <CriteriaCard
                        number={3}
                        title="Persistence"
                        description="Long enough to matter for allocation (not just trading)."
                        test="Likely persists 12–36 months?"
                        why="Structural signal, not noise."
                        colorClass="primary"
                    />
                    <CriteriaCard
                        number={4}
                        title="Capital Gravity"
                        description="Forces money to move (budgets, capex, risk premia, flows)."
                        test="Changes spending, financing, or returns?"
                        why="Capital flow = mechanism that makes it real."
                        colorClass="primary"
                    />
                </div>
            </div>

            {/* Examples */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card mb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-4">Examples</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">Market pain:</span>
                            <span className="text-muted-foreground"> Inflation, yields, or valuations in 90+ percentile</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">Policy shift:</span>
                            <span className="text-muted-foreground"> Fed pivot from QE to QT, new tariff regime, industrial policy changes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// O2: Swing Content
function SwingContent() {
    return (
        <div>
            <LawHeader
                title="Swing"
                lawName="Law of Opposites"
                axiom="Markets swing toward the opposite traits of the prior phase."
                description="The inversion of prior dominant traits — capital rotates toward a new set of winners (not a return)."
                colorClass="accent"
            />

            {/* Criteria */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-card-foreground mb-6">Criteria (tests)</h2>

                <div className="grid md:grid-cols-3 gap-4">
                    <CriteriaCard
                        number={1}
                        title="Direction flip"
                        description="Does it invert the prior cycle's 'winning logic' (what was rewarded becomes penalized)?"
                        test="Are yesterday's winners today's losers?"
                        why="A phase shift requires logic inversion."
                        colorClass="accent"
                    />
                    <CriteriaCard
                        number={2}
                        title="Constraint reversal"
                        description="Does the binding constraint change? (e.g., liquidity → funding scarcity; labor abundance → labor scarcity)"
                        test="What was abundant becomes scarce?"
                        why="New constraint = new phase."
                        colorClass="accent"
                    />
                    <CriteriaCard
                        number={3}
                        title="Relative rotation"
                        description="Do the opposite factor baskets outperform for a sustained window (not a one-week move)?"
                        test="Sustained multi-month factor reversal?"
                        why="Confirms structural shift, not noise."
                        colorClass="accent"
                    />
                </div>
            </div>

            {/* Examples */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card mb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-4">Examples</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">ZIRP / abundant liquidity</span>
                            <span className="text-muted-foreground"> → positive real rates / scarce funding</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">Globalization</span>
                            <span className="text-muted-foreground"> → fragmentation / reshoring</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">Growth-at-any-price</span>
                            <span className="text-muted-foreground"> → profitability / cash flow</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">"Long duration wins"</span>
                            <span className="text-muted-foreground"> → "duration is a liability"</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// O3: Story Content
function OutlierContent() {
    return (
        <div>
            <LawHeader
                title="Story"
                lawName="Law of Outliers"
                axiom="Sustained capital concentration forms around standout breakouts that reset what matters."
                description="The standout breakout thesis that captures attention and concentrates capital."
                colorClass="secondary"
            />

            {/* Criteria */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-card-foreground mb-6">Criteria (tests)</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <CriteriaCard
                        number={1}
                        title="New Rail"
                        description="A new distribution / transaction channel that didn't exist at scale."
                        test="Does it create a new 'default path' for delivery (platform, marketplace, protocol, exchange, app store)?"
                        why="New rails create new winners by controlling access + economics."
                        colorClass="secondary"
                    />
                    <CriteriaCard
                        number={2}
                        title="Access Unlock"
                        description="A permission / accessibility step-change: more participants can now buy/build/use."
                        test="Does it expand the addressable investor/user base by an order of magnitude (new geographies, new account types, new eligibility)?"
                        why="Access expansion is how stories become capital events."
                        colorClass="secondary"
                    />
                    <CriteriaCard
                        number={3}
                        title="Rulebook Shift"
                        description="A durable change in the rules that changes incentives (policy, standards, enforcement, platform rules)."
                        test="Is there a formal rule change (law/regulation/standard/platform policy) that persists and forces behavior change?"
                        why="Rules coordinate everyone—this is how narratives become reality."
                        colorClass="secondary"
                    />
                    <CriteriaCard
                        number={4}
                        title="Flow Gravity"
                        description="Evidence that flows will concentrate (or are already concentrating) toward the story."
                        test="Can you point to budgets / capex / procurement / allocations / forced buying (index reweights, mandates) that push money in one direction?"
                        why="Outliers matter only if they pull capital repeatedly."
                        colorClass="secondary"
                    />
                </div>
            </div>

            {/* Examples */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card mb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-4">Breakout examples</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">China joins WTO</span>
                            <span className="text-muted-foreground"> → global labor arbitrage + supply chain re-architecture</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">QE/ZIRP</span>
                            <span className="text-muted-foreground"> → price of money structurally altered</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">LLMs</span>
                            <span className="text-muted-foreground"> → marginal cost of software/cognition collapses</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-base">
                        <span className="text-primary">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">Security reset</span>
                            <span className="text-muted-foreground"> → persistent surveillance/defense baseline</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
