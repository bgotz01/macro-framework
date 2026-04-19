export default function OverviewPage() {
    return (
        <div className="max-w-5xl mx-auto px-4">

            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                    Strategic Framework
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-card-foreground">
                    Market Overview
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    A systematic approach to understanding market regimes, structural trends, and risk factors
                </p>
            </div>

            {/* Quant vs Macro Divide */}
            <section className="mb-16">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        Philosophy
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-card-foreground mb-3">
                        Quant vs Macro Divide
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                        Our goal: explain why signals behave differently across environments
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mb-5">
                    <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                                <span className="text-blue-400 text-sm font-bold">Q</span>
                            </div>
                            <h3 className="text-base font-semibold text-card-foreground">Quants</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Detect signals, don&apos;t explain. Pattern recognition and statistical models surface what is happening, but not why.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                                <span className="text-amber-400 text-sm font-bold">M</span>
                            </div>
                            <h3 className="text-base font-semibold text-card-foreground">Macro</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Explain narratives, don&apos;t formalize. Macro thinkers build causal stories but rarely encode them into repeatable rules.
                        </p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 text-center">
                    <p className="text-sm text-card-foreground font-medium">
                        We bridge the rigor of quant with the context of macro to explain why signals behave differently across environments.
                    </p>
                </div>
            </section>

            {/* Two Core Lenses */}
            <section className="mb-16">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        Framework
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-card-foreground">
                        Two Core Lenses
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    {/* Liquidity */}
                    <div className="p-6 rounded-2xl border border-blue-500/20 bg-card">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <span className="text-blue-400 font-bold text-sm">1</span>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-card-foreground">Liquidity</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">flows, policy, money</p>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            {['Central banks', 'Real rates', 'Credit conditions'].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70 shrink-0" />
                                    <span className="text-sm text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Valuation */}
                    <div className="p-6 rounded-2xl border border-amber-500/20 bg-card">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                <span className="text-amber-400 font-bold text-sm">2</span>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-card-foreground">Valuation</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">what you&apos;re paying</p>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            {['Earnings yield', 'Risk premium', 'Equity vs bonds'].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 shrink-0" />
                                    <span className="text-sm text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Core Themes */}
            <section className="mb-16">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        Core Themes
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-card-foreground">
                        Themes for the next decade
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { label: 'Equity valuations in 99th percentile', color: 'text-red-400', dot: 'bg-red-400/60' },
                        { label: 'Marginal cost of intelligence is 0 (AI)', color: 'text-violet-400', dot: 'bg-violet-400/60' },
                        { label: 'Stable bond market and inflation', color: 'text-green-400', dot: 'bg-green-400/60' },
                        { label: 'Rising geopolitical tensions (war, tariffs)', color: 'text-orange-400', dot: 'bg-orange-400/60' },
                    ].map(({ label, dot }) => (
                        <div
                            key={label}
                            className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-card hover:bg-accent/40 transition-colors"
                        >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                            <span className="text-sm font-medium text-card-foreground">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
