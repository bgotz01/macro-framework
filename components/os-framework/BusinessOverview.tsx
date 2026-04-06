'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type ReasonKey = 'WEALTH' | 'REGIME' | 'AI';

const REASONS: Array<{
    key: ReasonKey;
    title: string;
    subtitle: string;
    tagline: string;
    bullets: string[];
    details: Array<{ label: string; text: string }>;
}> = [
        {
            key: 'WEALTH',
            title: 'The Millennial Now Has Money',
            subtitle: 'Capital without a mental model',
            tagline: 'A generation inherits wealth without trusting institutions',
            bullets: [
                'Entering peak earning + inheritance years',
                'Lived through multiple market crashes',
                'Distrusts banks, advisors, and opaque incentives',
                'Wants explanation before allocation',
            ],
            details: [
                {
                    label: 'What changed',
                    text: 'This is the largest wealth transfer in history, hitting a generation that never experienced a stable economic regime.',
                },
                {
                    label: 'Why incumbents fail',
                    text: 'Traditional wealth management assumes falling rates, stable inflation, and buy-and-hold permanence.',
                },
                {
                    label: 'What is needed now',
                    text: 'Frameworks that explain how environments change — not product recommendations.',
                },
            ],
        },
        {
            key: 'REGIME',
            title: 'The Free-Money Era Is Over',
            subtitle: 'Regime awareness becomes alpha',
            tagline: 'Returns compress, mistakes compound',
            bullets: [
                'Historically high equity valuations',
                'Capital is no longer free',
                'Policy shocks dominate outcomes',
                'Passive exposure becomes dangerous',
            ],
            details: [
                {
                    label: 'What changed',
                    text: 'For over a decade, being invested was enough. That era rewarded passivity.',
                },
                {
                    label: 'Why this matters',
                    text: 'In high-valuation, high-volatility regimes, avoiding the wrong exposure matters more than finding upside.',
                },
                {
                    label: 'New source of value',
                    text: 'Knowing when assumptions break — and when regimes flip.',
                },
            ],
        },
        {
            key: 'AI',
            title: 'AI Belongs in Decision Infrastructure',
            subtitle: 'Not trading bots',
            tagline: 'Structure beats prediction',
            bullets: [
                'Trading algos decay and break trust',
                'Black boxes fail under regime change',
                'Humans still make the final call',
                'AI excels at consistency and memory',
            ],
            details: [
                {
                    label: 'The misconception',
                    text: 'Most AI finance tools try to predict prices or trade faster. This consistently fails.',
                },
                {
                    label: 'The insight',
                    text: 'AI is best used to maintain frameworks, track slow variables, and enforce decision discipline.',
                },
                {
                    label: 'Our approach',
                    text: 'AI as a macro-aware co-pilot that structures judgment — not an oracle.',
                },
            ],
        },
    ];

function ReasonCard({
    item,
    open,
    onToggle,
}: {
    item: (typeof REASONS)[number];
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <Card className="rounded-2xl border-border/60 shadow-sm !flex !flex-col h-full">
            <Collapsible open={open} onOpenChange={onToggle} className="flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-3 flex-shrink-0 text-center">
                    <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                    <p className="mt-3 text-sm font-medium text-foreground/90">{item.tagline}</p>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
                    <div className="flex-1">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {item.bullets.map((b) => (
                                <li key={b} className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/35" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>

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

                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 w-full gap-2"
                            aria-label={open ? 'Collapse' : 'Expand'}
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

export function BusinessOverview() {
    const [openKey, setOpenKey] = React.useState<ReasonKey | null>(null);

    return (
        <section className="w-full mt-16">
            <h2 className="mb-3 text-center text-2xl font-bold tracking-tight">
                Why This Business Exists Now
            </h2>
            <p className="mb-8 max-w-3xl mx-auto text-center text-sm text-muted-foreground">
                Three slow, irreversible forces are converging — and incumbents are structurally unable to adapt.
            </p>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
                {REASONS.map((item) => (
                    <ReasonCard
                        key={item.key}
                        item={item}
                        open={openKey === item.key}
                        onToggle={() =>
                            setOpenKey((prev) => (prev === item.key ? null : item.key))
                        }
                    />
                ))}
            </div>
        </section>
    );
}