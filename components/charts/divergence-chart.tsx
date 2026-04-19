'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatTooltipValue } from '@/lib/format-utils';
import { generateYearlyTicks } from '@/lib/chart-utils';
import { useTheme } from '../theme-provider';
import { getResponsiveHeight, getResponsiveMargin, getResponsiveFontSize, getResponsiveYAxisWidth } from '@/lib/responsive-chart-utils';
import HistoricalDataTable from './historical-data-table';

interface DivergenceChartProps {
    height?: number;
    className?: string;
    initialMAs?: string[];
}

interface ChartDataPoint {
    date: string;
    [key: string]: any;
}

type ViewMode = 'price' | 'divergence' | 'slope' | 'days' | 'percentile';

interface MAInfo {
    period: string;
    label: string;
    color: string;
    priceKey: string;
    divKey: string;
    slopeKey: string;
    positiveSlopeKey: string;
    priceAboveKey: string;
    divPercentileKey: string;
    slopePercentileKey: string;
    slopeStreakPercentileKey: string;
    priceAbovePercentileKey: string;
}

const MA_OPTIONS: MAInfo[] = [
    {
        period: '50',
        label: '50-Day MA',
        color: '#2563eb',
        priceKey: 'MA50',
        divKey: 'Div50',
        slopeKey: 'Slope50',
        positiveSlopeKey: 'SlopeStreak50',
        priceAboveKey: 'PriceAboveStreak50',
        divPercentileKey: 'DivPercentile50',
        slopePercentileKey: 'SlopePercentile50',
        slopeStreakPercentileKey: 'SlopeStreakPercentile50',
        priceAbovePercentileKey: 'PriceAbovePercentile50'
    },
    {
        period: '200',
        label: '200-Day MA',
        color: '#dc2626',
        priceKey: 'MA200',
        divKey: 'Div200',
        slopeKey: 'Slope200',
        positiveSlopeKey: 'SlopeStreak200',
        priceAboveKey: 'PriceAboveStreak200',
        divPercentileKey: 'DivPercentile200',
        slopePercentileKey: 'SlopePercentile200',
        slopeStreakPercentileKey: 'SlopeStreakPercentile200',
        priceAbovePercentileKey: 'PriceAbovePercentile200'
    },
    {
        period: '500',
        label: '500-Day MA',
        color: '#f59e0b',
        priceKey: 'MA500',
        divKey: 'Div500',
        slopeKey: 'Slope500',
        positiveSlopeKey: 'SlopeStreak500',
        priceAboveKey: 'PriceAboveStreak500',
        divPercentileKey: 'DivPercentile500',
        slopePercentileKey: 'SlopePercentile500',
        slopeStreakPercentileKey: 'SlopeStreakPercentile500',
        priceAbovePercentileKey: 'PriceAbovePercentile500'
    }
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
        { label: 'Last 20Y', value: '20y' },
        { label: 'Custom', value: 'custom' },
    ];

