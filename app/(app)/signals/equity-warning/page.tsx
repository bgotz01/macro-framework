import Link from 'next/link';
import SignalHeader from '@/components/signals/signal-header';
import SignalInsight from '@/components/signals/signal-insight';
import SignalMeaning from '@/components/signals/signal-meaning';
import SignalAction from '@/components/signals/signal-action';

export default function EquityWarningPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/signals" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Signals
            </Link>

            <div className="space-y-8">
                <SignalHeader
                    title="Equity Risk Warning"
                    titleColor="text-orange-700 dark:text-orange-400"
                    subtitle="Early warning signal - not a sell"
                    priority={4}
                    category={{
                        name: 'Caution / Reduce Risk',
                        color: 'text-orange-600 dark:text-orange-400',
                        description: 'Valuation cushion thin → Reduce aggressiveness',
                    }}
                    trigger="Real EY < +0.5%"
                />

                <SignalInsight
                    insight="This is a yellow flag, not a red flag. Equities can still work, but the margin of safety is compressed."
                />

                <SignalMeaning
                    meaning={[
                        'Equity earnings barely clear inflation',
                        'Valuation cushion is thin',
                        'Equities sensitive to liquidity, rates, narrative',
                        'Forward returns increasingly path-dependent',
                    ]}
                />

                <SignalAction
                    rotation={{
                        title: 'Reduce Equity Aggressiveness',
                        description: 'Tighten risk / early warning',
                        bullets: [
                            'Not a sell — early warning signal',
                            'Reduce position sizes',
                            'Tighten stop losses',
                            'Monitor for deterioration',
                        ],
                    }}
                />
            </div>
        </div>
    );
}
