'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/format-utils';
import { generateYearlyTicks } from '@/lib/chart-utils';

export type EquityAssetClass = 'equities' | 'commodities' | 'crypto' | 'volatility';

interface EquitiesChartProps {
    height?: number;
    className?: string;
    onSelectionChange?: (assetClass: string, series: string) => void;
    onDateRangeChange?: (startDate: string, endDate: string) => void;
    initialAssetClass?: EquityAssetClass;
    initialSeries?: string;
    initialStartDate?: string;
    initialEndDate?: string;
    hideControls?: boolean;
}

interface ChartDataPoint {
    date: string;
    [key: string]: any;
}

interface SeriesInfo {
    series_name: string;
    display_name: string;
    units?: string;
    currency?: string;
}

// Map currencies to FX series names
// For pairs like EUR/USD and GBP/USD: multiply index by rate to get USD value
// For pairs like USD/JPY and USD/CAD: divide index by rate to get USD value
const CURRENCY_TO_FX_SERIES: { [key: string]: { assetClass: string; seriesName: string; inverted: boolean } } = {
    'GBP': { assetClass: 'fx', seriesName: 'GBPUSD', inverted: false },
    'EUR': { assetClass: 'fx', seriesName: 'EURUSD', inverted: false },
    'JPY': { assetClass: 'fx', seriesName: 'USDJPY', inverted: true },
    'TRY': { assetClass: 'fx', seriesName: 'USDTRY', inverted: true },
    'ARS': { assetClass: 'fx', seriesName: 'USDARS', inverted: true },
    'CAD': { assetClass: 'fx', seriesName: 'USDCAD', inverted: true },
};

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

const ASSET_CLASSES: { value: EquityAssetClass; label: string }[] = [
    { value: 'equities', label: 'Equities' },
    { value: 'commodities', label: 'Commodities' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'volatility', label: 'Volatility' }
];

