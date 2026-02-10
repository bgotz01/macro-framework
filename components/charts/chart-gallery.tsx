'use client';

import { useState } from 'react';
import Chart, { ChartType } from './chart';

interface ChartConfig {
    filePath: string;
    title: string;
    chartType: ChartType;
    category: string;
}

const availableCharts: ChartConfig[] = [
    {
        filePath: 'equities/SP500.csv',
        title: 'S&P 500 Companies',
        chartType: 'bar',
        category: 'Equities',
    },
    {
        filePath: 'equities/ShillerPE.csv',
        title: 'Shiller P/E Ratio',
        chartType: 'line',
        category: 'Equities',
    },
    {
        filePath: 'equities/DJI.csv',
        title: 'Dow Jones Industrial',
        chartType: 'line',
        category: 'Equities',
    },
    {
        filePath: 'bonds/USmacro.csv',
        title: 'US Macro Bonds',
        chartType: 'line',
        category: 'Bonds',
    },
];

export default function ChartGallery() {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedChartType, setSelectedChartType] = useState<ChartType | 'all'>('all');

    const categories = ['All', ...Array.from(new Set(availableCharts.map(chart => chart.category)))];
    const chartTypes: (ChartType | 'all')[] = ['all', 'line', 'bar', 'area'];

    const filteredCharts = availableCharts.filter(chart => {
        const categoryMatch = selectedCategory === 'All' || chart.category === selectedCategory;
        const typeMatch = selectedChartType === 'all' || chart.chartType === selectedChartType;
        return categoryMatch && typeMatch;
    });

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-6 rounded-2xl border border-border/50 bg-card">
                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-card-foreground">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-card-foreground">Chart Type</label>
                    <select
                        value={selectedChartType}
                        onChange={(e) => setSelectedChartType(e.target.value as ChartType | 'all')}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {chartTypes.map(type => (
                            <option key={type} value={type}>
                                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-8">
                {filteredCharts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No charts match the selected filters.</p>
                    </div>
                ) : (
                    filteredCharts.map((chart, index) => (
                        <Chart
                            key={`${chart.filePath}-${index}`}
                            filePath={chart.filePath}
                            title={chart.title}
                            chartType={chart.chartType}
                            height={400}
                            className="w-full"
                        />
                    ))
                )}
            </div>
        </div>
    );
}