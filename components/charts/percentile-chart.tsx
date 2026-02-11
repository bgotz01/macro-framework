'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { useTheme } from '../theme-provider';

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
    // Equity Valuation
    { value: 'shillerpe', label: 'Shiller P/E (CAPE)', color: '#ec4899', category: 'Equity Valuation' },
    { value: 'pe5yr', label: 'P/E-5yr', color: '#f43f5e', category: 'Equity Valuation' },
    { value: 'eyp', label: 'Earnings Yield Premium', color: '#8b5cf6', category: 'Equity Valuation' },
    { value: 'rey', label: 'Real Earnings Yield', color: '#14b8a6', category: 'Equity Valuation' },
];

const DECADE_COLORS = [
    { start: '1950-01-01', end: '1959-12-31', color: '#3b82f6', opacity: 0.03 },
    { start: '1960-01-01', end: '1969-12-31', color: '#8b5cf6', opacity: 0.03 },
    { start: '1970-01-01', end: '1979-12-31', color: '#ec4899', opacity: 0.03 },
    { start: '1980-01-01', end: '1989-12-31', color: '#f59e0b', opacity: 0.03 },
    { start: '1990-01-01', end: '1999-12-31', color: '#10b981', opacity: 0.03 },
    { start: '2000-01-01', end: '2009-12-31', color: '#06b6d4', opacity: 0.03 },
    { start: '2010-01-01', end: '2019-12-31', color: '#6366f1', opacity: 0.03 },
    { start: '2020-01-01', end: '2029-12-31', color: '#ef4444', opacity: 0.03 },
];

export default function PercentileChart({ height = 500 }: PercentileChartProps) {
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState<'percentile' | 'value'>('percentile');
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

    const isDark = theme === 'dark';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const textColor = isDark ? '#9ca3af' : '#6b7280';

    // Generate yearly ticks
    const yearlyTicks = data
        .filter((_, index) => {
            const year = new Date(data[index].dateTimestamp).getFullYear();
            const prevYear = index > 0 ? new Date(data[index - 1].dateTimestamp).getFullYear() : null;
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
                ) : (
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
                )}
            </div>
        );
    };

    return (
        <div className="p-6 rounded-xl border bg-card">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3">Historical Percentile Chart</h2>

                {/* Metric Dropdown */}
                <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="metric-select" className="text-sm font-medium">
                        View:
                    </label>
                    <select
                        id="metric-select"
                        value={metric}
                        onChange={(e) => setMetric(e.target.value as 'percentile' | 'value')}
                        className="px-3 py-2 rounded-lg border-2 bg-background text-foreground font-medium text-sm cursor-pointer hover:border-primary transition-colors"
                    >
                        <option value="percentile">Percentile Rank</option>
                        <option value="value">Actual Value</option>
                    </select>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                    {metric === 'percentile'
                        ? 'Shows where values rank compared to all historical data up to that point'
                        : 'Shows the actual values over time'}
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
                                        {categorySeries.map(series => (
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
                                                <span className="font-medium">{series.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

                        {/* Decade shading */}
                        {DECADE_COLORS.map((decade, idx) => (
                            <ReferenceArea
                                key={idx}
                                x1={decade.start}
                                x2={decade.end}
                                fill={decade.color}
                                fillOpacity={decade.opacity}
                            />
                        ))}

                        <XAxis
                            dataKey="date"
                            stroke={textColor}
                            ticks={yearlyTicks}
                            tick={{ fontSize: 12 }}
                        />

                        <YAxis
                            stroke={textColor}
                            tick={{ fontSize: 12 }}
                            label={{
                                value: metric === 'percentile' ? 'Percentile Rank' : 'Value (%)',
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

                        {/* Lines - dynamically render based on selected series */}
                        {selectedSeries.map(seriesValue => {
                            const series = AVAILABLE_SERIES.find(s => s.value === seriesValue);
                            if (!series) return null;

                            return (
                                <Line
                                    key={seriesValue}
                                    type="monotone"
                                    dataKey={metric === 'percentile' ? `${seriesValue}_percentile` : `${seriesValue}_value`}
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

                {metric === 'percentile' && (
                    <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-green-500"></div>
                            <span>25th percentile</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-gray-500"></div>
                            <span>50th percentile (median)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-red-500"></div>
                            <span>75th percentile</span>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
