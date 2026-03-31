import CustomRegimeParameters from '@/components/regime/custom-regime-parameters';
import RegimeChart from '@/components/charts/regime-chart';
import ChatWidget from '@/components/chat/chat-widget';
import { Suspense } from 'react';

export default function RegimeCustomPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading custom regime engine...</div>}>
                    <CustomRegimeParameters />
                </Suspense>
            </div>

            <div className="mb-16">
                <Suspense fallback={<div className="text-center py-12">Loading regime chart...</div>}>
                    <RegimeChart />
                </Suspense>
            </div>

            <ChatWidget />
        </div>
    );
}
