import Link from 'next/link';
import SignalHeader from '@/components/signals/signal-header';
import SignalInsight from '@/components/signals/signal-insight';
import SignalChart from '@/components/signals/signal-chart';
import SignalMeaning from '@/components/signals/signal-meaning';
import SignalAction from '@/components/signals/signal-action';
import SignalNote from '@/components/signals/signal-note';
import SignalExamples from '@/components/signals/signal-examples';

export default function GrowthRegimePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/signals" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Signals
            </Link>

            <div className="space-y-8">
                <SignalHeader
                    title="Growth Signal"
                    titleColor="text-purple-700 dark:text-purple-400"
                    subtitle="Fourth priority - when EYP is negative but yield curve is positive"
                    priority={6}
                    category={{
                        name: 'Risk-On / Conditional Equity',
                        color: 'text-green-600 dark:text-green-400',
                        description: 'Liquidity supports duration → High-growth equities',
                    }}
                    trigger={[
                        'Real 10Y ≥ 0% (no System Stress)',
                        'AND Real EY ≥ 0% (equities not broken)',
                        'AND EYP < -1% (equity carry inferior to bonds)',
                        '',
                        'EYP < -1% AND Yield Curve > 0%',
                    ]}
                />

                <SignalInsight
                    insight="A positive yield curve indicates healthy liquidity transmission. Even though current equity earnings are expensive, the ability to finance duration means growth assets can be carried until their future cash flows materialize."
                />

                <SignalChart
                    imagePath="/signal-charts/EYGrowth.png"
                    altText="Earnings Yield Premium and Yield Curve for Growth Signal"
                />

                <SignalMeaning
                    meaning={[
                        'Equity cash-flow carry is inferior to bonds',
                        'But liquidity transmission is healthy',
                        'Duration can be financed and carried',
                        'Growth compensates for weak near-term earnings',
                    ]}
                />

                <SignalAction
                    rotation={{
                        title: 'Growth Equities',
                        description: 'High-growth / long-duration equities',
                        bullets: [
                            'Positive yield curve enables financing',
                            'Duration assets can be carried',
                            'Growth premium compensates for weak carry',
                        ],
                    }}
                />

                <SignalNote
                    note="This is NOT a bond-favored signal despite negative EYP. The positive yield curve changes the calculus entirely."
                />

                <SignalExamples
                    examples={[
                        '1994-1999 (tech boom with positive curve)',
                        '2017-2018 (FAANG dominance)',
                    ]}
                />
            </div>
        </div>
    );
}
