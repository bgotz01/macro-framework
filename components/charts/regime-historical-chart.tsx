'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/format-utils';
import { generateMonthlyTicks } from '@/lib/chart-utils';
import { getResponsiveHeight, getResponsiveMargin, getResponsiveFontSize, getResponsiveYAxisWidth } from '@/lib/responsive-chart-utils';

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

const EQUITY_SERIES = [
    { series_name: 'US/GSPC', display_name: 'S&P 500', units: 'index' },
    { series_name: 'US/IXIC', display_name: 'Nasdaq Composite', units: 'index' },
];

export default function RegimeHistoricalChart({
    selectedDateRange,
    height = 400,
    className = ''
}: RegimeHistoricalChartProps) {
    const [selectedSeries, setSelectedSeries] = useState<string>('US/GSPC');
    const [selectedUnits, setSelectedUnits] = useState<string | undefined>('index');
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

    // Load data when series changes
    useEffect(() => {
        if (!selectedSeries) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/data/equities?series=${selectedSeries}`);

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
    }, [selectedSeries]);

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
                                const date = new Date(value + 'T00:00:00');
                                const mm = String(date.getMonth() + 1).padStart(2, '0');
                                const yyyy = date.getFullYear();
                                return `${mm}-${yyyy}`;
                            }}
                            ticks={generateMonthlyTicks(chartData)}
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
                            name={EQUITY_SERIES.find(s => s.series_name === selectedSeries)?.display_name ?? selectedSeries}
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
            <div className="mb-5">
                <h3 className="section-title text-lg text-foreground">Regime Period Chart</h3>
                <p className="text-sm text-muted-foreground mt-1 tracking-wide">
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

                <div className="flex gap-2">
                    {EQUITY_SERIES.map(s => (
                        <button
                            key={s.series_name}
                            onClick={() => {
                                setSelectedSeries(s.series_name);
                                setSelectedUnits(s.units);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedSeries === s.series_name
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted text-card-foreground border-border hover:bg-muted/80'
                                }`}
                        >
                            {s.display_name}
                        </button>
                    ))}
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
