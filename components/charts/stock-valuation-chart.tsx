'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/format-utils';
import { generateYearlyTicks } from '@/lib/chart-utils';

interface StockValuationChartProps {
    height?: number;
    className?: string;
}

interface ChartDataPoint {
    date: string;
    [key: string]: any;
}

const CHART_COLORS = [
    '#2563eb', '#dc2626', '#16a34a', '#ea580c', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f59e0b', '#10b981'
];

const METRICS = [
    { value: 'Price', label: 'Stock Price', units: 'dollars' },
    { value: 'Market-Cap', label: 'Market Cap', units: 'millions' },
    { value: 'PE-Ratio', label: 'P/E Ratio', units: 'ratio' },
    { value: 'PS-Ratio', label: 'P/S Ratio', units: 'ratio' },
    { value: 'EPS', label: 'Earnings Per Share', units: 'dollars' },
    { value: 'Revenue', label: 'Revenue', units: 'millions' },
    { value: 'Shares', label: 'Shares Outstanding', units: 'millions' },
    { value: 'TTM', label: 'Trailing Twelve Months EPS', units: 'dollars' }
];

const DATE_PRESETS = [
    { label: 'All Time', value: 'all' },
    { label: 'Last 5Y', value: '5y' },
    { label: 'Last 10Y', value: '10y' },
    { label: 'Custom', value: 'custom' }
];

