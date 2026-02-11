export default function RegimeComparisonTable() {
    const data = [
        { variable: 'Debt', '1970s': 'Moderate', '1990s': 'Rising', '2020s': 'Extreme' },
        { variable: 'Trust', '1970s': 'High', '1990s': 'Medium', '2020s': 'Low' },
        { variable: 'Tech', '1970s': 'Early digital', '1990s': 'Internet', '2020s': 'AI cognition' },
        { variable: 'Info speed', '1970s': 'Slow', '1990s': 'Fast', '2020s': 'Instant' },
        { variable: 'Inequality', '1970s': 'Lower', '1990s': 'Rising', '2020s': 'Extreme' },
        { variable: 'Valuations', '1970s': 'Cyclical', '1990s': 'Elevated', '2020s': 'Concentrated + extreme' },
    ]

    return (
        <div className="my-8 overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                        <th className="text-left py-3 px-4 font-semibold">Variable</th>
                        <th className="text-left py-3 px-4 font-semibold">1970s</th>
                        <th className="text-left py-3 px-4 font-semibold">1990s</th>
                        <th className="text-left py-3 px-4 font-semibold bg-blue-50 dark:bg-blue-900/20">2020s</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr
                            key={row.variable}
                            className={`border-b border-gray-200 dark:border-gray-700 ${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                                }`}
                        >
                            <td className="py-3 px-4 font-medium">{row.variable}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row['1970s']}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row['1990s']}</td>
                            <td className="py-3 px-4 font-semibold bg-blue-50 dark:bg-blue-900/20">{row['2020s']}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
