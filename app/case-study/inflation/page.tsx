'use client';

import CpiChart from '@/components/case-study/cpi-chart';
import DjiChart from '@/components/case-study/dji-chart';

export default function InflationCaseStudyPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16 space-y-10">

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">INFLATION</h1>
                <p className="page-subtitle">
                    U.S. CPI Year-Over-Year Since 1947
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

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
