'use client';

import RegimeProximityChart from '@/components/regime/regime-proximity-chart';
import PageHeader from '@/components/page-header';
import { Suspense } from 'react';

export default function RegimeProximityPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <PageHeader title="REGIME PROXIMITY" subtitle="Historical proximity to each regime across all key conditions" />

            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading proximity history...</div>}>
                    <RegimeProximityChart />
                </Suspense>
            </div>
        </div>
    );
}
