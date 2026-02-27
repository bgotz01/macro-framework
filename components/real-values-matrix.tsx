'use client';

import { useState, useEffect } from 'react';

interface MetricValues {
    cpi: { value: number | null; yoy: number | null };
    fedFunds: { value: number | null; yoy: number | null };
    tnx: { value: number | null; yoy: number | null };
    irx: { value: number | null; yoy: number | null };
    pe5yr: { value: number | null; yoy: number | null };
    ey5yr: { value: number | null; yoy: number | null };
    real10Y: { value: number | null; yoy: number | null };
    realYield3m: { value: number | null; yoy: number | null };
    rey5yr: { value: number | null; yoy: number | null };
    eyp5yr: { value: number | null; yoy: number | null };
}

interface RealValuesMatrixProps {
    initialValues: MetricValues;
    sliderValue: number;
    onSliderChange: (value: number) => void;
}

export default function RealValuesMatrix({ initialValues, sliderValue, onSliderChange }: RealValuesMatrixProps) {
    const startYear = 1960;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const totalMonths = (currentYear - startYear) * 12 + currentMonth;

    const [debouncedSliderValue, setDebouncedSliderValue] = useState(sliderValue);
    const [values, setValues] = useState<MetricValues>(initialValues);
    const [loading, setLoading] = useState(false);

    const getDateFromSlider = (value: number) => {
        const year = startYear + Math.floor(value / 12);
        const month = value % 12;
        return { year, month };
    };

    const { year: selectedYear, month: selectedMonth } = getDateFromSlider(sliderValue);
    const { year: debouncedYear, month: debouncedMonth } = getDateFromSlider(debouncedSliderValue);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSliderValue(sliderValue), 300);
        return () => clearTimeout(timer);
    }, [sliderValue]);

    useEffect(() => {
        if (debouncedSliderValue === totalMonths) {
            setValues(initialValues);
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                // Fetch data from percentile-year API which has all the metrics we need
                const response = await fetch(`/api/percentile-year?year=${debouncedYear}&month=${String(debouncedMonth + 1).padStart(2, '0')}`);
                const data = await response.json();

                setValues({
                    cpi: {
                        value: data.cpi?.value ?? null,
                        yoy: data.cpi?.yoyPercentileChange ?? null
                    },
                    fedFunds: {
                        value: data.fedFunds?.value ?? null,
                        yoy: data.fedFunds?.yoyPercentileChange ?? null
                    },
                    tnx: {
                        value: data.tnx?.value ?? null,
                        yoy: data.tnx?.yoyPercentileChange ?? null
                    },
                    irx: {
                        value: data.irx?.value ?? null,
                        yoy: data.irx?.yoyPercentileChange ?? null
                    },
                    pe5yr: {
                        value: data.pe5yr?.value ?? null,
                        yoy: data.pe5yr?.yoyPercentileChange ?? null
                    },
                    ey5yr: {
                        value: data.ey5yr?.value ?? null,
                        yoy: data.ey5yr?.yoyPercentileChange ?? null
                    },
                    real10Y: {
                        value: data.realYield?.value ?? null,
                        yoy: data.realYield?.yoyPercentileChange ?? null
                    },
                    realYield3m: {
                        value: data.realYield3m?.value ?? null,
                        yoy: data.realYield3m?.yoyPercentileChange ?? null
                    },
                    rey5yr: {
                        value: data.rey5yr?.value ?? null,
                        yoy: data.rey5yr?.yoyPercentileChange ?? null
                    },
                    eyp5yr: {
                        value: data.eyp5yr?.value ?? null,
                        yoy: data.eyp5yr?.yoyPercentileChange ?? null
                    },
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [debouncedSliderValue, totalMonths, debouncedYear, debouncedMonth, initialValues]);

    const getYoYColor = (yoy: number | null): string => {
        if (yoy === null) return 'text-gray-500';
        if (yoy > 0) return 'text-green-600 dark:text-green-400';
        if (yoy < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-500';
    };

    const formatValue = (value: number | null, format: 'percentage' | 'number' = 'percentage'): string => {
        if (value === null) return 'N/A';
        if (format === 'number') return value.toFixed(2);
        return `${value.toFixed(2)}%`;
    };

    const formatYoY = (yoy: number | null): string => {
        if (yoy === null) return 'N/A';
        return `${yoy > 0 ? '+' : ''}${yoy.toFixed(1)}%`;
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const displayDate = `${monthNames[selectedMonth]} ${selectedYear}`;

    const marketMetrics = [
        { key: 'cpi' as keyof MetricValues, label: 'CPI', format: 'percentage' as const },
        { key: 'fedFunds' as keyof MetricValues, label: 'Fed Funds', format: 'percentage' as const },
        { key: 'tnx' as keyof MetricValues, label: '10Y', format: 'percentage' as const },
        { key: 'irx' as keyof MetricValues, label: '3M', format: 'percentage' as const },
        { key: 'pe5yr' as keyof MetricValues, label: 'P/E 5yr', format: 'number' as const },
        { key: 'ey5yr' as keyof MetricValues, label: 'EY 5yr', format: 'percentage' as const },
    ];

    const realMetrics = [
        { key: 'realYield' as keyof MetricValues, label: 'Real 10Y', format: 'percentage' as const },
        { key: 'realYield3m' as keyof MetricValues, label: 'Real 3M', format: 'percentage' as const },
        { key: 'rey5yr' as keyof MetricValues, label: 'Real EY', format: 'percentage' as const },
        { key: 'eyp5yr' as keyof MetricValues, label: 'EYP', format: 'percentage' as const },
    ];

    return (
        <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Values & Percentile Change</h2>
            </div>

            <div className={`space-y-4 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {/* Market Metrics */}
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Market Metrics</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground border-b pb-1">
                            <div className="w-28 flex-shrink-0">Metric</div>
                            <div className="flex-1 flex items-center justify-between">
                                <div>Actual Value</div>
                                <div>Δ%ile</div>
                            </div>
                        </div>
                        {marketMetrics.map(metric => {
                            const data = values[metric.key];
                            return (
                                <div key={metric.key} className="flex items-center gap-3">
                                    <div className="w-28 flex-shrink-0 text-xs font-medium">{metric.label}</div>
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="text-sm font-semibold">
                                            {formatValue(data.value, metric.format)}
                                        </div>
                                        <div className={`text-xs font-semibold ${getYoYColor(data.yoy)}`}>
                                            {formatYoY(data.yoy)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Real Metrics */}
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Real Metrics</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground border-b pb-1">
                            <div className="w-28 flex-shrink-0">Metric</div>
                            <div className="flex-1 flex items-center justify-between">
                                <div>Actual Value</div>
                                <div>Δ%ile</div>
                            </div>
                        </div>
                        {realMetrics.map(metric => {
                            const data = values[metric.key];
                            return (
                                <div key={metric.key} className="flex items-center gap-3">
                                    <div className="w-28 flex-shrink-0 text-xs font-medium">{metric.label}</div>
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="text-sm font-semibold">
                                            {formatValue(data.value, metric.format)}
                                        </div>
                                        <div className={`text-xs font-semibold ${getYoYColor(data.yoy)}`}>
                                            {formatYoY(data.yoy)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
