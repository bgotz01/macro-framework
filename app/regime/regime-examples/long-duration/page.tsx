'use client';

import StockDataTable from '@/components/regime/stock-data-table';
import Image from 'next/image';

const sections = [
    { id: 'now', label: '2023–Now' },
    { id: '2005', label: '2005–2007' },
    { id: '1994', label: '1994–2000' },
];

export default function LongDurationPage() {
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">
                    LONG DURATION
                </h1>
                <p className="page-subtitle">
                    Long-Duration Regime Analysis
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
                <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed text-left">
                    In a long duration regime, high growth stocks (profitable or not) become the primary trade. The most obvious stocks had already been growing steadily and fit the macro narrative (AI in 2023+, China/commodities in 2005+, tech in 1995+).
                </p>
            </div>

            <div className="flex justify-center gap-2 mb-12">
                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <section id="now" className="mb-20 scroll-mt-24">
                <div className="mb-8 px-1 text-center">
                    <h2 className="section-title text-2xl">
                        2023–Now
                    </h2>
                    <div className="mt-2 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-medium mt-4">High Growth Stock Screen Oct 2023</h3>
                </div>
                <div className="space-y-8">
                    <Image
                        src="/regimes/long-duration/long-duration-2023-screen.png"
                        alt="High Growth Stock Screen Oct 2023"
                        title="High Growth Stock Screen Oct 2023"
                        width={800}
                        height={600}
                        className="mx-auto rounded-lg shadow-md"
                    />
                    <StockDataTable csvPath="/data/regimes/long-duration/AVGO.csv" title="AVGO — Broadcom" />

                    <StockDataTable csvPath="/data/regimes/long-duration/NVDA.csv" title="NVDA — Nvidia" />
                    <StockDataTable csvPath="/data/regimes/long-duration/PLTR.csv" title="PLTR — Palantir" />
                    <StockDataTable csvPath="/data/regimes/long-duration/FIX.csv" title="FIX — Comfort Systems" />
                </div>
            </section>

            <section id="2005" className="mb-20 scroll-mt-24">
                <div className="mb-8 px-1 text-center">
                    <h2 className="section-title text-2xl">
                        2005–2007
                    </h2>
                    <div className="mt-2 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                </div>
                <div className="space-y-8">
                    <StockDataTable csvPath="/data/regimes/long-duration/CHL.csv" title="CHL — China Mobile" />
                    <StockDataTable csvPath="/data/regimes/long-duration/RIO.csv" title="RIO — Rio Tinto" />
                </div>
            </section>

            <section id="1994" className="mb-20 scroll-mt-24">
                <div className="mb-8 px-1 text-center">
                    <h2 className="section-title text-2xl">
                        1994–2000
                    </h2>
                    <div className="mt-2 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                </div>
                <div className="space-y-8">
                    <StockDataTable csvPath="/data/regimes/long-duration/MSFT.csv" title="MSFT — Microsoft" />
                    <StockDataTable csvPath="/data/regimes/long-duration/ORCL.csv" title="ORCL — Oracle" />
                </div>
            </section>
        </div>
    );
}
