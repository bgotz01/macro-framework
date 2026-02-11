'use client';

import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { DataService, ChartData } from '@/lib/data-service';
import { format, parseISO, isValid } from 'date-fns';

interface DataSource {
    filePath: string;
    column: string; // Which column to use from this file
    label: string; // Display name for the series
    color: string;
}

interface ChartMultipleProps {
    title: string;
    dataSources: DataSource[];
    startDate: string; // YYYY-MM-DD format - required
    endDate: string; // YYYY-MM-DD format - required
    height?: number;
    className?: string;
    dateColumn?: string;
    showGrid?: boolean;
    showLegend?: boolean;
    description?: string;
}

export default function ChartMultiple({
    title,
    dataSources,
    startDate,
    endDate,
    height = 400,
    className = '',
    dateColumn = 'observation_date',
    showGrid = true,
    showLegend = true,
    description
}: ChartMultipleProps) {
    const [combinedData, setCombinedData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load all datasets
                const filePaths = dataSources.map(ds => ds.filePath);
                const datasets = await DataService.loadMultipleCSVs(filePaths);

                // Combine datasets
                const combined = DataService.combineDatasets(datasets, dateColumn);

                // Filter by date range
                const filteredData = combined.data.filter(row => {
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

                setCombinedData({
                    ...combined,
                    data: filteredData
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [dataSources, startDate, endDate, dateColumn]);

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
                    {payload.map((entry: any) => {
                        // Find the corresponding data source for better labeling
                        const dataSource = dataSources.find(ds =>
                            entry.dataKey.includes(ds.column) || entry.dataKey === ds.column
                        );
                        const displayName = dataSource?.label || entry.name;

                        return (
                            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                                {`${displayName}: ${typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}${dataSource?.column.toLowerCase().includes('yield') ? '%' : ''}`}
                            </p>
                        );
                    })}
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

    if (!combinedData || combinedData.data.length === 0) {
        return (
            <div className={`p-6 rounded-2xl border border-border/50 bg-card ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No data available for the specified date range</p>
                </div>
            </div>
        );
    }

    // Get the columns that match our data sources
    const seriesColumns = dataSources.map(ds => {
        // Find the actual column name in the combined data
        const matchingColumn = combinedData.columns.find(col =>
            col.includes(ds.column) || col === ds.column
        );
        return {
            ...ds,
            column: matchingColumn || ds.column
        };
    }).filter(series => series.column && combinedData.columns.includes(series.column));

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-1">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <LineChart
                    data={combinedData.data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />}
                    <XAxis
                        dataKey={dateColumn}
                        tickFormatter={formatXAxisTick}
                        className="text-xs fill-muted-foreground"
                    />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && <Legend />}
                    {seriesColumns.map((series, index) => (
                        <Line
                            key={series.column}
                            type="monotone"
                            dataKey={series.column}
                            stroke={series.color}
                            strokeWidth={2}
                            dot={false}
                            name={series.label}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}