import DataTable from '@/components/data-table';

const cheapColumns = [
    { key: 'country', label: 'Country', align: 'left' as const },
    { key: 'cost', label: 'Cost ($/barrel)', align: 'right' as const },
    { key: 'notes', label: 'Notes', align: 'left' as const },
];

const cheapData = [
    { country: 'Saudi Arabia', cost: '$8–15', notes: 'Lowest-cost globally, huge onshore fields' },
    { country: 'Iran', cost: '~$9–20', notes: 'Similar geology to Saudi' },
    { country: 'Iraq', cost: '~$10–20', notes: 'Very cheap extraction' },
    { country: 'Kuwait / UAE', cost: '~$10–25', notes: 'Low-cost Gulf production' },
    { country: 'Russia', cost: '~$15–30', notes: 'Cheap but harsher environment' },
];

const midColumns = [
    { key: 'country', label: 'Country', align: 'left' as const },
    { key: 'cost', label: 'Cost ($/barrel)', align: 'right' as const },
    { key: 'notes', label: 'Notes', align: 'left' as const },
];

const midData = [
    { country: 'United States (conventional)', cost: '~$20–40', notes: 'Mature fields' },
    { country: 'United States (shale)', cost: '~$40–60', notes: 'Higher due to drilling/fracking' },
    { country: 'Brazil (offshore)', cost: '~$30–50', notes: 'Deepwater complexity' },
    { country: 'Norway', cost: '~$20–40', notes: 'Offshore + high labor costs' },
    { country: 'Nigeria', cost: '~$25–40', notes: 'Logistics + security costs' },
];

const expensiveColumns = [
    { key: 'country', label: 'Country', align: 'left' as const },
    { key: 'cost', label: 'Cost ($/barrel)', align: 'right' as const },
    { key: 'notes', label: 'Notes', align: 'left' as const },
];

const expensiveData = [
    { country: 'Canada (oil sands)', cost: '~$60–85+', notes: 'Among the most expensive' },
    { country: 'Venezuela (heavy oil)', cost: '~$60–80+', notes: 'Thick crude, hard to refine' },
    { country: 'UK (North Sea)', cost: '~$40–60', notes: 'Aging fields' },
    { country: 'China', cost: '~$70–90', notes: 'Difficult geology' },
];

export default function OilProductionCost() {
    return (
        <div id="production-cost" className="mt-12">
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Oil Production Cost by Country</h2>
            <p className="text-sm text-muted-foreground mb-8">Approximate cost per barrel (USD)</p>

            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🟢</span>
                    <h3 className="text-lg font-semibold">Cheapest Producers</h3>
                    <span className="text-sm text-muted-foreground">(easy conventional oil)</span>
                </div>
                <DataTable columns={cheapColumns} data={cheapData} />
                <p className="mt-3 text-sm text-muted-foreground">
                    These countries sit on large, pressurized reservoirs — oil flows easily.
                </p>
            </div>

            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🟡</span>
                    <h3 className="text-lg font-semibold">Mid-Cost Producers</h3>
                </div>
                <DataTable columns={midColumns} data={midData} />
                <p className="mt-3 text-sm text-muted-foreground">
                    These require more engineering, offshore drilling, or tighter rock formations.
                </p>
            </div>

            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🔴</span>
                    <h3 className="text-lg font-semibold">Expensive Producers</h3>
                    <span className="text-sm text-muted-foreground">(difficult oil)</span>
                </div>
                <DataTable columns={expensiveColumns} data={expensiveData} />
                <p className="mt-3 text-sm text-muted-foreground">
                    These need mining-like processes, heating, or complex offshore rigs.
                </p>
            </div>
        </div>
    );
}
