import RegimeMatrix from '@/components/regime-matrix';

export default function BondYieldMatrixPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Bond Yield Regime Matrix</h1>
            <RegimeMatrix
                title="Bond Yield Matrix (Nominal)"
                subtitle="10Y Treasury — Nominal yield levels"
                levels={[
                    { label: 'LOW', value: '< 2%', description: 'ZIRP environment', color: 'green' },
                    { label: 'MID', value: '2% – 5%', description: 'Normal range', color: 'yellow' },
                    { label: 'HIGH', value: '> 5%', description: 'Elevated rates', color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Deflation scare' },
                        { label: 'Growth scare' },
                        { label: 'Crisis hedge' },
                    ],
                    stable: [
                        { label: 'ZIRP trap' },
                        { label: 'Neutral' },
                        { label: 'Restrictive hold' },
                    ],
                    rising: [
                        { label: 'Reflation signal' },
                        { label: 'Tightening phase' },
                        { label: 'Policy accident risk' },
                    ],
                }}
                levelThresholds={{ low: 2, mid: 5 }}
            />
        </div>
    );
}
