import Link from 'next/link';
import SignalHeader from '@/components/signals/signal-header';
import SignalInsight from '@/components/signals/signal-insight';
import SignalChart from '@/components/signals/signal-chart';
import SignalMeaning from '@/components/signals/signal-meaning';
import SignalRotations from '@/components/signals/signal-rotations';
import SignalExamples from '@/components/signals/signal-examples';

export default function EquityDangerPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/signals" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Signals
            </Link>

            <div className="space-y-8">
                <SignalHeader
                    title="Equity Danger Signal"
                    titleColor="text-red-700 dark:text-red-400"
                    subtitle="Third priority - when EYP is negative and yield curve is inverted"
                    priority={5}
                    category={{
                        name: 'Risk-Off / Defensive',
                        color: 'text-red-600 dark:text-red-400',
                        description: 'Liquidity broken → Bonds or gold',
                    }}
                    trigger={[
                        'Real 10Y ≥ 0% (no System Stress)',
                        'AND Real EY ≥ 0% (equities not broken)',
                        'AND EYP < -1% (equity carry inferior to bonds)',
                        '',
                        'EYP < -1% AND Yield Curve < 0%',
                    ]}
                />

                <SignalInsight
                    insight="Expensive equities + inverted curve means current earnings don't justify valuations AND future growth cannot be financed."
                />

                <SignalChart
                    imagePath="/signal-charts/EYP+Curve.png"
                    altText="Earnings Yield Premium and Yield Curve Historical Chart"
                />

                <SignalMeaning
                    meaning={[
                        'Equity carry is inferior to bonds',
                        'Liquidity transmission is broken',
                        'Growth cannot be financed',
                        'Equity risk is poorly compensated',
                    ]}
                />

                <SignalRotations
                    rotations={[
                        {
                            condition: 'If Real 10Y > 0%:',
                            title: 'Rotate to Bonds',
                            description: 'Bonds offer positive real yield with lower risk',
                            note: 'Inverted curve signals stress ahead',
                        },
                        {
                            condition: 'If Real 10Y ≤ 0%:',
                            title: 'Rotate to Gold / Real Assets',
                            description: 'Both equities and bonds under stress',
                            note: 'Real assets preserve purchasing power',
                        },
                    ]}
                />

                <SignalExamples
                    examples={[
                        '1969',
                        '1973',
                        '1979',
                        '2000',
                        '2007',
                        '2023',
                    ]}
                />
            </div>
        </div>
    );
}
