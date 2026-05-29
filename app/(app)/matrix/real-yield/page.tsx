import RegimeMatrix from '@/components/regime-matrix';

export default function RealYieldMatrixPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Real Yield Regime Matrix</h1>
            <RegimeMatrix
                title="Real Yield Matrix"
                subtitle="10Y nominal − inflation — Real return on duration"
                levels={[
                    { label: 'LOW', value: '< 0%', description: 'Financial repression', color: 'green' },
                    { label: 'MID', value: '0% – 2%', description: 'Neutral', color: 'yellow' },
                    { label: 'HIGH', value: '> 2%', description: 'Restrictive', color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Inflation surge' },
                        { label: 'Real erosion' },
                        { label: 'Disinflation trade' },
                    ],
                    stable: [
                        { label: 'Negative carry' },
                        { label: 'Fair compensation' },
                        { label: 'Premium hold' },
                    ],
                    rising: [
                        { label: 'Breakeven tightening' },
                        { label: 'Real normalization' },
                        { label: 'Volcker moment' },
                    ],
                }}
                insight="Real yields below zero = financial repression. Above 2% = restrictive policy."
                levelThresholds={{ low: 0, mid: 2 }}
            />
        </div>
    );
}
