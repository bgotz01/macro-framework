'use client';

import { useState, useEffect } from 'react';

interface PercentileValues {
    cpi: number | null;
    fedFunds: number | null;
    tnx: number | null;
    irx: number | null;
    pe5yr: number | null;
    ey5yr: number | null;
    realYield: number | null;
    realYield3m: number | null;
    rey5yr: number | null;
    eyp5yr: number | null;
}

interface RealPercentileMatrixProps {
    initialValues: PercentileValues;
    sliderValue: number;
    onSliderChange: (value: number) => void;
}

export default function RealPercentileMatrix({ initialValues, sliderValue, onSliderChange }: RealPercentileMatrixProps) {
    const startYear = 1960;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const totalMonths = (currentYear - startYear) * 12 + currentMonth;

    const [debouncedSliderValue, setDebouncedSliderValue] = useState(sliderValue);
    const [values, setValues] = useState<PercentileValues>(initialValues);
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
                const targetDate = `${debouncedYear}-${String(debouncedMonth + 1).padStart(2, '0')}`;
                const response = await fetch(`/api/percentile-year?year=${debouncedYear}&month=${String(debouncedMonth + 1).padStart(2, '0')}`);
                const result = await response.json();

                setValues({
                    cpi: result.cpi?.percentileRank ?? null,
                    fedFunds: result.fedFunds?.percentileRank ?? null,
                    tnx: result.tnx?.percentileRank ?? null,
                    irx: result.irx?.percentileRank ?? null,
                    pe5yr: result.pe5yr?.percentileRank ?? null,
                    ey5yr: result.ey5yr?.percentileRank ?? null,
                    realYield: result.realYield?.percentileRank ?? null,
                    realYield3m: result.realYield3m?.percentileRank ?? null,
                    rey5yr: result.rey5yr?.percentileRank ?? null,
                    eyp5yr: result.eyp5yr?.percentileRank ?? null,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [debouncedSliderValue, totalMonths, debouncedYear, debouncedMonth, initialValues]);

    const getBarColor = (percentile: number | null, isReversed: boolean = false): string => {
        if (percentile === null) return 'bg-gray-300';
        if (isReversed) {
            if (percentile < 33) return 'bg-red-500';
            if (percentile < 67) return 'bg-yellow-500';
            return 'bg-green-500';
        }
        if (percentile < 33) return 'bg-green-500';
        if (percentile < 67) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getTextColor = (percentile: number | null, isReversed: boolean = false): string => {
        if (percentile === null) return 'text-gray-500';
        if (isReversed) {
            if (percentile < 33) return 'text-red-600 dark:text-red-400';
            if (percentile < 67) return 'text-yellow-600 dark:text-yellow-400';
            return 'text-green-600 dark:text-green-400';
        }
        if (percentile < 33) return 'text-green-600 dark:text-green-400';
        if (percentile < 67) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const displayDate = `${monthNames[selectedMonth]} ${selectedYear}`;

    const marketMetrics = [
        { key: 'cpi' as keyof PercentileValues, label: 'CPI', reversed: false },
        { key: 'fedFunds' as keyof PercentileValues, label: 'Fed Funds', reversed: false },
        { key: 'tnx' as keyof PercentileValues, label: '10Y', reversed: false },
        { key: 'irx' as keyof PercentileValues, label: '3M', reversed: false },
        { key: 'pe5yr' as keyof PercentileValues, label: 'P/E 5yr', reversed: false },
        { key: 'ey5yr' as keyof PercentileValues, label: 'EY 5yr', reversed: true },
    ];

    const realMetrics = [
        { key: 'realYield' as keyof PercentileValues, label: 'Real 10Y (10Y-CPI)', reversed: true },
        { key: 'realYield3m' as keyof PercentileValues, label: 'Real 3M (3M-CPI)', reversed: true },
        { key: 'rey5yr' as keyof PercentileValues, label: 'Real EY (EY5yr-CPI)', reversed: true },
        { key: 'eyp5yr' as keyof PercentileValues, label: 'EYP (EY5yr-3M)', reversed: true },
    ];

    return (
        <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Percentile Matrix</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onSliderChange(Math.max(0, sliderValue - 1))}
                        className="px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors text-sm font-bold"
                        disabled={sliderValue === 0}
                    >
                        −
                    </button>
                    <div className="text-sm font-semibold text-primary min-w-[100px] text-center">{displayDate}</div>
                    <button
                        onClick={() => onSliderChange(Math.min(totalMonths, sliderValue + 1))}
                        className="px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors text-sm font-bold"
                        disabled={sliderValue === totalMonths}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Timeline Slider */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute -top-2 left-0 right-0 h-2 pointer-events-none">
                        {[1960, 1970, 1980, 1990, 2000, 2010, 2020, currentYear].map(year => {
                            const monthsFromStart = (year - startYear) * 12;
                            const position = (monthsFromStart / totalMonths) * 100;
                            const isActive = Math.abs(sliderValue - monthsFromStart) < 6;
                            return (
                                <div key={year} className={`absolute w-0.5 h-3 transition-colors ${isActive ? 'bg-primary' : 'bg-muted-foreground/40'}`} style={{ left: `${position}%` }} />
                            );
                        })}
                    </div>
                    <input type="range" min={0} max={totalMonths} value={sliderValue} onChange={(e) => onSliderChange(Number(e.target.value))} className="w-full range-slider" />
                    <div className="relative mt-1 h-4">
                        {[1960, 1970, 1980, 1990, 2000, 2010, 2020, currentYear].map((year) => {
                            const monthsFromStart = (year - startYear) * 12;
                            const position = (monthsFromStart / totalMonths) * 100;
                            const isActive = Math.abs(sliderValue - monthsFromStart) < 6;
                            return (
                                <button key={year} onClick={() => onSliderChange(monthsFromStart)} className={`absolute cursor-pointer hover:text-primary transition-colors text-[10px] font-medium -translate-x-1/2 ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`} style={{ left: `${position}%` }}>
                                    {year}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={`space-y-4 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {/* Market Metrics */}
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Market Metrics</h3>
                    <div className="space-y-2">
                        {marketMetrics.map(metric => {
                            const percentile = values[metric.key];
                            return (
                                <div key={metric.key} className="flex items-center gap-3">
                                    <div className="w-32 flex-shrink-0 text-xs font-medium">{metric.label}</div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                                            <div className={`h-full ${getBarColor(percentile, metric.reversed)} transition-all duration-500`} style={{ width: `${percentile || 0}%` }} />
                                        </div>
                                        <div className="w-16 text-right">
                                            <span className={`text-xs font-semibold ${getTextColor(percentile, metric.reversed)}`}>
                                                {percentile !== null ? `${percentile.toFixed(1)}%` : 'N/A'}
                                            </span>
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
                        {realMetrics.map(metric => {
                            const percentile = values[metric.key];
                            return (
                                <div key={metric.key} className="flex items-center gap-3">
                                    <div className="w-32 flex-shrink-0 text-xs font-medium">{metric.label}</div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                                            <div className={`h-full ${getBarColor(percentile, metric.reversed)} transition-all duration-500`} style={{ width: `${percentile || 0}%` }} />
                                        </div>
                                        <div className="w-16 text-right">
                                            <span className={`text-xs font-semibold ${getTextColor(percentile, metric.reversed)}`}>
                                                {percentile !== null ? `${percentile.toFixed(1)}%` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded"></div><span>Low (0-33rd)</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-500 rounded"></div><span>Mid (33-67th)</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded"></div><span>High (67-100th)</span></div>
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground">* Real metrics and EY 5yr use reversed colors (higher is better)</div>
            </div>

            <style jsx>{`
                .range-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(sliderValue / totalMonths) * 100}%, hsl(var(--muted)) ${(sliderValue / totalMonths) * 100}%, hsl(var(--muted)) 100%);
                    outline: none;
                    cursor: pointer;
                }
                .range-slider::-webkit-slider-track { -webkit-appearance: none; width: 100%; height: 8px; border-radius: 4px; background: transparent; }
                .range-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: hsl(var(--primary)); cursor: grab; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: all 0.2s; border: 3px solid white; }
                .range-slider::-webkit-slider-thumb:hover { transform: scale(1.15); box-shadow: 0 3px 8px rgba(0,0,0,0.4); }
                .range-slider::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.1); }
                .range-slider::-moz-range-track { width: 100%; height: 8px; border-radius: 4px; background: hsl(var(--muted)); }
                .range-slider::-moz-range-progress { height: 8px; border-radius: 4px; background: hsl(var(--primary)); }
                .range-slider::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: hsl(var(--primary)); cursor: grab; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: all 0.2s; }
                .range-slider::-moz-range-thumb:hover { transform: scale(1.15); box-shadow: 0 3px 8px rgba(0,0,0,0.4); }
                .range-slider::-moz-range-thumb:active { cursor: grabbing; transform: scale(1.1); }
                @media (prefers-color-scheme: dark) {
                    .range-slider::-webkit-slider-thumb { border-color: hsl(var(--background)); }
                    .range-slider::-moz-range-thumb { border-color: hsl(var(--background)); }
                }
            `}</style>
        </div>
    );
}
