'use client';

import { useState } from 'react';

export default function MethodologyModal() {
    const [isOpen, setIsOpen] = useState(false);

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
                    <div className="bg-background border border-border rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
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

                        <div className="p-6 space-y-6">
                            {/* Overview */}
                            <section>
                                <h3 className="text-xl font-semibold mb-3">Overview</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Our regime classification system uses three key variables to determine the current liquidity environment.
                                    Each variable is scored based on its actual value, and the combined score determines the overall regime.
                                </p>
                            </section>

                            {/* The Three Variables */}
                            <section>
                                <h3 className="text-xl font-semibold mb-3">The Three Liquidity Variables</h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                        <h4 className="font-semibold mb-2">Real 3M → Policy Pressure</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Measures policy restrictiveness. The Fed directly controls this part of the system.
                                        </p>
                                        <div className="text-xs">
                                            <div className="font-medium mb-2">Value-based scoring:</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Value &lt; -1%:</span>
                                                    <span className="text-lime-600 dark:text-lime-400 font-medium">Strongly Stimulative (+2)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value -1% to 0%:</span>
                                                    <span className="text-green-600 dark:text-green-400 font-medium">Expansionary (+1)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value 0% to 1.5%:</span>
                                                    <span className="text-blue-600 dark:text-blue-400 font-medium">Neutral (0)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value 1.5% to 3%:</span>
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">Contractive (-1)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value &gt; 3%:</span>
                                                    <span className="text-red-600 dark:text-red-400 font-medium">Highly Contractive (-2)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                        <h4 className="font-semibold mb-2">Real 10Y → Capital Cost</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Measures long-term capital cost. Drives equity valuations and investment decisions.
                                        </p>
                                        <div className="text-xs">
                                            <div className="font-medium mb-2">Value-based scoring:</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Value &lt; 0%:</span>
                                                    <span className="text-lime-600 dark:text-lime-400 font-medium">Highly Expansionary (+2)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value 0% to 1%:</span>
                                                    <span className="text-green-600 dark:text-green-400 font-medium">Expansionary (+1)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value 1% to 2.5%:</span>
                                                    <span className="text-blue-600 dark:text-blue-400 font-medium">Neutral (0)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value 2.5% to 4%:</span>
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">Contractive (-1)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value &gt; 4%:</span>
                                                    <span className="text-red-600 dark:text-red-400 font-medium">Highly Contractive (-2)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                        <h4 className="font-semibold mb-2">Yield Curve (10Y-3M) → Credit Creation</h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Measures credit transmission through the banking system. Banks borrow short and lend long.
                                        </p>
                                        <div className="text-xs">
                                            <div className="font-medium mb-2">Value-based scoring:</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Value &gt; 1.75%:</span>
                                                    <span className="text-lime-600 dark:text-lime-400 font-medium">Highly Expansionary (+2)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value 0.75% to 1.75%:</span>
                                                    <span className="text-green-600 dark:text-green-400 font-medium">Expansionary (+1)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value 0.25% to 0.75%:</span>
                                                    <span className="text-blue-600 dark:text-blue-400 font-medium">Neutral (0)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value -0.25% to 0.25%:</span>
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">Contractive (-1)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Value &lt; -0.25%:</span>
                                                    <span className="text-red-600 dark:text-red-400 font-medium">Highly Contractive (-2)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Scoring System */}
                            <section>
                                <h3 className="text-xl font-semibold mb-3">Scoring System</h3>
                                <p className="text-muted-foreground mb-4">
                                    Each variable contributes +2, +1, 0, -1, or -2 to the total score. The total score ranges from -6 to +6.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                        <div className="font-semibold text-green-700 dark:text-green-400 min-w-[80px]">+4 to +6</div>
                                        <div className="text-sm">
                                            <div className="font-medium">Highly Expansionary Liquidity</div>
                                            <div className="text-xs text-muted-foreground">Highly accommodative monetary conditions</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                        <div className="font-semibold text-emerald-700 dark:text-emerald-400 min-w-[80px]">+2 to +3</div>
                                        <div className="text-sm">
                                            <div className="font-medium">Expansionary Liquidity</div>
                                            <div className="text-xs text-muted-foreground">Supportive monetary conditions</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                        <div className="font-semibold text-blue-700 dark:text-blue-400 min-w-[80px]">-1 to +1</div>
                                        <div className="text-sm">
                                            <div className="font-medium">Neutral Liquidity</div>
                                            <div className="text-xs text-muted-foreground">Normal monetary conditions</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                        <div className="font-semibold text-yellow-700 dark:text-yellow-400 min-w-[80px]">-3 to -2</div>
                                        <div className="text-sm">
                                            <div className="font-medium">Contractive Liquidity</div>
                                            <div className="text-xs text-muted-foreground">Monetary conditions becoming restrictive</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                        <div className="font-semibold text-red-700 dark:text-red-400 min-w-[80px]">-6 to -4</div>
                                        <div className="text-sm">
                                            <div className="font-medium">Highly Contractive Liquidity</div>
                                            <div className="text-xs text-muted-foreground">Capital is constrained and credit transmission is weak</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Why Value-Based Scoring */}
                            <section>
                                <h3 className="text-xl font-semibold mb-3">Why Value-Based Scoring?</h3>
                                <p className="text-muted-foreground leading-relaxed mb-3">
                                    We use actual values (not percentiles) for scoring because these metrics have structural economic meaning.
                                    For example, negative real rates are stimulative regardless of historical context, and an inverted yield
                                    curve restricts credit creation regardless of how often it has happened in the past.
                                </p>
                                <p className="text-muted-foreground leading-relaxed">
                                    Percentiles are still displayed for historical context, showing where current values sit relative to
                                    the full range from 1954 to present. This helps you understand both the structural impact (via the value)
                                    and the historical extremity (via the percentile).
                                </p>
                            </section>

                            {/* Color Coding */}
                            <section>
                                <h3 className="text-xl font-semibold mb-3">Color Coding</h3>
                                <p className="text-muted-foreground mb-4">
                                    Liquidity metrics use value-based color coding that matches the scoring system:
                                </p>
                                <div className="space-y-2 mb-4">
                                    <div className="p-3 rounded-lg border-2 border-lime-500 dark:border-lime-400">
                                        <div className="text-sm font-medium text-lime-700 dark:text-lime-400">Highly Expansionary</div>
                                        <div className="text-xs text-muted-foreground">Most accommodative conditions</div>
                                    </div>
                                    <div className="p-3 rounded-lg border-2 border-green-500 dark:border-green-400">
                                        <div className="text-sm font-medium text-green-700 dark:text-green-400">Expansionary</div>
                                        <div className="text-xs text-muted-foreground">Supportive conditions</div>
                                    </div>
                                    <div className="p-3 rounded-lg border-2 border-blue-500 dark:border-blue-400">
                                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400">Neutral</div>
                                        <div className="text-xs text-muted-foreground">Normal conditions</div>
                                    </div>
                                    <div className="p-3 rounded-lg border-2 border-yellow-500 dark:border-yellow-400">
                                        <div className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Contractive</div>
                                        <div className="text-xs text-muted-foreground">Tightening conditions</div>
                                    </div>
                                    <div className="p-3 rounded-lg border-2 border-red-500 dark:border-red-400">
                                        <div className="text-sm font-medium text-red-700 dark:text-red-400">Highly Contractive</div>
                                        <div className="text-xs text-muted-foreground">Most restrictive conditions</div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Other metrics (CPI, valuations) use percentile-based color coding. Some metrics use inverted colors where high values are favorable (e.g., Earnings Yield).
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
