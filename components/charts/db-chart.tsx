'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { formatTooltipValue, formatValue } from '@/lib/format-utils';
import { generateYearlyTicks } from '@/lib/chart-utils';

export type AssetClass = 'bonds' | 'fx' | 'equities' | 'economic' | 'moneysupply' | 'commodities' | 'volatility' | 'crypto' | 'valuations';

interface DBChartProps {
    height?: number;
    className?: string;
}

interface ChartDataPoint {
    date: string;
    [key: string]: any;
}

const CHART_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'];

const DECADE_COLORS = [
    { start: '1960-01-01', end: '1969-12-31', color: '#3b82f6', opacity: 0.05 },
    { start: '1970-01-01', end: '1979-12-31', color: '#8b5cf6', opacity: 0.05 },
    { start: '1980-01-01', end: '1989-12-31', color: '#ec4899', opacity: 0.05 },
    { start: '1990-01-01', end: '1999-12-31', color: '#f59e0b', opacity: 0.05 },
    { start: '2000-01-01', end: '2009-12-31', color: '#10b981', opacity: 0.05 },
    { start: '2010-01-01', end: '2019-12-31', color: '#06b6d4', opacity: 0.05 },
    { start: '2020-01-01', end: '2029-12-31', color: '#6366f1', opacity: 0.05 },
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

const ASSET_CLASSES: { value: AssetClass; label: string }[] = [
    { value: 'bonds', label: 'Bonds' },
    { value: 'commodities', label: 'Commodities' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'economic', label: 'Economic' },
    { value: 'equities', label: 'Equities' },
    { value: 'fx', label: 'Foreign Exchange' },
    { value: 'moneysupply', label: 'Money Supply' },
    { value: 'valuations', label: 'Valuations' },
    { value: 'volatility', label: 'Volatility' }
];

export default function DBChart({
    height = 400,
    className = ''
}: DBChartProps) {
    const [assetClass, setAssetClass] = useState<AssetClass>('bonds');
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

    // Spread/Ratio calculation state
    const [calculationMode, setCalculationMode] = useState<'none' | 'spread' | 'ratio'>('none');
    const [spreadAssetClass1, setSpreadAssetClass1] = useState<AssetClass>('economic');
    const [spreadAssetClass2, setSpreadAssetClass2] = useState<AssetClass>('bonds');
    const [spreadSeries1, setSpreadSeries1] = useState<string>('');
    const [spreadSeries2, setSpreadSeries2] = useState<string>('');
    const [availableSpreadSeries1, setAvailableSpreadSeries1] = useState<Array<{ series_name: string; display_name: string; units?: string }>>([]);
    const [availableSpreadSeries2, setAvailableSpreadSeries2] = useState<Array<{ series_name: string; display_name: string; units?: string }>>([]);
    const [spreadData, setSpreadData] = useState<ChartDataPoint[]>([]);

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

    // Load available series for spread calculation - Series 1
    useEffect(() => {
        const loadSeries = async () => {
            try {
                const response = await fetch(`/api/data/${spreadAssetClass1}`);
                if (!response.ok) {
                    throw new Error('Failed to load series list');
                }
                const result = await response.json();
                const seriesWithNames = result.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name,
                    units: s.units
                }));
                setAvailableSpreadSeries1(seriesWithNames);

                // Auto-select first series
                if (seriesWithNames.length > 0 && !spreadSeries1) {
                    setSpreadSeries1(seriesWithNames[0].series_name);
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSpreadSeries1([]);
            }
        };

        if (calculationMode !== 'none') {
            loadSeries();
        }
    }, [spreadAssetClass1, calculationMode]);

    // Load available series for spread calculation - Series 2
    useEffect(() => {
        const loadSeries = async () => {
            try {
                const response = await fetch(`/api/data/${spreadAssetClass2}`);
                if (!response.ok) {
                    throw new Error('Failed to load series list');
                }
                const result = await response.json();
                const seriesWithNames = result.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name,
                    units: s.units
                }));
                setAvailableSpreadSeries2(seriesWithNames);

                // Auto-select first series
                if (seriesWithNames.length > 0 && !spreadSeries2) {
                    setSpreadSeries2(seriesWithNames[0].series_name);
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSpreadSeries2([]);
            }
        };

        if (calculationMode !== 'none') {
            loadSeries();
        }
    }, [spreadAssetClass2, calculationMode]);

    // Load data when series changes
    useEffect(() => {
        if (!selectedSeries) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/data/${assetClass}?series=${selectedSeries}`);

                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.statusText}`);
                }

                const result = await response.json();
                setData(result.data);
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

    // Calculate spread/ratio when calculation mode is enabled
    useEffect(() => {
        if (calculationMode === 'none' || !spreadSeries1 || !spreadSeries2) {
            setSpreadData([]);
            return;
        }

        const loadCalculationData = async () => {
            try {
                setLoading(true);

                // Load both series from their respective asset classes
                const [response1, response2] = await Promise.all([
                    fetch(`/api/data/${spreadAssetClass1}?series=${encodeURIComponent(spreadSeries1)}`),
                    fetch(`/api/data/${spreadAssetClass2}?series=${encodeURIComponent(spreadSeries2)}`)
                ]);

                if (!response1.ok || !response2.ok) {
                    throw new Error('Failed to load data');
                }

                const [result1, result2] = await Promise.all([
                    response1.json(),
                    response2.json()
                ]);

                // Get units for both series
                const series1Units = availableSpreadSeries1.find(s => s.series_name === spreadSeries1)?.units;
                const series2Units = availableSpreadSeries2.find(s => s.series_name === spreadSeries2)?.units;

                // Determine result units
                // For spreads: if both have same units, keep them; otherwise no units
                // For ratios: result is unitless (ratio)
                let resultUnits: string | undefined;
                if (calculationMode === 'spread') {
                    resultUnits = (series1Units === series2Units) ? series1Units : undefined;
                } else {
                    resultUnits = 'ratio';
                }
                setSelectedUnits(resultUnits);

                // Create a map of dates to values for series 2
                const series2Map = new Map<string, number>();
                result2.data.forEach((point: ChartDataPoint) => {
                    series2Map.set(point.date, point.Value);
                });

                // Calculate spread (series1 - series2) or ratio (series1 / series2)
                const calculated = result1.data
                    .map((point: ChartDataPoint) => {
                        const value2 = series2Map.get(point.date);
                        if (value2 === undefined) return null;

                        let calculatedValue: number;
                        if (calculationMode === 'spread') {
                            calculatedValue = point.Value - value2;
                        } else { // ratio
                            calculatedValue = value2 !== 0 ? point.Value / value2 : 0;
                        }

                        return {
                            date: point.date,
                            Value: calculatedValue
                        };
                    })
                    .filter((point: ChartDataPoint | null) => point !== null) as ChartDataPoint[];

                setSpreadData(calculated);
            } catch (err) {
                setError(err instanceof Error ? err.message : `Failed to calculate ${calculationMode}`);
            } finally {
                setLoading(false);
            }
        };

        loadCalculationData();
    }, [calculationMode, spreadSeries1, spreadSeries2, spreadAssetClass1, spreadAssetClass2, availableSpreadSeries1, availableSpreadSeries2]);

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

        if (data.length === 0 && spreadData.length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-muted-foreground">No data available</p>
                </div>
            );
        }

        // Use calculated data if calculation mode is enabled, otherwise use regular data
        const sourceData = calculationMode !== 'none' ? spreadData : data;
        const sourceFilteredData = calculationMode !== 'none' ? spreadData : filteredData;
        const chartData = sourceFilteredData.length > 0 ? sourceFilteredData : sourceData;
        const noDataInRange = datePreset !== 'all' && sourceFilteredData.length === 0;

        // Get actual data range for decade bands
        const dataStartDate = chartData.length > 0 ? chartData[0].date : null;
        const dataEndDate = chartData.length > 0 ? chartData[chartData.length - 1].date : null;

        // Filter decade colors to only show within data range
        const visibleDecades = dataStartDate && dataEndDate
            ? DECADE_COLORS.filter(decade => {
                // Check if decade overlaps with data range
                return decade.end >= dataStartDate && decade.start <= dataEndDate;
            }).map(decade => ({
                ...decade,
                // Clamp decade boundaries to data range
                start: decade.start < dataStartDate ? dataStartDate : decade.start,
                end: decade.end > dataEndDate ? dataEndDate : decade.end
            }))
            : [];

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
                        {/* Decade background bands */}
                        {visibleDecades.map((decade, index) => (
                            <ReferenceArea
                                key={index}
                                x1={decade.start}
                                x2={decade.end}
                                fill={decade.color}
                                fillOpacity={decade.opacity}
                                strokeOpacity={0}
                                ifOverflow="hidden"
                            />
                        ))}

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
                        <Legend
                            wrapperStyle={{ color: '#9ca3af' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Value"
                            stroke={CHART_COLORS[0]}
                            strokeWidth={2}
                            dot={false}
                            name={calculationMode !== 'none'
                                ? `${availableSpreadSeries1.find(s => s.series_name === spreadSeries1)?.display_name || spreadSeries1} ${calculationMode === 'spread' ? '-' : '/'} ${availableSpreadSeries2.find(s => s.series_name === spreadSeries2)?.display_name || spreadSeries2}`
                                : selectedSeries.replace('.csv', '').replace(/[-_]/g, ' ')
                            }
                        />
                    </LineChart>
                </ResponsiveContainer>
            </>
        );
    };

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            {/* Controls */}
            <div className="mb-6 space-y-4">
                {/* Calculation Mode Selector */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <label className="text-sm font-medium text-card-foreground">
                        Calculation Mode:
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCalculationMode('none')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${calculationMode === 'none'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Single Series
                        </button>
                        <button
                            onClick={() => setCalculationMode('spread')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${calculationMode === 'spread'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Spread (S1 - S2)
                        </button>
                        <button
                            onClick={() => setCalculationMode('ratio')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${calculationMode === 'ratio'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Ratio (S1 / S2)
                        </button>
                    </div>
                </div>

                {calculationMode !== 'none' ? (
                    /* Spread Mode: Two Series Selectors with Asset Classes */
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-card-foreground mb-2">
                                    Asset Class 1
                                </label>
                                <select
                                    value={spreadAssetClass1}
                                    onChange={(e) => {
                                        setSpreadAssetClass1(e.target.value as AssetClass);
                                        setSpreadSeries1(''); // Reset series selection
                                    }}
                                    className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {ASSET_CLASSES.map(ac => (
                                        <option key={ac.value} value={ac.value}>
                                            {ac.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-card-foreground mb-2">
                                    Series 1
                                </label>
                                <select
                                    value={spreadSeries1}
                                    onChange={(e) => setSpreadSeries1(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    disabled={availableSpreadSeries1.length === 0}
                                >
                                    {availableSpreadSeries1.map(series => (
                                        <option key={series.series_name} value={series.series_name}>
                                            {series.display_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-card-foreground mb-2">
                                    Asset Class 2
                                </label>
                                <select
                                    value={spreadAssetClass2}
                                    onChange={(e) => {
                                        setSpreadAssetClass2(e.target.value as AssetClass);
                                        setSpreadSeries2(''); // Reset series selection
                                    }}
                                    className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {ASSET_CLASSES.map(ac => (
                                        <option key={ac.value} value={ac.value}>
                                            {ac.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-card-foreground mb-2">
                                    Series 2
                                </label>
                                <select
                                    value={spreadSeries2}
                                    onChange={(e) => setSpreadSeries2(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    disabled={availableSpreadSeries2.length === 0}
                                >
                                    {availableSpreadSeries2.map(series => (
                                        <option key={series.series_name} value={series.series_name}>
                                            {series.display_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Single Series Mode: Asset Class and Series Selector */
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
                )}

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

                {/* Info */}
                {data.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">
                            {filteredData.length > 0 ? filteredData.length : data.length} data points
                            {filteredData.length > 0 && filteredData.length !== data.length && (
                                <span className="text-xs ml-1">of {data.length} total</span>
                            )}
                            {datePreset !== 'all' && filteredData.length === 0 && (
                                <span className="text-xs ml-1 text-yellow-600 dark:text-yellow-400">
                                    (no data in range)
                                </span>
                            )}
                        </p>
                        <p className="text-muted-foreground">
                            {filteredData.length > 0
                                ? `${filteredData[0]?.date} to ${filteredData[filteredData.length - 1]?.date}`
                                : `${data[0]?.date} to ${data[data.length - 1]?.date}`
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Chart */}
            {renderContent()}
        </div>
    );
}
