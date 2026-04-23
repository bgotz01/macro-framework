'use client';

import { Globe2, Cpu, Rocket } from 'lucide-react';

interface MacroCycle {
    year: number;
    title: string;
    keywords: string[];
    description: string;
}

interface TechRelease {
    label: string;
    date: string;
}

interface TechCycle {
    year: number;
    title: string;
    keywords: string[];
    description: string;
    releases: TechRelease[];
}

const MACRO_CYCLES: MacroCycle[] = [
    {
        year: 1948,
        title: 'Rule-Based Reconstruction',
        keywords: ['Bretton Woods', 'Physical rebuild', 'State-directed capital'],
        description:
            'Post-war systems favor rules, measurement, and centralized planning. Capital is constrained, directed, and legitimized through institutions.',
    },
    {
        year: 1960,
        title: 'Brand Permanence',
        keywords: ['Consumer dominance', 'Growth certainty', 'Buy-and-hold faith'],
        description:
            'Economic confidence shifts toward durable brands and institutions. Stability, scale, and predictability are rewarded over disruption.',
    },
    {
        year: 1972,
        title: 'Fiat Price Discovery',
        keywords: ['Unanchored money', 'Inflation signals', 'Real assets'],
        description:
            'With money detached from hard anchors, price becomes the primary signal. Volatility rises and real assets regain strategic importance.',
    },
    {
        year: 1984,
        title: 'Credit-Driven Expansion',
        keywords: ['Leverage', 'Falling rates', 'Financial assets'],
        description:
            'Lower rates and financial innovation allow credit to scale faster than the real economy. Risk is modeled, distributed, and obscured.',
    },
    {
        year: 1996,
        title: 'Digital Scale Infrastructure',
        keywords: ['Networks', 'Software', 'Winner-take-most'],
        description:
            'Economic advantage shifts to platforms and networks. Software enables non-linear scale and concentration.',
    },
    {
        year: 2008,
        title: 'Policy-Controlled Markets',
        keywords: ['QE', 'Risk suppression', 'Moral hazard'],
        description:
            'Markets are stabilized by intervention. Volatility is externally managed, encouraging leverage and asset inflation.',
    },
    {
        year: 2020,
        title: 'Intangible Economy',
        keywords: [
            'Government Intervention',
            'Monetary Base Expansion',
            'Remote Work'
        ],
        description:
            'Economic outcomes become increasingly shaped by government intervention and balance-sheet expansion. Labor detaches from physical location under policy constraint, while price discovery is subordinated to stability, liquidity provision, and political legitimacy.',
    }
];

