import DataTable from '@/components/data-table';

const columns = [
    { key: 'location', label: 'Location', align: 'left' as const },
    { key: 'y2020', label: '2020', align: 'right' as const },
    { key: 'y2021', label: '2021', align: 'right' as const },
    { key: 'y2022', label: '2022', align: 'right' as const },
    { key: 'y2023', label: '2023', align: 'right' as const },
    { key: 'y2024', label: '2024', align: 'right' as const },
    { key: 'h1_2025', label: '1H25', align: 'right' as const },
    { key: 'pct', label: '% of Maritime', align: 'right' as const },
];

const data = [
    { location: 'Strait of Malacca', y2020: '22.8', y2021: '22.1', y2022: '23.0', y2023: '24.0', y2024: '22.5', h1_2025: '23.2', pct: '28%' },
    { location: 'Strait of Hormuz', y2020: '19.2', y2021: '19.7', y2022: '21.9', y2023: '21.8', y2024: '20.7', h1_2025: '20.9', pct: '26%' },
    { location: 'Suez Canal and SUMED Pipeline', y2020: '5.4', y2021: '5.2', y2022: '7.3', y2023: '8.8', y2024: '4.8', h1_2025: '4.9', pct: '6%' },
    { location: 'Bab el-Mandeb', y2020: '5.7', y2021: '6.0', y2022: '8.0', y2023: '9.3', y2024: '4.1', h1_2025: '4.2', pct: '5%' },
    { location: <span>Danish Straits<sup>a</sup></span>, y2020: '3.1', y2021: '3.1', y2022: '4.2', y2023: '5.0', y2024: '4.9', h1_2025: '4.9', pct: '6%' },
    { location: 'Turkish Straits (Dardanelles)', y2020: '3.2', y2021: '3.3', y2022: '3.2', y2023: '3.5', y2024: '3.6', h1_2025: '3.7', pct: '5%' },
    { location: <span>Panama Canal<sup>b</sup></span>, y2020: '1.7', y2021: '1.8', y2022: '2.2', y2023: '2.2', y2024: '2.0', h1_2025: '2.3', pct: '3%' },
    { location: 'Cape of Good Hope', y2020: '7.9', y2021: '7.2', y2022: '6.1', y2023: '6.2', y2024: '9.3', h1_2025: '9.1', pct: '12%' },
];

const summary = [
    { location: 'World maritime oil trade', y2020: '74.1', y2021: '75.9', y2022: '78.6', y2023: '80.2', y2024: '79.7', h1_2025: '79.8', pct: '100%' },
    { location: 'World total oil supply', y2020: '94.1', y2021: '95.8', y2022: '100.6', y2023: '102.6', y2024: '103.3', h1_2025: '104.4', pct: '—' },
];

export default function OilChokepoints() {
    return (
        <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Crude oil volume transported through major maritime chokepoints (million barrels per day)
            </p>
            <DataTable columns={columns} data={data} summaryRows={summary} />
            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2"><sup>a</sup> The Danish Straits do not include flows through the Kiel Canal.</p>
                <p><sup>b</sup> Data for the Panama Canal are by fiscal year (October 1 to September 30).</p>
                <p className="mt-2">Data source: U.S. Energy Information Administration (EIA)</p>
            </div>
        </div>
    );
}
