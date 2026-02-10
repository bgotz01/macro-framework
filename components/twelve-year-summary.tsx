'use client';

interface CycleSummary {
    year: number;
    title: string;
    keywords: string[];
}

const CYCLE_SUMMARIES: CycleSummary[] = [
    {
        year: 1948,
        title: "Rule-Based Reconstruction",
        keywords: ["Bretton Woods", "Physical rebuild", "State-directed capital"]
    },
    {
        year: 1960,
        title: "Brand Permanence",
        keywords: ["Consumer dominance", "Growth certainty", "Buy-and-hold faith"]
    },
    {
        year: 1972,
        title: "Fiat Price Discovery",
        keywords: ["Unanchored money", "Inflation signals", "Real assets"]
    },
    {
        year: 1984,
        title: "Credit-Driven Expansion",
        keywords: ["Leverage", "Falling rates", "Financial assets"]
    },
    {
        year: 1996,
        title: "Digital Scale Infrastructure",
        keywords: ["Networks", "Software", "Winner-take-most"]
    },
    {
        year: 2008,
        title: "Policy-Controlled Markets",
        keywords: ["QE", "Risk suppression", "Moral hazard"]
    },
    {
        year: 2020,
        title: "Intangible Economy",
        keywords: ["Platforms", "Code", "Trust strain"]
    }
];

export default function TwelveYearSummary() {
    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-3">12-Year Cycle — One-Line System Summaries</h2>
            </div>

            <div className="p-6 rounded-2xl border border-border/50 bg-card">
                <div className="space-y-3">
                    {CYCLE_SUMMARIES.map((cycle) => (
                        <div
                            key={cycle.year}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <span className="text-2xl font-bold text-primary min-w-[80px]">
                                {cycle.year}
                            </span>
                            <span className="font-semibold text-card-foreground min-w-fit">
                                {cycle.title}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                ({cycle.keywords.join(" • ")})
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
