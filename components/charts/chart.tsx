'use client';

import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { DataService, ChartData, DataPoint } from '@/lib/data-service';
import { format, parseISO, isValid, subYears } from 'date-fns';

export type TimePeriod = '2yr' | '5yr' | '10yr' | '20yr' | 'all';
export type ChartType = 'line' | 'bar' | 'area';

interface ChartProps {
    filePath: string;
    height?: number;
    className?: string;
    title?: string;
    xAxisKey?: string;
    yAxisKey?: string;
    showGrid?: boolean;
    showLegend?: boolean;
    colors?: string[];
    timePeriod?: TimePeriod;
    chartType?: ChartType;
    startDate?: string; // YYYY-MM-DD format
    endDate?: string; // YYYY-MM-DD format
    showMetadata?: boolean; // Show data points count and time period
}

export default function Chart({
    filePath,
    height = 400,
    className = '',
    title,
    xAxisKey,
    yAxisKey,
    showGrid = true,
    showLegend = true,
    colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'],
    timePeriod = '5yr',
    chartType = 'line',
    startDate,
    endDate,
    showMetadata = true,
}: ChartProps) {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await DataService.loadCSV(filePath);
                setChartData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [filePath]);

    const filterDataByTimePeriod = (data: DataPoint[], period: TimePeriod, dateKey: string): DataPoint[] => {
        if (!data.length) return data;

        // If custom date range is provided, use that instead of period
        if (startDate || endDate) {
            return data.filter(row => {
                const dateValue = row[dateKey];
                if (typeof dateValue === 'string') {
                    try {
                        const date = parseISO(dateValue);
                        if (isValid(date)) {
                            if (startDate && date < parseISO(startDate)) return false;
                            if (endDate && date > parseISO(endDate)) return false;
                            return true;
                        }
                    } catch {
                        return true;
                    }
                }
                return true;
            });
        }

        if (period === 'all') return data;

        const now = new Date();
        let cutoffDate: Date;

        switch (period) {
            case '2yr':
                cutoffDate = subYears(now, 2);
                break;
            case '5yr':
                cutoffDate = subYears(now, 5);
                break;
            case '10yr':
                cutoffDate = subYears(now, 10);
                break;
            case '20yr':
                cutoffDate = subYears(now, 20);
                break;
            default:
                return data;
        }

        return data.filter(row => {
            const dateValue = row[dateKey];
            if (typeof dateValue === 'string') {
                try {
                    const date = parseISO(dateValue);
                    if (isValid(date)) {
                        return date >= cutoffDate;
                    }
                } catch {
                    // If date parsing fails, include the row
                    return true;
                }
            }
            return true;
        });
    };

    const formatXAxisTick = (value: any) => {
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            try {
                const date = parseISO(value);
                if (isValid(date)) {
                    return format(date, 'MMM yyyy');
                }
            } catch {
                // Fall back to original value
            }
        }
        return value;
    };

    const formatTooltipLabel = (value: any) => {
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            try {
                const date = parseISO(value);
                if (isValid(date)) {
                    return format(date, 'MMM dd, yyyy');
                }
            } catch {
                // Fall back to original value
            }
        }
        return value;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium text-card-foreground mb-2">
                        {formatTooltipLabel(label)}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className={`p-6 rounded-2xl border border-border/50 bg-card ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-6 rounded-2xl border border-border/50 bg-card ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-500 font-medium mb-2">Error loading chart</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!chartData || chartData.data.length === 0) {
        return (
            <div className={`p-6 rounded-2xl border border-border/50 bg-card ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No data available</p>
                </div>
            </div>
        );
    }

    // Determine which keys to use for X and Y axes
    const xKey = xAxisKey || chartData.columns.find(col =>
        col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
    ) || chartData.columns[0];

    const yKeys = yAxisKey ? [yAxisKey] : chartData.columns.filter(col =>
        col !== xKey && typeof chartData.data[0]?.[col] === 'number'
    );

    // Filter data by time period
    const filteredData = filterDataByTimePeriod(chartData.data, timePeriod, xKey);

    const displayTitle = title || chartData.metadata.title;

    const commonProps = {
        data: filteredData,
        margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const xAxisProps = {
        dataKey: xKey,
        tickFormatter: formatXAxisTick,
        className: 'text-xs fill-muted-foreground',
    };

    const yAxisProps = {
        className: 'text-xs fill-muted-foreground',
    };

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            {displayTitle && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">{displayTitle}</h3>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{chartData.metadata.category}</p>
                        {showMetadata && (
                            <p className="text-xs text-muted-foreground">
                                {filteredData.length} data points • {timePeriod === 'all' ? 'All time' : timePeriod.toUpperCase()}
                            </p>
                        )}
                    </div>
                </div>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {chartType === 'line' && (
                    <LineChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />}
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        {yKeys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={false}
                                name={key}
                            />
                        ))}
                    </LineChart>
                )}
                {chartType === 'bar' && (
                    <BarChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />}
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        {yKeys.map((key, index) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={colors[index % colors.length]}
                                name={key}
                            />
                        ))}
                    </BarChart>
                )}
                {chartType === 'area' && (
                    <AreaChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />}
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        {yKeys.map((key, index) => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index % colors.length]}
                                fill={colors[index % colors.length]}
                                fillOpacity={0.3}
                                name={key}
                            />
                        ))}
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}