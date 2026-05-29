import Link from 'next/link';
import SignalHeader from '@/components/signals/signal-header';
import SignalMeaning from '@/components/signals/signal-meaning';
import SignalRotations from '@/components/signals/signal-rotations';

export default function EquitySellPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/signals" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Signals
            </Link>

            <div className="space-y-8">
                <SignalHeader
                    title="Equity Sell Zone"
                    titleColor="text-red-700 dark:text-red-400"
                    subtitle="Hard sell signal - not a timing call"
                    priority={3}
                    category={{
                        name: 'Risk-Off / Defensive',
                        color: 'text-red-600 dark:text-red-400',
                        description: 'Equity economics broken → SELL / underweight',
                    }}
                    trigger="Real EY < -1%"
                />

                <SignalMeaning
                    meaning={[
                        'Equity earnings fail to beat inflation',
                        'Equity ownership relies on multiple expansion',
                        'Long-term real returns structurally weak',
                        'Drawdown risk elevated',
                    ]}
                />

                <SignalRotations
                    rotations={[
                        {
                            condition: 'If Real 10Y > 0%:',
                            title: '💰 Rotate to Bonds',
                            description: 'Bonds offer positive real yield with lower risk than equities',
                            note: 'Hard economic break, not timing call',
                        },
                        {
                            condition: 'If Real 10Y ≤ 0%:',
                            title: '🏆 Rotate to Gold / Real Assets',
                            description: 'Both equities and bonds fail in real terms',
                            note: 'Hard economic break, not timing call',
                        },
                    ]}
                />
            </div>
        </div>
    );
}
