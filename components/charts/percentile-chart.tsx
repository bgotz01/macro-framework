'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTheme } from '../theme-provider';

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
}

interface ChartDataPoint {
    date: string;
    dateTimestamp: number;
    cpi_value: number;
    cpi_percentile: number;
    fedfunds_value: number;
    fedfunds_percentile: number;
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
    // Bond Yields
    { value: 'tnx', label: '10Y Treasury', color: '#16a34a', category: 'Bond Yields' },
    { value: 'us2yr', label: '2Y Treasury', color: '#ca8a04', category: 'Bond Yields' },
    { value: 'irx', label: '3M Treasury', color: '#9333ea', category: 'Bond Yields' },
    { value: 'realyield', label: 'Real Yield (10Y-CPI)', color: '#06b6d4', category: 'Bond Yields' },
    { value: 'yieldcurve', label: 'Yield Curve (10Y-2Y)', color: '#f97316', category: 'Bond Yields' },
    { value: 'yieldcurve3m', label: 'Yield Curve (10Y-3M)', color: '#fb923c', category: 'Bond Yields' },
    // Equity Valuation
    { value: 'shillerpe', label: 'Shiller P/E (CAPE)', color: '#ec4899', category: 'Equity Valuation' },
    { value: 'pe5yr', label: 'P/E-5yr', color: '#f43f5e', category: 'Equity Valuation' },
    { value: 'eycape', label: 'EY CAPE', color: '#db2777', category: 'Equity Valuation' },
    { value: 'eyp', label: 'Earnings Yield Premium', color: '#8b5cf6', category: 'Equity Valuation' },
    { value: 'ey5yr', label: 'Earnings Yield 5yr', color: '#fb7185', category: 'Equity Valuation' },
    { value: 'eyp5yr', label: 'EY Premium 5yr', color: '#a78bfa', category: 'Equity Valuation' },
    { value: 'rey5yr', label: 'Real EY 5yr', color: '#0d9488', category: 'Equity Valuation' },
];

const METRIC_TOOLTIPS: Record<string, string> = {
    'eyp': 'Earnings Yield Premium = (1 / Shiller P/E) - 3M Treasury Rate. Measures equity risk premium over cash.',
    'eyp5yr': 'Earnings Yield Premium 5yr = (1 / P/E-5yr) - 3M Treasury Rate. Measures equity risk premium over cash using 5-year average earnings.',
    'eycape': 'Earnings Yield CAPE = 1 / Shiller P/E. The inverse of CAPE, representing expected earnings yield using inflation-adjusted 10-year average earnings.',
    'ey5yr': 'Earnings Yield 5yr = 1 / P/E-5yr. The inverse of P/E-5yr, representing expected earnings yield using 5-year average earnings.',
    'rey5yr': 'Real Earnings Yield 5yr = (1 / P/E-5yr) - CPI Inflation. Measures real return potential using 5-year average earnings.',
};

export default function PercentileChart({ height = 500 }: PercentileChartProps) {
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState<'percentile' | 'value' | 'yoy'>('percentile');
    const [selectedSeries, setSelectedSeries] = useState<string[]>(['cpi', 'fedfunds']);
    const { theme } = useTheme();

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

    // Filter data based on selected series to show only relevant date range
    const filteredData = data.filter(point => {
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
            const year = new Date(filteredData[index].dateTimestamp).getFullYear();
            const prevYear = index > 0 ? new Date(filteredData[index - 1].dateTimestamp).getFullYear() : null;
            return year !== prevYear && year % 5 === 0;
        })
        .map(d => d.date);

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        const date = new Date(data.dateTimestamp).toLocaleDateString('en-US', {
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

                            return (
                                <p key={seriesValue} className="text-sm">
                                    <span style={{ color: series?.color }}>{series?.label}:</span>{' '}
                                    {value.toFixed(2)}{seriesValue.includes('pe') ? 'x' : '%'}
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
                    <h2 className="text-2xl font-bold">Historical Percentile Chart</h2>
                    {filteredData.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            Latest: {new Date(filteredData[filteredData.length - 1].dateTimestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
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

                {/* Series Selection - 3 Column Layout */}
                <div className="border-t pt-4">
                    <label className="text-sm font-medium mb-3 block">Select Series:</label>
                    <div className="grid grid-cols-3 gap-6">
                        {['Inflation & Policy', 'Bond Yields', 'Equity Valuation'].map(category => {
                            const categorySeries = AVAILABLE_SERIES.filter(s => s.category === category);
                            return (
                                <div key={category} className="space-y-2">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1">
                                        {category}
                                    </div>
                                    <div className="space-y-2">
                                        {categorySeries.map(series => {
                                            const tooltip = METRIC_TOOLTIPS[series.value];
                                            const checkbox = (
                                                <label
                                                    key={series.value}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:border-primary transition-colors bg-background text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSeries.includes(series.value)}
                                                        onChange={() => handleSeriesToggle(series.value)}
                                                        className="cursor-pointer"
                                                    />
                                                    <span className={`font-medium ${tooltip ? 'border-b border-dotted border-current' : ''}`}>
                                                        {series.label}
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
            </div>
        </div >
    );
}
