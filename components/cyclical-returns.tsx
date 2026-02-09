'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CyclicalReturnsProps {
    assetClass: string;
    seriesName: string;
    startDate: string;
    endDate: string;
    height?: number;
    className?: string;
}

interface ReturnsDataPoint {
    date: string;
    '2Y Return'?: number;
    '5Y Return'?: number;
    '10Y Return'?: number;
}

const CHART_COLORS = {
    '2Y Return': '#10b981',
    '5Y Return': '#3b82f6',
    '10Y Return': '#8b5cf6'
};

export default function CyclicalReturns({
    assetClass,
    seriesName,
    startDate,
    endDate,
    height = 300,
    className = ''
}: CyclicalReturnsProps) {
    const [returnsData, setReturnsData] = useState<ReturnsDataPoint[]>([]);
    const [filteredReturnsData, setFilteredReturnsData] = useState<ReturnsDataPoint[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<'2Y' | '5Y' | '10Y'>('10Y');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load pre-calculated returns from database - only for the visible date range
    useEffect(() => {
        if (!assetClass || !seriesName || !startDate || !endDate) {
            setLoading(false);
            return;
        }

        const loadReturns = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log(`Loading cyclical returns for ${assetClass}/${seriesName} from ${startDate} to ${endDate}`);

                // Fetch only the data we need for the visible range
                // Note: We fetch ALL data but the API should be optimized to filter server-side
                const response = await fetch(
                    `/api/data/${assetClass}?series=${encodeURIComponent(seriesName)}&columns=Value_Return2Y,Value_Return5Y,Value_Return10Y`
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Failed to load returns:', response.status, errorText);
                    throw new Error(`Failed to load returns: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('Received returns data:', result.data?.length || 0, 'points');

                if (!result.data || result.data.length === 0) {
                    console.warn('No returns data found - may need to run calc-cyclical-returns script');
                    setReturnsData([]);
                    setFilteredReturnsData([]);
                    setLoading(false);
                    return;
                }

                // Transform and filter data in one pass
                const transformed: ReturnsDataPoint[] = result.data
                    .filter((point: any) => point.date >= startDate && point.date <= endDate)
                    .map((point: any) => ({
                        date: point.date,
                        '2Y Return': point.Value_Return2Y,
                        '5Y Return': point.Value_Return5Y,
                        '10Y Return': point.Value_Return10Y,
                    }));

                console.log('Filtered returns data:', transformed.length, 'points');
                setReturnsData(transformed);
                setFilteredReturnsData(transformed);
            } catch (err) {
                console.error('Error loading cyclical returns:', err);
                setError(err instanceof Error ? err.message : 'Failed to load returns');
            } finally {
                setLoading(false);
            }
        };

        loadReturns();
    }, [assetClass, seriesName, startDate, endDate]);

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
                        <p className="text-red-500 font-medium mb-2">Error loading returns</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            );
        }

        if (returnsData.length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-muted-foreground">No cyclical returns data available. Run the add-cyclical-returns script.</p>
                </div>
            );
        }

        // Filter data to only show points where the selected period has data
        const filteredData = filteredReturnsData.filter(d => d[`${selectedPeriod} Return`] !== undefined && d[`${selectedPeriod} Return`] !== null);

        if (filteredData.length === 0) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-muted-foreground">No {selectedPeriod} return data available</p>
                </div>
            );
        }

        return (
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />

                    {selectedPeriod === '2Y' && (
                        <Line
                            type="monotone"
                            dataKey="2Y Return"
                            stroke={CHART_COLORS['2Y Return']}
                            strokeWidth={2}
                            dot={false}
                            name="2-Year Return"
                        />
                    )}
                    {selectedPeriod === '5Y' && (
                        <Line
                            type="monotone"
                            dataKey="5Y Return"
                            stroke={CHART_COLORS['5Y Return']}
                            strokeWidth={2}
                            dot={false}
                            name="5-Year Return"
                        />
                    )}
                    {selectedPeriod === '10Y' && (
                        <Line
                            type="monotone"
                            dataKey="10Y Return"
                            stroke={CHART_COLORS['10Y Return']}
                            strokeWidth={2}
                            dot={false}
                            name="10-Year Return"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Cyclical Returns</h3>
                    <p className="text-sm text-muted-foreground">Rolling returns over time (percentage)</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedPeriod('2Y')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === '2Y'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        2-Year
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('5Y')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === '5Y'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        5-Year
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('10Y')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === '10Y'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        10-Year
                    </button>
                </div>
            </div>

            {renderContent()}

            {/* Stats */}
            {filteredReturnsData.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {(['2Y', '5Y', '10Y'] as const).map((period) => {
                        const key = `${period} Return` as keyof ReturnsDataPoint;
                        const values = filteredReturnsData
                            .map(d => d[key])
                            .filter((v): v is number => v !== undefined && v !== null);

                        if (values.length === 0) return null;

                        const latest = values[values.length - 1];
                        const avg = values.reduce((a, b) => a + b, 0) / values.length;
                        const max = Math.max(...values);
                        const min = Math.min(...values);

                        return (
                            <div key={period} className="p-3 rounded-lg bg-muted/50">
                                <div className="text-xs font-semibold text-muted-foreground mb-1">
                                    {period} Return
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
    );
}
