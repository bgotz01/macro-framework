import Link from 'next/link';
import SignalHeader from '@/components/signals/signal-header';
import SignalInsight from '@/components/signals/signal-insight';
import SignalMeaning from '@/components/signals/signal-meaning';
import SignalRotations from '@/components/signals/signal-rotations';

export default function EquityBreakdownPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/signals" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Signals
            </Link>

            <div className="space-y-8">
                <SignalHeader
                    title="Equity Value Breakdown"
                    titleColor="text-red-800 dark:text-red-300"
                    subtitle="Most severe equity warning"
                    priority={2}
                    category={{
                        name: 'Risk-Off / Defensive',
                        color: 'text-red-600 dark:text-red-400',
                        description: 'Equity valuations fundamentally unsound → EXIT aggressively',
                    }}
                    trigger="Real EY < -2%"
                />

                <SignalMeaning
                    meaning={[
                        'Equity earnings materially lag inflation',
                        'Equity valuations are fundamentally unsound',
                        'Markets depend entirely on liquidity or speculation',
                        'High probability of market reset',
                    ]}
                />

                <SignalRotations
                    rotations={[
                        {
                            condition: 'If Real 10Y > 0%:',
                            title: '💰 EXIT to Bonds',
                            description: 'Aggressive exit from equity exposure. Bonds offer positive real yield.',
                            note: 'Major red-flag environment - preserve capital aggressively',
                        },
                        {
                            condition: 'If Real 10Y ≤ 0%:',
                            title: '🏆 EXIT to Gold / Real Assets',
                            description: 'Both equities and bonds fail in real terms',
                            note: 'Major red-flag environment - wait for market reset',
                        },
                    ]}
                />
            </div>
        </div>
    );
}
