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
    ReferenceLine,
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import { getResponsiveHeight, getResponsiveMargin, getResponsiveFontSize, getResponsiveYAxisWidth } from '@/lib/responsive-chart-utils';

interface DataPoint {
    [key: string]: any;
}

interface ChartData {
    data: DataPoint[];
    columns: string[];
    metadata: {
        title: string;
        category: string;
        filename: string;
    };
}

export type ChartType = 'line' | 'bar' | 'area';

interface ChartFixedProps {
    filePath: string;
    title: string;
    startDate: string; // YYYY-MM-DD format - required
    endDate: string; // YYYY-MM-DD format - required
    height?: number;
    className?: string;
    xAxisKey?: string;
    yAxisKeys?: string[]; // Support multiple Y-axis columns
    yAxisKey?: string; // Keep for backward compatibility
    showGrid?: boolean;
    showLegend?: boolean;
    colors?: string[];
    chartType?: ChartType;
    description?: string;
    referenceLine?: number; // Add reference line at specific Y value
    yAxisDomain?: [number | 'auto', number | 'auto']; // Y-axis domain [min, max]
}

export default function ChartFixed({
    filePath,
    title,
    startDate,
    endDate,
    height = 400,
    className = '',
    xAxisKey,
    yAxisKey,
    yAxisKeys,
    showGrid = true,
    showLegend = true,
    colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'],
    chartType = 'line',
    description,
    referenceLine,
    yAxisDomain
}: ChartFixedProps) {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [responsiveHeight, setResponsiveHeight] = useState(height);
    const [responsiveMargin, setResponsiveMargin] = useState(getResponsiveMargin());

    useEffect(() => {
        const handleResize = () => {
            setResponsiveHeight(getResponsiveHeight(height));
            setResponsiveMargin(getResponsiveMargin());
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [height]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Determine the fetch URL based on file path
                let fetchUrl: string;
                if (filePath.startsWith('events/')) {
                    // Use API endpoint for events files
                    const filename = filePath.replace('events/', '');
                    fetchUrl = `/api/data/events/${filename}`;
                } else {
                    // Use static file serving for other files
                    fetchUrl = `/data/${filePath}`;
                }

                const response = await fetch(fetchUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${fetchUrl}: ${response.statusText}`);
                }

                const csvText = await response.text();
                const lines = csvText.trim().split('\n');
                const headers = lines[0].split(',').map(h => h.trim());

                const parsedData = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim());
                    const row: DataPoint = {};

                    headers.forEach((header, index) => {
                        if (index === 0) {
                            // First column contains dates in "Jan-60" format
                            let dateValue = values[index];

                            // Convert "Jan-60" format to "1960-01-01"
                            if (dateValue && dateValue.match(/^[A-Za-z]{3}-\d{2}$/)) {
                                const [monthStr, yearStr] = dateValue.split('-');
                                const monthMap: { [key: string]: string } = {
                                    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                                    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                                };
                                const year = parseInt(yearStr) < 50 ? `20${yearStr}` : `19${yearStr}`;
                                const month = monthMap[monthStr] || '01';
                                dateValue = `${year}-${month}-01`;
                            }

                            row['date'] = dateValue; // Standardize to 'date' column
                        } else {
                            const numValue = parseFloat(values[index]);
                            row[header] = isNaN(numValue) ? values[index] : numValue;
                        }
                    });

                    return row;
                });

                // Filter by fixed date range
                const dateColumn = 'date'; // We standardized this above

                const filteredData = parsedData.filter(row => {
                    const dateValue = row[dateColumn];
                    if (typeof dateValue === 'string') {
                        try {
                            const date = parseISO(dateValue);
                            if (isValid(date)) {
                                return date >= parseISO(startDate) && date <= parseISO(endDate);
                            }
                        } catch {
                            return false;
                        }
                    }
                    return false;
                });

                setChartData({
                    data: filteredData,
                    columns: headers,
                    metadata: {
                        title,
                        category: 'Fixed Range',
                        filename: filePath.split('/').pop() || ''
                    }
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [filePath, startDate, endDate, xAxisKey]);

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
                            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}`}
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
                    <p className="text-muted-foreground">No data available for the specified date range</p>
                </div>
            </div>
        );
    }

    // Determine which keys to use for X and Y axes
    const xKey = 'date'; // We standardized this

    const yKeys = yAxisKeys || (yAxisKey ? [yAxisKey] :
        chartData.columns.filter(col =>
            col !== 'date' && typeof chartData.data[0]?.[col] === 'number'
        )
    );

    const commonProps = {
        data: chartData.data,
        margin: responsiveMargin,
    };

    const xAxisProps = {
        dataKey: xKey,
        tickFormatter: formatXAxisTick,
        className: 'text-xs fill-muted-foreground',
    };

    const yAxisProps = {
        className: 'text-xs fill-muted-foreground',
        domain: yAxisDomain,
    };

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-1">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>

            <ResponsiveContainer width="100%" height={responsiveHeight}>
                {chartType === 'line' && (
                    <LineChart {...commonProps}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />}
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        {referenceLine !== undefined && (
                            <ReferenceLine y={referenceLine} stroke="#6b7280" strokeDasharray="5 5" strokeWidth={1} />
                        )}
                        <Line
                            type="monotone"
                            dataKey={yKeys[0]}
                            stroke={colors[0]}
                            strokeWidth={2}
                            dot={false}
                            name={yKeys[0]}
                        />
                        {yKeys.slice(1).map((yKey, index) => (
                            <Line
                                key={yKey}
                                type="monotone"
                                dataKey={yKey}
                                stroke={colors[(index + 1) % colors.length]}
                                strokeWidth={2}
                                dot={false}
                                name={yKey}
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
                        {referenceLine !== undefined && (
                            <ReferenceLine y={referenceLine} stroke="#6b7280" strokeDasharray="5 5" strokeWidth={1} />
                        )}
                        <Bar
                            dataKey={yKeys[0]}
                            fill={colors[0]}
                            name={yKeys[0]}
                        />
                        {yKeys.slice(1).map((yKey, index) => (
                            <Bar
                                key={yKey}
                                dataKey={yKey}
                                fill={colors[(index + 1) % colors.length]}
                                name={yKey}
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
                        {referenceLine !== undefined && (
                            <ReferenceLine y={referenceLine} stroke="#6b7280" strokeDasharray="5 5" strokeWidth={1} />
                        )}
                        <Area
                            type="monotone"
                            dataKey={yKeys[0]}
                            stroke={colors[0]}
                            fill={colors[0]}
                            fillOpacity={0.3}
                            name={yKeys[0]}
                        />
                        {yKeys.slice(1).map((yKey, index) => (
                            <Area
                                key={yKey}
                                type="monotone"
                                dataKey={yKey}
                                stroke={colors[(index + 1) % colors.length]}
                                fill={colors[(index + 1) % colors.length]}
                                fillOpacity={0.3}
                                name={yKey}
                            />
                        ))}
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}