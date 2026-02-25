// components/OsGuide.tsx
'use client';

import * as React from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type OKey = 'O1' | 'O2' | 'O3';

const O_SECTIONS: Array<{
    key: OKey;
    subtitle: string;
    tagline: string;
    bullets: string[];
    details: Array<{ label: string; text: string }>;
}> = [
        {
            key: 'O1',
            subtitle: 'Identify the environment',
            tagline: 'What regime are we in right now?',
            bullets: [
                'Low-dimensional, observable macro variables',
                'Clear regime label + confidence',
                'Slow-moving changes, high importance when they occur',
                'Shared language for ICs and clients',
            ],
            details: [
                { label: 'Output', text: 'A “Regime Card” (label, confidence, key drivers) + change alerts.' },
                {
                    label: 'Why it matters',
                    text: 'You can’t choose strategies intelligently if you don’t know the environment they’re operating in.',
                },
                { label: 'Monetization role', text: 'Often free / top-of-funnel (creates vocabulary + distribution).' },
            ],
        },
        {
            key: 'O2',
            subtitle: 'Structure how to operate inside the regime',
            tagline: 'How the market is about to flip',
            bullets: [
                'Playbooks (what tends to work / break)',
                'Historical analogs as constraints, not nostalgia',
                'Policy + tech + market structure interpretation',
                'Decision menus: options, triggers, and guardrails',
            ],
            details: [
                {
                    label: 'Output',
                    text: 'Regime Playbooks: recommended behaviors, hedges, avoid-lists, and “what would change our mind” triggers.',
                },
                {
                    label: 'Why it matters',
                    text: 'Most tools stop at signals. Professionals need decision structure—not more charts.',
                },
                { label: 'Monetization role', text: 'High-value paid layer (CIO subscription / institutional briefings).' },
            ],
        },
        {
            key: 'O3',
            subtitle: 'Find anomalies created by the regime',
            tagline: 'Where are the new big moves?',
            bullets: [
                'Regime-gated anomaly detection (no blind scanning)',
                'Archetype matching: fraud, fragility, reflexive bubbles',
                '“Early winners” pattern search for new-regime operators',
                'Each outlier comes with risks + confirmation triggers',
            ],
            details: [
                {
                    label: 'Output',
                    text: 'Outlier Radar: ranked anomalies with explanation, risks, confirmations, and “ways to express the view.”',
                },
                { label: 'Why it matters', text: 'Edge comes from rare mispricings regimes create—not constant activity.' },
                { label: 'Monetization role', text: 'Premium layer (optional satellite allocations; highest ARPU).' },
            ],
        },
    ];

function renderTitle(key: OKey) {
    if (key === 'O1')
        return (
            <>
                <span className="italic">O1</span> — <span className="italic">Obvious</span> Signal
            </>
        );
    if (key === 'O2')
        return (
            <>
                O2 — <span className="italic">Opposite</span> Swing
            </>
        );
    return (
        <>
            O3 — <span className="italic">Outlier</span> Story <span className="text-muted-foreground">(9sigma)</span>
        </>
    );
}

function OCard({
    item,
    open,
    onToggle,
}: {
    item: (typeof O_SECTIONS)[number];
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <Card className="rounded-2xl border-border/60 shadow-sm !flex !flex-col h-full hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <Collapsible open={open} onOpenChange={onToggle} className="flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-3 flex-shrink-0">
                    <div className="min-w-0 w-full text-center">
                        <CardTitle className="text-base sm:text-lg">
                            {item.key === 'O1' ? (
                                <>
                                    <span className="text-blue-600 dark:text-blue-400">O1</span> — <span className="italic text-blue-500 dark:text-blue-300">Obvious</span> Signal
                                </>
                            ) : item.key === 'O2' ? (
                                <>
                                    <span className="text-blue-600 dark:text-blue-400">O2</span> — <span className="italic text-blue-500 dark:text-blue-300">Opposite</span> Swing
                                </>
                            ) : (
                                <>
                                    <span className="text-blue-600 dark:text-blue-400">O3</span> — <span className="italic text-blue-500 dark:text-blue-300">Outlier</span> Story{' '}
                                    <span className="text-muted-foreground">(9sigma)</span>
                                </>
                            )}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                    </div>

                    <p className="mt-3 text-sm font-medium text-foreground/90 text-center">
                        {item.tagline}
                    </p>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
                    <div className="flex-1">
                        {/* Summary bullets (always visible) */}
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {item.bullets.map((b) => (
                                <li key={b} className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/35" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Expandable details */}
                        <CollapsibleContent className="mt-4 space-y-3 border-t border-border/60 pt-4">
                            {item.details.map((d) => (
                                <div key={d.label}>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                                        {d.label}
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">{d.text}</p>
                                </div>
                            ))}
                        </CollapsibleContent>
                    </div>

                    {/* Bottom-only trigger - always at bottom */}
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 w-full gap-2"
                            aria-label={open ? `Collapse ${item.key}` : `Expand ${item.key}`}
                        >
                            <span className="text-xs sm:text-sm">
                                {open ? 'Hide details' : 'Show details'}
                            </span>
                            <ChevronDown
                                className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
                            />
                        </Button>
                    </CollapsibleTrigger>
                </CardContent>
            </Collapsible>
        </Card>
    );
}

function FlowRow() {
    const items: Array<{ key: OKey; label: string }> = [
        { key: 'O1', label: 'Regime' },
        { key: 'O2', label: 'Playbook' },
        { key: 'O3', label: 'Outliers' },
    ];

    return (
        <div className="mt-8 flex flex-col items-center gap-3">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">How it flows</div>

            <div className="flex flex-wrap items-center justify-center gap-2">
                {items.map((it, idx) => (
                    <React.Fragment key={it.key}>
                        <div className="rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 text-sm">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{it.key}</span>
                            <span className="text-muted-foreground"> — {it.label}</span>
                        </div>
                        {idx < items.length - 1 && <ArrowRight className="h-4 w-4 text-blue-400 dark:text-blue-500" />}
                    </React.Fragment>
                ))}
            </div>

            <p className="max-w-2xl text-center text-sm text-muted-foreground">
                <span className="text-blue-600 dark:text-blue-400 font-medium">O1</span> identifies the environment, <span className="text-blue-600 dark:text-blue-400 font-medium">O2</span> structures decisions inside it, and <span className="text-blue-600 dark:text-blue-400 font-medium">O3</span> surfaces anomalies worth acting on.
            </p>
        </div>
    );
}

export function OsGuide() {
    const [openKey, setOpenKey] = React.useState<OKey | null>(null);

    return (
        <section className="w-full">
            <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">
                The <span className="text-blue-600 dark:text-blue-400">Macro OS</span> Framework
            </h2>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
                {O_SECTIONS.map((item) => (
                    <OCard
                        key={item.key}
                        item={item}
                        open={openKey === item.key}
                        onToggle={() => setOpenKey((prev) => (prev === item.key ? null : item.key))}
                    />
                ))}
            </div>

            <FlowRow />
        </section>
    );
}