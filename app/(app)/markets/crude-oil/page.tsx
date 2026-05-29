import OilProductionCost from '@/components/markets/oil-production-cost';
import OilProvenReserves from '@/components/markets/oil-proven-reserves';
import OilConsumption from '@/components/markets/oil-consumption';
import OilProduction from '@/components/markets/oil-production';
import OilCostTierBar from '@/components/markets/oil-cost-tier';
import OilChokepoints from '@/components/markets/oil-chokepoints';
import PageHeader from '@/components/page-header';

const sections = [
    { id: 'petrodollar', label: 'Petrodollar' },
    { id: 'chokepoints', label: 'Chokepoints' },
    { id: 'production', label: 'Production' },
    { id: 'consumption', label: 'Consumption' },
    { id: 'cost-curve', label: 'Cost Curve' },
    { id: 'proven-reserves', label: 'Proven Reserves' },
    { id: 'production-cost', label: 'Production Cost' },
];

export default function CrudeOilPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <PageHeader title="Crude Oil" />

            <nav className="flex flex-wrap gap-2 mb-10">
                {sections.map(({ id, label }) => (
                    <a
                        key={id}
                        href={`#${id}`}
                        className="px-4 py-1.5 rounded-full border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                    >
                        {label}
                    </a>
                ))}
            </nav>

            <div id="petrodollar" className="mb-12 p-6 rounded-xl border bg-card">
                <h2 className="text-2xl font-bold mb-4">What the Petrodollar Actually Does</h2>
                <p className="text-muted-foreground mb-4">
                    The petrodollar system emerged after the 1970s oil crisis.
                </p>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Key structure:</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Oil is priced globally in U.S. dollars</li>
                        <li>Countries must hold dollars to buy oil</li>
                        <li>Oil exporters accumulate huge USD reserves</li>
                        <li>Those dollars get recycled into U.S. Treasuries and assets</li>
                    </ul>
                </div>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">This creates a constant loop:</h3>
                    <p className="text-muted-foreground ml-4">
                        Oil trade → Dollar demand → Treasury buying → Lower US borrowing costs
                    </p>
                </div>
                <p className="text-muted-foreground italic">
                    This is often called petrodollar recycling.
                </p>
            </div>

            <h2 id="chokepoints" className="text-2xl font-bold mb-6 dark:text-white">Chokepoints</h2>
            <OilChokepoints />

            <h2 id="production" className="text-2xl font-bold mt-12 mb-4 dark:text-white">Crude Oil Production</h2>
            <p className="text-sm text-muted-foreground mb-4">Data from 2024</p>
            <OilProduction />

            <h2 id="consumption" className="text-2xl font-bold mt-12 mb-4 dark:text-white">Crude Oil Consumption</h2>
            <p className="text-sm text-muted-foreground mb-4">Million barrels per day (2024)</p>
            <OilConsumption />

            <h2 id="cost-curve" className="text-2xl font-bold mt-12 mb-4 dark:text-white">Cost Curve</h2>
            <OilCostTierBar />

            <OilProvenReserves />

            <OilProductionCost />
        </div>
    );
}
