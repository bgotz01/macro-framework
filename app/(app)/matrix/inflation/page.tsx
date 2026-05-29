import RegimeMatrix from '@/components/regime-matrix';

export default function InflationMatrixPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Inflation Regime Matrix</h1>
            <RegimeMatrix
                title="Inflation Matrix"
                subtitle="CPI / PCE — Valuation of money and purchasing power"
                levels={[
                    { label: 'LOW', value: '< 3%', color: 'green' },
                    { label: 'MID', value: '3% – 6%', color: 'yellow' },
                    { label: 'HIGH', value: '> 6%', color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Disinflation tail' },
                        { label: 'Soft landing' },
                        { label: 'Policy victory' },
                    ],
                    stable: [
                        { label: 'Goldilocks' },
                        { label: 'Nominal stability' },
                        { label: 'Stagflation risk' },
                    ],
                    rising: [
                        { label: 'Early reflation' },
                        { label: 'Late-cycle pressure' },
                        { label: 'Inflation shock' },
                    ],
                }}
                levelThresholds={{ low: 3, mid: 6 }}
            />
        </div>
    );
}