export default function DivergenceChart({
    height = 400,
    className = '',
    initialMAs = ['50', '200']
}: DivergenceChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('price');
    const [daysMetric, setDaysMetric] = useState<'positiveSlope' | 'priceAbove'>('positiveSlope');
    const [percentileMetric, setPercentileMetric] = useState<'divergence' | 'slope' | 'slopeStreak' | 'priceAbove'>('divergence');
    const [selectedMAs, setSelectedMAs] = useState<string[]>(initialMAs);
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);
    const [datePreset, setDatePreset] = useState<string>('10y');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [responsiveHeight, setResponsiveHeight] = useState(height);

    useEffect(() => {
        const handleResize = () => {
            setResponsiveHeight(getResponsiveHeight(height));
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [height]);
    const [error, setError] = useState<string | null>(null);
    const [showTable, setShowTable] = useState(false);
    const [index, setIndex] = useState<'sp500' | 'ndx'>('sp500');
    const { theme } = useTheme();

    // Load data when index changes
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/divergence-data?index=${index}`);
                if (!res.ok) throw new Error('Failed to load data');
                const json = await res.json();
                setData(json.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [index]); // Reload when index changes

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
            startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()).toISOString().split('T')[0];
            endDate = now.toISOString().split('T')[0];
        } else if (datePreset === '10y') {
            const now = new Date();
            startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate()).toISOString().split('T')[0];
            endDate = now.toISOString().split('T')[0];
        } else if (datePreset === '20y') {
            const now = new Date();
            startDate = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate()).toISOString().split('T')[0];
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

        const isDark = theme === 'dark';
        const gridColor = isDark ? '#374151' : '#e5e7eb';
        const textColor = isDark ? '#9ca3af' : '#6b7280';
        const tooltipBg = isDark ? '#1f2937' : '#ffffff';
        const tooltipBorder = isDark ? '#374151' : '#e5e7eb';
        const priceLineColor = isDark ? '#ffffff' : '#000000';

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
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke={textColor}
                            tick={{ fill: textColor, fontSize: 12 }}
                            tickFormatter={(value) => {
                                const [y, m, d] = value.split('-').map(Number);
                                return new Date(y, m - 1, d).getFullYear().toString();
                            }}
                            ticks={generateYearlyTicks(chartData)}
                        />
                        <YAxis width={getResponsiveYAxisWidth()}
                            stroke={textColor}
                            tick={{ fill: textColor, fontSize: 12 }}
                            domain={viewMode === 'percentile' ? [0, 100] : ['auto', 'auto']}
                            tickFormatter={(value) => {
                                if (viewMode === 'percentile') {
                                    return `${value.toFixed(0)}%`;
                                } else if (viewMode === 'divergence') {
                                    return `${value.toFixed(1)}%`;
                                } else if (viewMode === 'slope') {
                                    return `${value.toFixed(2)}%`;
                                } else if (viewMode === 'days') {
                                    return `${value}`;
                                }
                                return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: tooltipBg,
                                border: `1px solid ${tooltipBorder}`,
                                borderRadius: '8px',
                                color: isDark ? '#f9fafb' : '#1f2937'
                            }}
                            labelStyle={{ color: textColor }}
                            labelFormatter={(label: any) => {
                                const [y, m, d] = String(label).split('-').map(Number);
                                return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            }}
                            formatter={(value: any, name?: string) => {
                                if (viewMode === 'percentile') {
                                    return `${Number(value).toFixed(1)}%`;
                                } else if (viewMode === 'divergence' || (name && name.includes('Divergence'))) {
                                    return formatTooltipValue(Number(value), '%');
                                } else if (viewMode === 'slope' || (name && name.includes('Slope'))) {
                                    return `${Number(value).toFixed(4)}%`;
                                } else if (viewMode === 'days') {
                                    return `${Number(value).toFixed(0)} days`;
                                }
                                return formatTooltipValue(Number(value), undefined);
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: getResponsiveFontSize(), color: textColor }} />
                        {(viewMode === 'divergence' || viewMode === 'slope' || viewMode === 'days') && (
                            <ReferenceLine y={0} stroke={textColor} strokeDasharray="3 3" opacity={0.5} />
                        )}
                        {viewMode === 'percentile' && (
                            <>
                                <ReferenceLine y={20} stroke={textColor} strokeDasharray="3 3" opacity={0.3} />
                                <ReferenceLine y={40} stroke={textColor} strokeDasharray="3 3" opacity={0.3} />
                                <ReferenceLine y={60} stroke={textColor} strokeDasharray="3 3" opacity={0.3} />
                                <ReferenceLine y={80} stroke={textColor} strokeDasharray="3 3" opacity={0.3} />
                            </>
                        )}
                        {viewMode === 'price' ? (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="Price"
                                    stroke={priceLineColor}
                                    strokeWidth={2}
                                    dot={false}
                                    name={index === 'sp500' ? 'S&P 500' : 'NDX 100'}
                                />
                                {selectedMAs.map((period) => {
                                    const maInfo = MA_OPTIONS.find(ma => ma.period === period);
                                    if (!maInfo) return null;
                                    return (
                                        <Line
                                            key={maInfo.priceKey}
                                            type="monotone"
                                            dataKey={maInfo.priceKey}
                                            stroke={maInfo.color}
                                            strokeWidth={2}
                                            dot={false}
                                            name={maInfo.label}
                                        />
                                    );
                                })}
                            </>
                        ) : viewMode === 'divergence' ? (
                            <>
                                {selectedMAs.map((period) => {
                                    const maInfo = MA_OPTIONS.find(ma => ma.period === period);
                                    if (!maInfo) return null;
                                    return (
                                        <Line
                                            key={maInfo.divKey}
                                            type="monotone"
                                            dataKey={maInfo.divKey}
                                            stroke={maInfo.color}
                                            strokeWidth={2}
                                            dot={false}
                                            name={`${maInfo.label} Divergence`}
                                        />
                                    );
                                })}
                            </>
                        ) : viewMode === 'slope' ? (
                            <>
                                {selectedMAs.map((period) => {
                                    const maInfo = MA_OPTIONS.find(ma => ma.period === period);
                                    if (!maInfo) return null;
                                    return (
                                        <Line
                                            key={maInfo.slopeKey}
                                            type="monotone"
                                            dataKey={maInfo.slopeKey}
                                            stroke={maInfo.color}
                                            strokeWidth={2}
                                            dot={false}
                                            name={`${maInfo.label} Slope`}
                                        />
                                    );
                                })}
                            </>
                        ) : viewMode === 'days' ? (
                            <>
                                {selectedMAs.map((period) => {
                                    const maInfo = MA_OPTIONS.find(ma => ma.period === period);
                                    if (!maInfo) return null;
                                    const dataKey = daysMetric === 'positiveSlope' ? maInfo.positiveSlopeKey : maInfo.priceAboveKey;
                                    const label = daysMetric === 'positiveSlope'
                                        ? `${maInfo.label} Days Positive`
                                        : `${maInfo.label} Days Above`;
                                    return (
                                        <Line
                                            key={dataKey}
                                            type="monotone"
                                            dataKey={dataKey}
                                            stroke={maInfo.color}
                                            strokeWidth={2}
                                            dot={false}
                                            name={label}
                                        />
                                    );
                                })}
                            </>
                        ) : (
                            <>
                                {selectedMAs.map((period) => {
                                    const maInfo = MA_OPTIONS.find(ma => ma.period === period);
                                    if (!maInfo) return null;
                                    let dataKey: string;
                                    let label: string;

                                    if (percentileMetric === 'divergence') {
                                        dataKey = maInfo.divPercentileKey;
                                        label = `${maInfo.label} Divergence Percentile`;
                                    } else if (percentileMetric === 'slope') {
                                        dataKey = maInfo.slopePercentileKey;
                                        label = `${maInfo.label} Slope Percentile`;
                                    } else if (percentileMetric === 'slopeStreak') {
                                        dataKey = maInfo.slopeStreakPercentileKey;
                                        label = `${maInfo.label} Slope Streak Percentile`;
                                    } else {
                                        dataKey = maInfo.priceAbovePercentileKey;
                                        label = `${maInfo.label} Price Above Percentile`;
                                    }

                                    return (
                                        <Line
                                            key={dataKey}
                                            type="monotone"
                                            dataKey={dataKey}
                                            stroke={maInfo.color}
                                            strokeWidth={2}
                                            dot={false}
                                            name={label}
                                        />
                                    );
                                })}
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </>
        );
    };

    const latestDate = data.length > 0 ? data[data.length - 1].date : null;

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            {/* Latest Date */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Price Divergence</h3>
                {latestDate && (
                    <div className="text-xs text-muted-foreground">
                        Latest data: {(() => { const [y, m, d] = latestDate.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); })()}
                    </div>
                )}
            </div>
            {/* Controls */}
            <div className="mb-6 space-y-4">
                {/* View Mode Toggle + Index Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-card-foreground">View Mode:</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('price')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'price' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                Price & MAs
                            </button>
                            <button
                                onClick={() => setViewMode('divergence')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'divergence' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                Divergence
                            </button>
                            <button
                                onClick={() => setViewMode('slope')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'slope' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                Slopes
                            </button>
                            <button
                                onClick={() => setViewMode('days')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'days' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                Days
                            </button>
                            <button
                                onClick={() => setViewMode('percentile')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'percentile' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                Percentile
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {(['sp500', 'ndx'] as const).map(idx => (
                            <button
                                key={idx}
                                onClick={() => setIndex(idx)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${index === idx ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                {idx === 'sp500' ? 'S&P 500' : 'NDX 100'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Days Metric Selector - only show when in Days view */}
                {viewMode === 'days' && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <label className="text-sm font-medium text-card-foreground">
                            Metric:
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDaysMetric('positiveSlope')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${daysMetric === 'positiveSlope'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Slope Streak
                            </button>
                            <button
                                onClick={() => setDaysMetric('priceAbove')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${daysMetric === 'priceAbove'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Price over MA Streak
                            </button>
                        </div>
                    </div>
                )}

                {/* Percentile Metric Selector - only show when in Percentile view */}
                {viewMode === 'percentile' && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <label className="text-sm font-medium text-card-foreground">
                            Metric:
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPercentileMetric('divergence')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${percentileMetric === 'divergence'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Divergence
                            </button>
                            <button
                                onClick={() => setPercentileMetric('slope')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${percentileMetric === 'slope'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Slope
                            </button>
                            <button
                                onClick={() => setPercentileMetric('slopeStreak')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${percentileMetric === 'slopeStreak'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Slope Streak
                            </button>
                            <button
                                onClick={() => setPercentileMetric('priceAbove')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${percentileMetric === 'priceAbove'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Price Above Streak
                            </button>
                        </div>
                    </div>
                )}

                {/* MA Selector */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-card-foreground">
                        Select Moving Averages
                    </label>
                    <div className="flex gap-4">
                        {MA_OPTIONS.map(ma => (
                            <label key={ma.period} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectedMAs.includes(ma.period)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedMAs([...selectedMAs, ma.period]);
                                        } else {
                                            setSelectedMAs(selectedMAs.filter(p => p !== ma.period));
                                        }
                                    }}
                                    className="w-4 h-4 rounded border-2 border-border bg-background checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer transition-colors"
                                />
                                <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">{ma.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Date Preset Selector */}
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

            {/* Table Toggle */}
            <button
                onClick={() => setShowTable(!showTable)}
                className="mt-4 w-full px-4 py-2 rounded-lg bg-muted text-card-foreground hover:bg-muted/80 transition-colors text-sm font-medium"
            >
                {showTable ? 'Hide Data Table' : 'Show Data Table'}
            </button>

            {/* Data Table */}
            {showTable && filteredData.length > 0 && (
                <div className="mt-6">
                    <HistoricalDataTable
                        data={filteredData}
                        seriesName={
                            viewMode === 'price'
                                ? 'S&P 500 Price & Moving Averages'
                                : viewMode === 'divergence'
                                    ? 'S&P 500 MA Divergence'
                                    : viewMode === 'slope'
                                        ? 'S&P 500 MA Slopes'
                                        : viewMode === 'days'
                                            ? daysMetric === 'positiveSlope'
                                                ? 'MA Slope Streaks (Days)'
                                                : 'Price vs MA Streaks (Days)'
                                            : percentileMetric === 'divergence'
                                                ? 'MA Divergence Percentiles'
                                                : percentileMetric === 'slope'
                                                    ? 'MA Slope Percentiles'
                                                    : percentileMetric === 'slopeStreak'
                                                        ? 'MA Slope Streak Percentiles'
                                                        : 'MA Price Above Percentiles'
                        }
                    />
                </div>
            )}
        </div>
    );
}
