// app/guide/page.tsx
import { BusinessOverview } from '@/components/os-framework/BusinessOverview';
import { OsGuide } from '@/components/os-framework/OsGuide';

export default function OSFrameworkPage() {
    return (
        <div className="container mx-auto px-4 py-10">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">OS FRAMEWORK</h1>
                <p className="page-subtitle">
                    Regime · Playbook · Outlier
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            <OsGuide />
            <BusinessOverview />
        </div>
    );
}