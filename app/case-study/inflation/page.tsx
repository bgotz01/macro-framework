'use client';

import CpiChart from '@/components/case-study/cpi-chart';
import DjiChart from '@/components/case-study/dji-chart';
import PageHeader from '@/components/page-header';

export default function InflationCaseStudyPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16 space-y-10">

            {/* Header */}
            <PageHeader title="INFLATION" subtitle="U.S. CPI Year-Over-Year Since 1947" />

            {/* CPI Chart */}
            <section>
                <CpiChart />
            </section>

            {/* Dow Jones Chart */}
            <section>
                <DjiChart />
            </section>

        </div>
    );
}
