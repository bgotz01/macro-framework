'use client';

import { useState } from 'react';
import Chart, { TimePeriod } from './chart';

interface ChartOption {
    id: string;
    filePath: string;
    title: string;
    description: string;
    category: string;
    xAxisKey?: string;
    yAxisKey?: string;
}

const chartOptions: ChartOption[] = [
    {
        id: 'shiller-pe',
        filePath: 'equities/ShillerPE.csv',
        title: 'Shiller P/E Ratio',
        description: 'Cyclically adjusted price-to-earnings ratio over time',
        category: 'Equities',
    },
    {
        id: 'sp500-companies',
        filePath: 'equities/SP500.csv',
        title: 'S&P 500 Companies',
        description: 'Market capitalization of major S&P 500 companies',
        category: 'Equities',
        xAxisKey: 'Company',
        yAxisKey: 'Market Cap',
    },
    {
        id: 'dji',
        filePath: 'equities/DJI.csv',
        title: 'Dow Jones Industrial',
        description: 'Dow Jones Industrial Average historical data',
        category: 'Equities',
    },
    {
        id: 'us-bonds',
        filePath: 'bonds/USmacro.csv',
        title: 'US Bond Yields',
        description: 'US government bond yields across different maturities',
        category: 'Bonds',
    },
];

const timePeriodOptions: { value: TimePeriod; label: string }[] = [
    { value: '2yr', label: '2 Years' },
    { value: '5yr', label: '5 Years' },
    { value: '10yr', label: '10 Years' },
    { value: '20yr', label: '20 Years' },
    { value: 'all', label: 'All Time' },
];

export default function ChartSelector() {
    const [selectedChart, setSelectedChart] = useState<ChartOption>(chartOptions[0]);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('5yr');

    const categories = Array.from(new Set(chartOptions.map(option => option.category)));

    const handleChartChange = (chartId: string) => {
        const chart = chartOptions.find(option => option.id === chartId);
        if (chart) {
            setSelectedChart(chart);
        }
    };

    return (
        <div className="space-y-6">
            {/* Chart Selection Controls */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Data Visualization</h3>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Dataset Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Dataset</label>
                        <select
                            value={selectedChart.id}
                            onChange={(e) => handleChartChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        >
                            {categories.map(category => (
                                <optgroup key={category} label={category}>
                                    {chartOptions
                                        .filter(option => option.category === category)
                                        .map(option => (
                                            <option key={option.id} value={option.id}>
                                                {option.title}
                                            </option>
                                        ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Time Period Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Time Period</label>
                        <select
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        >
                            {timePeriodOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Time Period Quick Select Buttons */}
                <div className="mt-4">
                    <label className="text-sm font-medium text-card-foreground mb-2 block">Quick Time Selection</label>
                    <div className="flex flex-wrap gap-2">
                        {timePeriodOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTimePeriod(option.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${timePeriod === option.value
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart Description */}
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-card-foreground mb-1">{selectedChart.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{selectedChart.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Category: {selectedChart.category}</span>
                        <span>•</span>
                        <span>Period: {timePeriodOptions.find(opt => opt.value === timePeriod)?.label}</span>
                        <span>•</span>
                        <span>Type: Line Chart</span>
                    </div>
                </div>
            </div>

            {/* Single Chart Display */}
            <Chart
                key={`${selectedChart.id}-${timePeriod}`} // Force re-render when selection changes
                filePath={selectedChart.filePath}
                title={selectedChart.title}
                height={500}
                xAxisKey={selectedChart.xAxisKey}
                yAxisKey={selectedChart.yAxisKey}
                timePeriod={timePeriod}
                className="w-full"
            />
        </div>
    );
}