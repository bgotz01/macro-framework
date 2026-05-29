import Link from 'next/link';
import SignalHeader from '@/components/signals/signal-header';
import SignalInsight from '@/components/signals/signal-insight';
import SignalMeaning from '@/components/signals/signal-meaning';
import SignalRotations from '@/components/signals/signal-rotations';
import SignalNote from '@/components/signals/signal-note';
import SignalExamples from '@/components/signals/signal-examples';

export default function EquityValuePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/signals" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Signals
            </Link>

            <div className="space-y-8">
                <SignalHeader
                    title="Equity Value Window"
                    titleColor="text-green-700 dark:text-green-400"
                    subtitle="Fifth priority - attractive equity valuations"
                    priority={7}
                    category={{
                        name: 'Risk-On / Strong Buy',
                        color: 'text-green-600 dark:text-green-400',
                        description: 'Real EY ≥ +3.0% → BUY equities (broad exposure)',
                    }}
                    trigger={[
                        'Real EY ≥ +3.0% (Good Value)',
                        'Real EY ≥ +5.0% (Extreme Value)',
                    ]}
                />

                <SignalInsight
                    insight="This signal identifies periods when equity valuations are attractive enough that long-term expected returns are high. The two levels distinguish between standard opportunities (Good Value) and rare, crisis-driven extremes (Extreme Value)."
                />

                <SignalMeaning
                    meaning={[
                        'Equities offer strong real earnings cushion',
                        'Valuations provide downside protection',
                        'Long-term equity ownership economically justified',
                        'Timing precision is less important; expectancy is high',
                    ]}
                />

                <SignalRotations
                    rotations={[
                        {
                            condition: '🟢 Good Value (Real EY ≥ +3.0%):',
                            title: 'BUY Equities',
                            description: 'Valuations attractive, but not distressed. Long-term real returns are favorable. Broad participation likely over time.',
                            note: 'Standard high-conviction BUY signal',
                        },
                        {
                            condition: '🟢🟢 Extreme Value (Real EY ≥ +5.0%):',
                            title: 'STRONG BUY Equities',
                            description: 'Equity valuations severely compressed. Pessimism elevated; risk premia unusually wide. Long-term real returns historically exceptional.',
                            note: 'Rare, crisis-level opportunity (post-crash, forced selling, market resets)',
                        },
                    ]}
                />

                <SignalNote
                    note="This is a permission signal, not a timing signal. It does not imply a sell when the condition ends. When Real EY falls below +3%, the system simply returns to normal. Negative equity signals are triggered only by separate conditions (e.g., Real EY < 0, System Stress, Equity Danger)."
                />

                <SignalExamples
                    examples={[
                        '2009 (post-financial crisis - Extreme Value)',
                        '1982 (end of stagflation - Extreme Value)',
                        '2020 March (COVID panic - Extreme Value)',
                        '2011 (European debt crisis - Good Value)',
                    ]}
                />
            </div>
        </div>
    );
}
