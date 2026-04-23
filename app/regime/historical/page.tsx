'use client';

import RegimeTimelineBarChart from '@/components/charts/regime-timeline-bar-chart';
import RegimeHistoryTable from '@/components/regime/regime-history-table';
import RegimeReturns from '@/components/regime/regime-returns';
import RegimeHistoricalChart from '@/components/charts/regime-historical-chart';
import { Suspense, useState } from 'react';

export default function RegimeHistoricalPage() {
    const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string } | null>(null);

    return (
        <div className="max-w-6xl mx-auto">
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
        </div>
    );
}
