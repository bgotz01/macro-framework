'use client';

import { useState } from 'react';

export type ChartType = 'yields' | 'economics' | 'equities' | 'returns' | 'all';

interface ChartNavigationProps {
    onChartChange: (chartType: ChartType) => void;
    currentChart: ChartType;
}

const CHART_TYPES: Array<{ value: ChartType; label: string; description: string }> = [
    {
        value: 'yields',
        label: 'Yields & Rates',
        description: 'Bond yields, Fed Funds, CPI, and yield spreads'
    },
    {
        value: 'economics',
        label: 'Economic Data',
        description: 'GDP, debt, money supply, and consumption'
    },
    {
        value: 'equities',
        label: 'Equities & Markets',
        description: 'Stock indices, commodities, and volatility'
    },
    {
        value: 'returns',
        label: 'Cyclical Returns',
        description: '2Y, 5Y, and 10Y rolling returns for markets'
    },
    {
        value: 'all',
        label: 'All Data',
        description: 'Access all available time series'
    }
];

export default function ChartNavigation({ onChartChange, currentChart }: ChartNavigationProps) {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {CHART_TYPES.map((chart) => (
                    <button
                        key={chart.value}
                        onClick={() => onChartChange(chart.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${currentChart === chart.value
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border/50 bg-card hover:border-primary/50 hover:shadow-sm'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className={`font-semibold ${currentChart === chart.value
                                ? 'text-primary'
                                : 'text-card-foreground'
                                }`}>
                                {chart.label}
                            </h3>
                            {currentChart === chart.value && (
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {chart.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
