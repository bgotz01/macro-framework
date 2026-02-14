// components/why-twelve.tsx
'use client';

import { useMemo, useState } from "react";

type CategoryKey = "math" | "time" | "religion" | "institutions";

type Item = {
    id: string;
    title: string;
    claim: string | string[];
    why: string;
};

type Category = {
    key: CategoryKey;
    title: string;
    subtitle: string;
    icon: string;
    items: Item[];
};

function ExampleCard({
    n,
    item,
    open,
    onToggle,
}: {
    n: number;
    item: Item;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <button
                onClick={onToggle}
                className="w-full text-left focus:outline-none"
                aria-expanded={open}
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
                        <span className="font-mono text-sm">{String(n).padStart(2, "0")}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base font-semibold">{item.title}</h4>
                            <span className="text-muted-foreground text-sm">{open ? "−" : "+"}</span>
                        </div>
                        {typeof item.claim === 'string' ? (
                            <p className="mt-1 text-sm text-muted-foreground">{item.claim}</p>
                        ) : (
                            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                                {item.claim.map((line, i) => (
                                    <li key={i}>{line}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </button>

            <div
                className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr] mt-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <p className="text-sm">
                            <span className="font-medium">Why it matters:</span>{" "}
                            <span className="text-muted-foreground">{item.why}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryRow({
    category,
    startNumber,
    openId,
    setOpenId,
}: {
    category: Category;
    startNumber: number;
    openId: string | null;
    setOpenId: (id: string | null) => void;
}) {
    return (
        <div className="rounded-2xl border border-border/50 bg-card p-6">
            {/* Category header */}
            <div className="flex flex-col items-center gap-2 mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-xl">
                        {category.icon}
                    </div>
                    <h3 className="text-xl font-bold">{category.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground text-center">{category.subtitle}</p>
            </div>

            {/* 3-column examples grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {category.items.map((item, idx) => {
                    const n = startNumber + idx;
                    const isOpen = openId === item.id;

                    return (
                        <ExampleCard
                            key={item.id}
                            n={n}
                            item={item}
                            open={isOpen}
                            onToggle={() => setOpenId(isOpen ? null : item.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default function WhyTwelve() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);

    const categories: Category[] = useMemo(
        () => [
            {
                key: "math",
                title: "Math & Measurement",
                subtitle: "12 is efficient: it subdivides cleanly and maps to physical standards.",
                icon: "➗",
                items: [
                    {
                        id: "divisibility",
                        title: "Divisibility",
                        claim: "12 divides cleanly into 2, 3, 4, and 6.",
                        why: "High divisibility makes 12 ideal for splitting value, measuring parts, and building shared standards.",
                    },
                    {
                        id: "circle",
                        title: "Circle Geometry",
                        claim: "360° = 12 × 30° (clean rotational slicing).",
                        why: "When you need repeatable partitions of a full rotation, 12 yields symmetric, human-usable segments.",
                    },
                    {
                        id: "inches",
                        title: "12 Inches in a Foot",
                        claim: "A legacy unit built around easy subdivision.",
                        why: "A base unit that halves, thirds, and quarters smoothly is extremely practical for everyday work.",
                    },
                ],
            },
            {
                key: "time",
                title: "Time",
                subtitle: "12 is a natural container for cycles: annual, daily, and symbolic rhythm.",
                icon: "🕰️",
                items: [
                    {
                        id: "months",
                        title: "12 Months",
                        claim: "The year is commonly organized into 12 months.",
                        why: "A stable annual container with convenient internal segmentation supports planning and seasonal rhythm.",
                    },
                    {
                        id: "clock",
                        title: "12-Hour Clock",
                        claim: "Two 12-hour halves structure daily time (AM/PM).",
                        why: "Human-scale time slices keep scheduling intuitive while preserving clean halves and quarters.",
                    },
                    {
                        id: "zodiac",
                        title: "12 Zodiac Signs",
                        claim: "12-sign zodiac systems (Western & Eastern).",
                        why: "Twelve segments create a memorable cycle map—useful for archetypes, narrative, and recurring interpretation.",
                    },
                ],
            },
            {
                key: "religion",
                title: "Religion & Myth",
                subtitle: "12 signals a complete council: organized authority, wholeness, and symbolic order.",
                icon: "🕯️",
                items: [
                    {
                        id: "tribes",
                        title: "12 Tribes of Israel",
                        claim: "A canonical structure for a complete people.",
                        why: "12 expresses unity through organized parts—one identity represented as a full set.",
                    },
                    {
                        id: "apostles",
                        title: "12 Apostles",
                        claim: "A complete leadership circle in Christian tradition.",
                        why: "It encodes authority as a stable council: enough to represent, not so many that cohesion collapses.",
                    },
                    {
                        id: "olympians",
                        title: "12 Olympians",
                        claim: "Greek mythology's canonical council of gods.",
                        why: "Myths use 12 to signal completeness—an orderly map of powers and domains.",
                    },
                ],
            },
            {
                key: "institutions",
                title: "Institutions",
                subtitle: "12 shows up in human systems: judgment, governance rhythm, and developmental milestones.",
                icon: "🏛️",
                items: [
                    {
                        id: "jurors",
                        title: "12 Jurors",
                        claim: "A workable group for collective judgment.",
                        why: "Large enough for diverse viewpoints, small enough for deliberation and consensus-building.",
                    },
                    {
                        id: "us_terms",
                        title: "US Election Terms",
                        claim: [
                            "House: 2 years",
                            "President: 4 years",
                            "Senate: 6 years",
                            "(all divide 12)"
                        ],
                        why: "A 12-year window cleanly contains 6 House cycles, 3 presidential terms, and 2 Senate terms—so short accountability and longer stability can coexist.",
                    },
                    {
                        id: "k12_college",
                        title: "K–12 + 4-Year College",
                        claim: "12-year foundation, often followed by a 4-year degree arc.",
                        why: "A long developmental container with predictable milestones; 4-year steps act as evaluation and specialization checkpoints.",
                    },
                ],
            },
        ],
        []
    );

    return (
        <div className="mb-12">
            <div className="rounded-2xl border border-border/50 bg-card">
                {/* Collapsible header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-8 text-left focus:outline-none hover:bg-muted/20 transition-colors rounded-2xl"
                    aria-expanded={isExpanded}
                >
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
                                <span className="text-xl font-bold">12</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Why 12?</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    12 feels complete because it's a natural container: divisible, repeatable, and easy to segment into human-sized structure.
                                </p>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-xl">
                            {isExpanded ? "−" : "+"}
                        </div>
                    </div>

                    {/* Category preview boxes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {categories.map((cat) => (
                            <div
                                key={cat.key}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-muted/30"
                            >
                                <span className="text-2xl">{cat.icon}</span>
                                <span className="text-sm font-semibold text-center">{cat.title}</span>
                            </div>
                        ))}
                    </div>
                </button>

                {/* Expandable content */}
                <div
                    className={`grid transition-all duration-300 ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                >
                    <div className="overflow-hidden">
                        <div className="px-8 pb-8">
                            {/* Category rows */}
                            <div className="space-y-6">
                                {categories.map((cat, i) => (
                                    <CategoryRow
                                        key={cat.key}
                                        category={cat}
                                        startNumber={i * 3 + 1}
                                        openId={openId}
                                        setOpenId={setOpenId}
                                    />
                                ))}
                            </div>

                            <p className="mt-6 text-xs text-muted-foreground">
                                Tip: click an example to expand the "why it matters."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
