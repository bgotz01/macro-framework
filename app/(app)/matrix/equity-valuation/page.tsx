import RegimeMatrix from '@/components/regime-matrix';

export default function EquityValuationMatrixPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Equity Valuation Regime Matrix</h1>
            <RegimeMatrix
                title="Equity Valuation Matrix"
                subtitle="P/E, ERP, CAPE — Valuation metrics (not price)"
                levels={[
                    { label: 'CHEAP', value: '< 15x', color: 'green' },
                    { label: 'FAIR', value: '15x – 20x', color: 'yellow' },
                    { label: 'EXPENSIVE', value: '> 20x', color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Panic / capitulation' },
                        { label: 'Correction' },
                        { label: 'Distribution' },
                    ],
                    stable: [
                        { label: 'Base building' },
                        { label: 'Range-bound' },
                        { label: 'Narrow leadership' },
                    ],
                    rising: [
                        { label: 'Bear-market rally' },
                        { label: 'Healthy advance' },
                        { label: 'Melt-up' },
                    ],
                }}
                insight="High & rising ≠ healthy. High & stable is often the most dangerous state."
                levelThresholds={{ low: 15, mid: 20 }}
                valueFormat="number"
            />
        </div>
    );
}
