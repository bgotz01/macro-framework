import PageHeader from '@/components/page-header';

export default function GoldDepegPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <PageHeader title="1971 GOLD STANDARD" subtitle="The End of Bretton Woods" />

            {/* Background */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Background</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">The Bretton Woods System (1944-1971)</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                                <div className="text-sm text-muted-foreground">Fixed exchange rates with US dollar as anchor</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                                <div className="text-sm text-muted-foreground">US dollar backed by gold at $35 per ounce</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                                <div className="text-sm text-muted-foreground">Other currencies pegged to the dollar</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                                <div className="text-sm text-muted-foreground">Designed for monetary stability after WWII</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Growing Pressures</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                <div>
                                    <div className="font-medium text-card-foreground text-sm">Vietnam War Spending</div>
                                    <div className="text-xs text-muted-foreground">Massive fiscal deficits</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                <div>
                                    <div className="font-medium text-card-foreground text-sm">Great Society Programs</div>
                                    <div className="text-xs text-muted-foreground">Increased domestic spending</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                <div>
                                    <div className="font-medium text-card-foreground text-sm">Trade Deficits</div>
                                    <div className="text-xs text-muted-foreground">Growing current account imbalances</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                <div>
                                    <div className="font-medium text-card-foreground text-sm">Gold Outflows</div>
                                    <div className="text-xs text-muted-foreground">Foreign central banks converting dollars</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Decision */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">The Decision</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Immediate Triggers</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">British Request</div>
                                <div className="text-sm text-muted-foreground">UK asked to convert $3 billion into gold</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">French Pressure</div>
                                <div className="text-sm text-muted-foreground">De Gaulle's criticism of dollar privilege</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">Market Speculation</div>
                                <div className="text-sm text-muted-foreground">Betting against dollar sustainability</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">Gold Reserves</div>
                                <div className="text-sm text-muted-foreground">US reserves declining rapidly</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Nixon's Announcement</h3>
                        <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/20">
                            <p className="text-card-foreground italic leading-relaxed">
                                "I have directed Secretary Connally to suspend temporarily the convertibility of the dollar into gold or other reserve assets."
                            </p>
                            <div className="text-sm text-muted-foreground mt-4">— President Richard Nixon, August 15, 1971</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Immediate Consequences */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Immediate Consequences</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Market Reactions</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-red-50 dark:bg-red-950/20">
                                <span className="text-sm font-medium">Dollar Devaluation</span>
                                <span className="text-sm text-red-600 dark:text-red-400">-10%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50 dark:bg-green-950/20">
                                <span className="text-sm font-medium">Gold Price</span>
                                <span className="text-sm text-green-600 dark:text-green-400">↗ Surge</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50 dark:bg-green-950/20">
                                <span className="text-sm font-medium">US Stocks</span>
                                <span className="text-sm text-green-600 dark:text-green-400">↗ Rally</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50 dark:bg-green-950/20">
                                <span className="text-sm font-medium">Commodities</span>
                                <span className="text-sm text-green-600 dark:text-green-400">↗ Boom</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Policy Responses</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">Import Surcharge</div>
                                <div className="text-sm text-muted-foreground">10% tariff on imports</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">Wage-Price Freeze</div>
                                <div className="text-sm text-muted-foreground">Domestic inflation controls</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">Smithsonian Agreement</div>
                                <div className="text-sm text-muted-foreground">December 1971 negotiations</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Long-Term Impact */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Long-Term Impact</h2>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Monetary System Changes</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Floating Exchange Rates</div>
                                <div className="text-sm text-muted-foreground">End of fixed rate system</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Fiat Currency Era</div>
                                <div className="text-sm text-muted-foreground">No gold backing for major currencies</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Central Bank Power</div>
                                <div className="text-sm text-muted-foreground">Increased monetary policy flexibility</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Dollar Hegemony</div>
                                <div className="text-sm text-muted-foreground">USD remained dominant reserve currency</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Economic Consequences</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Inflation Era</div>
                                <div className="text-sm text-muted-foreground">1970s stagflation period</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Commodity Cycles</div>
                                <div className="text-sm text-muted-foreground">More volatile commodity prices</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Financial Innovation</div>
                                <div className="text-sm text-muted-foreground">Growth of derivatives and hedging</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">EM Crises</div>
                                <div className="text-sm text-muted-foreground">Increased volatility in developing countries</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Framework Analysis */}
            <div className="p-8 rounded-3xl gradient-secondary text-secondary-foreground mb-12">
                <h2 className="text-2xl font-bold mb-8">Framework Analysis</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
                        <h4 className="font-semibold mb-2">O1: Swing</h4>
                        <p className="text-sm text-secondary-foreground/90">
                            The extreme stability of Bretton Woods created conditions for its own destruction. Rigid systems can't adapt to changing realities.
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
                        <h4 className="font-semibold mb-2">O2: Signal</h4>
                        <p className="text-sm text-secondary-foreground/90">
                            By 1971, it was obvious the system was unsustainable, yet policymakers were reluctant to act until forced.
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
                        <h4 className="font-semibold mb-2">O3: Story</h4>
                        <p className="text-sm text-secondary-foreground/90">
                            The decision represented a paradigm shift that created new investment themes for decades.
                        </p>
                    </div>
                </div>
            </div>

            {/* Investment Implications */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Investment Implications</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4 text-green-600 dark:text-green-400">Winners</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/20">
                                <div className="font-semibold text-card-foreground">Gold & Precious Metals</div>
                                <div className="text-sm text-muted-foreground">Multi-decade bull market</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/20">
                                <div className="font-semibold text-card-foreground">Real Assets</div>
                                <div className="text-sm text-muted-foreground">Commodities, real estate, natural resources</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/20">
                                <div className="font-semibold text-card-foreground">International Diversification</div>
                                <div className="text-sm text-muted-foreground">Non-dollar assets gained importance</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/20">
                                <div className="font-semibold text-card-foreground">Financial Services</div>
                                <div className="text-sm text-muted-foreground">Currency trading and hedging growth</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4 text-red-600 dark:text-red-400">Losers</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20">
                                <div className="font-semibold text-card-foreground">Fixed Income</div>
                                <div className="text-sm text-muted-foreground">Bond holders faced inflation erosion</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20">
                                <div className="font-semibold text-card-foreground">Dollar Savers</div>
                                <div className="text-sm text-muted-foreground">Currency debasement reduced purchasing power</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20">
                                <div className="font-semibold text-card-foreground">Import-Dependent Industries</div>
                                <div className="text-sm text-muted-foreground">Higher costs from dollar weakness</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lessons for Today */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Lessons for Today</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Modern Parallels</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                                <div>
                                    <div className="font-medium text-card-foreground text-sm">Fiscal Deficits</div>
                                    <div className="text-xs text-muted-foreground">Similar unsustainable spending patterns</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                                <div>
                                    <div className="font-medium text-card-foreground text-sm">Reserve Currency Debates</div>
                                    <div className="text-xs text-muted-foreground">Questions about dollar dominance</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                                <div>
                                    <div className="font-medium text-card-foreground text-sm">Monetary Extremes</div>
                                    <div className="text-xs text-muted-foreground">Zero and negative interest rates</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Key Takeaways</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">Unsustainable Systems Break</div>
                                <div className="text-sm text-muted-foreground">No matter how entrenched</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">Crisis Drives Change</div>
                                <div className="text-sm text-muted-foreground">Policy makers act when forced</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50">
                                <div className="font-semibold text-card-foreground mb-1">Paradigm Shifts Create Opportunities</div>
                                <div className="text-sm text-muted-foreground">New investment themes emerge</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}