'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function PercentileExplanation() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mt-8 rounded-xl border bg-card">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors rounded-xl"
            >
                <h2 className="text-xl font-semibold">Understanding Percentile Rankings</h2>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
            </button>

            {isExpanded && (
                <div className="px-6 pb-6">
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Percentile rankings show where a current value sits relative to all historical values up to that point in time.
                            This helps identify whether conditions are historically high, low, or average.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="font-semibold text-green-600 dark:text-green-400 mb-2">
                                    0-25th Percentile
                                </div>
                                <p className="text-xs">
                                    Historically low values. For inflation or rates, this suggests accommodative conditions.
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
                                <div className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    25-75th Percentile
                                </div>
                                <p className="text-xs">
                                    Normal range. Values in this range are typical based on historical patterns.
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="font-semibold text-red-600 dark:text-red-400 mb-2">
                                    75-100th Percentile
                                </div>
                                <p className="text-xs">
                                    Historically high values. For inflation or rates, this suggests restrictive conditions.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t">
                            <h3 className="font-semibold text-foreground mb-2">Key Metrics Explained</h3>
                            <ul className="space-y-2">
                                <li>
                                    <span className="font-medium text-foreground">CPI Inflation:</span> Year-over-year change in Consumer Price Index
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Fed Funds Rate:</span> The target rate set by the Federal Reserve
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Treasury Yields:</span> Interest rates on U.S. government bonds
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Real Yield:</span> 10-Year Treasury yield minus CPI inflation (inflation-adjusted return)
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Yield Curve:</span> Difference between long-term and short-term rates (inversion signals recession risk)
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Shiller P/E (CAPE):</span> Cyclically-adjusted price-to-earnings ratio for the S&P 500
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Earnings Yield Premium:</span> Equity earnings yield minus risk-free rate (equity risk premium)
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}