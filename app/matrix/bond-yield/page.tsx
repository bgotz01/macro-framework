import RegimeMatrix from '@/components/regime-matrix';

export default function BondYieldMatrixPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Bond Yield Regime Matrix</h1>
            <RegimeMatrix />
        </div>
    );
}
