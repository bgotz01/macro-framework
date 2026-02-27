// app/outline/page.tsx
'use client';

import * as React from 'react';
import {
    ArrowRight,
    Beaker,
    CheckCircle2,
    ChevronDown,
    Globe2,
    Layers,
    Lock,
    Network,
    Sparkles,
    Wrench,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Status = 'live' | 'in-progress' | 'planned' | 'research';

const STATUS_META: Record<
    Status,
    { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
    live: { label: 'Live', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    'in-progress': { label: 'In Progress', icon: Wrench, className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    planned: { label: 'Planned', icon: Globe2, className: 'bg-sky-500/10 text-sky-700 border-sky-500/20' },
    research: { label: 'Research', icon: Beaker, className: 'bg-violet-500/10 text-violet-700 border-violet-500/20' },
};

function StatusBadge({ status }: { status: Status }) {
    const meta = STATUS_META[status];
    const Icon = meta.icon;
    return (
        <Badge variant="outline" className={cn('gap-1.5 rounded-full', meta.className)}>
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
        </Badge>
    );
}

function InfoRow({
    label,
    value,
    tone = 'muted',
    leftIcon,
}: {
    label: string;
    value: React.ReactNode;
    tone?: 'muted' | 'live';
    leftIcon?: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
                {leftIcon ? leftIcon : null}
                <span className="text-sm font-medium">{label}</span>
                <span className={cn('text-sm', tone === 'muted' ? 'text-muted-foreground' : 'text-foreground')}>{value}</span>
            </div>
        </div>
    );
}

type Section = {
    id: string;
    title: string;
    subtitle: string;
    status: Status;
    icon: React.ComponentType<{ className?: string }>;
    purpose: string[];
    answers: string[];
    blocks?: Array<{ label: string; items: string[] }>;
    note?: string;
};

const SECTIONS: Section[] = [
    {
        id: 'regimes',
        title: 'US Macro Regime Detector',
        subtitle: 'Live engine that labels the capital environment using low-dimensional, observable variables.',
        status: 'live',
        icon: Layers,
        purpose: [
            'Identify the current capital environment using low-dimensional, observable variables.',
            'Provide a clear regime label that constrains what strategies are viable.',
        ],
        answers: ['What environment are we in right now?', 'Which assets are structurally favored or punished?'],
        blocks: [
            {
                label: 'Key outputs',
                items: ['Regime label', 'Confidence / intensity', 'Allowed vs. disallowed behaviors'],
            },
        ],
    },
    {
        id: 'transmission',
        title: 'Macro Transmission Engine',
        subtitle: 'Causal bridge from shocks → propagation → market & corporate outcomes.',
        status: 'in-progress',
        icon: Network,
        purpose: [
            'Model how a macro or policy shock propagates through the system.',
            'Bridge regime detection to market and corporate outcomes (second-order effects).',
        ],
        answers: ['How does a regime change actually affect markets?', 'Where do second-order effects emerge?'],
        blocks: [
            {
                label: 'Conceptual flow',
                items: ['Policy / Liquidity Shock', 'Rates & FX', 'Equity valuations', 'Corporate behavior', 'Asset outcomes'],
            },
        ],
        note: 'Multi-month build. The goal is structured propagation, not correlation theater.',
    },
    {
        id: 'global',
        title: 'Global Application',
        subtitle: 'Macro first. Same regime logic applied globally through the most liquid expressions.',
        status: 'planned',
        icon: Globe2,
        purpose: ['Apply the same regime logic internationally.', 'Prioritize liquidity and signal quality via macro markets.'],
        answers: ['How does capital express differently across regions?', 'What regimes dominate outside the US?'],
        blocks: [
            { label: 'Expressed via', items: ['FX', 'Sovereign rates', 'Equity indexes'] },
            { label: 'Design principle', items: ['Macro first (liquid, clean signals)', 'Micro only where data quality supports it'] },
        ],
    },
    {
        id: 'archetypes',
        title: 'Company Behavior Archetypes',
        subtitle: 'Micro-level regime logic with different variables. Teaser-only in demos.',
        status: 'research',
        icon: Lock,
        purpose: [
            'Apply regime logic at the company level using different variables.',
            'Classify adaptation (or failure) under constraint.',
        ],
        answers: ['Which companies adapt when rules change?', 'Where does “permissioned risk” emerge?'],
        blocks: [
            { label: 'Example archetype labels', items: ['Suit Up', 'Zombie Capital', 'Terminal Excess', 'False Recovery', 'Quiet Compounder'] },
            { label: 'Important note', items: ['Logic is analogous to macro regimes', 'Variables and mechanics are completely different'] },
        ],
        note: 'In the YC demo: show titles, not mechanics.',
    },
    {
        id: 'cycles',
        title: 'Long-Cycle Research',
        subtitle: 'Exploratory overlay for ~12-year system reconfigurations (phase awareness, not a regime driver).',
        status: 'research',
        icon: Sparkles,
        purpose: [
            'Study slow system reconfigurations that recur over ~12-year intervals.',
            'Provide phase awareness and qualitative context across macro and tech.',
        ],
        answers: ['What phase of the system are we in?', 'How do major reconfigurations cluster over time?'],
        blocks: [
            { label: 'This is NOT', items: ['Not a regime driver', 'Not a timing model', 'Not predictive (yet)'] },
            { label: 'This IS', items: ['A structured research layer', 'A way to organize historical change', 'A future qualitative overlay'] },
        ],
        note: 'Flash a simple timeline; don’t debate it.',
    },
];

const ROADMAP: Array<{ label: string; status: Status }> = [
    { label: 'US Macro Regimes', status: 'live' },
    { label: 'Transmission Engine', status: 'in-progress' },
    { label: 'Global Macro', status: 'planned' },
    { label: 'Company Archetypes', status: 'research' },
    { label: 'Long-Cycle Context', status: 'research' },
];

function AnchorNav() {
    return (
        <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
                <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={cn(
                        'rounded-full border px-3 py-1 text-sm transition',
                        'bg-background hover:bg-muted',
                        'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {s.title}
                </a>
            ))}
            <a
                href="#roadmap"
                className={cn(
                    'rounded-full border px-3 py-1 text-sm transition',
                    'bg-background hover:bg-muted',
                    'text-muted-foreground hover:text-foreground'
                )}
            >
                Roadmap
            </a>
        </div>
    );
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {items.map((t) => (
                <li key={t} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                    <span>{t}</span>
                </li>
            ))}
        </ul>
    );
}

export default function OutlinePage() {
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        regimes: true,
    });

    const toggleSection = (id: string) => {
        setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5" />
                            Outline (internal)
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Capital Physics</h1>

                        <div className="max-w-3xl space-y-3 text-base text-muted-foreground md:text-lg">
                            <p className="text-foreground font-medium">
                                We&apos;re building a regime-aware CIO layer that helps millennials and wealth advisors allocate capital using structured, observable market frameworks.
                            </p>

                            <p>
                                The system detects macro regimes, models how shocks transmit through markets, and applies the same logic
                                across regions and eventually down to company behavior.
                            </p>
                            <p>
                                Everything is decomposed into explicit layers — regimes, transmission, behavior, and long-cycle context —
                                so decisions are driven by structure rather than intuition.
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="whitespace-nowrap">Start here</span>
                        <ArrowRight className="h-4 w-4" />
                        <a href="#regimes" className="rounded-full border px-3 py-1 hover:bg-muted">
                            US Macro Regimes
                        </a>
                    </div>
                </div>

                <AnchorNav />

                {/* Internal positioning rows */}
                <InfoRow
                    label="Core question:"
                    value="How do you navigate a Negative Earnings Yield Premium (EYP) regime?"
                    leftIcon={<div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                />
                <InfoRow label="Client archetype:" value="Millennials with meaningful capital to allocate." />
                <InfoRow label="Scale:" value="CIO context layer for wealth advisors." />

                <Separator className="my-2" />
            </div>

            {/* Sections */}
            <div className="mt-8 grid gap-6">
                {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    const isExpanded = !!expandedSections[s.id];

                    return (
                        <Card key={s.id} id={s.id} className="rounded-2xl">
                            <CardHeader
                                className="space-y-3 cursor-pointer hover:bg-muted/20 transition-colors rounded-t-2xl"
                                onClick={() => toggleSection(s.id)}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="grid h-10 w-10 place-items-center rounded-2xl border bg-muted/40">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">{s.title}</CardTitle>
                                            <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={s.status} />
                                        <ChevronDown
                                            className={cn('h-5 w-5 text-muted-foreground transition-transform', isExpanded && 'rotate-180')}
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            {isExpanded && (
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h3 className="text-sm font-medium">Purpose</h3>
                                            <BulletList items={s.purpose} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium">What this answers</h3>
                                            <BulletList items={s.answers} />
                                        </div>
                                    </div>

                                    {s.blocks?.length ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {s.blocks.map((b) => (
                                                <div key={b.label} className="rounded-2xl border bg-muted/20 p-4">
                                                    <div className="text-sm font-medium">{b.label}</div>
                                                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                                        {b.items.map((it) => (
                                                            <li key={it} className="flex gap-2">
                                                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                                                                <span>{it}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}

                                    {s.note ? (
                                        <div className="rounded-2xl border bg-background p-4">
                                            <div className="text-sm font-medium">Note</div>
                                            <p className="mt-2 text-sm text-muted-foreground">{s.note}</p>
                                        </div>
                                    ) : null}
                                </CardContent>
                            )}
                        </Card>
                    );
                })}

                {/* Philosophy + Roadmap */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="rounded-2xl">
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/20 transition-colors rounded-t-2xl"
                            onClick={() => toggleSection('philosophy')}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <CardTitle className="text-xl">Philosophy</CardTitle>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Capital Physics is a collection of structured lenses — not one monolithic model.
                                    </p>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'h-5 w-5 text-muted-foreground transition-transform shrink-0',
                                        expandedSections['philosophy'] && 'rotate-180'
                                    )}
                                />
                            </div>
                        </CardHeader>

                        {expandedSections['philosophy'] && (
                            <CardContent className="space-y-5">
                                <div className="rounded-2xl border bg-muted/20 p-4">
                                    <div className="text-sm font-medium">Capital Physics</div>
                                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                        <li className="flex gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                                            <span>Capital responds to constraints.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                                            <span>Regimes define the rules of the game.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                                            <span>Behavior determines outcomes.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="rounded-2xl border bg-background p-4">
                                    <div className="text-sm font-medium">Design principles</div>
                                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                        <li className="flex gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                                            <span>Structured thinking only (separate signal vs. research).</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                                            <span>Multiple timescales, one framework.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
                                            <span>Macro-first internationally (liquidity + clean expression via FX/indexes).</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    <Card id="roadmap" className="rounded-2xl">
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/20 transition-colors rounded-t-2xl"
                            onClick={() => toggleSection('roadmap')}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <CardTitle className="text-xl">Roadmap Summary</CardTitle>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Proof of execution first (regimes). Then causal depth (transmission). Then expansion (global + micro + cycles).
                                    </p>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'h-5 w-5 text-muted-foreground transition-transform shrink-0',
                                        expandedSections['roadmap'] && 'rotate-180'
                                    )}
                                />
                            </div>
                        </CardHeader>

                        {expandedSections['roadmap'] && (
                            <CardContent className="space-y-3">
                                {ROADMAP.map((r) => (
                                    <div
                                        key={r.label}
                                        className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/20 p-4"
                                    >
                                        <div className="text-sm font-medium">{r.label}</div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                ))}

                                <div className="mt-4 rounded-2xl border bg-background p-4">
                                    <div className="text-sm font-medium">One-line pitch</div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        We combine regime detection, causal transmission, and multi-timescale research into a single framework
                                        for how capital moves when rules change.
                                    </p>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>

            <div className="mt-10 text-xs text-muted-foreground">
                This page is an architectural overview — not a prediction engine.
            </div>
        </div>
    );
}