export default function StockValuationChart({
    height = 500,
    className = ''
}: StockValuationChartProps) {
    const [availableStocks, setAvailableStocks] = useState<Array<{ series_name: string; display_name: string; asset_class: string }>>([]);
    const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<string>('PE-Ratio');
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);
    const [datePreset, setDatePreset] = useState<string>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load available stocks
    useEffect(() => {
        const loadStocks = async () => {
            try {
                const [stocksResponse, indicesResponse] = await Promise.all([
                    fetch('/api/data/stocks'),
                    fetch('/api/data/indices')
                ]);

                if (!stocksResponse.ok) {
                    throw new Error('Failed to load stocks list');
                }

                const stocksResult = await stocksResponse.json();
                const stocks = stocksResult.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name,
                    asset_class: 'stocks'
                }));

                // Add indices if available
                if (indicesResponse.ok) {
                    const indicesResult = await indicesResponse.json();
                    const indices = indicesResult.seriesInfo.map((s: any) => ({
                        series_name: s.series_name,
                        display_name: s.display_name,
                        asset_class: 'indices'
                    }));
                    const allItems = [...indices, ...stocks];
                    setAvailableStocks(allItems);

                    // Auto-select first 3 items
                    if (allItems.length > 0) {
                        setSelectedStocks(allItems.slice(0, 3).map((s: any) => s.series_name));
                    }
                } else {
                    setAvailableStocks(stocks);

                    // Auto-select first 3 stocks
                    if (stocks.length > 0) {
                        setSelectedStocks(stocks.slice(0, 3).map((s: any) => s.series_name));
                    }
                }
            } catch (err) {
                console.error('Error loading stocks:', err);
                setAvailableStocks([]);
            }
        };

        loadStocks();
    }, []);

    // Load data when stocks or metric changes
    useEffect(() => {
        if (selectedStocks.length === 0 || !selectedMetric) {
            setData([]);
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch data for all selected stocks/indices
                const responses = await Promise.all(
                    selectedStocks.map(stockName => {
                        const stock = availableStocks.find(s => s.series_name === stockName);
                        const assetClass = stock?.asset_class || 'stocks';
                        return fetch(`/api/data/${assetClass}?series=${stockName}&columns=${selectedMetric}`);
                    })
                );

                const results = await Promise.all(responses.map(r => r.json()));

                // Combine data from all stocks
                const dateMap = new Map<string, ChartDataPoint>();

                results.forEach((result, index) => {
                    const stockName = selectedStocks[index];
                    const stock = availableStocks.find(s => s.series_name === stockName);
                    const displayName = stock?.display_name || stockName;

                    result.data.forEach((point: any) => {
                        const dateKey = point.date;
                        if (!dateMap.has(dateKey)) {
                            dateMap.set(dateKey, { date: dateKey });
                        }
                        dateMap.get(dateKey)![displayName] = point[selectedMetric];
                    });
                });

                const combinedData = Array.from(dateMap.values()).sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                setData(combinedData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedStocks, selectedMetric, availableStocks]);

    // Filter data based on date range
    useEffect(() => {
        if (data.length === 0) {
            setFilteredData([]);
            return;
        }

        let filtered = [...data];

        if (datePreset === 'all') {
            setFilteredData(filtered);
            return;
        }

        let startDate: string | null = null;
        let endDate: string | null = null;

        if (datePreset === 'custom') {
            startDate = customStartDate;
            endDate = customEndDate;
        } else if (datePreset === '5y') {
            const now = new Date();
            const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            startDate = fiveYearsAgo.toISOString().split('T')[0];
            endDate = now.toISOString().split('T')[0];
        } else if (datePreset === '10y') {
            const now = new Date();
            const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
            startDate = tenYearsAgo.toISOString().split('T')[0];
            endDate = now.toISOString().split('T')[0];
        }

        if (startDate) {
            filtered = filtered.filter(d => d.date >= startDate!);
        }
        if (endDate) {
            filtered = filtered.filter(d => d.date <= endDate!);
        }

        setFilteredData(filtered);
    }, [data, datePreset, customStartDate, customEndDate]);

    const toggleStock = (stock: string) => {
        setSelectedStocks(prev =>
            prev.includes(stock)
                ? prev.filter(s => s !== stock)
                : [...prev, stock]
        );
    };

    const selectedMetricInfo = METRICS.find(m => m.value === selectedMetric);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <div className="text-center">
                        <p className="text-red-500 font-medium mb-2">Error loading data</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            );
        }

        if (selectedStocks.length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-muted-foreground">Select at least one stock to view data</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-muted-foreground">No data available</p>
                </div>
            );
        }

        const chartData = filteredData.length > 0 ? filteredData : data;
        const noDataInRange = datePreset !== 'all' && filteredData.length === 0;

        return (
            <>
                {noDataInRange && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            ⚠️ No data available for the selected date range. Showing all data instead.
                        </p>
                    </div>
                )}
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.getFullYear().toString();
                            }}
                            ticks={generateYearlyTicks(chartData)}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => {
                                if (selectedMetricInfo?.units === 'millions') {
                                    return `${(value / 1000).toFixed(0)}B`;
                                } else if (selectedMetricInfo?.units === 'dollars') {
                                    return `$${value.toFixed(0)}`;
                                }
                                return value.toFixed(1);
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#f9fafb'
                            }}
                            labelStyle={{ color: '#9ca3af' }}
                            formatter={(value: any) => {
                                if (selectedMetricInfo?.units === 'millions') {
                                    return `${(Number(value) / 1000).toFixed(2)}B`;
                                } else if (selectedMetricInfo?.units === 'dollars') {
                                    return `$${Number(value).toFixed(2)}`;
                                }
                                return Number(value).toFixed(2);
                            }}
                        />
                        <Legend wrapperStyle={{ color: '#9ca3af' }} />
                        {selectedStocks.map((stock, index) => {
                            const displayName = availableStocks.find(s => s.series_name === stock)?.display_name || stock;
                            return (
                                <Line
                                    key={stock}
                                    type="monotone"
                                    dataKey={displayName}
                                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                    strokeWidth={2}
                                    dot={false}
                                    name={displayName}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </>
        );
    };

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            {/* Controls */}
            <div className="mb-6 space-y-4">
                {/* Metric Selector */}
                <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                        Valuation Metric
                    </label>
                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {METRICS.map(metric => (
                            <option key={metric.value} value={metric.value}>
                                {metric.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Stock Selector */}
                <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                        Select Stocks (click to toggle)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availableStocks.map(stock => (
                            <button
                                key={stock.series_name}
                                onClick={() => toggleStock(stock.series_name)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStocks.includes(stock.series_name)
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {stock.display_name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-card-foreground">
                        Date Range
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {DATE_PRESETS.map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => setDatePreset(preset.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${datePreset === preset.value
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {datePreset === 'custom' && (
                        <div className="flex gap-3 mt-3">
                            <div className="flex-1">
                                <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-muted-foreground mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            {renderContent()}
        </div>
    );
}
