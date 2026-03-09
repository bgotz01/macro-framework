'use client';

import { useState } from 'react';

export default function RegimeChangeGuide() {
    const [expandedSection, setExpandedSection] = useState<number | null>(null);

    const toggleSection = (index: number) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    return (
        <div className="p-6 rounded-2xl border border-border/50 bg-card shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">What Happens During a Market Regime Change</h2>
                <p className="text-sm text-muted-foreground">
                    Understanding the mechanics of regime transitions
                </p>
            </div>

            <div className="space-y-4">
                {/* Section 1 */}
                <div className="rounded-lg border border-border bg-muted/30">
                    <button
                        onClick={() => toggleSection(1)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📉</span>
                            <div>
                                <h3 className="text-lg font-bold">1. The Old Strategy Stops Working</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Persistent failure of the dominant strategy
                                </p>
                            </div>
                        </div>
                        <span className="text-xl">{expandedSection === 1 ? '−' : '+'}</span>
                    </button>

                    {expandedSection === 1 && (
                        <div className="p-4 pt-0 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                The first signal is persistent failure of the dominant strategy.
                            </p>

                            {/* Examples Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-2 px-3 font-semibold">Regime</th>
                                            <th className="text-left py-2 px-3 font-semibold">Dominant Strategy</th>
                                            <th className="text-left py-2 px-3 font-semibold">What Broke</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-border/50">
                                            <td className="py-2 px-3 font-medium">2000–2007</td>
                                            <td className="py-2 px-3">Leverage + housing</td>
                                            <td className="py-2 px-3 text-red-600 dark:text-red-400">Housing collapsed</td>
                                        </tr>
                                        <tr className="border-b border-border/50">
                                            <td className="py-2 px-3 font-medium">2009–2019</td>
                                            <td className="py-2 px-3">Buy the dip / QE assets</td>
                                            <td className="py-2 px-3 text-red-600 dark:text-red-400">Inflation returned</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3 font-medium">2020–?</td>
                                            <td className="py-2 px-3">Passive flows + megacap tech</td>
                                            <td className="py-2 px-3 text-orange-600 dark:text-orange-400">TBD</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Signs */}
                            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                                <div className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-2">
                                    Signs:
                                </div>
                                <ul className="space-y-1.5 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                                        <span>Strategies with long track records suddenly fail</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                                        <span>Risk models stop predicting volatility</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                                        <span>Correlations break</span>
                                    </li>
                                </ul>
                                <p className="text-xs text-muted-foreground mt-3 italic">
                                    This creates confusion before recognition.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 2 */}
                <div className="rounded-lg border border-border bg-muted/30">
                    <button
                        onClick={() => toggleSection(2)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📊</span>
                            <div>
                                <h3 className="text-lg font-bold">2. Volatility Spikes Across Multiple Markets</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Cross-asset repricing events
                                </p>
                            </div>
                        </div>
                        <span className="text-xl">{expandedSection === 2 ? '−' : '+'}</span>
                    </button>

                    {expandedSection === 2 && (
                        <div className="p-4 pt-0 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Regime shifts are cross-asset events, not single-market events.
                            </p>

                            {/* Typical Pattern */}
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-3">
                                    Typical Pattern:
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-red-600 dark:text-red-400">↯</span>
                                        <span>Equities volatile</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-red-600 dark:text-red-400">↯</span>
                                        <span>Bonds volatile</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-red-600 dark:text-red-400">↯</span>
                                        <span>Currency volatility rises</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-red-600 dark:text-red-400">↯</span>
                                        <span>Credit spreads widen</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-red-600 dark:text-red-400">↯</span>
                                        <span>Liquidity deteriorates</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-3 italic">
                                    This is the system repricing risk everywhere simultaneously.
                                </p>
                            </div>

                            {/* 2008 Example */}
                            <div className="p-4 rounded-lg bg-muted/50 border border-border">
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                    2008 Example:
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Stocks</span>
                                        <span className="text-red-600 dark:text-red-400 font-bold">↓</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Credit</span>
                                        <span className="text-red-600 dark:text-red-400 font-bold">↓</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Commodities</span>
                                        <span className="text-red-600 dark:text-red-400 font-bold">↓</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>USD</span>
                                        <span className="text-green-600 dark:text-green-400 font-bold">↑</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 3 */}
                <div className="rounded-lg border border-border bg-muted/30">
                    <button
                        onClick={() => toggleSection(3)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🏛️</span>
                            <div>
                                <h3 className="text-lg font-bold">3. Policy Intervention Becomes Extreme</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Governments and central banks forced to act
                                </p>
                            </div>
                        </div>
                        <span className="text-xl">{expandedSection === 3 ? '−' : '+'}</span>
                    </button>

                    {expandedSection === 3 && (
                        <div className="p-4 pt-0 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Regime shifts force governments and central banks to act.
                            </p>

                            {/* Examples Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-2 px-3 font-semibold">Event</th>
                                            <th className="text-left py-2 px-3 font-semibold">Policy Response</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-border/50">
                                            <td className="py-2 px-3 font-medium">2008</td>
                                            <td className="py-2 px-3">QE + zero rates</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-3 font-medium">2020</td>
                                            <td className="py-2 px-3">Trillions in stimulus + QE infinity</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Key Insight */}
                            <div className="p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/50">
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">
                                    The Key Insight:
                                </div>
                                <p className="text-sm font-medium">
                                    Policy does not prevent regime change. It defines the next regime.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
