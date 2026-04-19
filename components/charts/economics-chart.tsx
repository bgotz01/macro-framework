'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { formatTooltipValue } from '@/lib/format-utils';
import { generateYearlyTicks } from '@/lib/chart-utils';
import { getResponsiveHeight, getResponsiveMargin, getResponsiveFontSize, getResponsiveYAxisWidth } from '@/lib/responsive-chart-utils';

interface EconomicsChartProps {
    height?: number;
    className?: string;
}

interface ChartDataPoint {
    date: string;
    [key: string]: any;
}

const CHART_COLORS = ['#2563eb', '#dc2626'];

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

export default function EconomicsChart({
    height = 400,
    className = ''
}: EconomicsChartProps) {
    const [availableSeries, setAvailableSeries] = useState<Array<{ series_name: string; display_name: string; units?: string; geography?: string }>>([]);
    const [selectedSeries, setSelectedSeries] = useState<string>('');
    const [selectedUnits, setSelectedUnits] = useState<string | undefined>(undefined);
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);
    const [datePreset, setDatePreset] = useState<string>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [responsiveHeight, setResponsiveHeight] = useState(height);

    useEffect(() => {
        const handleResize = () => {
            setResponsiveHeight(getResponsiveHeight(height));
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [height]);

    // Ratio calculation state
    const [calculationMode, setCalculationMode] = useState<'single' | 'ratio'>('single');
    const [series1, setSeries1] = useState<string>('');
    const [series2, setSeries2] = useState<string>('');
    const [ratioData, setRatioData] = useState<ChartDataPoint[]>([]);

    // Load available economic series (non-percent only)
    useEffect(() => {
        const loadSeries = async () => {
            try {
                const response = await fetch('/api/data/economic');
                if (!response.ok) {
                    throw new Error('Failed to load series list');
                }
                const result = await response.json();

                // Filter out percent-based series
                const seriesWithNames = result.seriesInfo
                    .filter((s: any) => s.units !== 'percent')
                    .map((s: any) => ({
                        series_name: s.series_name,
                        display_name: s.display_name,
                        units: s.units,
                        geography: s.geography
                    }));

                setAvailableSeries(seriesWithNames);

                // Auto-select first series
                if (seriesWithNames.length > 0) {
                    setSelectedSeries(seriesWithNames[0].series_name);
                    setSelectedUnits(seriesWithNames[0].units);
                    setSeries1(seriesWithNames[0].series_name);

                    if (seriesWithNames.length > 1) {
                        setSeries2(seriesWithNames[1].series_name);
                    }
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSeries([]);
            }
        };

        loadSeries();
    }, []);

    // Load data when series changes
    useEffect(() => {
        if (calculationMode !== 'single' || !selectedSeries) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/data/economic?series=${selectedSeries}`);

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
    }, [selectedSeries, calculationMode]);

    // Calculate ratio when in ratio mode
    useEffect(() => {
        if (calculationMode !== 'ratio' || !series1 || !series2) {
            setRatioData([]);
            return;
        }

        const loadRatioData = async () => {
            try {
                setLoading(true);

                const [response1, response2] = await Promise.all([
                    fetch(`/api/data/economic?series=${encodeURIComponent(series1)}`),
                    fetch(`/api/data/economic?series=${encodeURIComponent(series2)}`)
                ]);

                if (!response1.ok || !response2.ok) {
                    throw new Error('Failed to load data');
                }

                const [result1, result2] = await Promise.all([
                    response1.json(),
                    response2.json()
                ]);

                // Helper function to get year from date
                const getYear = (dateStr: string) => new Date(dateStr).getFullYear();

                // Create maps of dates to values for both series
                const series1Map = new Map<string, number>();
                const series2Map = new Map<string, number>();
                const series1YearMap = new Map<number, { date: string; value: number }>();
                const series2YearMap = new Map<number, { date: string; value: number }>();

                result1.data.forEach((point: ChartDataPoint) => {
                    series1Map.set(point.date, point.Value);
                    const year = getYear(point.date);
                    // For annual data, store the most recent value for each year
                    if (!series1YearMap.has(year) || point.date > series1YearMap.get(year)!.date) {
                        series1YearMap.set(year, { date: point.date, value: point.Value });
                    }
                });

                result2.data.forEach((point: ChartDataPoint) => {
                    series2Map.set(point.date, point.Value);
                    const year = getYear(point.date);
                    if (!series2YearMap.has(year) || point.date > series2YearMap.get(year)!.date) {
                        series2YearMap.set(year, { date: point.date, value: point.Value });
                    }
                });

                // Try exact date matching first
                const exactMatches = Array.from(series1Map.keys())
                    .filter(date => series2Map.has(date))
                    .sort();

                let calculated: ChartDataPoint[];

                if (exactMatches.length > 0) {
                    // Use exact date matching if available
                    calculated = exactMatches
                        .map((date) => {
                            const value1 = series1Map.get(date);
                            const value2 = series2Map.get(date);

                            if (value1 === undefined || value2 === undefined || value2 === 0) return null;

                            return {
                                date: date,
                                Value: value1 / value2
                            };
                        })
                        .filter((point: ChartDataPoint | null) => point !== null) as ChartDataPoint[];
                } else {
                    // Fall back to year-based matching for different frequencies (e.g., annual vs quarterly)
                    const commonYears = Array.from(series1YearMap.keys())
                        .filter(year => series2YearMap.has(year))
                        .sort();

                    calculated = commonYears
                        .map((year) => {
                            const data1 = series1YearMap.get(year);
                            const data2 = series2YearMap.get(year);

                            if (!data1 || !data2 || data2.value === 0) return null;

                            // Use the later date of the two for display
                            const displayDate = data1.date > data2.date ? data1.date : data2.date;

                            return {
                                date: displayDate,
                                Value: data1.value / data2.value
                            };
                        })
                        .filter((point: ChartDataPoint | null) => point !== null) as ChartDataPoint[];
                }

                setRatioData(calculated);
                setSelectedUnits('ratio'); // Ratios are unitless
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to calculate ratio');
            } finally {
                setLoading(false);
            }
        };

        loadRatioData();
    }, [calculationMode, series1, series2]);

    // Filter data based on date range
    useEffect(() => {
        const sourceData = calculationMode === 'ratio' ? ratioData : data;

        if (sourceData.length === 0) {
            setFilteredData([]);
            return;
        }

        let filtered = [...sourceData];

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
    }, [data, ratioData, datePreset, customStartDate, customEndDate, calculationMode]);

    // Categorize series for organized dropdown
    const renderCategorizedOptions = () => {
        const categories: Record<string, typeof availableSeries> = {
            'Money Supply': [],
            'Money Market Funds': [],
            'Debt': [],
            'GDP & Income': [],
            'Federal Budget': [],
            'Inflation & Prices': [],
            'Interest Rates': [],
            'International': [],
            'Other': []
        };

        // Categorize each series based on display name or series name
        availableSeries.forEach(series => {
            const name = series.display_name.toLowerCase();
            const seriesName = series.series_name.toLowerCase();

            // Route non-US series to International
            if (series.geography && series.geography !== 'US') {
                categories['International'].push(series);
            } else if (name.includes('m1') || name.includes('m2') || name.includes('money supply')) {
                categories['Money Supply'].push(series);
            } else if (name.includes('money market') || seriesName.includes('money-market')) {
                categories['Money Market Funds'].push(series);
            } else if (name.includes('debt') || name.includes('deficit') || name.includes('surplus')) {
                categories['Debt'].push(series);
            } else if (name.includes('gdp') || name.includes('income') || name.includes('consumption') || name.includes('pce')) {
                categories['GDP & Income'].push(series);
            } else if (name.includes('federal') && (name.includes('deficit') || name.includes('surplus') || name.includes('interest payment') || name.includes('tax receipt'))) {
                categories['Federal Budget'].push(series);
            } else if (name.includes('cpi') || name.includes('inflation') || name.includes('price')) {
                categories['Inflation & Prices'].push(series);
            } else if (name.includes('fed funds') || name.includes('interest rate') || name.includes('yield')) {
                categories['Interest Rates'].push(series);
            } else {
                categories['Other'].push(series);
            }
        });

        // Render optgroups for non-empty categories
        return Object.entries(categories).map(([categoryName, seriesList]) => {
            if (seriesList.length === 0) return null;

            return (
                <optgroup key={categoryName} label={categoryName}>
                    {seriesList.map(series => (
                        <option key={series.series_name} value={series.series_name}>
                            {series.display_name}
                        </option>
                    ))}
                </optgroup>
            );
        });
    };

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

        const sourceData = calculationMode === 'ratio' ? ratioData : data;
        const chartData = filteredData.length > 0 ? filteredData : sourceData;
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
                <ResponsiveContainer width="100%" height={responsiveHeight}>
                    <LineChart data={chartData} margin={getResponsiveMargin()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af', fontSize: getResponsiveFontSize() }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.getFullYear().toString();
                            }}
                            ticks={generateYearlyTicks(chartData)}
                        />
                        <YAxis
                            width={getResponsiveYAxisWidth()}
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af', fontSize: getResponsiveFontSize() }}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => {
                                if (selectedUnits === 'billions') {
                                    return `${(value / 1).toFixed(0)}B`;
                                } else if (selectedUnits === 'millions') {
                                    return `${(value / 1).toFixed(0)}M`;
                                } else if (selectedUnits === 'index') {
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
                                color: '#f9fafb',
                                fontSize: getResponsiveFontSize()
                            }}
                            labelStyle={{ color: '#9ca3af' }}
                            formatter={(value: any) => formatTooltipValue(Number(value), selectedUnits)}
                        />
                        <Legend wrapperStyle={{ color: '#9ca3af' }} />
                        <Line
                            type="monotone"
                            dataKey="Value"
                            stroke={CHART_COLORS[0]}
                            strokeWidth={2}
                            dot={false}
                            name={calculationMode === 'ratio'
                                ? `${availableSeries.find(s => s.series_name === series1)?.display_name || series1} / ${availableSeries.find(s => s.series_name === series2)?.display_name || series2}`
                                : availableSeries.find(s => s.series_name === selectedSeries)?.display_name || selectedSeries
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
                {/* Mode Selector */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <label className="text-sm font-medium text-card-foreground">
                        Chart Mode:
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCalculationMode('single')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${calculationMode === 'single'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Single Series
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

                {calculationMode === 'ratio' ? (
                    /* Ratio Mode: Two Series Selectors */
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-card-foreground mb-2">
                                Series 1 (Numerator)
                            </label>
                            <select
                                value={series1}
                                onChange={(e) => setSeries1(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {renderCategorizedOptions()}
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                const temp = series1;
                                setSeries1(series2);
                                setSeries2(temp);
                            }}
                            className="px-3 py-2 rounded-lg bg-muted hover:bg-primary/10 text-card-foreground border border-border transition-all duration-200 flex-shrink-0"
                            title="Swap numerator and denominator"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M7 16V4M7 4L3 8M7 4l4 4" />
                                <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </button>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-card-foreground mb-2">
                                Series 2 (Denominator)
                            </label>
                            <select
                                value={series2}
                                onChange={(e) => setSeries2(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {renderCategorizedOptions()}
                            </select>
                        </div>
                    </div>
                ) : (
                    /* Single Series Mode */
                    <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                            Economic Indicator
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
                            {renderCategorizedOptions()}
                        </select>
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

            {/* Latest Data Display */}
            {!loading && !error && (calculationMode === 'single' ? data.length > 0 : ratioData.length > 0) && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <h4 className="text-sm font-semibold text-card-foreground mb-3">
                        Latest Data
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {calculationMode === 'single' && data.length > 0 && (
                            <>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Current Value</div>
                                    <div className="text-2xl font-bold text-card-foreground">
                                        {formatTooltipValue(data[data.length - 1].Value, selectedUnits)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">As of</div>
                                    <div className="text-lg font-semibold text-card-foreground">
                                        {(() => {
                                            // Find the most recent date in the data
                                            const latestDate = data.reduce((latest, current) =>
                                                current.date > latest ? current.date : latest, data[0].date
                                            );
                                            // Parse date as local date to avoid timezone issues
                                            const [year, month, day] = latestDate.split('-').map(Number);
                                            const localDate = new Date(year, month - 1, day);
                                            return localDate.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            });
                                        })()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Series</div>
                                    <div className="text-sm font-medium text-card-foreground">
                                        {availableSeries.find(s => s.series_name === selectedSeries)?.display_name || selectedSeries}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        FRED: {selectedSeries}
                                    </div>
                                </div>
                            </>
                        )}
                        {calculationMode === 'ratio' && ratioData.length > 0 && (
                            <>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Current Ratio</div>
                                    <div className="text-2xl font-bold text-card-foreground">
                                        {ratioData[ratioData.length - 1].Value.toFixed(4)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">As of</div>
                                    <div className="text-lg font-semibold text-card-foreground">
                                        {(() => {
                                            // Find the most recent date in the ratio data
                                            const latestDate = ratioData.reduce((latest, current) =>
                                                current.date > latest ? current.date : latest, ratioData[0].date
                                            );
                                            // Parse date as local date to avoid timezone issues
                                            const [year, month, day] = latestDate.split('-').map(Number);
                                            const localDate = new Date(year, month - 1, day);
                                            return localDate.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            });
                                        })()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Calculation</div>
                                    <div className="text-sm font-medium text-card-foreground">
                                        {availableSeries.find(s => s.series_name === series1)?.display_name || series1}
                                        {' / '}
                                        {availableSeries.find(s => s.series_name === series2)?.display_name || series2}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        FRED: {series1} / {series2}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
