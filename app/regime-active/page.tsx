import CustomRegimeParameters from '@/components/regime/custom-regime-parameters';
import RegimeChart from '@/components/charts/regime-chart';
import ChatWidget from '@/components/chat/chat-widget';
import { Suspense } from 'react';

export default function RegimeCustomPage() {
    return (
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
            <div className="mb-12 sm:mb-16">
                <Suspense fallback={<div className="text-center py-8 sm:py-12 text-sm">Loading regime engine...</div>}>
                    <CustomRegimeParameters />
                </Suspense>
            </div>

            <div className="mb-12 sm:mb-16">
                <Suspense fallback={<div className="text-center py-8 sm:py-12 text-sm">Loading regime chart...</div>}>
                    <RegimeChart />
                </Suspense>
            </div>

            <ChatWidget />
        </div>
    );
}
