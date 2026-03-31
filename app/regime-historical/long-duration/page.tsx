'use client';

import StockDataTable from '@/components/regime/stock-data-table';

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
                <h1 className="text-3xl font-light tracking-wider mb-1" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}>
                    LONG DURATION
                </h1>
                <p className="text-sm font-light text-muted-foreground tracking-widest uppercase" style={{ letterSpacing: '0.2em' }}>
                    Long-Duration Regime Analysis
                </p>
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
                    <h2 className="text-2xl font-light tracking-wider" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.12em' }}>
                        2023–Now
                    </h2>
                    <div className="mt-2 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                </div>
                <div className="space-y-8">
                    <StockDataTable csvPath="/data/regimes/long-duration/AVGO.csv" title="AVGO — Broadcom" />
                    <StockDataTable csvPath="/data/regimes/long-duration/ANET.csv" title="ANET — Arista Networks" />
                    <StockDataTable csvPath="/data/regimes/long-duration/NVDA.csv" title="NVDA — Nvidia" />
                    <StockDataTable csvPath="/data/regimes/long-duration/PLTR.csv" title="PLTR — Palantir" />
                    <StockDataTable csvPath="/data/regimes/long-duration/FIX.csv" title="FIX — Comfort Systems" />
                </div>
            </section>

            <section id="2005" className="mb-20 scroll-mt-24">
                <div className="mb-8 px-1 text-center">
                    <h2 className="text-2xl font-light tracking-wider" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.12em' }}>
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
                    <h2 className="text-2xl font-light tracking-wider" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.12em' }}>
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
