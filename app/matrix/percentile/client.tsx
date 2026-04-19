'use client';

import PercentileChart from '@/components/charts/percentile-chart';
import PercentileBars from '@/components/percentile-bars';
import PercentileDataTable from '@/components/percentile-data-table';
import { useState, Suspense } from 'react';

// Tooltip component for methodology
function MethodologyTooltip({ children }: { children: React.ReactNode }) {
    const [show, setShow] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="absolute z-50 px-4 py-3 text-xs bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg -top-2 left-0 sm:left-full sm:ml-2 w-72 sm:w-96 pointer-events-none">
                    <div className="text-blue-900 dark:text-blue-100 font-semibold mb-2">📊 Methodology</div>
                    <p className="text-blue-800 dark:text-blue-200 mb-2">
                        For each date, we calculate what percentile the current value represents compared to
                        <strong> all historical data up to that date</strong> (expanding window).
                    </p>
                    <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• 0th percentile = lowest value ever seen</li>
                        <li>• 50th percentile = median of all historical values</li>
                        <li>• 100th percentile = highest value ever seen</li>
                    </ul>
                    <div className="absolute w-2 h-2 bg-blue-50 dark:bg-blue-950 border-l border-t border-blue-200 dark:border-blue-800 rotate-45 -left-1 top-4 hidden sm:block"></div>
                </div>
            )}
        </div>
    );
}

interface PercentileAnalysisClientProps {
    initialData: any;
    availableYears: number[];
}

export default function PercentileAnalysisClient({ initialData, availableYears }: PercentileAnalysisClientProps) {
    return (
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 max-w-6xl">
            <div className="mb-6 sm:mb-8 text-center">
                <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    Percentile Analysis
                    <MethodologyTooltip>
                        <button className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-help">
                            ℹ️ Methodology
                        </button>
                    </MethodologyTooltip>
                </h1>
                <p className="text-sm sm:text-lg text-muted-foreground">
                    Historical context: Where do values rank compared to all past observations?
                </p>
            </div>

            {/* Percentile Bars Visualization */}
            <PercentileBars
                initialData={initialData}
                availableYears={availableYears}
                initialYear={9999}
            />

            {/* Historical Chart */}
            <div className="mb-6 sm:mb-8 mt-6 sm:mt-8">
                <Suspense fallback={<div className="h-64 sm:h-[500px] flex items-center justify-center">Loading chart...</div>}>
                    <PercentileChart height={500} />
                </Suspense>
            </div>

            {/* Historical Data Table */}
            <div className="mb-6 sm:mb-8 mt-6 sm:mt-8">
                <PercentileDataTable />
            </div>

            {/* Navigation */}
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                <a
                    href="/matrix"
                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all duration-200 border border-primary/20 text-sm sm:text-base"
                >
                    ← Back to Matrix
                </a>
                <a
                    href="/matrix/chart"
                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all duration-200 border border-primary/20 text-sm sm:text-base"
                >
                    View Charts →
                </a>
            </div>
        </div>
    );
}
