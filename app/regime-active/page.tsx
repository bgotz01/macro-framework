import RegimeParameters from '@/components/regime/regime-parameters';
import RegimeHistoryTable from '@/components/regime/regime-history-table';
import { Suspense } from 'react';

export default function RegimeActivePage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading regime parameters...</div>}>
                    <RegimeParameters />
                </Suspense>
            </div>

            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading regime history...</div>}>
                    <RegimeHistoryTable />
                </Suspense>
            </div>
        </div>
    );
}