const TECH_CYCLES: TechCycle[] = [
    {
        year: 1948,
        title: 'Modern computing & control systems',
        keywords: ['Programmable compute', 'Information theory', 'Feedback systems'],
        description:
            'Computation and control become practical primitives for coordination: measurement → feedback → execution at scale.',
        releases: [
            { label: 'Transistor demonstrated (Bell Labs)', date: '1947-12-23' },
            { label: 'Shannon publishes Information Theory', date: '1948' },
            { label: 'Wiener publishes “Cybernetics”', date: '1948' },
        ],
    },
    {
        year: 1960,
        title: 'Mainframes & enterprise data processing',
        keywords: ['Centralized IT', 'Standardized software', 'Org-scale compute'],
        description:
            'Computing consolidates inside major institutions, turning administration into a machine: payroll, inventory, accounting, control.',
        releases: [
            { label: 'COBOL specification completed', date: '1959' },
            { label: 'DEC PDP-1 delivered', date: '1960' },
        ],
    },
    {
        year: 1972,
        title: 'Computing & electronic markets',
        keywords: ['Microprocessors', 'Systems languages', 'Networking begins'],
        description:
            'Compute moves toward the edge. Hardware shrinks, software becomes portable, and networking starts to look like a default.',
        releases: [
            { label: 'NASDAQ electronic trading', date: '1971' },
            { label: 'Intel 4004 released (first single chip mircroprocessor)', date: '1971' },
            { label: 'C programming language created', date: '1972' },

        ],
    },
    {
        year: 1984,
        title: 'Networked computing & software standardization',
        keywords: ['GUI era', 'Naming & routing', 'PC OS layer'],
        description:
            'The durable stack forms: friendly interfaces on top, stable naming/routing underneath, and an OS layer that standardizes distribution.',
        releases: [
            { label: 'DNS introduced (domain names)', date: '1983' },
            { label: 'Macintosh released', date: '1984' },
            { label: 'Windows 1.0 released', date: '1985' },
        ],
    },
    {
        year: 1996,
        title: 'Commercial internet & platform software',
        keywords: ['Search & discovery', 'Web plumbing', 'Always-on services'],
        description:
            'The internet becomes commercially real: discovery (search), standardized web delivery, and services that scale beyond geography.',
        releases: [
            { label: 'Search Engines - Yahoo! (1994), Google (1998)', date: '1994' },
            { label: 'Internet Browser - Netscape (1994), Internet Explorer (1995)', date: '1995' },
            { label: 'Ecommerce Platoform - Ebay, Amazon', date: '1995' },

        ],
    },
    {
        year: 2008,
        title: 'Cloud era, mobile platforms & programmable money',
        keywords: ['Smartphones', 'App distribution', 'Crypto rails'],
        description:
            'Daily life shifts onto mobile platforms, distribution becomes app-native, and a parallel monetary rail is proposed after institutional failure.',
        releases: [
            { label: 'AWS launched', date: '2006' },
            { label: 'iPhone released, App store (2008)', date: '2007' },
            { label: 'Bitcoin whitepaper published', date: '2008' },
        ],
    },
    {
        year: 2020,
        title: 'Algorithms & LLMs',
        keywords: ['Algorithmic distribution (TikTok)', 'LLMs', 'Digital workflows'],
        description:
            'Algorithms move from ranking content to shaping culture and labor. During a period of physical constraint, model-driven distribution determines what is seen, while large language models introduce generative intelligence as a direct input to work. Production, attention, and feedback loops compress beyond human-scale control.',
        releases: [
            { label: 'TikTok hits 1B downloads', date: '2019' },
            { label: 'GPT-3 API beta released', date: '2020' },
            { label: 'GitHub Copilot preview announced', date: '2021' },


        ],
    },
];

const techByYear = new Map(TECH_CYCLES.map((t) => [t.year, t]));

export default function TwelveYearSummary() {
    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-3">
                    12-Year Cycle — Macro & Tech
                </h2>
                <p className="text-sm text-muted-foreground">
                    One anchor year per row. Macro explains the regime. Tech explains the system reconfiguration.
                </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                {MACRO_CYCLES.map((macro) => {
                    const tech = techByYear.get(macro.year);

                    return (
                        <div
                            key={macro.year}
                            className="rounded-xl border border-border/40 bg-background/40 p-5"
                        >
                            {/* Year Header */}
                            <div className="text-2xl font-bold text-primary mb-4">
                                {macro.year}
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* MACRO - Left Column */}
                                <div className="flex gap-3">
                                    <Globe2 className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold tracking-wide text-muted-foreground">
                                            MACRO
                                        </div>
                                        <div className="font-semibold text-foreground">
                                            {macro.title}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {macro.keywords.map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-3">
                                            {macro.description}
                                        </div>
                                    </div>
                                </div>

                                {/* TECH - Right Column */}
                                {tech && (
                                    <div className="flex gap-3">
                                        <Cpu className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
                                                TECH
                                            </div>
                                            <div className="font-semibold text-foreground">
                                                {tech.title}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {tech.keywords.map((keyword, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-3">
                                                {tech.description}
                                            </div>

                                            {/* Releases */}
                                            <div className="mt-3 rounded-xl border border-border/40 bg-muted/15 p-3">
                                                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground mb-2">
                                                    <Rocket className="h-3.5 w-3.5" />
                                                    <span>MAJOR RELEASES</span>
                                                </div>

                                                <div className="space-y-1">
                                                    {tech.releases.map((r) => (
                                                        <div
                                                            key={`${tech.year}-${r.label}-${r.date}`}
                                                            className="flex items-baseline justify-between gap-4 rounded-md border border-border/40 bg-background/30 px-3 py-2"
                                                        >
                                                            <span className="text-sm text-foreground">
                                                                {r.label}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {r.date}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}