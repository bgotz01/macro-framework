import RegimeParameters from '@/components/regime/regime-parameters';
import RegimeHistoryTable from '@/components/regime/regime-history-table';
import RegimeChart from '@/components/charts/regime-chart';
import ChatWidget from '@/components/chat/chat-widget';
import { Suspense } from 'react';
import Link from 'next/link';

export default function RegimeActivePage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex justify-end">
                <Link
                    href="/regime-active/custom"
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    Custom Thresholds
                </Link>
            </div>
            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading regime parameters...</div>}>
                    <RegimeParameters />
                </Suspense>
            </div>

            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading regime chart...</div>}>
                    <RegimeChart />
                </Suspense>
            </div>

            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading regime history...</div>}>
                    <RegimeHistoryTable />
                </Suspense>
            </div>

            <ChatWidget />
        </div>
    );
}
