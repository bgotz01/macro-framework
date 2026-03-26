import DataTable from '@/components/data-table';

export default function CrudeOilPage() {
    const chokepointsColumns = [
        { key: 'location', label: 'Location', align: 'left' as const },
        { key: 'y2020', label: '2020', align: 'right' as const },
        { key: 'y2021', label: '2021', align: 'right' as const },
        { key: 'y2022', label: '2022', align: 'right' as const },
        { key: 'y2023', label: '2023', align: 'right' as const },
        { key: 'y2024', label: '2024', align: 'right' as const },
        { key: 'h1_2025', label: '1H25', align: 'right' as const },
    ];

    const chokepointsData = [
        { location: 'Strait of Malacca', y2020: '22.8', y2021: '22.1', y2022: '23.0', y2023: '24.0', y2024: '22.5', h1_2025: '23.2' },
        { location: 'Strait of Hormuz', y2020: '19.2', y2021: '19.7', y2022: '21.9', y2023: '21.8', y2024: '20.7', h1_2025: '20.9' },
        { location: 'Suez Canal and SUMED Pipeline', y2020: '5.4', y2021: '5.2', y2022: '7.3', y2023: '8.8', y2024: '4.8', h1_2025: '4.9' },
        { location: 'Bab el-Mandeb', y2020: '5.7', y2021: '6.0', y2022: '8.0', y2023: '9.3', y2024: '4.1', h1_2025: '4.2' },
        { location: <span>Danish Straits<sup>a</sup></span>, y2020: '3.1', y2021: '3.1', y2022: '4.2', y2023: '5.0', y2024: '4.9', h1_2025: '4.9' },
        { location: 'Turkish Straits (Dardanelles)', y2020: '3.2', y2021: '3.3', y2022: '3.2', y2023: '3.5', y2024: '3.6', h1_2025: '3.7' },
        { location: <span>Panama Canal<sup>b</sup></span>, y2020: '1.7', y2021: '1.8', y2022: '2.2', y2023: '2.2', y2024: '2.0', h1_2025: '2.3' },
        { location: 'Cape of Good Hope', y2020: '7.9', y2021: '7.2', y2022: '6.1', y2023: '6.2', y2024: '9.3', h1_2025: '9.1' },
    ];

    const chokepointsSummary = [
        { location: 'World maritime oil trade', y2020: '74.1', y2021: '75.9', y2022: '78.6', y2023: '80.2', y2024: '79.7', h1_2025: '79.8' },
        { location: 'World total oil supply', y2020: '94.1', y2021: '95.8', y2022: '100.6', y2023: '102.6', y2024: '103.3', h1_2025: '104.4' },
    ];

    const productionColumns = [
        { key: 'country', label: 'Country', align: 'left' as const },
        { key: 'volume', label: 'Million barrels per day', align: 'right' as const },
        { key: 'share', label: 'Share of world total', align: 'right' as const },
    ];

    const productionData = [
        { country: 'United States', volume: '21.91', share: '22%' },
        { country: 'Saudi Arabia', volume: '11.13', share: '11%' },
        { country: 'Russia', volume: '10.75', share: '11%' },
        { country: 'Canada', volume: '5.76', share: '6%' },
        { country: 'China', volume: '5.26', share: '5%' },
        { country: 'Iraq', volume: '4.42', share: '4%' },
        { country: 'Brazil', volume: '4.28', share: '4%' },
        { country: 'United Arab Emirates', volume: '4.16', share: '4%' },
        { country: 'Iran', volume: '3.99', share: '4%' },
        { country: 'Kuwait', volume: '2.91', share: '3%' },
    ];

    const productionSummary = [
        { country: 'Total top 10', volume: '74.59', share: '73%' },
        { country: 'World total', volume: '101.81', share: '—' },
    ];

    const consumptionColumns = [
        { key: 'country', label: 'Country', align: 'left' as const },
        { key: 'y2019', label: '2019', align: 'right' as const },
        { key: 'y2020', label: '2020', align: 'right' as const },
        { key: 'y2021', label: '2021', align: 'right' as const },
        { key: 'y2022', label: '2022', align: 'right' as const },
        { key: 'y2023', label: '2023', align: 'right' as const },
        { key: 'share', label: 'Share of world total', align: 'right' as const },
    ];

    const consumptionData = [
        { country: 'United States', y2019: '20.54', y2020: '18.19', y2021: '19.89', y2022: '20.01', y2023: '20.28', share: '20%' },
        { country: 'China', y2019: '13.98', y2020: '13.98', y2021: '15.29', y2022: '15.23', y2023: '15.98', share: '16%' },
        { country: 'India', y2019: '4.92', y2020: '4.56', y2021: '4.73', y2022: '5.13', y2023: '5.38', share: '5%' },
        { country: 'Russia', y2019: '3.71', y2020: '3.47', y2021: '3.64', y2022: '3.70', y2023: '3.70', share: '4%' },
        { country: 'Saudi Arabia', y2019: '3.47', y2020: '3.30', y2021: '3.39', y2022: '3.54', y2023: '3.59', share: '4%' },
        { country: 'Japan', y2019: '3.75', y2020: '3.35', y2021: '3.40', y2022: '3.34', y2023: '3.29', share: '3%' },
        { country: 'Brazil', y2019: '3.02', y2020: '2.84', y2021: '2.97', y2022: '3.08', y2023: '3.16', share: '3%' },
        { country: 'Canada', y2019: '2.56', y2020: '2.26', y2021: '2.29', y2022: '2.40', y2023: '2.45', share: '2%' },
        { country: 'South Korea', y2019: '2.60', y2020: '2.45', y2021: '2.56', y2022: '2.53', y2023: '2.42', share: '2%' },
        { country: 'Germany', y2019: '2.35', y2020: '2.15', y2021: '2.13', y2022: '2.17', y2023: '2.05', share: '2%' },
    ];

    const consumptionSummary = [
        { country: 'Total top 10', y2019: '60.90', y2020: '54.55', y2021: '58.29', y2022: '59.13', y2023: '60.30', share: '60%' },
        { country: 'World total', y2019: '100.67', y2020: '91.27', y2021: '97.23', y2022: '99.56', y2023: '101.25', share: '—' },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="page-title text-3xl font-bold mb-6 dark:text-white">Crude Oil</h1>

            <div className="mb-12 p-6 rounded-xl border bg-card">
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

            <h2 className="text-2xl font-bold mb-6 dark:text-white">Chokepoints</h2>

            <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                    Crude oil volume transported through major maritime chokepoints (million barrels per day)
                </p>
            </div>

            <DataTable
                columns={chokepointsColumns}
                data={chokepointsData}
                summaryRows={chokepointsSummary}
            />

            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2"><sup>a</sup> The Danish Straits do not include flows through the Kiel Canal.</p>
                <p><sup>b</sup> Data for the Panama Canal are by fiscal year (October 1 to September 30).</p>
                <p className="mt-2">Data source: U.S. Energy Information Administration (EIA)</p>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6 dark:text-white">Crude Oil Production</h2>

            <div className="mb-4">
                <p className="text-sm text-muted-foreground">Data from 2023</p>
            </div>

            <DataTable
                columns={productionColumns}
                data={productionData}
                summaryRows={productionSummary}
            />

            <h2 className="text-2xl font-bold mt-12 mb-6 dark:text-white">Crude Oil Consumption</h2>

            <div className="mb-4">
                <p className="text-sm text-muted-foreground">Million barrels per day (2019-2023)</p>
            </div>

            <DataTable
                columns={consumptionColumns}
                data={consumptionData}
                summaryRows={consumptionSummary}
            />
        </div>
    );
}
