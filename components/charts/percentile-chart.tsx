'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTheme } from '../theme-provider';
import SeriesDataTable from './series-data-table';

// Tooltip component for metric explanations
function MetricTooltip({ children, content }: { children: React.ReactNode; content: string }) {
    const [show, setShow] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="absolute z-50 px-3 py-2 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-lg bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 pointer-events-none whitespace-normal">
                    {content}
                    <div className="absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
            )}
        </div>
    );
}

interface PercentileChartProps {
    height?: number;
    initialSeries?: string[];
}

interface ChartDataPoint {
    date: string;
    cpi_value: number;
    cpi_percentile: number;
    fedfunds_value: number;
    fedfunds_percentile: number;
    [key: string]: number | string | null | undefined;
}

interface SeriesOption {
    value: string;
    label: string;
    color: string;
    category: string;
}

const AVAILABLE_SERIES: SeriesOption[] = [
    // Inflation & Policy
    { value: 'cpi', label: 'CPI Inflation', color: '#2563eb', category: 'Inflation & Policy' },
    { value: 'fedfunds', label: 'Fed Funds Rate', color: '#dc2626', category: 'Inflation & Policy' },
    { value: 'm1yoy', label: 'M1 YoY Growth', color: '#8b5cf6', category: 'Inflation & Policy' },
    { value: 'm2yoy', label: 'M2 YoY Growth', color: '#a855f7', category: 'Inflation & Policy' },
    { value: 'realm2yoy', label: 'Real M2 YoY (M2-CPI)', color: '#c084fc', category: 'Inflation & Policy' },
    // Bond Yields
    { value: 'tnx', label: '10Y-Monthly', color: '#16a34a', category: 'Bond Yields' },
    { value: 'us2yr', label: '2Y-Monthly', color: '#ca8a04', category: 'Bond Yields' },
    { value: 'irx', label: '3M-Monthly', color: '#9333ea', category: 'Bond Yields' },
    { value: 'realyield', label: 'Real 10Y (10Y-CPI)', color: '#06d469ff', category: 'Bond Yields' },
    { value: 'realyield3m', label: 'Real 3M (3M-CPI)', color: '#0891b2', category: 'Bond Yields' },
    { value: 'yieldcurve', label: 'Yield Curve (10Y-2Y)', color: '#f97316', category: 'Bond Yields' },
    { value: 'yieldcurve3m', label: 'Yield Curve (10Y-3M)', color: '#fb923c', category: 'Bond Yields' },
    // Equity Valuation
    { value: 'pe5yr', label: 'P/E-5yr', color: '#f43f5e', category: 'Equity Valuation' },
    { value: 'pe2yr', label: 'P/E-2yr', color: '#be123c', category: 'Equity Valuation' },
    { value: 'ey5yr', label: 'EY-5yr', color: '#fb7185', category: 'Equity Valuation' },
    { value: 'ey2yr', label: 'EY-2yr', color: '#14b8a6', category: 'Equity Valuation' },
    // Equity Spreads
    { value: 'eyp5yr', label: 'EYP-5yr', color: '#a78bfa', category: 'Equity Spreads' },
    { value: 'eyp2yr', label: 'EYP-2yr', color: '#f59e0b', category: 'Equity Spreads' },
    { value: 'rey5yr', label: 'Real EY-5yr', color: '#0d9488', category: 'Equity Spreads' },
    { value: 'rey2yr', label: 'Real EY-2yr', color: '#ea580c', category: 'Equity Spreads' },
];

const METRIC_TOOLTIPS: Record<string, string> = {
    'eyp': 'EYP (CAPE) = Earnings Yield Premium using CAPE. Calculated as (1/CAPE) - 3M Treasury Rate. Measures equity risk premium over cash.',
    'eyp5yr': 'EYP-5yr = Earnings Yield Premium using 5-year P/E. Calculated as (1/P/E-5yr) - 3M Treasury Rate. Measures equity risk premium over cash using 5-year average earnings.',
    'eyp2yr': 'EYP-2yr = Earnings Yield Premium using 2-year P/E. Calculated as (1/P/E-2yr) - 3M Treasury Rate. Measures equity risk premium over cash using 2-year average earnings.',
    'eycape': 'Earnings Yield CAPE = 1 / Shiller P/E. The inverse of CAPE, representing expected earnings yield using inflation-adjusted 10-year average earnings.',
    'ey5yr': 'Earnings Yield 5yr = 1 / P/E-5yr. The inverse of P/E-5yr, representing expected earnings yield using 5-year average earnings.',
    'ey2yr': 'Earnings Yield 2yr = 1 / P/E-2yr. The inverse of P/E-2yr, representing expected earnings yield using 2-year average earnings.',
    'rey5yr': 'Real Earnings Yield 5yr = (1 / P/E-5yr) - CPI Inflation. Measures real return potential using 5-year average earnings.',
    'rey2yr': 'Real Earnings Yield 2yr = (1 / P/E-2yr) - CPI Inflation. Measures real return potential using 2-year average earnings.',
};

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
        { label: 'Last 20Y', value: '20y' },
        { label: 'Custom', value: 'custom' },
    ];

