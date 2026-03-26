'use client';

export default function FrameworkProcessPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6 lg:py-14">
            <div className="space-y-10">
                {/* Header */}
                <section className="text-center">
                    <div className="mx-auto max-w-3xl space-y-4">
                        <div className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
                            Framework
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            Two Opposite Decision Flows
                        </h1>
                        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
                            Most investors start with visible winners and get trapped by permanence.
                            Our process starts with the system, identifies inflection, and allocates
                            to outliers before they become obvious.
                        </p>
                    </div>
                </section>

                {/* Top summary band */}
                <section className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-primary/15 bg-primary/5 p-6 lg:p-7">
                        <div className="mb-3 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                            Our Framework
                        </div>
                        <ul className="space-y-2 text-lg font-semibold tracking-tight">
                            <li className="flex items-center gap-2">
                                <span className="text-primary text-sm">O1</span>
                                Define the regime
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-primary text-sm">O2</span>
                                Identify inflection
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-primary text-sm">O3</span>
                                Allocate to outliers
                            </li>
                        </ul>
                        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                            Start with system state, detect change in the system itself, then position
                            for the assets that benefit before the market fully recognizes them.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 lg:p-7">
                        <div className="mb-3 inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-500">
                            Typical Flow
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Buy winners → Assume permanence → Get trapped
                        </h2>
                        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                            Start with visible outcomes, project them forward as if current conditions
                            are permanent, then remain positioned into the break.
                        </p>
                    </div>
                </section>

                {/* Main comparison */}
                <section className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                    {/* Our side */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-px flex-1 bg-border/60" />
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                O1 → O2 → O3
                            </span>
                            <div className="h-px flex-1 bg-border/60" />
                        </div>

                        <div className="grid gap-4">
                            <div className="flex rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                                <div className="flex flex-col flex-1">
                                    <div className="mb-4 flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                                            O1
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold">Define the regime</h3>
                                            <p className="text-sm italic text-muted-foreground">
                                                What system are we in?
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-sm text-muted-foreground flex-1">
                                        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                                            <span>Liquidity</span>
                                            <span className="text-primary">System input</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                                            <span>Rates</span>
                                            <span className="text-primary">Constraint input</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                                            <span>Valuation structure</span>
                                            <span className="text-primary">Context input</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                        Understand the current system before looking for ideas.
                                    </div>
                                </div>
                            </div>

                            <div className="flex rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                                <div className="flex flex-col flex-1">
                                    <div className="mb-4 flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                                            O2
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold">Identify inflection</h3>
                                            <p className="text-sm italic text-muted-foreground">
                                                What is about to change?
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-sm text-muted-foreground flex-1">
                                        <div className="rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                                            Regime shift
                                        </div>
                                        <div className="rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                                            Constraint breaking
                                        </div>
                                        <div className="rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                                            Trend reversal
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-3 py-3">
                                        <p className="text-xs font-semibold text-foreground">
                                            Not just change
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            This is change in the system itself, not just noise inside it.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                                <div className="flex flex-col flex-1">
                                    <div className="mb-4 flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                                            O3
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold">Allocate to outliers</h3>
                                            <p className="text-sm italic text-muted-foreground">
                                                Who is positioned to benefit before it becomes obvious?
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-sm text-muted-foreground flex-1">
                                        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                                            <span>Styles</span>
                                            <span>Growth / Value</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                                            <span>Sectors</span>
                                            <span>Leadership shift</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                                            <span>Assets</span>
                                            <span>Specific expressions</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                        Stock picking enters here — but only after regime and inflection.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center divider */}
                    <div className="hidden lg:flex lg:h-full lg:items-center">
                        <div className="flex h-full flex-col items-center">
                            <div className="w-px flex-1 bg-border/60" />
                            <div className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                vs
                            </div>
                            <div className="w-px flex-1 bg-border/60" />
                        </div>
                    </div>

                    {/* Typical side */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-px flex-1 bg-border/60" />
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Reversed Flow
                            </span>
                            <div className="h-px flex-1 bg-border/60" />
                        </div>

                        <div className="grid gap-4">
                            <div className="flex rounded-2xl border border-red-500/20 bg-card p-6 shadow-sm">
                                <div className="flex flex-col flex-1">
                                    <div className="mb-4 flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-sm font-bold text-red-500">
                                            1
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold">Buy winners</h3>
                                            <p className="text-sm italic text-muted-foreground">
                                                Start with visible outcomes
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-sm text-muted-foreground flex-1">
                                        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.03] px-3 py-2">
                                            Strong stocks
                                        </div>
                                        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.03] px-3 py-2">
                                            Dominant narratives
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                        Outcome-first behavior.
                                    </div>
                                </div>
                            </div>

                            <div className="flex rounded-2xl border border-red-500/20 bg-card p-6 shadow-sm">
                                <div className="flex flex-col flex-1">
                                    <div className="mb-4 flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-sm font-bold text-red-500">
                                            2
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold">Assume permanence</h3>
                                            <p className="text-sm italic text-muted-foreground">
                                                Treat current conditions as normal
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-sm text-muted-foreground flex-1">
                                        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.03] px-3 py-2">
                                            Extrapolate trends
                                        </div>
                                        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.03] px-3 py-2">
                                            Believe the current regime is permanent
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-red-500/15 bg-red-500/[0.04] px-3 py-3">
                                        <p className="text-xs font-semibold text-foreground">
                                            Core mistake
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            The regime is mistaken for reality itself.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex rounded-2xl border border-red-500/20 bg-card p-6 shadow-sm">
                                <div className="flex flex-col flex-1">
                                    <div className="mb-4 flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-sm font-bold text-red-500">
                                            3
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold">Get trapped</h3>
                                            <p className="text-sm italic text-muted-foreground">
                                                Stay positioned into the break
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-sm text-muted-foreground flex-1">
                                        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.03] px-3 py-2">
                                            Positioned into the break
                                        </div>
                                        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.03] px-3 py-2">
                                            Too late to exit
                                        </div>
                                        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.03] px-3 py-2">
                                            Stuck in the old regime
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                        Consequence, not decision.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer summary */}
                <section className="rounded-3xl border border-border/60 bg-card p-6 lg:p-8">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Short Form
                            </p>
                            <p className="mt-3 text-xl font-bold tracking-tight">
                                System → Change → Outliers
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Reversed Form
                            </p>
                            <p className="mt-3 text-xl font-bold tracking-tight text-red-500">
                                Winners → Permanence → Trap
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}