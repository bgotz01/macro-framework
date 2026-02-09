import RegimeMatrix from '@/components/regime-matrix';

export default function VolatilityMatrixPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Volatility Regime Matrix</h1>
            <RegimeMatrix
                title="VIX Matrix"
                subtitle="VIX — Market volatility and option pricing"
                levels={[
                    { label: 'LOW', value: '< 15', color: 'green' },
                    { label: 'MID', value: '15 – 25', color: 'yellow' },
                    { label: 'HIGH', value: '> 25', color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Calm restoration' },
                        { label: 'Normalization' },
                        { label: 'Crisis fade' },
                    ],
                    stable: [
                        { label: 'Complacency' },
                        { label: 'Balanced risk' },
                        { label: 'Elevated baseline' },
                    ],
                    rising: [
                        { label: 'Risk-off signal' },
                        { label: 'Uncertainty spike' },
                        { label: 'Panic mode' },
                    ],
                }}
                levelThresholds={{ low: 15, mid: 25 }}
                valueFormat="number"
            />
        </div>
    );
}
