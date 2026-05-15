'use client';

import CpiChart from '@/components/case-study/cpi-chart';
import DjiChart from '@/components/case-study/dji-chart';

export default function InflationCaseStudyPage() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16 space-y-10">

            {/* Header */}
            <section className="text-center space-y-4">
                <div className="inline-flex items-center rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Case Study
                </div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    Inflation
                </h1>
                <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    U.S. CPI year-over-year change since 1947.
                </p>
            </section>

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
