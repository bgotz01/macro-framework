'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/format-utils';

export type AssetClass = 'bonds' | 'fx' | 'equities' | 'economic' | 'moneysupply' | 'commodities' | 'volatility' | 'crypto';

interface MADBChartProps {
    height?: number;
    className?: string;
}

interface ChartDataPoint {
    date: string;
    Value?: number;
    MA12?: number;
    MA252?: number;
}

const ASSET_CLASSES: { value: AssetClass; label: string }[] = [
    { value: 'bonds', label: 'Bonds' },
    { value: 'commodities', label: 'Commodities' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'economic', label: 'Economic' },
    { value: 'equities', label: 'Equities' },
    { value: 'fx', label: 'Foreign Exchange' },
    { value: 'volatility', label: 'Volatility' }
];

const DATE_PRESETS: Array<
    | { label: string; value: string }
    | { label: string; value: string; start: string; end: string }
> = [
        { label: 'All Time', value: 'all' },
        { label: '1960s', value: '1960s', start: '1960-01-01', end: '1969-12-31' },
        { label: '1970s', value: '1970s', start: '1970-01-01', end: '1979-12-31' },
        { label: '1980s', value: '1980s', start: '1980-01-01', end: '1989-12-31' },
        { label: '1990s', value: '1990s', start: '1990-01-01', end: '1999-12-31' },
        { label: '2000s', value: '2000s', start: '2000-01-01', end: '2009-12-31' },
        { label: '2010s', value: '2010s', start: '2010-01-01', end: '2019-12-31' },
        { label: '2020s', value: '2020s', start: '2020-01-01', end: '2029-12-31' },
        { label: 'Last 5Y', value: '5y' },
        { label: 'Last 10Y', value: '10y' },
        { label: 'Custom', value: 'custom' },
    ];

export default function MADBChart({
    height = 500,
    className = ''
}: MADBChartProps) {
    const [assetClass, setAssetClass] = useState<AssetClass>('economic');
    const [availableSeries, setAvailableSeries] = useState<Array<{ series_name: string; display_name: string; units?: string }>>([]);
    const [selectedSeries, setSelectedSeries] = useState<string>('');
    const [selectedUnits, setSelectedUnits] = useState<string | undefined>(undefined);
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);
    const [datePreset, setDatePreset] = useState<string>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load available series when asset class changes
    useEffect(() => {
        const loadSeries = async () => {
            try {
                const response = await fetch(`/api/data/${assetClass}`);
                if (!response.ok) {
                    throw new Error('Failed to load series list');
                }
                const result = await response.json();
                const seriesWithNames = result.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name,
                    units: s.units
                }));
                setAvailableSeries(seriesWithNames);

                // Auto-select first series
                if (seriesWithNames.length > 0) {
                    setSelectedSeries(seriesWithNames[0].series_name);
                    setSelectedUnits(seriesWithNames[0].units);
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSeries([]);
            }
        };

        loadSeries();
    }, [assetClass]);

    // Load data when series changes
    useEffect(() => {
        if (!selectedSeries) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try to fetch both MA12 and MA252 - the API will return whichever exists
                const response = await fetch(`/api/data/${assetClass}?series=${selectedSeries}&columns=Value,Value_MA12,Value_MA252`);

                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.statusText}`);
                }

                const result = await response.json();

                // Transform data to include Value and whichever MA is available
                const transformedData = result.data.map((point: any) => ({
                    date: point.date,
                    Value: point.Value,
                    MA12: point.Value_MA12,  // Monthly 12-period MA
                    MA252: point.Value_MA252  // Daily 252-period MA
                }));

                setData(transformedData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [assetClass, selectedSeries]);

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
        } else {
            // Decade preset
            const preset = DATE_PRESETS.find(p => p.value === datePreset);
            if (preset && 'start' in preset && preset.start && preset.end) {
                startDate = preset.start;
                endDate = preset.end;
            }
        }

        if (startDate) {
            filtered = filtered.filter(d => d.date >= startDate!);
        }
        if (endDate) {
            filtered = filtered.filter(d => d.date <= endDate!);
        }

        setFilteredData(filtered);
    }, [data, datePreset, customStartDate, customEndDate]);

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
                                return `${date.getMonth() + 1}/${date.getFullYear()}`;
                            }}
                            interval={Math.floor(chartData.length / 10)}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => {
                                // For Y-axis, use compact formatting
                                if (selectedUnits === 'billions') {
                                    return `${(value / 1).toFixed(0)}B`;
                                } else if (selectedUnits === 'millions') {
                                    return `${(value / 1).toFixed(0)}M`;
                                } else if (selectedUnits === 'percent') {
                                    return `${value.toFixed(1)}%`;
                                } else if (selectedUnits === 'index' || selectedUnits === 'usd') {
                                    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
                                } else {
                                    return value.toFixed(2);
                                }
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
                            formatter={(value: any) => formatTooltipValue(Number(value), selectedUnits)}
                        />
                        <Legend wrapperStyle={{ color: '#9ca3af' }} />
                        <Line
                            type="monotone"
                            dataKey="Value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            name="Value"
                        />
                        {chartData.some(d => d.MA12 !== undefined) && (
                            <Line
                                type="monotone"
                                dataKey="MA12"
                                stroke="#a855f7"
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="5 5"
                                name="MA 12mo"
                            />
                        )}
                        {chartData.some(d => d.MA252 !== undefined) && (
                            <Line
                                type="monotone"
                                dataKey="MA252"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="5 5"
                                name="MA 252d"
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 text-sm text-muted-foreground">
                    {filteredData.length > 0 ? filteredData.length : data.length} data points
                    {filteredData.length > 0 && filteredData.length !== data.length && (
                        <span className="text-xs ml-1">of {data.length} total</span>
                    )}
                    {data.length > 0 && (
                        <span className="ml-4">
                            {filteredData.length > 0
                                ? `${filteredData[0]?.date} to ${filteredData[filteredData.length - 1]?.date}`
                                : `${data[0]?.date} to ${data[data.length - 1]?.date}`
                            }
                        </span>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            {/* Controls */}
            <div className="mb-6 space-y-4">
                <div className="flex gap-4">
                    {/* Asset Class Selector */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                            Asset Class
                        </label>
                        <select
                            value={assetClass}
                            onChange={(e) => setAssetClass(e.target.value as AssetClass)}
                            className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {ASSET_CLASSES.map(ac => (
                                <option key={ac.value} value={ac.value}>
                                    {ac.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Series Selector */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                            Time Series
                        </label>
                        <select
                            value={selectedSeries}
                            onChange={(e) => {
                                setSelectedSeries(e.target.value);
                                const series = availableSeries.find(s => s.series_name === e.target.value);
                                setSelectedUnits(series?.units);
                            }}
                            className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={availableSeries.length === 0}
                        >
                            {availableSeries.map(series => (
                                <option key={series.series_name} value={series.series_name}>
                                    {series.display_name}
                                </option>
                            ))}
                        </select>
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

                    {/* Custom Date Inputs */}
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
