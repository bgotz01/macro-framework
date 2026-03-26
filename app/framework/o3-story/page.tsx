export default function StoryPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 text-secondary-foreground text-sm font-medium mb-4">
                    Framework • Law 3
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                    O3: Story
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Outlier (New Paradigm)
                </p>
            </div>

            {/* What it is */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card mb-8">
                <h2 className="text-xl font-bold text-card-foreground mb-3">What it is</h2>
                <p className="text-sm text-muted-foreground">
                    A discontinuity that changes the production function or the system's rules (creates new winners, kills old moats).
                </p>
            </div>

            {/* Criteria */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Criteria (tests)</h2>

                <div className="space-y-6">
                    {/* New Capability */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-start space-x-3 mb-3">
                            <span className="text-2xl">✦</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-card-foreground mb-2">New capability</h3>
                                <p className="text-sm text-muted-foreground">
                                    Does it reduce a foundational cost (compute, labor, capital, energy, cognition) or create a new capability (surveillance, precision strike, automation)?
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Institutional Adoption */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-start space-x-3 mb-3">
                            <span className="text-2xl">✦</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-card-foreground mb-2">Institutional adoption</h3>
                                <p className="text-sm text-muted-foreground">
                                    Do governments and large enterprises adopt it (budgets, procurement, regulation)?
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Value Chain Rewrite */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-start space-x-3 mb-3">
                            <span className="text-2xl">✦</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-card-foreground mb-2">Value chain rewrite</h3>
                                <p className="text-sm text-muted-foreground">
                                    Does it re-map who captures margin (distribution vs product, platform vs vendor)?
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Irreversibility (Optional) */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-start space-x-3 mb-3">
                            <span className="text-2xl">✦</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-card-foreground mb-2">Irreversibility <span className="text-xs text-muted-foreground font-normal">(Optional)</span></h3>
                                <p className="text-sm text-muted-foreground">
                                    Is it hard to "go back" even after the shock fades?
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Examples */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card mb-8">
                <h3 className="text-xl font-bold text-card-foreground mb-4">Examples</h3>
                <div className="space-y-3">
                    <div className="flex items-start space-x-3 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">China joins WTO</span>
                            <span className="text-muted-foreground"> → global labor arbitrage + supply chain re-architecture</span>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">QE/ZIRP</span>
                            <span className="text-muted-foreground"> → price of money structurally altered</span>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">LLMs</span>
                            <span className="text-muted-foreground"> → marginal cost of software/cognition collapses</span>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <div>
                            <span className="font-medium text-card-foreground">Major security reset</span>
                            <span className="text-muted-foreground"> → persistent surveillance/defense baseline</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
