import Link from 'next/link';
import SignalHeader from '@/components/signals/signal-header';
import SignalInsight from '@/components/signals/signal-insight';
import SignalChart from '@/components/signals/signal-chart';
import SignalMeaning from '@/components/signals/signal-meaning';
import SignalRotations from '@/components/signals/signal-rotations';
import SignalExamples from '@/components/signals/signal-examples';

export default function SystemStressPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/signals" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Signals
            </Link>

            <div className="space-y-8">
                <SignalHeader
                    title="System Stress Signal"
                    titleColor="text-red-600 dark:text-red-400"
                    subtitle="Highest priority - overrides all other signals"
                    priority={1}
                    category={{
                        name: 'Risk-Off / Defensive',
                        color: 'text-red-600 dark:text-red-400',
                        description: 'Financial system unanchored → Gold / real assets',
                    }}
                    trigger="Real 10Y < -0.5%"
                />

                <SignalInsight
                    insight="When the risk-free rate fails to provide real returns, the entire financial system's pricing mechanism breaks down. No financial asset can be reliably valued."
                />

                <SignalChart
                    imagePath="/signal-charts/Real10Y.png"
                    altText="Real 10Y Treasury Yield Historical Chart"
                />

                <SignalMeaning
                    meaning={[
                        'The long-term risk-free rate fails in real terms',
                        'Financial assets lose a stable valuation anchor',
                        'Bonds no longer preserve purchasing power',
                        'Capital seeks protection in real assets',
                    ]}
                />

                <SignalRotations
                    rotations={[
                        {
                            title: '🏆 Primary: Gold / Real Assets',
                            description: 'Commodities, real estate, inflation hedges - assets that preserve purchasing power when financial assets fail',
                            note: 'Expecting continued inflation or stagflation',
                        },
                        {
                            title: '📉 Alternative: Sell Equities',
                            description: 'Move to cash or short-term instruments if expecting rate hikes or deflation to restore real yields',
                            note: 'Expecting aggressive Fed tightening or deflationary forces',
                        },
                    ]}
                />

                <SignalExamples
                    examples={[
                        '1970s stagflation (gold/commodities outperformed)',
                        '2021-2022 inflation surge (real assets protected capital)',
                    ]}
                />
            </div>
        </div>
    );
}
