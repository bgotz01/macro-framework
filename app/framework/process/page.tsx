'use client';

export default function FrameworkProcessPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6 lg:py-14">
            <div className="space-y-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="page-title text-3xl mb-1">DECISION FLOWS</h1>
                    <p className="page-subtitle">
                        Two Opposite Approaches
                    </p>
                    <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
                </div>

                {/* Typical Flow Section */}
                <section className="space-y-6">
                    <div className="text-center">
                        <div className="mb-4 inline-flex items-center rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-500">
                            Current Flow
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Winners → Permanence → Trap
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
                            The default method: start with visible outcomes, project them forward as if
                            current conditions are permanent, then remain positioned into the break.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <div className="rounded-2xl border border-red-500/20 bg-card p-6 text-center shadow-sm">
                            <div className="mb-4 flex flex-col items-center gap-3">
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

                            <div className="grid gap-2 text-sm text-muted-foreground">
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

                        <div className="rounded-2xl border border-red-500/20 bg-card p-6 text-center shadow-sm">
                            <div className="mb-4 flex flex-col items-center gap-3">
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

                            <div className="grid gap-2 text-sm text-muted-foreground">
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

                        <div className="rounded-2xl border border-red-500/20 bg-card p-6 text-center shadow-sm">
                            <div className="mb-4 flex flex-col items-center gap-3">
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

                            <div className="grid gap-2 text-sm text-muted-foreground">
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
                </section>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/60"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-background px-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            We reverse this
                        </span>
                    </div>
                </div>

                {/* Our Framework Section */}
                <section className="space-y-6">
                    <div className="text-center">
                        <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                            Our Framework
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            System → Change → Outliers
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
                            Start with system state, detect change in the system itself, then position
                            for assets that benefit before the market recognizes them.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <div className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm">
                            <div className="mb-4 flex flex-col items-center gap-3">
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

                            <div className="grid gap-2 text-sm text-muted-foreground">
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

                        <div className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm">
                            <div className="mb-4 flex flex-col items-center gap-3">
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

                            <div className="grid gap-2 text-sm text-muted-foreground">
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

                        <div className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm">
                            <div className="mb-4 flex flex-col items-center gap-3">
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

                            <div className="grid gap-2 text-sm text-muted-foreground">
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
                </section>
            </div>
        </div>
    );
}
