'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/format-utils';
import { generateYearlyTicks } from '@/lib/chart-utils';
import { getResponsiveHeight, getResponsiveMargin, getResponsiveFontSize, getResponsiveYAxisWidth } from '@/lib/responsive-chart-utils';

export type AssetClass = 'bonds' | 'fx' | 'equities' | 'economic' | 'moneysupply' | 'commodities' | 'volatility' | 'crypto' | 'valuations';

interface RegimeHistoricalChartProps {
    selectedDateRange: { start: string; end: string } | null;
    height?: number;
    className?: string;
}

interface ChartDataPoint {
    date: string;
    [key: string]: any;
}

const CHART_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'];

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

export default function RegimeHistoricalChart({
    selectedDateRange,
    height = 400,
    className = ''
}: RegimeHistoricalChartProps) {
    const [assetClass, setAssetClass] = useState<AssetClass>('equities');
    const [availableSeries, setAvailableSeries] = useState<Array<{ series_name: string; display_name: string; units?: string }>>([]);
    const [selectedSeries, setSelectedSeries] = useState<string>('US/GSPC');
    const [selectedUnits, setSelectedUnits] = useState<string | undefined>(undefined);
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [responsiveHeight, setResponsiveHeight] = useState(height);
    const [show200MA, setShow200MA] = useState(false);
    const [extendOneYear, setExtendOneYear] = useState(false);

    // Responsive height
    useEffect(() => {
        const handleResize = () => {
            setResponsiveHeight(getResponsiveHeight(height));
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [height]);

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

                // Auto-select S&P 500 if available, otherwise first series
                const sp500Series = seriesWithNames.find((s: { series_name: string; display_name: string; units?: string }) => s.series_name === 'US/GSPC');
                if (sp500Series) {
                    setSelectedSeries(sp500Series.series_name);
                    setSelectedUnits(sp500Series.units);
                } else if (seriesWithNames.length > 0) {
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

    // Filter data based on selected date range
    useEffect(() => {
        if (data.length === 0) {
            setFilteredData([]);
            return;
        }

        if (!selectedDateRange) {
            // Show all data if no regime is selected
            setFilteredData(data);
            return;
        }

        // Calculate end date with optional +1 year extension
        let endDate = selectedDateRange.end;
        if (extendOneYear) {
            const endDateObj = new Date(selectedDateRange.end);
            endDateObj.setFullYear(endDateObj.getFullYear() + 1);
            endDate = endDateObj.toISOString().split('T')[0];
        }

        const filtered = data.filter(d =>
            d.date >= selectedDateRange.start && d.date <= endDate
        );

        setFilteredData(filtered);
    }, [data, selectedDateRange, extendOneYear]);

    // Calculate 200-day moving average
    const calculateMA = (data: ChartDataPoint[], period: number = 200): ChartDataPoint[] => {
        return data.map((point, index) => {
            if (index < period - 1) {
                return { ...point, MA200: null };
            }

            const sum = data
                .slice(index - period + 1, index + 1)
                .reduce((acc, p) => acc + (p.Value || 0), 0);

            return {
                ...point,
                MA200: sum / period
            };
        });
    };

    const chartData = (() => {
        const baseData = filteredData.length > 0 ? filteredData : data;
        return show200MA ? calculateMA(baseData) : baseData;
    })();

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center" style={{ height: responsiveHeight }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center" style={{ height: responsiveHeight }}>
                    <div className="text-center">
                        <p className="text-red-500 font-medium mb-2">Error loading data</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height: responsiveHeight }}>
                    <p className="text-muted-foreground">No data available</p>
                </div>
            );
        }

        const noDataInRange = selectedDateRange && filteredData.length === 0;

        return (
            <>
                {noDataInRange && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            ⚠️ No data available for the selected regime period. Showing all data instead.
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
                                color: '#f9fafb',
                                fontSize: getResponsiveFontSize()
                            }}
                            labelStyle={{ color: '#9ca3af' }}
                            formatter={(value: any) => formatTooltipValue(Number(value), selectedUnits)}
                        />
                        <Legend
                            wrapperStyle={{ color: '#9ca3af', fontSize: getResponsiveFontSize() }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Value"
                            stroke={CHART_COLORS[0]}
                            strokeWidth={2}
                            dot={false}
                            name={selectedSeries.replace('.csv', '').replace(/[-_]/g, ' ')}
                        />
                        {show200MA && (
                            <Line
                                type="monotone"
                                dataKey="MA200"
                                stroke={CHART_COLORS[1]}
                                strokeWidth={2}
                                dot={false}
                                name="200-Day MA"
                                strokeDasharray="5 5"
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </>
        );
    };

    return (
        <div className={`p-2 sm:p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Regime Period Chart</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {selectedDateRange
                        ? (() => {
                            const startDate = new Date(selectedDateRange.start).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                            let endDate = new Date(selectedDateRange.end).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

                            if (extendOneYear) {
                                const extendedEndDate = new Date(selectedDateRange.end);
                                extendedEndDate.setFullYear(extendedEndDate.getFullYear() + 1);
                                endDate = extendedEndDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                            }

                            return `Showing data from ${startDate} to ${endDate}${extendOneYear ? ' (+1 year)' : ''}`;
                        })()
                        : 'Click a regime in the table above to view its period'}
                </p>
            </div>

            {/* Controls */}
            <div className="mb-3 sm:mb-6 space-y-3 sm:space-y-4">
                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={show200MA}
                            onChange={(e) => setShow200MA(e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                        />
                        <span className="text-sm font-medium text-card-foreground">
                            Show 200-Day Moving Average
                        </span>
                    </label>

                    {selectedDateRange && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={extendOneYear}
                                onChange={(e) => setExtendOneYear(e.target.checked)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                            />
                            <span className="text-sm font-medium text-card-foreground">
                                Extend +1 Year After Exit
                            </span>
                        </label>
                    )}
                </div>

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

                {/* Info */}
                {data.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">
                            {filteredData.length > 0 ? filteredData.length : data.length} data points
                            {filteredData.length > 0 && filteredData.length !== data.length && (
                                <span className="text-xs ml-1">of {data.length} total</span>
                            )}
                        </p>
                        <p className="text-muted-foreground">
                            {(() => {
                                const displayData = filteredData.length > 0 ? filteredData : data;
                                return displayData.length > 0
                                    ? `${displayData[0]?.date} to ${displayData[displayData.length - 1]?.date}`
                                    : '';
                            })()}
                        </p>
                    </div>
                )}
            </div>

            {/* Chart */}
            {renderContent()}
        </div>
    );
}
