'use client';

import RegimeTimelineBarChart from '@/components/charts/regime-timeline-bar-chart';
import RegimeHistoryTable from '@/components/regime/regime-history-table';
import RegimeReturns from '@/components/regime/regime-returns';
import RegimeHistoricalChart from '@/components/charts/regime-historical-chart';
import RegimeProximityChart from '@/components/regime/regime-proximity-chart';
import EquitiesChart from '@/components/charts/equities-chart';
import { Suspense, useState } from 'react';

export default function RegimeHistoricalPage() {
    const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string } | null>(null);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">
                    REGIME TIMELINE
                </h1>
                <p className="page-subtitle">
                    Historical regime transitions and performance
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading regime timeline...</div>}>
                    <RegimeTimelineBarChart />
                </Suspense>
            </div>

            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading regime history...</div>}>
                    <RegimeHistoryTable onRegimeSelect={setSelectedDateRange} />
                </Suspense>
            </div>

            <div className="mb-16">
                <RegimeHistoricalChart selectedDateRange={selectedDateRange} />
            </div>

            <div className="mb-16">
                <RegimeReturns />
            </div>

            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading proximity history...</div>}>
                    <RegimeProximityChart />
                </Suspense>
            </div>

            <div className="mb-16">
                <EquitiesChart />
            </div>
        </div>
    );
}
