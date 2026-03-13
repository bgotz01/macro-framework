'use client';

import { useState } from 'react';

type Tab = 'liquidity' | 'valuation' | 'trend';

export default function MethodologyModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('liquidity');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
                How We Calculate Regimes
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-background border border-border rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">Regime Classification Methodology</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border bg-muted/30">
                            <button
                                onClick={() => setActiveTab('liquidity')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'liquidity'
                                    ? 'bg-background text-foreground border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Liquidity
                            </button>
                            <button
                                onClick={() => setActiveTab('valuation')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'valuation'
                                    ? 'bg-background text-foreground border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Valuation
                            </button>
                            <button
                                onClick={() => setActiveTab('trend')}
                                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'trend'
                                    ? 'bg-background text-foreground border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Trend Pressure
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="overflow-y-auto p-6 space-y-6">
                            {activeTab === 'liquidity' && <LiquidityContent />}
                            {activeTab === 'valuation' && <ValuationContent />}
                            {activeTab === 'trend' && <TrendContent />}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function LiquidityContent() {
    return (
        <>
            <section>
                <h3 className="text-xl font-semibold mb-3">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Our liquidity regime classification uses three key variables to determine the current monetary environment.
                    Each variable is scored based on its actual value, and the combined score determines the overall regime.
                </p>
            </section>

            <section className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">Data Note</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    The 3M and 10Y Treasury yields displayed are monthly averages of daily values, smoothing out day-to-day volatility.
                    This makes them more comparable to other monthly economic data like CPI and Fed Funds.
                    Fed Funds data is aligned to month-end dates to match other monthly series.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">The Three Liquidity Variables</h3>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Real 3M → Policy Pressure</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Measures policy restrictiveness. The Fed directly controls this part of the system.
                        </p>
                        <div className="text-xs space-y-1">
                            <div className="flex gap-2"><span className="min-w-[140px]">Value &lt; -1%:</span><span className="text-lime-600 dark:text-lime-400 font-medium">Strongly Stimulative (+2)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value -1% to 0%:</span><span className="text-green-600 dark:text-green-400 font-medium">Expansionary (+1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value 0% to 1.5%:</span><span className="text-blue-600 dark:text-blue-400 font-medium">Neutral (0)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value 1.5% to 3%:</span><span className="text-yellow-600 dark:text-yellow-400 font-medium">Contractive (-1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value &gt; 3%:</span><span className="text-red-600 dark:text-red-400 font-medium">Highly Contractive (-2)</span></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Real 10Y → Capital Cost</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Measures long-term capital cost. Drives equity valuations and investment decisions.
                        </p>
                        <div className="text-xs space-y-1">
                            <div className="flex gap-2"><span className="min-w-[140px]">Value &lt; 0%:</span><span className="text-lime-600 dark:text-lime-400 font-medium">Highly Expansionary (+2)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value 0% to 1%:</span><span className="text-green-600 dark:text-green-400 font-medium">Expansionary (+1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value 1% to 2.5%:</span><span className="text-blue-600 dark:text-blue-400 font-medium">Neutral (0)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value 2.5% to 4%:</span><span className="text-yellow-600 dark:text-yellow-400 font-medium">Contractive (-1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value &gt; 4%:</span><span className="text-red-600 dark:text-red-400 font-medium">Highly Contractive (-2)</span></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Yield Curve (10Y-3M) → Credit Creation</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Measures credit transmission through the banking system. Banks borrow short and lend long.
                        </p>
                        <div className="text-xs space-y-1">
                            <div className="flex gap-2"><span className="min-w-[140px]">Value &gt; 1.75%:</span><span className="text-lime-600 dark:text-lime-400 font-medium">Highly Expansionary (+2)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value 0.75% to 1.75%:</span><span className="text-green-600 dark:text-green-400 font-medium">Expansionary (+1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value 0.25% to 0.75%:</span><span className="text-blue-600 dark:text-blue-400 font-medium">Neutral (0)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value -0.25% to 0.25%:</span><span className="text-yellow-600 dark:text-yellow-400 font-medium">Contractive (-1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Value &lt; -0.25%:</span><span className="text-red-600 dark:text-red-400 font-medium">Highly Contractive (-2)</span></div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">Scoring System</h3>
                <p className="text-muted-foreground mb-4">
                    Each variable contributes +2, +1, 0, -1, or -2 to the total score. The total score ranges from -6 to +6.
                </p>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="font-semibold text-green-700 dark:text-green-400 min-w-[80px]">+4 to +6</div>
                        <div className="text-sm"><div className="font-medium">Highly Expansionary Liquidity</div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="font-semibold text-emerald-700 dark:text-emerald-400 min-w-[80px]">+2 to +3</div>
                        <div className="text-sm"><div className="font-medium">Expansionary Liquidity</div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="font-semibold text-blue-700 dark:text-blue-400 min-w-[80px]">-1 to +1</div>
                        <div className="text-sm"><div className="font-medium">Neutral Liquidity</div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="font-semibold text-yellow-700 dark:text-yellow-400 min-w-[80px]">-3 to -2</div>
                        <div className="text-sm"><div className="font-medium">Contractive Liquidity</div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="font-semibold text-red-700 dark:text-red-400 min-w-[80px]">-6 to -4</div>
                        <div className="text-sm"><div className="font-medium">Highly Contractive Liquidity</div></div>
                    </div>
                </div>
            </section>
        </>
    );
}

function ValuationContent() {
    return (
        <>
            <section>
                <h3 className="text-xl font-semibold mb-3">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Our valuation regime uses two metrics to assess whether equities are cheap or expensive relative to bonds and inflation.
                    Both metrics compare equity earnings yields to alternative returns.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">The Two Valuation Metrics</h3>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Earnings Yield Premium (EYP) 5yr</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Compares equity earnings yield to 10Y Treasury yield. Measures the extra return you get from equities vs bonds.
                        </p>
                        <div className="text-xs space-y-1">
                            <div className="flex gap-2"><span className="min-w-[120px]">EYP &gt; 4%:</span><span className="text-lime-600 dark:text-lime-400 font-medium">Very Cheap (+2)</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">EYP 2% to 4%:</span><span className="text-green-600 dark:text-green-400 font-medium">Cheap (+1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">EYP 0% to 2%:</span><span className="text-blue-600 dark:text-blue-400 font-medium">Fair (0)</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">EYP -2% to 0%:</span><span className="text-yellow-600 dark:text-yellow-400 font-medium">Expensive (-1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">EYP &lt; -2%:</span><span className="text-red-600 dark:text-red-400 font-medium">Very Expensive (-2)</span></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Real Earnings Yield (REY) 5yr</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Compares equity earnings yield to inflation. Measures real return after accounting for purchasing power erosion.
                        </p>
                        <div className="text-xs space-y-1">
                            <div className="flex gap-2"><span className="min-w-[120px]">REY &gt; 6%:</span><span className="text-lime-600 dark:text-lime-400 font-medium">Very Cheap (+2)</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">REY 4% to 6%:</span><span className="text-green-600 dark:text-green-400 font-medium">Cheap (+1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">REY 2% to 4%:</span><span className="text-blue-600 dark:text-blue-400 font-medium">Fair (0)</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">REY 0% to 2%:</span><span className="text-yellow-600 dark:text-yellow-400 font-medium">Expensive (-1)</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">REY &lt; 0%:</span><span className="text-red-600 dark:text-red-400 font-medium">Very Expensive (-2)</span></div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">Valuation Regimes</h3>
                <p className="text-muted-foreground mb-4">
                    Combined score from both metrics determines the valuation regime:
                </p>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="font-semibold text-green-700 dark:text-green-400 min-w-[80px]">+3 to +4</div>
                        <div className="text-sm"><div className="font-medium">Very Cheap</div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="font-semibold text-emerald-700 dark:text-emerald-400 min-w-[80px]">+1 to +2</div>
                        <div className="text-sm"><div className="font-medium">Cheap</div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <div className="font-semibold text-blue-700 dark:text-blue-400 min-w-[80px]">-1 to 0</div>
                        <div className="text-sm"><div className="font-medium">Fair</div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="font-semibold text-yellow-700 dark:text-yellow-400 min-w-[80px]">-3 to -2</div>
                        <div className="text-sm"><div className="font-medium">Expensive</div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="font-semibold text-red-700 dark:text-red-400 min-w-[80px]">-4</div>
                        <div className="text-sm"><div className="font-medium">Very Expensive</div></div>
                    </div>
                </div>
            </section>
        </>
    );
}

function TrendContent() {
    return (
        <>
            <section>
                <h3 className="text-xl font-semibold mb-3">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Our trend pressure system uses a three-layer classification to assess market trend behavior:
                    Direction (backdrop), Stage (lifecycle), Pressure (extension magnitude), and Risk (behavioral implication).
                    Each layer serves a distinct purpose in understanding trend dynamics.
                </p>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">The Four Components</h3>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Direction (200MA Slope)</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Descriptive backdrop showing trend momentum. Not scored, provides context only.
                        </p>
                        <div className="text-xs space-y-1">
                            <div className="flex gap-2"><span className="min-w-[140px]">Slope &gt; 0.1%/day:</span><span className="font-medium">Strong Uptrend</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Slope 0.03-0.1%:</span><span className="font-medium">Uptrend</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Slope -0.02 to 0.03%:</span><span className="font-medium">Neutral</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Slope -0.1 to -0.02%:</span><span className="font-medium">Downtrend</span></div>
                            <div className="flex gap-2"><span className="min-w-[140px]">Slope &lt; -0.1%:</span><span className="font-medium">Strong Downtrend</span></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Stage (MA Duration)</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Lifecycle position of the trend. Tracks how long the 200MA slope has been positive or negative.
                            More stable than price position—brief dips below 200MA don't reset the count.
                        </p>
                        <div className="text-xs space-y-1">
                            <div className="flex gap-2"><span className="min-w-[100px]">0-50 days:</span><span className="text-blue-600 dark:text-blue-400 font-medium">Early</span></div>
                            <div className="flex gap-2"><span className="min-w-[100px]">50-150 days:</span><span className="text-cyan-600 dark:text-cyan-400 font-medium">Established</span></div>
                            <div className="flex gap-2"><span className="min-w-[100px]">150-250 days:</span><span className="text-yellow-600 dark:text-yellow-400 font-medium">Mature</span></div>
                            <div className="flex gap-2"><span className="min-w-[100px]">250+ days:</span><span className="text-orange-600 dark:text-orange-400 font-medium">Late</span></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            Note: Stage colors are neutral/progressive (blue→orange), not risk colors. A late trend is older, not necessarily bad.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Pressure (Divergence from 200MA)</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Extension magnitude—how far price has stretched from the trend. This measures raw distance, not final vulnerability.
                        </p>
                        <div className="text-xs space-y-1">
                            <div className="flex gap-2"><span className="min-w-[60px]">0-5%:</span><span className="text-blue-600 dark:text-blue-400 font-medium">Low</span></div>
                            <div className="flex gap-2"><span className="min-w-[60px]">5-10%:</span><span className="text-green-600 dark:text-green-400 font-medium">Mid</span></div>
                            <div className="flex gap-2"><span className="min-w-[60px]">10-20%:</span><span className="text-yellow-600 dark:text-yellow-400 font-medium">High</span></div>
                            <div className="flex gap-2"><span className="min-w-[60px]">20%+:</span><span className="text-red-600 dark:text-red-400 font-medium">Extreme</span></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                            Side (Upside/Downside/Neutral) is determined by divergence direction: &gt;5% = Upside, &lt;-5% = Downside, else Neutral.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h4 className="font-semibold mb-2">Risk (Stage × Pressure × Side)</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Behavioral implication from the combination of stage, pressure, and side. This is where vulnerability is assessed.
                        </p>
                        <div className="text-xs space-y-1">
                            <div className="flex gap-2"><span className="min-w-[120px]">Continuation:</span><span className="text-green-600 dark:text-green-400 font-medium">Healthy, early stage with room to run</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">Pullback:</span><span className="text-yellow-600 dark:text-yellow-400 font-medium">Stretched but not aged, normal reversion</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">Distribution:</span><span className="text-yellow-600 dark:text-yellow-400 font-medium">Mature/late, range-bound topping behavior</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">Rollover:</span><span className="text-orange-600 dark:text-orange-400 font-medium">Late trend losing thrust, not yet broken</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">Breakdown:</span><span className="text-red-600 dark:text-red-400 font-medium">Downside-confirmed deterioration</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">Mania:</span><span className="text-red-600 dark:text-red-400 font-medium">Aged + extreme upside extension</span></div>
                            <div className="flex gap-2"><span className="min-w-[120px]">Capitulation:</span><span className="text-red-600 dark:text-red-400 font-medium">Extreme downside pressure, panic selling</span></div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">Key Insights</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        <span className="font-semibold text-foreground">Stage is descriptive, not predictive:</span> A late-stage trend isn't automatically bearish—it's simply older.
                        Risk assessment comes from the Stage × Pressure × Side matrix.
                    </p>
                    <p>
                        <span className="font-semibold text-foreground">Pressure measures stretch, not risk:</span> High pressure means extended from trend,
                        but whether that's dangerous depends on stage and direction.
                    </p>
                    <p>
                        <span className="font-semibold text-foreground">MA Duration vs Price Position:</span> We use MA slope duration (not price-above-200MA)
                        because it's more stable—brief price dips don't signal trend changes.
                    </p>
                    <p>
                        <span className="font-semibold text-foreground">Risk carries the warning:</span> Stage and Pressure use neutral colors.
                        Risk (green→red) is where behavioral implications and vulnerability are assessed.
                    </p>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">Example Scenarios</h3>
                <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                        <div className="font-medium mb-1">Early + Low + Upside = Continuation (Green)</div>
                        <div className="text-muted-foreground">Young trend with room to run, healthy setup</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                        <div className="font-medium mb-1">Late + Low + Upside = Distribution (Yellow)</div>
                        <div className="text-muted-foreground">Aged trend with little upside pressure, topping behavior likely</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                        <div className="font-medium mb-1">Late + Extreme + Upside = Mania (Red)</div>
                        <div className="text-muted-foreground">Aged trend with extreme stretch, high crash risk</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                        <div className="font-medium mb-1">Late + Low + Neutral = Rollover (Orange)</div>
                        <div className="text-muted-foreground">Aged trend losing momentum, not yet broken but fragile</div>
                    </div>
                </div>
            </section>
        </>
    );
}
