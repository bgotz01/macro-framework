import DataTable from '@/components/data-table';

const columns = [
    { key: 'country', label: 'Country', align: 'left' as const },
    { key: 'reserves', label: 'Proven Reserves (Bn bbl)', align: 'right' as const },
    { key: 'share', label: '% of World', align: 'right' as const },
    { key: 'cost', label: 'Cost ($/barrel)', align: 'right' as const },
    { key: 'type', label: 'Type of Oil', align: 'left' as const },
];

const data = [
    { country: 'Venezuela', reserves: '303', share: '~17%', cost: '$60–80+', type: 'Heavy (Orinoco)' },
    { country: 'Saudi Arabia', reserves: '267', share: '~15%', cost: '$8–15', type: 'Light, easy' },
    { country: 'Iran', reserves: '209', share: '~12%', cost: '$10–20', type: 'Conventional' },
    { country: 'Canada', reserves: '163', share: '~9%', cost: '$60–85+', type: 'Oil sands' },
    { country: 'Iraq', reserves: '145', share: '~8%', cost: '$10–20', type: 'Very easy' },
    { country: 'UAE', reserves: '113', share: '~6%', cost: '$10–25', type: 'Easy' },
    { country: 'Kuwait', reserves: '102', share: '~6%', cost: '$10–25', type: 'Easy' },
    { country: 'Russia', reserves: '80–107', share: '~5%', cost: '$15–30', type: 'Mixed' },
    { country: 'United States', reserves: '74–84', share: '~5%', cost: '$40–60', type: 'Tight oil (shale)' },
    { country: 'Libya', reserves: '48', share: '~3%', cost: '$10–25', type: 'High quality' },
    { country: 'Nigeria', reserves: '37', share: '~2%', cost: '$25–40', type: 'Offshore/onshore' },
    { country: 'Kazakhstan', reserves: '30', share: '~2%', cost: '$20–40', type: 'Mixed' },
    { country: 'Qatar', reserves: '25', share: '~1%', cost: '$10–20', type: 'Easy' },
    { country: 'China', reserves: '28', share: '~2%', cost: '$70–90', type: 'Difficult' },
    { country: 'Brazil', reserves: '16', share: '<1%', cost: '$30–50', type: 'Deepwater' },
];

export default function OilProvenReserves() {
    return (
        <div id="proven-reserves" className="mt-12">
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Proven Oil Reserves</h2>
            <p className="text-sm text-muted-foreground mb-6">Top countries by proven reserves with extraction cost and oil type</p>
            <DataTable columns={columns} data={data} />
        </div>
    );
}
