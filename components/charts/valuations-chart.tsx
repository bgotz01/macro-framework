'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/format-utils';
import { generateYearlyTicks } from '@/lib/chart-utils';

interface ValuationsChartProps {
    height?: number;
    className?: string;
}

interface ChartDataPoint {
    date: string;
    Value?: number;
    MA12?: number;
    MA252?: number;
}

const CHART_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'];

export default function ValuationsChart({
    height = 500,
    className = ''
}: ValuationsChartProps) {
    const [availableSeries, setAvailableSeries] = useState<Array<{ series_name: string; display_name: string; units?: string }>>([]);
    const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
    const [data, setData] = useState<{ [key: string]: ChartDataPoint[] }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showRatio, setShowRatio] = useState(false);
    const [ratioNumerator, setRatioNumerator] = useState<string>('');
    const [ratioDenominator, setRatioDenominator] = useState<string>('');

    // Load available series from valuations category
    useEffect(() => {
        const loadSeries = async () => {
            try {
                const response = await fetch('/api/data/valuations');
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

                // Auto-select Shiller-PE if available, otherwise first non-EPS series
                const shillerPE = seriesWithNames.find((s: any) => s.series_name === 'Shiller-PE');
                if (shillerPE) {
                    setSelectedSeries(['Shiller-PE']);
                } else {
                    const nonEPSSeries = seriesWithNames.filter((s: any) => !s.series_name.includes('EPS'));
                    if (nonEPSSeries.length > 0) {
                        setSelectedSeries([nonEPSSeries[0].series_name]);
                    }
                }

                // Set default ratio values
                const sp500Price = seriesWithNames.find((s: any) => s.series_name === 'SP500-Price');
                const sp500EPS = seriesWithNames.find((s: any) => s.series_name === 'SP500-EPS');
                if (sp500Price) setRatioNumerator('SP500-Price');
                if (sp500EPS) setRatioDenominator('SP500-EPS');
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSeries([]);
            }
        };

        loadSeries();
    }, []);

    // Load data when series selection changes or ratio settings change
    useEffect(() => {
        // Determine which series we need to load
        let seriesToLoad: string[] = [];

        if (showRatio && ratioNumerator && ratioDenominator) {
            // In ratio mode, load both numerator and denominator
            seriesToLoad = [ratioNumerator, ratioDenominator];
        } else if (selectedSeries.length > 0) {
            // In normal mode, load selected series
            seriesToLoad = selectedSeries;
        }

        if (seriesToLoad.length === 0) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const dataPromises = seriesToLoad.map(async (series) => {
                    const response = await fetch(`/api/data/valuations?series=${series}`);
                    if (!response.ok) {
                        throw new Error(`Failed to load data: ${response.statusText}`);
                    }
                    const result = await response.json();
                    return { series, data: result.data };
                });

                const results = await Promise.all(dataPromises);
                const newData: { [key: string]: ChartDataPoint[] } = {};
                results.forEach(({ series, data }) => {
                    newData[series] = data;
                });
                setData(newData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedSeries, showRatio, ratioNumerator, ratioDenominator]);

    // Toggle series selection
    const toggleSeries = (seriesName: string) => {
        if (seriesName === 'ratio') {
            // Toggle ratio mode
            setShowRatio(!showRatio);
            if (!showRatio) {
                // Entering ratio mode - clear other selections
                setSelectedSeries([]);
            } else {
                // Exiting ratio mode - select first series
                if (availableSeries.length > 0) {
                    const shillerPE = availableSeries.find(s => s.series_name === 'Shiller-PE');
                    setSelectedSeries(shillerPE ? ['Shiller-PE'] : [availableSeries[0].series_name]);
                }
            }
        } else {
            // Regular series toggle
            if (showRatio) {
                // If in ratio mode, exit it first
                setShowRatio(false);
            }
            setSelectedSeries(prev => {
                if (prev.includes(seriesName)) {
                    // Don't allow deselecting if it's the only one
                    if (prev.length === 1) return prev;
                    return prev.filter(s => s !== seriesName);
                } else {
                    return [...prev, seriesName];
                }
            });
        }
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

        if (Object.keys(data).length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-muted-foreground">No data available</p>
                </div>
            );
        }

        // Merge all series data by date
        const mergedData: { [date: string]: any } = {};

        // If in ratio mode, load numerator and denominator data
        if (showRatio && ratioNumerator && ratioDenominator) {
            const numData = data[ratioNumerator] || [];
            const denData = data[ratioDenominator] || [];

            numData.forEach((point) => {
                if (!mergedData[point.date]) {
                    mergedData[point.date] = { date: point.date };
                }
                mergedData[point.date][ratioNumerator] = point.Value;
            });

            denData.forEach((point) => {
                if (!mergedData[point.date]) {
                    mergedData[point.date] = { date: point.date };
                }
                mergedData[point.date][ratioDenominator] = point.Value;
            });
        } else {
            // Normal mode - load selected series
            selectedSeries.forEach((seriesName) => {
                const seriesData = data[seriesName] || [];
                seriesData.forEach((point) => {
                    if (!mergedData[point.date]) {
                        mergedData[point.date] = { date: point.date };
                    }
                    mergedData[point.date][seriesName] = point.Value;
                });
            });
        }

        // Calculate ratio if enabled
        if (showRatio && ratioNumerator && ratioDenominator) {
            Object.keys(mergedData).forEach((date) => {
                const num = mergedData[date][ratioNumerator];
                const den = mergedData[date][ratioDenominator];
                if (num !== undefined && den !== undefined && den !== 0) {
                    mergedData[date]['ratio'] = num / den;
                }
            });
        }

        const chartData = Object.values(mergedData).sort((a, b) => a.date.localeCompare(b.date));

        return (
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
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#f9fafb'
                        }}
                        labelStyle={{ color: '#9ca3af' }}
                        formatter={(value: any, name: string | undefined) => {
                            if (!name) return [formatTooltipValue(Number(value), undefined), ''];
                            if (name === 'ratio') {
                                const numSeries = availableSeries.find(s => s.series_name === ratioNumerator);
                                const denSeries = availableSeries.find(s => s.series_name === ratioDenominator);
                                return [
                                    Number(value).toFixed(2),
                                    `${numSeries?.display_name || ratioNumerator} / ${denSeries?.display_name || ratioDenominator}`
                                ];
                            }
                            const series = availableSeries.find(s => s.series_name === name);
                            return [
                                formatTooltipValue(Number(value), series?.units),
                                series?.display_name || name
                            ];
                        }}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                    {selectedSeries.map((seriesName, index) => {
                        const series = availableSeries.find(s => s.series_name === seriesName);
                        return (
                            <Line
                                key={seriesName}
                                type="monotone"
                                dataKey={seriesName}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                                connectNulls={true}
                                name={series?.display_name || seriesName}
                            />
                        );
                    })}
                    {showRatio && ratioNumerator && ratioDenominator && (
                        <Line
                            key="ratio"
                            type="monotone"
                            dataKey="ratio"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={false}
                            connectNulls={true}
                            name="Ratio"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            {/* Controls */}
            <div className="mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-card-foreground mb-3">
                        Select Valuation Metrics (click to toggle)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availableSeries
                            .filter(series => !series.series_name.includes('EPS') && !series.series_name.includes('Price'))
                            .map(series => (
                                <button
                                    key={series.series_name}
                                    onClick={() => toggleSeries(series.series_name)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedSeries.includes(series.series_name)
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {series.display_name}
                                </button>
                            ))}
                        <button
                            onClick={() => toggleSeries('ratio')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${showRatio
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Custom Ratio
                        </button>
                    </div>
                </div>

                {/* Ratio Controls */}
                {showRatio && (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <label className="block text-sm font-medium text-card-foreground mb-3">
                            Configure Custom Ratio
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Numerator</label>
                                <select
                                    value={ratioNumerator}
                                    onChange={(e) => setRatioNumerator(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                >
                                    <option value="">Select series...</option>
                                    {availableSeries
                                        .filter(s => s.series_name === 'SP500-Price')
                                        .map(series => (
                                            <option key={series.series_name} value={series.series_name}>
                                                {series.display_name}
                                            </option>
                                        ))}
                                    {availableSeries
                                        .filter(s => s.series_name !== 'SP500-Price' && !s.series_name.includes('EPS'))
                                        .map(series => (
                                            <option key={series.series_name} value={series.series_name}>
                                                {series.display_name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Denominator</label>
                                <select
                                    value={ratioDenominator}
                                    onChange={(e) => setRatioDenominator(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-card border border-border text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                >
                                    <option value="">Select series...</option>
                                    {availableSeries
                                        .filter(s => s.series_name.includes('EPS'))
                                        .map(series => (
                                            <option key={series.series_name} value={series.series_name}>
                                                {series.display_name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart */}
            {renderContent()}

            {/* Explanation Note */}
            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    📊 Understanding P/E Ratios
                </h4>
                <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong className="text-card-foreground">S&P 500 P/E Ratio:</strong> Uses trailing 12-month earnings.
                        More responsive to current market conditions but can be volatile during earnings cycles.
                    </p>
                    <p>
                        <strong className="text-card-foreground">Shiller P/E (CAPE):</strong> Cyclically Adjusted Price-to-Earnings ratio
                        uses 10-year average inflation-adjusted earnings. Smooths out business cycle fluctuations and provides
                        a longer-term valuation perspective.
                    </p>
                    <p className="text-xs italic">
                        💡 Tip: Shiller P/E is generally more useful for identifying long-term market valuation extremes,
                        while the standard P/E reflects current market sentiment.
                    </p>
                </div>
            </div>
        </div>
    );
}
