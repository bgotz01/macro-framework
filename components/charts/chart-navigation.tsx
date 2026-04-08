'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type ChartType = 'yields' | 'economics' | 'equities' | 'commodities' | 'valuations' | 'fx' | 'returns' | 'volatility' | 'stocks' | 'percentile' | 'divergence' | 'all';

const CHART_TYPES: Array<{ value: ChartType; label: string; description: string }> = [
    { value: 'yields', label: 'Yields & Rates', description: 'Bond yields, Fed Funds, CPI, and yield spreads' },
    { value: 'economics', label: 'Economic Data', description: 'GDP, debt, money supply, and consumption' },
    { value: 'equities', label: 'Equities & Markets', description: 'Stock indices, commodities, and volatility' },
    { value: 'commodities', label: 'Commodities', description: 'Crude oil, gold, silver, copper, grains, and natural gas' },
    { value: 'valuations', label: 'Valuations', description: 'P/E ratios and valuation metrics' },
    { value: 'fx', label: 'FX & Currencies', description: 'Currency pairs and exchange rates' },
    { value: 'returns', label: 'Cyclical Returns', description: '2Y, 5Y, and 10Y rolling returns for markets' },
    { value: 'volatility', label: 'Volatility', description: '63, 126, and 252-day rolling volatility for equities' },
    { value: 'stocks', label: 'Stock Valuations', description: 'Individual stock metrics for major tech companies' },
    { value: 'percentile', label: 'Percentile Analysis', description: 'Historical percentile rankings and trends' },
    { value: 'divergence', label: 'MA Divergence', description: 'S&P 500 price divergence from moving averages' },
    { value: 'all', label: 'All Data', description: 'Access all available time series' },
];

export { CHART_TYPES };

export default function ChartNavigation() {
    const pathname = usePathname();

    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CHART_TYPES.map((chart) => {
                    const href = `/chart/${chart.value}`;
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={chart.value}
                            href={href}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${isActive
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border/50 bg-card hover:border-primary/50 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className={`font-semibold ${isActive ? 'text-primary' : 'text-card-foreground'}`}>
                                    {chart.label}
                                </h3>
                                {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{chart.description}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
