export default function SwingPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Framework • Law 1
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    O1: Swing
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    The first law focuses on how trends swing to extremes and then invert. Markets are cyclical by nature, and extreme positions create conditions for their own reversal.
                </p>
            </div>

            {/* Core Principle */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Core Principle</h2>
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 mb-6">
                    <p className="text-lg text-card-foreground italic">
                        "Markets naturally swing between extremes, and the further they move in one direction, the greater the potential energy for a reversal."
                    </p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    When markets, sentiment, or economic indicators reach extreme levels, they tend to reverse course. This law recognizes that extreme positions in any direction create the conditions for their own reversal.
                </p>
            </div>

            {/* Key Applications */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h3 className="text-xl font-bold text-card-foreground mb-6">Market Sentiment Reversals</h3>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Extreme Bullishness</div>
                                <div className="text-sm text-muted-foreground">When everyone is optimistic, markets often correct</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Extreme Bearishness</div>
                                <div className="text-sm text-muted-foreground">Widespread pessimism typically marks significant bottoms</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Contrarian Opportunities</div>
                                <div className="text-sm text-muted-foreground">Best opportunities arise at sentiment extremes</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h3 className="text-xl font-bold text-card-foreground mb-6">Economic Cycle Turning Points</h3>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Interest Rate Cycles</div>
                                <div className="text-sm text-muted-foreground">Extreme rates often precede policy reversals</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Inflation Cycles</div>
                                <div className="text-sm text-muted-foreground">Very low/high inflation swings back toward mean</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                            <div>
                                <div className="font-semibold text-card-foreground">Valuation Cycles</div>
                                <div className="text-sm text-muted-foreground">Historical extremes typically revert</div>
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
                        <h4 className="font-bold text-card-foreground mb-3">1999 Dot-Com Bubble</h4>
                        <p className="text-sm text-muted-foreground">
                            Extreme optimism and "this time is different" mentality created perfect conditions for the 2000-2002 bear market reversal.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">2008 Financial Crisis</h4>
                        <p className="text-sm text-muted-foreground">
                            Extreme pessimism and VIX above 80 in late 2008/early 2009 marked the beginning of the longest bull market in history.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">2020 COVID Crash</h4>
                        <p className="text-sm text-muted-foreground">
                            Rapid extreme sell-off in March 2020 was followed by equally dramatic recovery as markets swung from fear to optimism.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">Bond Market Extremes</h4>
                        <p className="text-sm text-muted-foreground">
                            Extreme low yields in 2020 (10-year Treasury below 0.5%) preceded significant swing higher as inflation expectations shifted.
                        </p>
                    </div>
                </div>
            </div>

            {/* Implementation Strategy */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Implementation Strategy</h2>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Identifying Extremes</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="font-medium text-card-foreground">Sentiment Indicators</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• VIX levels above 30 (fear) or below 12 (complacency)</li>
                                    <li>• Put/Call ratios at historical extremes</li>
                                    <li>• Survey data showing extreme sentiment</li>
                                    <li>• Media coverage reaching fever pitch</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-medium text-card-foreground">Technical Indicators</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• RSI above 80 or below 20 across timeframes</li>
                                    <li>• Multiple momentum indicators at extremes</li>
                                    <li>• Divergences between price and momentum</li>
                                    <li>• Extreme readings in breadth indicators</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Risk Management</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div>• <strong>Position Sizing:</strong> Reduce sizes when betting against strong trends</div>
                                <div>• <strong>Time Horizon:</strong> Be patient with swing trades</div>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div>• <strong>Confirmation:</strong> Wait for initial reversal signs</div>
                                <div>• <strong>Diversification:</strong> Don't bet everything on one swing</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration */}
            <div className="p-8 rounded-3xl gradient-primary text-primary-foreground mb-12">
                <h2 className="text-2xl font-bold mb-6">Integration with Other Laws</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
                        <h4 className="font-semibold mb-2">O2: Signal</h4>
                        <p className="text-sm text-primary-foreground/90">
                            When extreme positions become obvious to everyone, the signal for reversal strengthens
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
                        <h4 className="font-semibold mb-2">O3: Story</h4>
                        <p className="text-sm text-primary-foreground/90">
                            When new narratives emerge to justify extremes, it often marks the final stage before a swing
                        </p>
                    </div>
                </div>
            </div>

            {/* Practical Checklist */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Practical Checklist</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-muted-foreground">Identify current market extremes across indicators</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-muted-foreground">Assess sentiment indicators for extreme readings</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-muted-foreground">Look for technical confirmation of reversal</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-muted-foreground">Consider fundamental backdrop</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-muted-foreground">Plan risk management strategy</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-muted-foreground">Monitor for initial reversal signals</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-muted-foreground">Set realistic time horizons</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm text-muted-foreground">Size positions appropriately</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}