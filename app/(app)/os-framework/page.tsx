// app/guide/page.tsx
import { BusinessOverview } from '@/components/os-framework/BusinessOverview';
import { OsGuide } from '@/components/os-framework/OsGuide';
import PageHeader from '@/components/page-header';

export default function OSFrameworkPage() {
    return (
        <div className="container mx-auto px-4">
            <PageHeader title="OS FRAMEWORK" subtitle="Regime · Playbook · Outlier" />

            <OsGuide />
            <BusinessOverview />
        </div>
    );
}