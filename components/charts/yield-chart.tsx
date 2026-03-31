'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { generateYearlyTicks } from '@/lib/chart-utils';

interface YieldChartProps {
    height?: number;
    className?: string;
}

interface ChartDataPoint {
    date: string;
    [key: string]: any;
}

const CHART_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'];

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

export default function YieldChart({
    height = 400,
    className = ''
}: YieldChartProps) {
    const [availableSeries, setAvailableSeries] = useState<Array<{ series_name: string; display_name: string; asset_class: string }>>([]);
    const [selectedSeries, setSelectedSeries] = useState<string>('');
    const [selectedAssetClass, setSelectedAssetClass] = useState<string>('');
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);
    const [datePreset, setDatePreset] = useState<string>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Spread calculation state
    const [calculationMode, setCalculationMode] = useState<'single' | 'spread'>('single');
    const [series1, setSeries1] = useState<string>('');
    const [assetClass1, setAssetClass1] = useState<string>('');
    const [series2, setSeries2] = useState<string>('');
    const [assetClass2, setAssetClass2] = useState<string>('');
    const [spreadData, setSpreadData] = useState<ChartDataPoint[]>([]);

    // Load available yield series on mount
    useEffect(() => {
        const loadYieldSeries = async () => {
            try {
                setLoading(true);

                // Load bonds, economic, and valuations series (all have percent-based data)
                const [bondsResponse, economicResponse, valuationsResponse] = await Promise.all([
                    fetch('/api/data/bonds'),
                    fetch('/api/data/economic'),
                    fetch('/api/data/valuations')
                ]);

                if (!bondsResponse.ok || !economicResponse.ok || !valuationsResponse.ok) {
                    throw new Error('Failed to load series list');
                }

                const [bondsResult, economicResult, valuationsResult] = await Promise.all([
                    bondsResponse.json(),
                    economicResponse.json(),
                    valuationsResponse.json()
                ]);

                // Filter for percent-based series only
                const bondsSeries = bondsResult.seriesInfo
                    .filter((s: any) => s.units === 'percent')
                    .map((s: any) => ({
                        series_name: s.series_name,
                        display_name: s.display_name,
                        asset_class: 'bonds'
                    }));

                const economicSeries = economicResult.seriesInfo
                    .filter((s: any) => s.units === 'percent')
                    .map((s: any) => ({
                        series_name: s.series_name,
                        display_name: s.display_name,
                        asset_class: 'economic'
                    }));

                const valuationsSeries = valuationsResult.seriesInfo
                    .filter((s: any) => s.units === 'percent')
                    .map((s: any) => ({
                        series_name: s.series_name,
                        display_name: s.display_name,
                        asset_class: 'valuations'
                    }));

                const allSeries = [...bondsSeries, ...economicSeries, ...valuationsSeries];
                setAvailableSeries(allSeries);

                // Auto-select 10Y Treasury as default, fallback to first series
                const default10Y = allSeries.find(s => s.series_name === 'US/TNX') || allSeries.find(s => s.series_name === 'US/TNX-Monthly');
                const defaultSeries = default10Y || allSeries[0];

                if (defaultSeries) {
                    setSelectedSeries(defaultSeries.series_name);
                    setSelectedAssetClass(defaultSeries.asset_class);
                    setSeries1(defaultSeries.series_name);
                    setAssetClass1(defaultSeries.asset_class);

                    // For series2, pick the next available series
                    const series2Index = allSeries.indexOf(defaultSeries) + 1;
                    if (series2Index < allSeries.length) {
                        setSeries2(allSeries[series2Index].series_name);
                        setAssetClass2(allSeries[series2Index].asset_class);
                    } else if (allSeries.length > 1) {
                        setSeries2(allSeries[0].series_name);
                        setAssetClass2(allSeries[0].asset_class);
                    }
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setError('Failed to load yield series');
            } finally {
                setLoading(false);
            }
        };

        loadYieldSeries();
    }, []);

    // Load data when series changes (single mode)
    useEffect(() => {
        if (calculationMode !== 'single' || !selectedSeries || !selectedAssetClass) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/data/${selectedAssetClass}?series=${selectedSeries}`);

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
    }, [selectedAssetClass, selectedSeries, calculationMode]);

    // Calculate spread when in spread mode
    useEffect(() => {
        if (calculationMode !== 'spread' || !series1 || !series2 || !assetClass1 || !assetClass2) {
            setSpreadData([]);
            return;
        }

        const loadSpreadData = async () => {
            try {
                setLoading(true);

                const [response1, response2] = await Promise.all([
                    fetch(`/api/data/${assetClass1}?series=${encodeURIComponent(series1)}`),
                    fetch(`/api/data/${assetClass2}?series=${encodeURIComponent(series2)}`)
                ]);

                if (!response1.ok || !response2.ok) {
                    throw new Error('Failed to load data');
                }

                const [result1, result2] = await Promise.all([
                    response1.json(),
                    response2.json()
                ]);

                // Create a map of dates to values for series 2
                const series2Map = new Map<string, number>();
                result2.data.forEach((point: ChartDataPoint) => {
                    series2Map.set(point.date, point.Value);
                });

                // Calculate spread (series1 - series2)
                const calculated = result1.data
                    .map((point: ChartDataPoint) => {
                        const value2 = series2Map.get(point.date);
                        if (value2 === undefined) return null;

                        return {
                            date: point.date,
                            Value: point.Value - value2
                        };
                    })
                    .filter((point: ChartDataPoint | null) => point !== null) as ChartDataPoint[];

                setSpreadData(calculated);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to calculate spread');
            } finally {
                setLoading(false);
            }
        };

        loadSpreadData();
    }, [calculationMode, series1, series2, assetClass1, assetClass2]);

    // Filter data based on date range
    useEffect(() => {
        const sourceData = calculationMode === 'spread' ? spreadData : data;

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
    }, [data, spreadData, datePreset, customStartDate, customEndDate, calculationMode]);

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

        const sourceData = calculationMode === 'spread' ? spreadData : data;
        const chartData = filteredData.length > 0 ? filteredData : sourceData;

        if (chartData.length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-muted-foreground">No data available</p>
                </div>
            );
        }

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
                            tickFormatter={(value) => `${value.toFixed(1)}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#f9fafb'
                            }}
                            labelStyle={{ color: '#9ca3af' }}
                            formatter={(value: any) => `${Number(value).toFixed(2)}%`}
                        />
                        <Legend wrapperStyle={{ color: '#9ca3af' }} />

                        {/* Zero reference line */}
                        <ReferenceLine
                            y={0}
                            stroke="#dc2626"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            opacity={0.7}
                        />

                        <Line
                            type="monotone"
                            dataKey="Value"
                            stroke={CHART_COLORS[0]}
                            strokeWidth={2}
                            dot={false}
                            connectNulls={true}
                            name={calculationMode === 'spread'
                                ? `${availableSeries.find(s => s.series_name === series1)?.display_name || series1} - ${availableSeries.find(s => s.series_name === series2)?.display_name || series2}`
                                : availableSeries.find(s => s.series_name === selectedSeries)?.display_name || selectedSeries
                            }
                        />
                    </LineChart>
                </ResponsiveContainer>
            </>
        );
    };

    const MONTHLY_AVG_SERIES = ['US/IRX-Monthly', 'US/TNX-Monthly', 'US/US-2yr-Monthly'];

    const renderBondOptions = () => {
        const monthly = availableSeries.filter(s => s.asset_class === 'bonds' && MONTHLY_AVG_SERIES.includes(s.series_name));
        const other = availableSeries.filter(s => s.asset_class === 'bonds' && !MONTHLY_AVG_SERIES.includes(s.series_name));
        return (
            <>
                {monthly.length > 0 && (
                    <optgroup label="Monthly Averages">
                        {monthly.map(s => (
                            <option key={`${s.asset_class}/${s.series_name}`} value={`${s.asset_class}/${s.series_name}`}>{s.display_name}</option>
                        ))}
                    </optgroup>
                )}
                <optgroup label="Bond Markets">
                    {other.map(s => (
                        <option key={`${s.asset_class}/${s.series_name}`} value={`${s.asset_class}/${s.series_name}`}>{s.display_name}</option>
                    ))}
                </optgroup>
            </>
        );
    };

    const renderSeriesOptions = () => (
        <>
            {renderBondOptions()}
            <optgroup label="Economic">
                {availableSeries.filter(s => s.asset_class === 'economic').map(s => (
                    <option key={`${s.asset_class}/${s.series_name}`} value={`${s.asset_class}/${s.series_name}`}>{s.display_name}</option>
                ))}
            </optgroup>
            <optgroup label="Equity Valuation">
                {availableSeries.filter(s => s.asset_class === 'valuations').map(s => (
                    <option key={`${s.asset_class}/${s.series_name}`} value={`${s.asset_class}/${s.series_name}`}>{s.display_name}</option>
                ))}
            </optgroup>
        </>
    );

    const formatLatestDate = (src: ChartDataPoint[]) => {
        if (!src.length) return '';
        const latest = src.reduce((a, b) => b.date > a ? b.date : a, src[0].date);
        const [y, m, d] = latest.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            {data.length > 0 && (
                <div className="mb-4 text-xs text-muted-foreground text-right">
                    Latest data: {formatLatestDate(calculationMode === 'spread' ? spreadData : data)}
                </div>
            )}
            {/* Controls */}
            <div className="mb-6 space-y-4">
                {/* Mode Selector */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mode</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCalculationMode('single')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${calculationMode === 'single' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}
                        >
                            Single Series
                        </button>
                        <button
                            onClick={() => setCalculationMode('spread')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${calculationMode === 'spread' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}
                        >
                            Yield Spread
                        </button>
                    </div>
                </div>

                {/* Series Selector(s) */}
                {calculationMode === 'spread' ? (
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">Series 1</span>
                            <select
                                value={`${assetClass1}/${series1}`}
                                onChange={(e) => { const [ac, ...rest] = e.target.value.split('/'); setSeries1(rest.join('/')); setAssetClass1(ac); }}
                                className="w-1/2 px-3 py-2 text-sm rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {renderSeriesOptions()}
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">Series 2</span>
                            <select
                                value={`${assetClass2}/${series2}`}
                                onChange={(e) => { const [ac, ...rest] = e.target.value.split('/'); setSeries2(rest.join('/')); setAssetClass2(ac); }}
                                className="w-1/2 px-3 py-2 text-sm rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {renderSeriesOptions()}
                            </select>
                            {!loading && spreadData.length > 0 && (
                                <>
                                    <div className="px-4 py-2 rounded-lg bg-muted/60 border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-0.5">Spread</div>
                                        <div className="text-lg font-bold text-card-foreground leading-none">{spreadData[spreadData.length - 1].Value.toFixed(2)}%</div>
                                    </div>
                                    <div className="px-4 py-2 rounded-lg bg-muted/60 border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-0.5">As of</div>
                                        <div className="text-lg font-bold text-card-foreground leading-none">{formatLatestDate(spreadData)}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 flex items-center gap-4">
                        <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">Series</span>
                        <select
                            value={`${selectedAssetClass}/${selectedSeries}`}
                            onChange={(e) => { const [ac, ...rest] = e.target.value.split('/'); setSelectedSeries(rest.join('/')); setSelectedAssetClass(ac); }}
                            className="w-1/2 px-3 py-2 text-sm rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {renderSeriesOptions()}
                        </select>
                        {!loading && data.length > 0 && (
                            <>
                                <div className="px-4 py-2 rounded-lg bg-muted/60 border border-border/50">
                                    <div className="text-xs text-muted-foreground mb-0.5">Latest</div>
                                    <div className="text-lg font-bold text-card-foreground leading-none">{data[data.length - 1].Value.toFixed(2)}%</div>
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-muted/60 border border-border/50">
                                    <div className="text-xs text-muted-foreground mb-0.5">As of</div>
                                    <div className="text-lg font-bold text-card-foreground leading-none">{formatLatestDate(data)}</div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Date Range Filter */}
                <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date Range</span>
                    <div className="flex flex-wrap gap-2">
                        {DATE_PRESETS.map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => setDatePreset(preset.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${datePreset === preset.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    {datePreset === 'custom' && (
                        <div className="flex gap-3 pt-1">
                            <div className="flex-1">
                                <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
                                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-muted-foreground mb-1">End Date</label>
                                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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
