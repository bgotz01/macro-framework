// components/OilCostTierBar.tsx
"use client";

import { Card } from "@/components/ui/card";

type TierKey = "cheap" | "medium" | "expensive";

type CountryCost = {
    name: string;
    costRange: string;
};

type Tier = {
    key: TierKey;
    label: string;
    range: string;
    description: string;
    countries: CountryCost[];
};

const OIL_COST_TIERS: Tier[] = [
    {
        key: "cheap",
        label: "Cheap",
        range: "$8–25 / barrel",
        description: "Large conventional reserves, easy extraction, strong flow rates",
        countries: [
            { name: "Saudi Arabia", costRange: "$8–15" },
            { name: "Iraq", costRange: "$10–20" },
            { name: "Iran", costRange: "$10–20" },
            { name: "UAE", costRange: "$10–25" },
            { name: "Kuwait", costRange: "$10–25" },
            { name: "Libya", costRange: "$10–25" },
        ],
    },
    {
        key: "medium",
        label: "Medium",
        range: "$20–50 / barrel",
        description: "Offshore, mature fields, or more complex logistics",
        countries: [
            { name: "Russia", costRange: "$15–30" },
            { name: "United States (conventional)", costRange: "$20–40" },
            { name: "Norway", costRange: "$20–40" },
            { name: "Nigeria", costRange: "$25–40" },
            { name: "Brazil", costRange: "$30–50" },
            { name: "Kazakhstan", costRange: "$20–40" },
        ],
    },
    {
        key: "expensive",
        label: "Expensive",
        range: "$40–90+ / barrel",
        description: "Shale, heavy oil, oil sands, or difficult geology",
        countries: [
            { name: "United States (shale)", costRange: "$40–60" },
            { name: "Canada", costRange: "$60–85+" },
            { name: "Venezuela", costRange: "$60–80+" },
            { name: "United Kingdom (North Sea)", costRange: "$40–60" },
            { name: "China", costRange: "$70–90" },
        ],
    },
];

const tierStyles: Record<
    TierKey,
    {
        bar: string;
        badge: string;
        border: string;
        bg: string;
        dot: string;
    }
> = {
    cheap: {
        bar: "from-emerald-500 to-emerald-400",
        badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        border: "border-emerald-500/20",
        bg: "bg-emerald-500/5",
        dot: "bg-emerald-400",
    },
    medium: {
        bar: "from-amber-500 to-amber-400",
        badge: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
        border: "border-amber-500/20",
        bg: "bg-amber-500/5",
        dot: "bg-amber-400",
    },
    expensive: {
        bar: "from-rose-500 to-rose-400",
        badge: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
        border: "border-rose-500/20",
        bg: "bg-rose-500/5",
        dot: "bg-rose-400",
    },
};

export default function OilCostTierBar() {
    return (
        <Card className="border-white/10 bg-zinc-950 p-6 text-white">
            <div className="mb-6">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                    Global Oil Cost Curve
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Cheap → Medium → Expensive
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                    Approximate extraction cost tiers by country. This is a simple visual
                    grouping, not a precise field-by-field breakeven model.
                </p>
            </div>

            {/* Top bar */}
            <div className="mb-8">
                <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10">
                    {OIL_COST_TIERS.map((tier) => {
                        const styles = tierStyles[tier.key];
                        return (
                            <div
                                key={tier.key}
                                className={`bg-gradient-to-r ${styles.bar} px-4 py-4 text-center`}
                            >
                                <div className="text-xs uppercase tracking-[0.2em] text-white/70">
                                    {tier.label}
                                </div>
                                <div className="mt-1 text-lg font-semibold">{tier.range}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>Easier geology / lower cost</span>
                    <span>Harder geology / higher cost</span>
                </div>
            </div>

            {/* Detail cards */}
            <div className="grid gap-4 lg:grid-cols-3">
                {OIL_COST_TIERS.map((tier) => {
                    const styles = tierStyles[tier.key];

                    return (
                        <div
                            key={tier.key}
                            className={`rounded-2xl border ${styles.border} ${styles.bg} p-4`}
                        >
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <div
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles.badge}`}
                                    >
                                        {tier.label}
                                    </div>
                                    <div className="mt-3 text-lg font-semibold">{tier.range}</div>
                                    <p className="mt-1 text-sm leading-6 text-zinc-400">
                                        {tier.description}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {tier.countries.map((country) => (
                                    <div
                                        key={country.name}
                                        className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 rounded-full ${styles.dot}`}
                                                aria-hidden="true"
                                            />
                                            <span className="text-sm text-zinc-200">{country.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-zinc-400">
                                            {country.costRange}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}