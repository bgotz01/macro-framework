import Link from 'next/link';
import SignalHeader from '@/components/signals/signal-header';
import SignalInsight from '@/components/signals/signal-insight';
import SignalMeaning from '@/components/signals/signal-meaning';
import SignalAction from '@/components/signals/signal-action';

export default function NormalPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/signals" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
                ← Back to Signals
            </Link>

            <div className="space-y-8">
                <SignalHeader
                    title="Normal Signal"
                    titleColor="text-green-700 dark:text-green-400"
                    subtitle="Default state - when no stress signals are active"
                    priority={8}
                    category={{
                        name: 'Risk-On / Balanced',
                        color: 'text-green-600 dark:text-green-400',
                        description: 'All metrics healthy → Balanced portfolio',
                    }}
                    trigger={[
                        'Real 10Y ≥ 0%',
                        'AND Real EY ≥ 0%',
                        'AND (EYP ≥ -1% OR no clear fork signal)',
                        'AND Real EY ≤ +3.0%',
                    ]}
                />

                <SignalInsight
                    insight="In Normal conditions, traditional portfolio construction principles work well. Focus on diversification, rebalancing, and long-term goals."
                />

                <SignalMeaning
                    meaning={[
                        'Financial system functioning normally',
                        'Risk-free rate provides real return',
                        'Equities compensate for inflation',
                        'Standard asset allocation applies',
                    ]}
                />

                <SignalAction
                    rotation={{
                        title: 'Balanced Portfolio',
                        description: '',
                        bullets: [
                            'Diversified portfolio appropriate',
                            'Risk assets can be held',
                            'Normal risk/return tradeoffs apply',
                            'No forced rotation required',
                        ],
                    }}
                />
            </div>
        </div>
    );
}