export default function PercentileChart({ height = 500, initialSeries }: PercentileChartProps) {
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState<'percentile' | 'value' | 'yoy'>('value');
    const [selectedSeries, setSelectedSeries] = useState<string[]>(initialSeries || ['realyield']);
    const [isSeriesSelectionOpen, setIsSeriesSelectionOpen] = useState(true);
    const [datePreset, setDatePreset] = useState<string>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const { theme } = useTheme();
    const searchParams = useSearchParams();

    // Initialize selected series from URL parameters
    useEffect(() => {
        const seriesParam = searchParams.get('series');
        if (seriesParam) {
            const seriesArray = seriesParam.split(',').filter(s =>
                AVAILABLE_SERIES.some(series => series.value === s)
            );
            if (seriesArray.length > 0) {
                setSelectedSeries(seriesArray);
                // Auto-expand series selection when coming from a link
                setIsSeriesSelectionOpen(true);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/api/percentile-history');
                if (!response.ok) throw new Error('Failed to load data');

                const result = await response.json();
                setData(result.data);
            } catch (error) {
                console.error('Error loading percentile data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Apply date filtering
    const getFilteredData = () => {
        if (data.length === 0) return [];

        // Always enforce minimum date of Jan 1, 1950
        let filtered = data.filter(d => d.date >= '1950-01-01');

        if (datePreset === 'all') {
            return filtered;
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
        } else if (datePreset === '20y') {
            const now = new Date();
            const twentyYearsAgo = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());
            startDate = twentyYearsAgo.toISOString().split('T')[0];
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

        return filtered;
    };

    const handleSeriesToggle = (seriesValue: string) => {
        setSelectedSeries(prev => {
            if (prev.includes(seriesValue)) {
                // Don't allow deselecting if it's the last one
                if (prev.length === 1) return prev;
                return prev.filter(s => s !== seriesValue);
            } else {
                return [...prev, seriesValue];
            }
        });
    };

    if (loading) {
        return (
            <div className="p-6 rounded-xl border bg-card">
                <div className="text-center text-muted-foreground">Loading chart data...</div>
            </div>
        );
    }

    // Filter data based on selected series and date range
    const dateFilteredData = getFilteredData();
    const filteredData = dateFilteredData.filter(point => {
        // Check if any selected series has data at this point
        return selectedSeries.some(seriesValue => {
            const valueKey = `${seriesValue}_value`;
            const value = point[valueKey as keyof ChartDataPoint];
            return value !== null && value !== undefined;
        });
    });

    const isDark = theme === 'dark';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const textColor = isDark ? '#9ca3af' : '#6b7280';

    // Generate yearly ticks from filtered data
    const yearlyTicks = filteredData
        .filter((_, index) => {
            const year = parseInt(filteredData[index].date.split('-')[0]);
            const prevYear = index > 0 ? parseInt(filteredData[index - 1].date.split('-')[0]) : null;
            return year !== prevYear && year % 5 === 0;
        })
        .map(d => d.date);

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        const date = new Date(data.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });

        return (
            <div className="bg-background border-2 border-border rounded-lg p-3 shadow-lg max-w-xs">
                <p className="font-semibold mb-2">{date}</p>
                {metric === 'percentile' ? (
                    <div className="space-y-1">
                        {selectedSeries.map(seriesValue => {
                            const series = AVAILABLE_SERIES.find(s => s.value === seriesValue);
                            const percentileKey = `${seriesValue}_percentile`;
                            const percentileValue = data[percentileKey];

                            if (percentileValue === null || percentileValue === undefined) return null;

                            return (
                                <p key={seriesValue} className="text-sm">
                                    <span style={{ color: series?.color }}>{series?.label}:</span>{' '}
                                    {percentileValue.toFixed(1)}th percentile
                                </p>
                            );
                        })}
                    </div>
                ) : metric === 'value' ? (
                    <div className="space-y-1">
                        {selectedSeries.map(seriesValue => {
                            const series = AVAILABLE_SERIES.find(s => s.value === seriesValue);
                            const valueKey = `${seriesValue}_value`;
                            const value = data[valueKey];

                            if (value === null || value === undefined) return null;

                            // Determine suffix: P/E ratios use 'x', everything else uses '%'
                            const suffix = (seriesValue === 'shillerpe' || seriesValue === 'pe5yr' || seriesValue === 'pe1yr' || seriesValue === 'pe2yr') ? 'x' : '%';

                            return (
                                <p key={seriesValue} className="text-sm">
                                    <span style={{ color: series?.color }}>{series?.label}:</span>{' '}
                                    {value.toFixed(2)}{suffix}
                                </p>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {selectedSeries.map(seriesValue => {
                            const series = AVAILABLE_SERIES.find(s => s.value === seriesValue);
                            const yoyKey = `${seriesValue}_yoy`;
                            const yoyValue = data[yoyKey];

                            if (yoyValue === null || yoyValue === undefined) return null;

                            return (
                                <p key={seriesValue} className="text-sm">
                                    <span style={{ color: series?.color }}>{series?.label}:</span>{' '}
                                    <span className={yoyValue > 0 ? 'text-red-600 dark:text-red-400' : yoyValue < 0 ? 'text-green-600 dark:text-green-400' : ''}>
                                        {yoyValue > 0 ? '+' : ''}{yoyValue.toFixed(1)} pts
                                    </span>
                                </p>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 rounded-xl border bg-card">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-2xl font-bold">Actual vs Percentile Chart</h2>
                    {filteredData.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            Latest: {(() => {
                                const dateStr = filteredData[filteredData.length - 1].date;
                                const [year, month, day] = dateStr.split('-');
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                return `${monthNames[parseInt(month) - 1]}-${day}-${year}`;
                            })()}
                        </div>
                    )}
                </div>

                {/* Metric Dropdown */}
                <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="metric-select" className="text-sm font-medium">
                        View:
                    </label>
                    <select
                        id="metric-select"
                        value={metric}
                        onChange={(e) => setMetric(e.target.value as 'percentile' | 'value' | 'yoy')}
                        className="px-3 py-2 rounded-lg border-2 bg-background text-foreground font-medium text-sm cursor-pointer hover:border-primary transition-colors"
                    >
                        <option value="percentile">Percentile Rank</option>
                        <option value="value">Actual Value</option>
                        <option value="yoy">Percentile Growth (YoY)</option>
                    </select>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                    {metric === 'percentile'
                        ? 'Shows where values rank compared to all historical data up to that point'
                        : metric === 'value'
                            ? 'Shows the actual values over time'
                            : 'Shows year-over-year change in percentile rank (how fast the percentile is moving)'}
                </p>

                {/* Date Range Filter */}
                <div className="mb-4 space-y-3">
                    <label className="block text-sm font-medium">
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
                                    min="1950-01-01"
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-background text-foreground border-2 border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-muted-foreground mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-background text-foreground border-2 border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Series Selection - Collapsible */}
                <div className="border-t pt-4">
                    <button
                        onClick={() => setIsSeriesSelectionOpen(!isSeriesSelectionOpen)}
                        className="flex items-center justify-between w-full text-left text-sm font-medium mb-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <span>
                            Select Series ({selectedSeries.length} selected)
                            {!isSeriesSelectionOpen && <span className="text-xs text-muted-foreground ml-2">Click to expand</span>}
                        </span>
                        <svg
                            className={`w-4 h-4 transition-transform ${isSeriesSelectionOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Show selected series when collapsed */}
                    {!isSeriesSelectionOpen && selectedSeries.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {selectedSeries.map(seriesValue => {
                                const series = AVAILABLE_SERIES.find(s => s.value === seriesValue);
                                if (!series) return null;
                                return (
                                    <span
                                        key={seriesValue}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
                                        style={{ borderColor: series.color, color: series.color }}
                                    >
                                        {series.label}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {isSeriesSelectionOpen && (
                        <div className="grid grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200">
                            {['Inflation & Policy', 'Bond Yields', 'Equity Valuation', 'Equity Spreads'].map(category => {
                                const categorySeries = AVAILABLE_SERIES.filter(s => s.category === category);
                                if (categorySeries.length === 0) return null;
                                return (
                                    <div key={category} className="space-y-2">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1">
                                            {category}
                                        </div>
                                        <div className="space-y-2">
                                            {categorySeries.map(series => {
                                                const tooltip = METRIC_TOOLTIPS[series.value];

                                                // Find latest date for this series
                                                const latestDataPoint = data.slice().reverse().find(point => {
                                                    const valueKey = `${series.value}_value`;
                                                    const value = point[valueKey as keyof ChartDataPoint];
                                                    return value !== null && value !== undefined;
                                                });

                                                const latestDate = latestDataPoint ? (() => {
                                                    const dateStr = latestDataPoint.date;
                                                    const [year, month, day] = dateStr.split('-');
                                                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                    return `${monthNames[parseInt(month) - 1]}-${year.slice(-2)}`;
                                                })() : 'No data';

                                                const checkbox = (
                                                    <label
                                                        key={series.value}
                                                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:border-primary transition-colors bg-background text-sm"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedSeries.includes(series.value)}
                                                                onChange={() => handleSeriesToggle(series.value)}
                                                                className="cursor-pointer"
                                                            />
                                                            <span className={`font-medium ${tooltip ? 'border-b border-dotted border-current' : ''}`}>
                                                                {series.label}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                            {latestDate}
                                                        </span>
                                                    </label>
                                                );

                                                if (tooltip) {
                                                    return (
                                                        <MetricTooltip key={series.value} content={tooltip}>
                                                            {checkbox}
                                                        </MetricTooltip>
                                                    );
                                                }

                                                return checkbox;
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-6">
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

                        <XAxis
                            dataKey="date"
                            stroke={textColor}
                            ticks={yearlyTicks}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.getFullYear().toString();
                            }}
                        />

                        <YAxis
                            stroke={textColor}
                            tick={{ fontSize: 12 }}
                            label={{
                                value: metric === 'percentile' ? 'Percentile Rank' : metric === 'value' ? 'Value (%)' : 'YoY Change (pts)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: textColor }
                            }}
                            domain={metric === 'percentile' ? [0, 100] : ['auto', 'auto']}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Legend />

                        {/* Percentile reference lines */}
                        {metric === 'percentile' && (
                            <>
                                <ReferenceLine y={25} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
                                <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="3 3" strokeOpacity={0.5} />
                                <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                            </>
                        )}

                        {/* Zero line for actual values and YoY */}
                        {(metric === 'value' || metric === 'yoy') && (
                            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={2} />
                        )}

                        {/* Lines - dynamically render based on selected series */}
                        {selectedSeries.map(seriesValue => {
                            const series = AVAILABLE_SERIES.find(s => s.value === seriesValue);
                            if (!series) return null;

                            const dataKey = metric === 'percentile'
                                ? `${seriesValue}_percentile`
                                : metric === 'value'
                                    ? `${seriesValue}_value`
                                    : `${seriesValue}_yoy`;

                            return (
                                <Line
                                    key={seriesValue}
                                    type="monotone"
                                    dataKey={dataKey}
                                    stroke={series.color}
                                    strokeWidth={2}
                                    dot={false}
                                    name={series.label}
                                    connectNulls={true}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>

                {/* Display selected metrics and their tooltips */}
                <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium text-foreground">
                        Selected Metrics: {selectedSeries.map(seriesValue => {
                            const series = AVAILABLE_SERIES.find(s => s.value === seriesValue);
                            return series?.label;
                        }).join(', ')}
                    </div>
                    {selectedSeries.some(s => METRIC_TOOLTIPS[s]) && (
                        <div className="text-xs text-muted-foreground space-y-1">
                            {selectedSeries.map(seriesValue => {
                                const tooltip = METRIC_TOOLTIPS[seriesValue];
                                const series = AVAILABLE_SERIES.find(s => s.value === seriesValue);
                                if (!tooltip) return null;
                                return (
                                    <div key={seriesValue} className="flex items-start gap-2">
                                        <span className="font-semibold" style={{ color: series?.color }}>
                                            {series?.label}:
                                        </span>
                                        <span>{tooltip}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Explanatory Notes */}
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
                    <p><strong>Note:</strong> EYP = Earnings Yield Premium = Earnings Yield - 3M Treasury Rate</p>
                    <p>• EYP (CAPE) uses earnings yield from CAPE (1/CAPE - 3M)</p>
                    <p>• EYP-5yr uses earnings yield from P/E-5yr (1/P/E-5yr - 3M)</p>
                    <p>• EY-2yr = 1 / P/E-2yr (earnings yield using 2-year average earnings)</p>
                    <p>• P/E-1yr (TTM) = Price / trailing twelve months EPS (no smoothing)</p>
                    <p>• P/E-2yr = Price / 24-month rolling average of TTM EPS</p>
                    <p>• P/E-5yr = Price / 60-month rolling average of TTM EPS</p>
                    <p>• Shiller P/E (CAPE) = Price / 10-year inflation-adjusted average EPS</p>
                </div>
            </div>

            {/* Series Data Table */}
            <SeriesDataTable
                data={filteredData as Array<{
                    date: string;
                    [key: string]: number | string | null | undefined;
                }>}
                selectedSeries={selectedSeries}
                seriesLabels={Object.fromEntries(
                    AVAILABLE_SERIES.map(s => [s.value, s.label])
                )}
                seriesColors={Object.fromEntries(
                    AVAILABLE_SERIES.map(s => [s.value, s.color])
                )}
                metric={metric}
            />
        </div >
    );
}
