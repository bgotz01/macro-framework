export default function SignalPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                    Framework • Law 2
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    O2: Signal
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    The second law focuses on how markets signal what the obvious new opportunity is. When consensus becomes too obvious, it reveals the next major shift.
                </p>
            </div>

            {/* Core Principle */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Core Principle</h2>
                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 mb-6">
                    <p className="text-lg text-card-foreground italic">
                        "When something becomes obvious to everyone, the market is often signaling the next major opportunity or shift that's about to unfold."
                    </p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    Markets have a way of making the next big opportunity obvious through price action, sentiment, and positioning. The challenge is not identifying what's obvious, but acting on it when others hesitate.
                </p>
            </div>

            {/* Key Applications */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h3 className="text-xl font-bold text-card-foreground mb-6">Consensus Recognition</h3>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Universal Agreement</div>
                                <div className="text-sm text-muted-foreground">When analysts, media, and investors all agree</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Obvious Trades</div>
                                <div className="text-sm text-muted-foreground">When strategies become widely discussed</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Media Saturation</div>
                                <div className="text-sm text-muted-foreground">When coverage reaches saturation levels</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h3 className="text-xl font-bold text-card-foreground mb-6">Signal Types</h3>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Price Signals</div>
                                <div className="text-sm text-muted-foreground">Markets telegraph moves through price action</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Cross-Asset Signals</div>
                                <div className="text-sm text-muted-foreground">Different assets signal broader themes</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Policy Signals</div>
                                <div className="text-sm text-muted-foreground">Central bank actions signal future directions</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historical Examples */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Historical Examples</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">2008 Housing Bubble</h4>
                        <p className="text-sm text-muted-foreground">
                            By 2006-2007, it was obvious housing was overvalued, yet markets continued higher. The signal was there, but timing was challenging.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">COVID Technology Acceleration</h4>
                        <p className="text-sm text-muted-foreground">
                            In early 2020, it became obvious technology adoption would accelerate, signaled through companies like Zoom and Peloton.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">Inflation Return (2021-2022)</h4>
                        <p className="text-sm text-muted-foreground">
                            By late 2021, signals were clear in commodity prices and supply chains that inflation was returning after decades.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">Energy Transition</h4>
                        <p className="text-sm text-muted-foreground">
                            The shift toward renewables has been obvious for years, signaled through policy changes and technology costs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Implementation Strategy */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Implementation Strategy</h2>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Signal Recognition</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="font-medium text-card-foreground">Media Analysis</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Track frequency and tone of coverage</li>
                                    <li>• Identify when topics move mainstream</li>
                                    <li>• Monitor consensus formation</li>
                                    <li>• Watch expert opinion convergence</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-medium text-card-foreground">Positioning Analysis</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Monitor futures positioning data</li>
                                    <li>• Track fund flows and allocation shifts</li>
                                    <li>• Analyze options positioning bias</li>
                                    <li>• Review survey data for consensus</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Acting on Signals</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div>• <strong>Early Positioning:</strong> Act before signals become crowded</div>
                                <div>• <strong>Thematic Investing:</strong> Build around obvious long-term themes</div>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div>• <strong>Contrarian Timing:</strong> Sometimes fade the obvious trade</div>
                                <div>• <strong>Risk Management:</strong> Obvious doesn't mean risk-free</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Signal Categories */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Signal Categories</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Economic Signals</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Yield Curve Inversions</div>
                                <div className="text-sm text-muted-foreground">Signaling recession risk</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Commodity Movements</div>
                                <div className="text-sm text-muted-foreground">Signaling inflation expectations</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Policy Signals</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Central Bank Pivots</div>
                                <div className="text-sm text-muted-foreground">Monetary policy inflection points</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Regulatory Changes</div>
                                <div className="text-sm text-muted-foreground">Affecting specific sectors</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration */}
            <div className="p-8 rounded-3xl gradient-accent text-accent-foreground mb-12">
                <h2 className="text-2xl font-bold mb-6">Integration with Other Laws</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
                        <h4 className="font-semibold mb-2">O1: Swing</h4>
                        <p className="text-sm text-accent-foreground/90">
                            Obvious signals often emerge at extreme points in market cycles
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
                        <h4 className="font-semibold mb-2">O3: Story</h4>
                        <p className="text-sm text-accent-foreground/90">
                            New stories often make obvious opportunities more compelling and actionable
                        </p>
                    </div>
                </div>
            </div>

            {/* Signal Validation */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Signal Validation Framework</h2>
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-muted/50">
                        <h4 className="font-semibold text-card-foreground mb-2">Before Acting on Signals, Consider:</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>• Is the signal confirmed across multiple indicators?</div>
                            <div>• What is current positioning around this signal?</div>
                            <div>• Are there fundamental reasons supporting it?</div>
                            <div>• What could invalidate this signal?</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}