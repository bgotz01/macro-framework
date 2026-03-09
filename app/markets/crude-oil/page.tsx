import DataTable from '@/components/data-table';

export default function CrudeOilPage() {
    const chokepointsColumns = [
        { key: 'location', label: 'Location', align: 'left' as const },
        { key: 'country', label: 'Country', align: 'left' as const },
        { key: 'y2018', label: '2018', align: 'right' as const },
        { key: 'y2019', label: '2019', align: 'right' as const },
        { key: 'y2020', label: '2020', align: 'right' as const },
        { key: 'y2021', label: '2021', align: 'right' as const },
        { key: 'y2022', label: '2022', align: 'right' as const },
        { key: 'y2023', label: '2023', align: 'right' as const },
    ];

    const chokepointsData = [
        { location: 'Strait of Malacca', country: 'Malaysia/Indonesia/Singapore', y2018: '23.0', y2019: '23.1', y2020: '22.8', y2021: '21.9', y2022: '22.9', y2023: '23.7' },
        { location: 'Strait of Hormuz', country: 'Iran/Oman', y2018: '21.4', y2019: '20.0', y2020: '18.4', y2021: '19.0', y2022: '21.1', y2023: '20.9' },
        { location: 'Suez Canal and SUMED Pipeline', country: 'Egypt', y2018: '6.4', y2019: '6.2', y2020: '5.3', y2021: '5.1', y2022: '7.3', y2023: '8.8' },
        { location: 'Bab el-Mandeb', country: 'Yemen/Djibouti', y2018: '6.4', y2019: '6.0', y2020: '5.2', y2021: '5.4', y2022: '7.5', y2023: '8.6' },
        { location: <span>Danish Straits<sup>a</sup></span>, country: 'Denmark', y2018: '3.3', y2019: '3.4', y2020: '3.1', y2021: '3.1', y2022: '4.2', y2023: '4.9' },
        { location: 'Turkish Straits (Dardanelles)', country: 'Turkey', y2018: '3.4', y2019: '3.5', y2020: '3.3', y2021: '3.4', y2022: '3.2', y2023: '3.4' },
        { location: <span>Panama Canal<sup>b</sup></span>, country: 'Panama', y2018: '1.4', y2019: '1.5', y2020: '1.7', y2021: '1.8', y2022: '2.1', y2023: '2.1' },
        { location: 'Cape of Good Hope', country: 'South Africa', y2018: '7.6', y2019: '7.5', y2020: '7.7', y2021: '7.0', y2022: '5.9', y2023: '6.0' },
    ];

    const chokepointsSummary = [
        { location: 'World maritime oil trade', country: '—', y2018: '78.5', y2019: '78.2', y2020: '73.0', y2021: '74.3', y2022: '76.2', y2023: '77.5' },
        { location: 'World total oil supply', country: '—', y2018: '100.1', y2019: '100.9', y2020: '91.6', y2021: '97.6', y2022: '99.9', y2023: '101.9' },
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
            <h1 className="page-title text-3xl font-bold mb-6 dark:text-white">Chokepoints</h1>

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
                <p className="mb-2"><sup>a</sup> Danish Straits include the Great Belt, Little Belt, and Øresund passages</p>
                <p><sup>b</sup> Panama Canal data represents petroleum and petroleum products</p>
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
