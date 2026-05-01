export default function ArchitecturePage() {
    const traditionalSteps = [
        {
            label: "Story",
            description: '"AI is hot." "EVs are the future." "This company is revolutionary."',
        },
        {
            label: "Stocks",
            description: "Find tickers tied to the narrative. NVDA, TSLA, PLTR, crypto miners.",
        },
        {
            label: "Macro justification",
            description: '"Rates probably won\'t matter." "This time is different." "Growth justifies valuation."',
        },
    ];

    const ourSteps = [
        {
            label: "Regime",
            description: "Quantify the macro environment first. Growth, inflation, liquidity — defined by data, not headlines.",
        },
        {
            label: "Asset class / category",
            description: "Identify what historically performs in this regime. The environment selects the strategy.",
        },
        {
            label: "Stock selection",
            description: "Only then look at individual names — filtered through a regime-appropriate lens.",
        },
    ];

    const contrasts = [
        { traditional: "Bottom-up", ours: "Top-down" },
        { traditional: "Narrative-first", ours: "Environment-first" },
        { traditional: "Emotionally & socially driven", ours: "Structurally driven" },
        { traditional: "Reactive", ours: "Probabilistic" },
    ];

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Inversion section */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    The Inversion
                </p>

                <h2 className="text-3xl font-bold tracking-tight mb-3">
                    Traditional investing, flipped.
                </h2>

                <p className="text-muted-foreground mb-14 max-w-xl">
                    Most investors start with a story and work backward to justify it.
                    Capital Physics starts with the environment and works forward from there.
                </p>

                {/* Flow comparison — headers */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Traditional
                    </p>

                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                        Capital Physics
                    </p>
                </div>

                {/* Flow comparison — aligned rows */}
                <div className="space-y-0 mb-20">
                    {traditionalSteps.map((step, i) => (
                        <div key={i} className="grid grid-cols-2 gap-6 items-start">
                            {/* Traditional step */}
                            <div className="relative flex gap-5 pb-8 last:pb-0">
                                {i < traditionalSteps.length - 1 && (
                                    <div className="absolute left-[0.9rem] top-7 bottom-0 w-px bg-border/40" />
                                )}

                                <div className="relative z-10 flex-shrink-0 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-amber-500/80">
                                    {i + 1}
                                </div>

                                <div className="pt-0.5">
                                    <p className="text-sm font-semibold text-card-foreground mb-0.5">
                                        {step.label}
                                    </p>

                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {/* Capital Physics step */}
                            <div className="relative flex gap-5 pb-8 last:pb-0">
                                {i < ourSteps.length - 1 && (
                                    <div className="absolute left-[0.9rem] top-7 bottom-0 w-px bg-blue-500/20" />
                                )}

                                <div className="relative z-10 flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                                    {i + 1}
                                </div>

                                <div className="pt-0.5">
                                    <p className="text-sm font-semibold text-blue-300 mb-0.5">
                                        {ourSteps[i].label}
                                    </p>

                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {ourSteps[i].description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Why invert */}
                <div className="mb-20">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Why Invert?
                    </p>

                    <h2 className="text-3xl font-bold tracking-tight mb-6">
                        The regime exerts more force on returns than the company story.
                    </h2>

                    <p className="text-muted-foreground leading-relaxed mb-8">
                        A company does not operate in a vacuum. It operates inside a liquidity environment,
                        a rate environment, a valuation environment, and a capital flow environment.
                        Those forces often dominate company fundamentals.
                    </p>

                    {/* Core realization */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-6 py-5 mb-10">
                        <p className="text-sm font-semibold text-blue-300 mb-3">
                            The core realization
                        </p>

                        <p className="text-muted-foreground leading-relaxed mb-2">
                            A great company in the wrong regime can underperform badly.
                        </p>

                        <p className="text-muted-foreground leading-relaxed">
                            A mediocre company in the right regime can massively outperform.
                        </p>
                    </div>

                    {/* Examples */}
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                        Examples
                    </p>

                    <div className="space-y-3 mb-12">
                        {[
                            "Great tech companies collapsed in rising real-rate environments.",
                            "Weak speculative companies exploded during zero-rate liquidity booms.",
                            "Energy companies were ignored for years despite strong cash flows — because the regime favored duration and growth.",
                            "Banks can trade terribly even with decent earnings if the yield curve is inverted.",
                        ].map((example, i) => (
                            <div key={i} className="flex gap-3 items-baseline">
                                <span className="text-border flex-shrink-0">–</span>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {example}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Questions */}
                    <div className="rounded-xl border border-border bg-card/50 px-6 py-5 mb-4">
                        <p className="text-sm text-muted-foreground mb-1">
                            The wrong first question
                        </p>

                        <p className="text-lg font-semibold text-card-foreground">
                            "Which company is best?"
                        </p>
                    </div>

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-6 py-5 mb-10">
                        <p className="text-sm text-blue-400/70 mb-1">
                            The right first question
                        </p>

                        <p className="text-lg font-semibold text-blue-300">
                            "What environment are we in?"
                        </p>
                    </div>

                    {/* Environment determines */}
                    <p className="text-sm text-muted-foreground mb-4">
                        Because the environment determines:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            "Cost of capital",
                            "Investor preferences",
                            "Valuation tolerance",
                            "Liquidity availability",
                            "Risk appetite",
                            "Which categories attract flows",
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="rounded-lg border border-border bg-card/50 px-4 py-3"
                            >
                                <p className="text-sm text-muted-foreground">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contrast table */}
                <div className="rounded-xl border border-border overflow-hidden mb-24">
                    <div className="grid grid-cols-2 divide-x divide-border">
                        <div className="px-5 py-3 bg-card">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Traditional
                            </p>
                        </div>

                        <div className="px-5 py-3 bg-blue-500/5">
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                                Capital Physics
                            </p>
                        </div>
                    </div>

                    <div className="divide-y divide-border/50">
                        {contrasts.map((row, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-2 divide-x divide-border/50"
                            >
                                <div className="px-5 py-3.5 flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {row.traditional}
                                    </span>
                                </div>

                                <div className="px-5 py-3.5 flex items-center gap-2 bg-blue-500/[0.03]">
                                    <span className="text-sm text-blue-300">
                                        {row.ours}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timing */}
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        The Final Inversion
                    </p>

                    <h2 className="text-3xl font-bold tracking-tight mb-6">
                        A good asset at the wrong time can still be a bad investment.
                    </h2>

                    <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                        Traditional investing treats timing as secondary — assuming that if the company is great,
                        the investment will eventually work. Capital Physics treats timing as structural.
                        Returns are heavily shaped by liquidity cycles, real rates, valuation expansion,
                        and capital rotation.
                    </p>

                    {/* Core timing quote */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-6 py-5 mb-10">
                        <p className="text-lg font-semibold text-blue-300 leading-relaxed">
                            Investing is not just what you buy.
                            <br />
                            It is when the environment allows it to work.
                        </p>
                    </div>

                    {/* Timing examples */}
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                        Examples
                    </p>

                    <div className="space-y-3 mb-12">
                        {[
                            "Amazon was a great company in 1999 — terrible timing.",
                            "Energy was hated in 2020 — incredible timing.",
                            "Long-duration growth outperformed until real yields reversed.",
                            "Value can remain cheap for years if the regime suppresses it.",
                        ].map((example, i) => (
                            <div key={i} className="flex gap-3 items-baseline">
                                <span className="text-border flex-shrink-0">–</span>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {example}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Final framework */}
                    <div className="rounded-2xl border border-border bg-card/40 p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                            Capital Physics Process
                        </p>

                        <div className="grid sm:grid-cols-4 gap-4">
                            {[
                                {
                                    step: "1",
                                    label: "Regime",
                                    desc: "What environment are we in?",
                                },
                                {
                                    step: "2",
                                    label: "Category",
                                    desc: "What does this regime reward?",
                                },
                                {
                                    step: "3",
                                    label: "Selection",
                                    desc: "Which assets best express it?",
                                },
                                {
                                    step: "4",
                                    label: "Timing",
                                    desc: "When does probability shift?",
                                },
                            ].map((item) => (
                                <div
                                    key={item.step}
                                    className="rounded-xl border border-border bg-background/40 px-4 py-5"
                                >
                                    <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 mb-4">
                                        {item.step}
                                    </div>

                                    <p className="text-sm font-semibold text-blue-300 mb-1">
                                        {item.label}
                                    </p>

                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}