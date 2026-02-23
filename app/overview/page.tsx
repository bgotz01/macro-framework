export default function OverviewPage() {
    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Strategic Framework
                </div>
                <h1 className="page-title text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Market Overview & Framework
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    A systematic approach to understanding market regimes, structural trends, and risk factors
                </p>
            </div>

            {/* Core Themes */}
            <div className="mb-16">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 uppercase tracking-wide">
                        Core Themes
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-card-foreground">
                        Core themes for the next decade
                    </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-xl border-2 border-primary/20 bg-card hover:border-primary/40 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">📊</span>
                            </div>
                            <span className="text-base font-semibold text-card-foreground">Equity valuations in 99th percentile</span>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl border-2 border-primary/20 bg-card hover:border-primary/40 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">🤖</span>
                            </div>
                            <span className="text-base font-semibold text-card-foreground">Marginal cost of intelligence is 0 (AI)</span>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl border-2 border-primary/20 bg-card hover:border-primary/40 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">📈</span>
                            </div>
                            <span className="text-base font-semibold text-card-foreground">Stable bond market & inflation</span>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl border-2 border-primary/20 bg-card hover:border-primary/40 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg">🌍</span>
                            </div>
                            <span className="text-base font-semibold text-card-foreground">Rising geopolitical tensions (war, tariffs)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Goals Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Goal 1 */}
                <div className="p-6 rounded-xl border border-border/50 bg-card hover:border-border transition-colors">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold">1</span>
                        </div>
                        <h2 className="text-2xl font-bold text-card-foreground">Define Market Regimes</h2>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        Understanding the current market environment through the lens of inflation,
                        growth, and monetary policy to identify which regime we're operating in.
                    </p>
                </div>

                {/* Goal 2 */}
                <div className="p-6 rounded-xl border border-border/50 bg-card hover:border-border transition-colors">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold">2</span>
                        </div>
                        <h2 className="text-2xl font-bold text-card-foreground">Establish the O3 Framework</h2>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        The O3 Framework provides a systematic approach to analyzing market conditions
                        and making informed investment decisions based on observable, objective, and
                        operational factors.
                    </p>
                </div>

                {/* Goal 3 */}
                <div className="p-6 rounded-xl border border-border/50 bg-card hover:border-border transition-colors">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold">3</span>
                        </div>
                        <h2 className="text-2xl font-bold text-card-foreground">Structural Expectations for the Next Decade</h2>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        Long-term structural trends and expectations that will shape markets over the
                        coming decade, including demographic shifts, technological disruption, and
                        policy frameworks.
                    </p>
                </div>

                {/* Goal 4 */}
                <div className="p-6 rounded-xl border border-border/50 bg-card hover:border-border transition-colors">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold">4</span>
                        </div>
                        <h2 className="text-2xl font-bold text-card-foreground">Fringe Risk Factors</h2>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        Tail risks and low-probability, high-impact events that could disrupt the
                        baseline scenario and require contingency planning.
                    </p>
                </div>
            </div>
        </div>
    );
}
