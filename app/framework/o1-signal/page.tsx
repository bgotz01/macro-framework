export default function SignalPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    Framework • Law 1
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                    O1: Signal
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    The 4 Structural Signal Criteria
                </p>
            </div>

            {/* The 4 Criteria - Compact Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* 1. Novelty */}
                <div className="p-6 rounded-2xl border border-border/50 bg-card">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-foreground">1</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-card-foreground">Novelty</h3>
                            <p className="text-xs text-muted-foreground">(was: rare)</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                        Breaks the recent regime memory / local pattern library.
                    </p>
                    <div className="text-xs space-y-1">
                        <div>
                            <span className="font-medium text-card-foreground">Test:</span>{" "}
                            <span className="text-muted-foreground">Not typical in the last 5–15 years (or the last cycle)?</span>
                        </div>
                        <div>
                            <span className="font-medium text-card-foreground">Why:</span>{" "}
                            <span className="text-muted-foreground">If common, already priced and modeled.</span>
                        </div>
                    </div>
                </div>

                {/* 2. Observability */}
                <div className="p-6 rounded-2xl border border-border/50 bg-card">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-foreground">2</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-card-foreground">Observability</h3>
                            <p className="text-xs text-muted-foreground">(was: objective)</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                        Measurable and verifiable — not vibe-based.
                    </p>
                    <div className="text-xs space-y-1">
                        <div>
                            <span className="font-medium text-card-foreground">Test:</span>{" "}
                            <span className="text-muted-foreground">Hard data, formal policy action, or a clear market repricing?</span>
                        </div>
                        <div>
                            <span className="font-medium text-card-foreground">Why:</span>{" "}
                            <span className="text-muted-foreground">Prevents narrative chasing.</span>
                        </div>
                    </div>
                </div>

                {/* 3. Persistence */}
                <div className="p-6 rounded-2xl border border-border/50 bg-card">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-foreground">3</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-card-foreground">Persistence</h3>
                            <p className="text-xs text-muted-foreground">(was: durable)</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                        Long enough to matter for allocation (not just trading).
                    </p>
                    <div className="text-xs space-y-1">
                        <div>
                            <span className="font-medium text-card-foreground">Test:</span>{" "}
                            <span className="text-muted-foreground">Likely persists 12–36 months?</span>
                        </div>
                        <div>
                            <span className="font-medium text-card-foreground">Why:</span>{" "}
                            <span className="text-muted-foreground">Makes it a regime signal, not a headline.</span>
                        </div>
                    </div>
                </div>

                {/* 4. Capital Gravity */}
                <div className="p-6 rounded-2xl border border-border/50 bg-card">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-foreground">4</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-card-foreground">Capital Gravity</h3>
                            <p className="text-xs text-muted-foreground">(was: connected to flows)</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                        Forces money to move (budgets, capex, risk premia, flows).
                    </p>
                    <div className="text-xs space-y-1">
                        <div>
                            <span className="font-medium text-card-foreground">Test:</span>{" "}
                            <span className="text-muted-foreground">Does it change spending, financing conditions, or required returns?</span>
                        </div>
                        <div>
                            <span className="font-medium text-card-foreground">Why:</span>{" "}
                            <span className="text-muted-foreground">Capital flow is the mechanism that makes it real.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="p-6 rounded-2xl gradient-primary text-primary-foreground mb-8">
                <p className="text-sm text-primary-foreground/90">
                    A Structural Signal passes the four criteria, then gets expressed as O1 (Signal) → O2 (Opposite) → O3 (Outlier Paradigm).
                </p>
            </div>

            {/* O1/O2/O3 Structure */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Structure: O1 / O2 / O3</h2>

                <div className="space-y-6">
                    {/* O1 - Signal */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-center space-x-3 mb-3">
                            <span className="text-2xl">◉</span>
                            <h3 className="text-xl font-bold text-card-foreground">O1 — Signal</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            The measurable trigger (market pain and/or policy action):
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-start space-x-2">
                                <span className="text-primary mt-0.5">•</span>
                                <div>
                                    <span className="font-medium text-card-foreground">Market pain</span>
                                    <span className="text-muted-foreground"> (spreads, yields, drawdowns, volatility, defaults, flows) and/or</span>
                                </div>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="text-primary mt-0.5">•</span>
                                <div>
                                    <span className="font-medium text-card-foreground">Policy action</span>
                                    <span className="text-muted-foreground"> (laws, tariffs, sanctions, industrial policy, central bank stance)</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 italic">
                            O1 is where Observability is enforced.
                        </p>
                    </div>

                    {/* O2 - Inversion */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-center space-x-3 mb-3">
                            <span className="text-2xl">⟜</span>
                            <h3 className="text-xl font-bold text-card-foreground">O2 — Opposite (Inversion)</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            The direction that is opposite of the prior regime’s logic.
                        </p>
                        <div className="bg-muted/30 p-4 rounded-xl mb-3">
                            <p className="text-xs font-medium text-card-foreground mb-2">Examples:</p>
                            <div className="space-y-1.5 text-sm">
                                <div className="flex items-center space-x-2">
                                    <span className="text-muted-foreground">ZIRP</span>
                                    <span className="text-primary">→</span>
                                    <span className="text-card-foreground">positive real rates</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-muted-foreground">Globalization</span>
                                    <span className="text-primary">→</span>
                                    <span className="text-card-foreground">fragmentation</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-muted-foreground">“Software eats world”</span>
                                    <span className="text-primary">→</span>
                                    <span className="text-card-foreground">“software commoditized”</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-muted-foreground">Abundant liquidity</span>
                                    <span className="text-primary">→</span>
                                    <span className="text-card-foreground">scarce funding</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            O2 gives Novelty a direction (not just a surprise).
                        </p>
                    </div>

                    {/* O3 - Outlier */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-center space-x-3 mb-3">
                            <span className="text-2xl">✦</span>
                            <h3 className="text-xl font-bold text-card-foreground">O3 — Outlier (New Paradigm)</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            A structural discontinuity that introduces a new production function, constraint, or capability.
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                            O3 is the “hasn’t happened” element that creates the new world — not just a shock.
                        </p>
                        <div className="bg-muted/30 p-4 rounded-xl">
                            <p className="text-xs font-medium text-card-foreground mb-2">Examples:</p>
                            <div className="space-y-1.5 text-sm">
                                <div className="flex items-start space-x-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <div>
                                        <span className="font-medium text-card-foreground">China joins WTO</span>
                                        <span className="text-muted-foreground"> (global labor + supply chain regime unlocked)</span>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <div>
                                        <span className="font-medium text-card-foreground">ZIRP/QE era</span>
                                        <span className="text-muted-foreground"> (price of money structurally changed)</span>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <div>
                                        <span className="font-medium text-card-foreground">AI cost curve collapse</span>
                                        <span className="text-muted-foreground"> (marginal cost of cognition/software drops)</span>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <div>
                                        <span className="font-medium text-card-foreground">Security reset / major war</span>
                                        <span className="text-muted-foreground"> (surveillance + defense baseline resets)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 italic">
                            O3 is where Persistence and Capital Gravity are most visible.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
