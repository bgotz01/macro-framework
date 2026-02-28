import Link from 'next/link';
import SignalHeader from '@/components/signals/signal-header';
import SignalInsight from '@/components/signals/signal-insight';
import SignalChart from '@/components/signals/signal-chart';

export default function RealEarningsYieldPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/signals" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Signals
            </Link>

            <div className="space-y-8">
                <SignalHeader
                    title="Negative Real Earnings Yield Signal"
                    titleColor="text-red-700 dark:text-red-400"
                    subtitle="Multi-level equity valuation signal based on inflation-adjusted earnings"
                    priority={2}
                    category={{
                        name: 'Risk-Off / Defensive',
                        color: 'text-red-600 dark:text-red-400',
                        description: 'Monitors equity valuations relative to inflation',
                    }}
                    trigger="Real EY = (1/P/E-5yr) - CPI"
                />

                <SignalInsight
                    insight="Real Earnings Yield measures whether equity earnings compensate investors for inflation. When Real EY turns negative, equities fail to provide real returns, signaling increasing levels of risk as valuations deteriorate."
                />

                <SignalChart
                    imagePath="/signal-charts/RealEY.png"
                    altText="Real Earnings Yield Historical Chart"
                />

                {/* Three severity levels */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">Signal Levels</h2>
                    <div className="space-y-4">
                        {/* Level 1: Warning */}
                        <div className="border border-orange-500/30 rounded-lg overflow-hidden">
                            <div className="bg-orange-500/10 px-4 py-2 border-b border-orange-500/30">
                                <h3 className="font-semibold text-orange-700 dark:text-orange-400">Level 1: Warning</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground min-w-[80px]">Trigger:</span>
                                    <code className="text-sm font-mono">Real EY &lt; +0.5%</code>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Meaning:</div>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Equity earnings barely clear inflation</li>
                                        <li>• Valuation cushion is thin</li>
                                        <li>• Forward returns increasingly path-dependent</li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Action:</div>
                                    <p className="text-sm font-medium">Reduce equity aggressiveness - tighten risk management</p>
                                </div>
                            </div>
                        </div>

                        {/* Level 2: Sell */}
                        <div className="border border-red-500/30 rounded-lg overflow-hidden">
                            <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/30">
                                <h3 className="font-semibold text-red-700 dark:text-red-400">Level 2: Sell Zone</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground min-w-[80px]">Trigger:</span>
                                    <code className="text-sm font-mono">Real EY &lt; -1%</code>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Meaning:</div>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Equity earnings fail to beat inflation</li>
                                        <li>• Equity ownership relies on multiple expansion</li>
                                        <li>• Long-term real returns structurally weak</li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Action:</div>
                                    <p className="text-sm font-medium">SELL / underweight equities</p>
                                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                                        <div>
                                            <span className="font-semibold">If Real 10Y &gt; 0%:</span> Rotate to Bonds
                                        </div>
                                        <div>
                                            <span className="font-semibold">If Real 10Y ≤ 0%:</span> Rotate to Gold / Real Assets
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Level 3: Breakdown */}
                        <div className="border border-red-700/40 rounded-lg overflow-hidden">
                            <div className="bg-red-700/15 px-4 py-2 border-b border-red-700/40">
                                <h3 className="font-semibold text-red-800 dark:text-red-300">Level 3: Value Breakdown</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground min-w-[80px]">Trigger:</span>
                                    <code className="text-sm font-mono">Real EY &lt; -2%</code>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Meaning:</div>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Equity earnings materially lag inflation</li>
                                        <li>• Equity valuations fundamentally unsound</li>
                                        <li>• Markets depend entirely on liquidity or speculation</li>
                                        <li>• High probability of market reset</li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Action:</div>
                                    <p className="text-sm font-medium text-red-700 dark:text-red-400">EXIT equities aggressively</p>
                                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                                        <div>
                                            <span className="font-semibold">If Real 10Y &gt; 0%:</span> EXIT to Bonds (preserve capital aggressively)
                                        </div>
                                        <div>
                                            <span className="font-semibold">If Real 10Y ≤ 0%:</span> EXIT to Gold / Real Assets (wait for market reset)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">Key Insight</h2>
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                        <p className="text-sm">
                            This is a graduated signal system. As Real EY deteriorates, the severity of the warning increases.
                            Each level represents a harder break in equity economics, requiring progressively more defensive positioning.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