export default function EquitiesChart({
    height = 400,
    className = '',
    onSelectionChange,
    onDateRangeChange,
    initialAssetClass = 'equities',
    initialSeries = '',
    initialStartDate = '',
    initialEndDate = '',
    hideControls = false
}: EquitiesChartProps) {
    const [assetClass, setAssetClass] = useState<EquityAssetClass>(initialAssetClass);
    const [availableSeries, setAvailableSeries] = useState<SeriesInfo[]>([]);
    const [selectedSeries, setSelectedSeries] = useState<string>(initialSeries);
    const [selectedUnits, setSelectedUnits] = useState<string | undefined>(undefined);
    const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(undefined);
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);
    const [datePreset, setDatePreset] = useState<string>(initialStartDate && initialEndDate ? 'custom' : '10y');
    const [customStartDate, setCustomStartDate] = useState<string>(initialStartDate);
    const [customEndDate, setCustomEndDate] = useState<string>(initialEndDate);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [convertToUSD, setConvertToUSD] = useState(false);

    // Ratio calculation state
    const [calculationMode, setCalculationMode] = useState<'single' | 'ratio'>('single');
    const [assetClass1, setAssetClass1] = useState<EquityAssetClass>('equities');
    const [assetClass2, setAssetClass2] = useState<EquityAssetClass>('equities');
    const [series1, setSeries1] = useState<string>('');
    const [series2, setSeries2] = useState<string>('');
    const [availableSeries1, setAvailableSeries1] = useState<Array<{ series_name: string; display_name: string; units?: string }>>([]);
    const [availableSeries2, setAvailableSeries2] = useState<Array<{ series_name: string; display_name: string; units?: string }>>([]);
    const [ratioData, setRatioData] = useState<ChartDataPoint[]>([]);

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
                    units: s.units,
                    currency: s.currency
                }));
                setAvailableSeries(seriesWithNames);

                // Auto-select S&P 500 (US/GSPC) if available, otherwise first series
                if (seriesWithNames.length > 0) {
                    const sp500 = seriesWithNames.find((s: SeriesInfo) => s.series_name === 'US/GSPC');
                    const selected = sp500 || seriesWithNames[0];
                    setSelectedSeries(selected.series_name);
                    setSelectedUnits(selected.units);
                    setSelectedCurrency(selected.currency);
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSeries([]);
            }
        };

        loadSeries();
    }, [assetClass]);

    // Load available series for ratio calculation - Series 1
    useEffect(() => {
        const loadSeries = async () => {
            try {
                const response = await fetch(`/api/data/${assetClass1}`);
                if (!response.ok) {
                    throw new Error('Failed to load series list');
                }
                const result = await response.json();
                const seriesWithNames = result.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name,
                    units: s.units
                }));
                setAvailableSeries1(seriesWithNames);

                // Auto-select first series
                if (seriesWithNames.length > 0 && !series1) {
                    setSeries1(seriesWithNames[0].series_name);
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSeries1([]);
            }
        };

        if (calculationMode === 'ratio') {
            loadSeries();
        }
    }, [assetClass1, calculationMode]);

    // Load available series for ratio calculation - Series 2
    useEffect(() => {
        const loadSeries = async () => {
            try {
                const response = await fetch(`/api/data/${assetClass2}`);
                if (!response.ok) {
                    throw new Error('Failed to load series list');
                }
                const result = await response.json();
                const seriesWithNames = result.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name,
                    units: s.units
                }));
                setAvailableSeries2(seriesWithNames);

                // Auto-select first series
                if (seriesWithNames.length > 0 && !series2) {
                    setSeries2(seriesWithNames[0].series_name);
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSeries2([]);
            }
        };

        if (calculationMode === 'ratio') {
            loadSeries();
        }
    }, [assetClass2, calculationMode]);

    // Load data when series changes
    useEffect(() => {
        if (calculationMode !== 'single' || !selectedSeries) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/data/${assetClass}?series=${selectedSeries}`);

                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.statusText}`);
                }

                const result = await response.json();
                let processedData = result.data;

                // Apply USD conversion if enabled
                if (convertToUSD && selectedCurrency && selectedCurrency !== 'USD' && CURRENCY_TO_FX_SERIES[selectedCurrency]) {
                    const fxInfo = CURRENCY_TO_FX_SERIES[selectedCurrency];
                    const fxResponse = await fetch(`/api/data/${fxInfo.assetClass}?series=${encodeURIComponent(fxInfo.seriesName)}`);

                    if (fxResponse.ok) {
                        const fxResult = await fxResponse.json();

                        // Create a sorted array of FX data for forward-filling
                        const fxData = fxResult.data.sort((a: ChartDataPoint, b: ChartDataPoint) =>
                            a.date.localeCompare(b.date)
                        );

                        // Build a map with forward-filling for missing dates
                        const fxMap = new Map<string, number>();
                        fxData.forEach((point: ChartDataPoint) => {
                            if (point.Value !== undefined && point.Value !== null) {
                                fxMap.set(point.date, point.Value);
                            }
                        });

                        // Convert index values using FX rates with forward-filling
                        processedData = processedData.map((point: ChartDataPoint) => {
                            let fxRate = fxMap.get(point.date);

                            // If no exact match, find the most recent FX rate before this date
                            if (!fxRate) {
                                for (let i = fxData.length - 1; i >= 0; i--) {
                                    if (fxData[i].date <= point.date && fxData[i].Value) {
                                        fxRate = fxData[i].Value;
                                        break;
                                    }
                                }
                            }

                            if (fxRate && point.Value !== undefined) {
                                // If inverted (like USD/JPY), divide; otherwise multiply
                                const convertedValue = fxInfo.inverted
                                    ? point.Value / fxRate
                                    : point.Value * fxRate;
                                return { ...point, Value: convertedValue };
                            }
                            return point;
                        });
                    }
                }

                setData(processedData);

                // Notify parent of selection change
                if (onSelectionChange) {
                    onSelectionChange(assetClass, selectedSeries);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [assetClass, selectedSeries, calculationMode, onSelectionChange, convertToUSD, selectedCurrency]);

    // Calculate ratio when in ratio mode
    useEffect(() => {
        if (calculationMode !== 'ratio' || !series1 || !series2 || !assetClass1 || !assetClass2) {
            setRatioData([]);
            return;
        }

        const loadRatioData = async () => {
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

                // Calculate ratio (series1 / series2)
                const calculated = result1.data
                    .map((point: ChartDataPoint) => {
                        const value2 = series2Map.get(point.date);
                        if (value2 === undefined || value2 === 0) return null;

                        return {
                            date: point.date,
                            Value: point.Value / value2
                        };
                    })
                    .filter((point: ChartDataPoint | null) => point !== null) as ChartDataPoint[];

                setRatioData(calculated);
                setSelectedUnits('ratio'); // Ratios are unitless
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to calculate ratio');
            } finally {
                setLoading(false);
            }
        };

        loadRatioData();
    }, [calculationMode, series1, series2, assetClass1, assetClass2]);

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

    // Notify parent of date range changes
    useEffect(() => {
        if (calculationMode === 'single' && filteredData.length > 0 && onDateRangeChange) {
            const startDate = filteredData[0].date;
            const endDate = filteredData[filteredData.length - 1].date;
            onDateRangeChange(startDate, endDate);
        }
    }, [filteredData, calculationMode, onDateRangeChange]);

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
                            tickFormatter={(value) => {
                                return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
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
                            stroke={CHART_COLORS[0]}
                            strokeWidth={2}
                            dot={false}
                            name={calculationMode === 'ratio'
                                ? `${availableSeries1.find(s => s.series_name === series1)?.display_name || series1} / ${availableSeries2.find(s => s.series_name === series2)?.display_name || series2}`
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
            {!hideControls && (
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
                        /* Ratio Mode: Two Series Selectors with Asset Classes */
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-card-foreground mb-2">
                                        Asset Class 1
                                    </label>
                                    <select
                                        value={assetClass1}
                                        onChange={(e) => {
                                            setAssetClass1(e.target.value as EquityAssetClass);
                                            setSeries1('');
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
                                        value={series1}
                                        onChange={(e) => setSeries1(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        disabled={availableSeries1.length === 0}
                                    >
                                        {availableSeries1.map(series => (
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
                                        value={assetClass2}
                                        onChange={(e) => {
                                            setAssetClass2(e.target.value as EquityAssetClass);
                                            setSeries2('');
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
                                        value={series2}
                                        onChange={(e) => setSeries2(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                        disabled={availableSeries2.length === 0}
                                    >
                                        {availableSeries2.map(series => (
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
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-card-foreground mb-2">
                                    Asset Class
                                </label>
                                <select
                                    value={assetClass}
                                    onChange={(e) => setAssetClass(e.target.value as EquityAssetClass)}
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
                                    Time Series
                                </label>
                                <select
                                    value={selectedSeries}
                                    onChange={(e) => {
                                        setSelectedSeries(e.target.value);
                                        const series = availableSeries.find(s => s.series_name === e.target.value);
                                        setSelectedUnits(series?.units);
                                        setSelectedCurrency(series?.currency);
                                        setConvertToUSD(false); // Reset conversion when changing series
                                    }}
                                    className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    disabled={availableSeries.length === 0}
                                >
                                    {assetClass === 'equities' ? (
                                        <>
                                            <optgroup label="US Indices">
                                                {availableSeries
                                                    .filter(s => s.series_name.startsWith('US/') || s.series_name === 'NDX' || s.series_name === 'DJI')
                                                    .map(series => (
                                                        <option key={series.series_name} value={series.series_name}>
                                                            {series.display_name}
                                                        </option>
                                                    ))}
                                            </optgroup>
                                            <optgroup label="International Indices">
                                                {availableSeries
                                                    .filter(s => !s.series_name.startsWith('US/') && s.series_name !== 'NDX' && s.series_name !== 'DJI')
                                                    .map(series => (
                                                        <option key={series.series_name} value={series.series_name}>
                                                            {series.display_name}
                                                        </option>
                                                    ))}
                                            </optgroup>
                                        </>
                                    ) : (
                                        availableSeries.map(series => (
                                            <option key={series.series_name} value={series.series_name}>
                                                {series.display_name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* USD Conversion Toggle (only for equities with non-USD currency) */}
                    {assetClass === 'equities' && selectedCurrency && selectedCurrency !== 'USD' && CURRENCY_TO_FX_SERIES[selectedCurrency] && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={convertToUSD}
                                    onChange={(e) => setConvertToUSD(e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-card-foreground">
                                    Convert to USD (currently in {selectedCurrency})
                                </span>
                            </label>
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
            )}

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
                                        {(() => {
                                            // Find the data point with the most recent date
                                            const latestDataPoint = data.reduce((latest, current) =>
                                                current.date > latest.date ? current : latest
                                            );
                                            return formatTooltipValue(latestDataPoint.Value, convertToUSD ? 'usd' : selectedUnits);
                                        })()}
                                    </div>
                                    {selectedCurrency && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {convertToUSD ? 'USD (converted)' : selectedCurrency}
                                        </div>
                                    )}
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
                                </div>
                            </>
                        )}
                        {calculationMode === 'ratio' && ratioData.length > 0 && (
                            <>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Current Ratio</div>
                                    <div className="text-2xl font-bold text-card-foreground">
                                        {(() => {
                                            // Find the data point with the most recent date
                                            const latestDataPoint = ratioData.reduce((latest, current) =>
                                                current.date > latest.date ? current : latest
                                            );
                                            return latestDataPoint.Value.toFixed(4);
                                        })()}
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
                                        {availableSeries1.find(s => s.series_name === series1)?.display_name || series1}
                                        {' / '}
                                        {availableSeries2.find(s => s.series_name === series2)?.display_name || series2}
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
