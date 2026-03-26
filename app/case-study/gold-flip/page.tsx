'use client';

import GoldReservesTable from '@/components/case-study/gold-reserves-table';
import GoldDrainChart from '@/components/case-study/gold-drain-chart';

export default function CaseStudy1960sPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight">1960s — The Gold Drain</h1>
                <p className="text-muted-foreground mt-1">
                    How the U.S. lost half its gold reserves in a decade, leading to the collapse of Bretton Woods.
                </p>
            </div>



            <div className="py-6 text-center space-y-2">
                <p className="text-xl sm:text-2xl font-semibold tracking-tight italic text-foreground/80">
                    &ldquo;Was the 1971 depeg really a surprise?&rdquo;
                </p>
                <p className="text-sm text-muted-foreground tracking-wide uppercase">
                    O1: draining supply at artificially set price is not sustainable
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">The Gold Drain</h2>
                <GoldDrainChart />
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Context</h2>
                <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                    <p>
                        After World War II the United States held roughly 20,000 metric tons of gold — over
                        two-thirds of the world&apos;s monetary gold. The Bretton Woods system pegged the dollar
                        at $35 per ounce, and foreign central banks could redeem dollars for gold on demand.
                    </p>
                    <p>
                        Through the 1950s and 1960s, persistent U.S. trade deficits and overseas military
                        spending flooded the world with dollars. Foreign governments, led by France, began
                        converting those dollars into gold. By 1965 U.S. reserves had fallen below 400 million
                        troy ounces — a loss of nearly 40% from the 1945 peak.
                    </p>
                    <p>
                        The London Gold Pool (1961–1968) was a last-ditch effort by eight central banks to
                        defend the $35 peg on the open market. It collapsed in March 1968 when speculative
                        demand overwhelmed official selling. Three years later, on August 15, 1971, Nixon
                        suspended dollar-gold convertibility entirely.
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">U.S. Gold Reserves</h2>
                <GoldReservesTable />
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Key Takeaways</h2>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
                    <li>Peak holdings of ~20,000 metric tons in the early 1940s fell to ~8,100 by 1970 — a 60% decline.</li>
                    <li>The fixed $35/oz price masked the true cost: in 2026 dollars, the lost gold would be worth hundreds of billions.</li>
                    <li>Once the gold window closed, the dollar became a pure fiat currency and gold repriced dramatically upward.</li>
                    <li>The 1960s gold drain is a textbook example of how fixed-rate regimes collapse under persistent imbalances.</li>
                </ul>
            </section>
        </div>
    );
}
