'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface VolatilityChartProps {
    assetClass?: string;
    seriesName?: string;
    startDate?: string;
    endDate?: string;
    height?: number;
    className?: string;
}

interface VolatilityDataPoint {
    date: string;
    '63-Day Vol'?: number;
    '126-Day Vol'?: number;
    '252-Day Vol'?: number;
    '504-Day Vol'?: number;
}

const CHART_COLORS = {
    '63-Day Vol': '#ef4444',
    '126-Day Vol': '#f59e0b',
    '252-Day Vol': '#3b82f6',
    '504-Day Vol': '#8b5cf6'
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
        { label: 'Custom', value: 'custom' },
    ];

export default function VolatilityChart({
    assetClass = 'equities',
    seriesName: initialSeriesName,
    startDate: initialStartDate,
    endDate: initialEndDate,
    height = 500,
    className = ''
}: VolatilityChartProps) {
    const [availableSeries, setAvailableSeries] = useState<Array<{ series_name: string; display_name: string }>>([]);
    const [selectedSeries, setSelectedSeries] = useState<string>(initialSeriesName || '');
    const [volatilityData, setVolatilityData] = useState<VolatilityDataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<VolatilityDataPoint[]>([]);
    const [datePreset, setDatePreset] = useState<string>('all');
    const [customStartDate, setCustomStartDate] = useState<string>(initialStartDate || '');
    const [customEndDate, setCustomEndDate] = useState<string>(initialEndDate || '');
    const [chartMode, setChartMode] = useState<'single' | 'spread'>('single');
    const [selectedPeriod, setSelectedPeriod] = useState<'63' | '126' | '252' | '504'>('252');
    const [spreadPeriod1, setSpreadPeriod1] = useState<'63' | '126' | '252' | '504'>('252');
    const [spreadPeriod2, setSpreadPeriod2] = useState<'63' | '126' | '252' | '504'>('126');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load available series
    useEffect(() => {
        const loadSeries = async () => {
            try {
                const response = await fetch(`/api/data/${assetClass}`);
                if (!response.ok) throw new Error('Failed to load series list');

                const result = await response.json();
                const seriesWithNames = result.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name
                }));
                setAvailableSeries(seriesWithNames);

                // Auto-select S&P 500 if available, otherwise first series
                if (!initialSeriesName && seriesWithNames.length > 0) {
                    const sp500 = seriesWithNames.find((s: { series_name: string }) => s.series_name === 'US/GSPC');
                    setSelectedSeries(sp500 ? sp500.series_name : seriesWithNames[0].series_name);
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSeries([]);
            }
        };

        loadSeries();
    }, [assetClass, initialSeriesName]);

    // Load volatility data
    useEffect(() => {
        if (!selectedSeries) {
            setLoading(false);
            return;
        }

        const loadVolatility = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/data/${assetClass}?series=${encodeURIComponent(selectedSeries)}&columns=Value_Vol63,Value_Vol126,Value_Vol252,Value_Vol504`
                );

                if (!response.ok) {
                    throw new Error(`Failed to load volatility data: ${response.statusText}`);
                }

                const result = await response.json();

                if (!result.data || result.data.length === 0) {
                    setVolatilityData([]);
                    setLoading(false);
                    return;
                }

                // Transform data
                const transformed: VolatilityDataPoint[] = result.data.map((point: any) => ({
                    date: point.date,
                    '63-Day Vol': point.Value_Vol63,
                    '126-Day Vol': point.Value_Vol126,
                    '252-Day Vol': point.Value_Vol252,
                    '504-Day Vol': point.Value_Vol504,
                }));

                setVolatilityData(transformed);
            } catch (err) {
                console.error('Error loading volatility:', err);
                setError(err instanceof Error ? err.message : 'Failed to load volatility');
            } finally {
                setLoading(false);
            }
        };

        loadVolatility();
    }, [assetClass, selectedSeries]);

    // Filter data based on date range
    useEffect(() => {
        if (volatilityData.length === 0) {
            setFilteredData([]);
            return;
        }

        let filtered = [...volatilityData];

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
    }, [volatilityData, datePreset, customStartDate, customEndDate]);

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
                        <p className="text-red-500 font-medium mb-2">Error loading volatility</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            );
        }

        if (volatilityData.length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-muted-foreground">No volatility data available. Run the add-volatility-metrics script.</p>
                </div>
            );
        }

        // Use filtered data if available, otherwise use all data
        const chartData = filteredData.length > 0 ? filteredData : volatilityData;
        const noDataInRange = datePreset !== 'all' && filteredData.length === 0;

        if (chartMode === 'spread') {
            // Calculate spread data
            const period1Key = `${spreadPeriod1}-Day Vol` as keyof VolatilityDataPoint;
            const period2Key = `${spreadPeriod2}-Day Vol` as keyof VolatilityDataPoint;

            const spreadData = chartData
                .map(d => {
                    const val1 = d[period1Key];
                    const val2 = d[period2Key];
                    if (val1 === undefined || val1 === null || val2 === undefined || val2 === null) {
                        return null;
                    }
                    return {
                        date: d.date,
                        Spread: (val1 as number) - (val2 as number)
                    };
                })
                .filter((d): d is { date: string; Spread: number } => d !== null);

            if (spreadData.length === 0) {
                return (
                    <div className="flex items-center justify-center" style={{ height }}>
                        <p className="text-muted-foreground">No spread data available</p>
                    </div>
                );
            }

            const periodLabel1 = spreadPeriod1 === '63' ? '3mo' : spreadPeriod1 === '126' ? '6mo' : spreadPeriod1 === '252' ? '1yr' : '2yr';
            const periodLabel2 = spreadPeriod2 === '63' ? '3mo' : spreadPeriod2 === '126' ? '6mo' : spreadPeriod2 === '252' ? '1yr' : '2yr';

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
                        <LineChart data={spreadData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.getFullYear().toString();
                                }}
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
                                formatter={(value: any) => [`${Number(value).toFixed(2)}pp`, '']}
                            />
                            <Legend wrapperStyle={{ color: '#9ca3af' }} />
                            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
                            <Line
                                type="monotone"
                                dataKey="Spread"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={false}
                                name={`${periodLabel1} - ${periodLabel2} Spread`}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </>
            );
        }

        // Single period mode
        // Filter data to only show points where the selected period has data
        const periodKey = `${selectedPeriod}-Day Vol` as keyof VolatilityDataPoint;
        const displayData = chartData.filter(d => d[periodKey] !== undefined && d[periodKey] !== null);

        if (displayData.length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-muted-foreground">No {selectedPeriod}-day volatility data available</p>
                </div>
            );
        }

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
                    <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.getFullYear().toString();
                            }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `${value.toFixed(0)}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#f9fafb'
                            }}
                            labelStyle={{ color: '#9ca3af' }}
                            formatter={(value: any) => [`${Number(value).toFixed(2)}%`, '']}
                        />
                        <Legend wrapperStyle={{ color: '#9ca3af' }} />

                        {selectedPeriod === '63' && (
                            <Line
                                type="monotone"
                                dataKey="63-Day Vol"
                                stroke={CHART_COLORS['63-Day Vol']}
                                strokeWidth={2}
                                dot={false}
                                name="63-Day Volatility (3mo)"
                            />
                        )}
                        {selectedPeriod === '126' && (
                            <Line
                                type="monotone"
                                dataKey="126-Day Vol"
                                stroke={CHART_COLORS['126-Day Vol']}
                                strokeWidth={2}
                                dot={false}
                                name="126-Day Volatility (6mo)"
                            />
                        )}
                        {selectedPeriod === '252' && (
                            <Line
                                type="monotone"
                                dataKey="252-Day Vol"
                                stroke={CHART_COLORS['252-Day Vol']}
                                strokeWidth={2}
                                dot={false}
                                name="252-Day Volatility (1yr)"
                            />
                        )}
                        {selectedPeriod === '504' && (
                            <Line
                                type="monotone"
                                dataKey="504-Day Vol"
                                stroke={CHART_COLORS['504-Day Vol']}
                                strokeWidth={2}
                                dot={false}
                                name="504-Day Volatility (2yr)"
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </>
        );
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Controls */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card">
                {/* Mode Selector */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                    <label className="text-sm font-medium text-card-foreground">
                        Chart Mode:
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setChartMode('single')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${chartMode === 'single'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Single Period
                        </button>
                        <button
                            onClick={() => setChartMode('spread')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${chartMode === 'spread'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Spread (P1 − P2)
                        </button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                            Time Series
                        </label>
                        <select
                            value={selectedSeries}
                            onChange={(e) => setSelectedSeries(e.target.value)}
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
                <div className="space-y-3 mt-4">
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
            <div className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground">
                            {chartMode === 'spread' ? 'Volatility Spread' : 'Historical Volatility'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {chartMode === 'spread'
                                ? 'Difference between volatility periods (percentage points)'
                                : 'Annualized standard deviation (percentage)'}
                        </p>
                    </div>

                    {/* Period Selector */}
                    {chartMode === 'single' ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedPeriod('63')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === '63'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                3-Month
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('126')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === '126'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                6-Month
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('252')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === '252'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                1-Year
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('504')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === '504'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                2-Year
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 items-center">
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Period 1</label>
                                <select
                                    value={spreadPeriod1}
                                    onChange={(e) => setSpreadPeriod1(e.target.value as '63' | '126' | '252' | '504')}
                                    className="px-3 py-1.5 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="63">3-Month</option>
                                    <option value="126">6-Month</option>
                                    <option value="252">1-Year</option>
                                    <option value="504">2-Year</option>
                                </select>
                            </div>
                            <span className="text-muted-foreground mt-5">−</span>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Period 2</label>
                                <select
                                    value={spreadPeriod2}
                                    onChange={(e) => setSpreadPeriod2(e.target.value as '63' | '126' | '252' | '504')}
                                    className="px-3 py-1.5 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="63">3-Month</option>
                                    <option value="126">6-Month</option>
                                    <option value="252">1-Year</option>
                                    <option value="504">2-Year</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {renderContent()}

                {/* Stats */}
                {chartMode === 'single' && volatilityData.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                        {(['63', '126', '252', '504'] as const).map((period) => {
                            const key = `${period}-Day Vol` as keyof VolatilityDataPoint;
                            const sourceData = filteredData.length > 0 ? filteredData : volatilityData;
                            const values = sourceData
                                .map(d => d[key])
                                .filter((v): v is number => v !== undefined && v !== null);

                            if (values.length === 0) return null;

                            const latest = values[values.length - 1];
                            const avg = values.reduce((a, b) => a + b, 0) / values.length;
                            const max = Math.max(...values);
                            const min = Math.min(...values);

                            const periodLabel = period === '63' ? '3mo' : period === '126' ? '6mo' : period === '252' ? '1yr' : '2yr';

                            return (
                                <div key={period} className="p-3 rounded-lg bg-muted/50">
                                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                                        {periodLabel} Volatility
                                    </div>
                                    <div className="text-lg font-bold text-card-foreground">
                                        {latest.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Avg: {avg.toFixed(1)}% | Range: {min.toFixed(1)}% to {max.toFixed(1)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
