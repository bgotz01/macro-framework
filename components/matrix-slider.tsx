
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MatrixValues {
    inflation: number | null;
    bondYieldNominal: number | null;
    bondYieldReal: number | null;
    yieldCurve: number | null;
    fedFunds: number | null;
    equityPE: number | null;
    earningsYieldPremium: number | null;
    realEarningsYield: number | null;
    equityPE5yr: number | null;
    earningsYieldPremium5yr: number | null;
    realEarningsYield5yr: number | null;
}

interface MatrixDates {
    inflation: string | null;
    bondYieldNominal: string | null;
    bondYieldReal: string | null;
    yieldCurve: string | null;
    fedFunds: string | null;
    equityPE: string | null;
    earningsYieldPremium: string | null;
    realEarningsYield: string | null;
    equityPE5yr: string | null;
    earningsYieldPremium5yr: string | null;
    realEarningsYield5yr: string | null;
}

interface DraggableRegimeMatrixProps {
    initialValues: MatrixValues;
    initialDates?: MatrixDates;
}

export default function DraggableRegimeMatrix({ initialValues, initialDates }: DraggableRegimeMatrixProps) {
    const startYear = 1960;
    const startMonth = 0; // January
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Cap at last month — data is month-end, so the current month isn't complete yet
    const lastAvailableYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastAvailableMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const totalMonths = (lastAvailableYear - startYear) * 12 + lastAvailableMonth - startMonth;

    const [sliderValue, setSliderValue] = useState(totalMonths);
    const [debouncedSliderValue, setDebouncedSliderValue] = useState(totalMonths);
    const [values, setValues] = useState<MatrixValues>(initialValues);
    const [dates, setDates] = useState<MatrixDates>(initialDates || {
        inflation: null,
        bondYieldNominal: null,
        bondYieldReal: null,
        yieldCurve: null,
        fedFunds: null,
        equityPE: null,
        earningsYieldPremium: null,
        realEarningsYield: null,
        equityPE5yr: null,
        earningsYieldPremium5yr: null,
        realEarningsYield5yr: null,
    });
    const [loading, setLoading] = useState(false);

    // Convert slider value to year and month
    const getDateFromSlider = (value: number) => {
        const monthsFromStart = value;
        const year = startYear + Math.floor(monthsFromStart / 12);
        const month = (startMonth + (monthsFromStart % 12)) % 12;
        return { year, month };
    };

    const { year: selectedYear, month: selectedMonth } = getDateFromSlider(sliderValue);
    const { year: debouncedYear, month: debouncedMonth } = getDateFromSlider(debouncedSliderValue);

    // Debounce slider value changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSliderValue(sliderValue);
        }, 300); // Wait 300ms after user stops dragging

        return () => clearTimeout(timer);
    }, [sliderValue]);

    useEffect(() => {
        const isCurrentMonth = debouncedSliderValue === totalMonths;

        if (isCurrentMonth) {
            setValues(initialValues);
            if (initialDates) {
                setDates(initialDates);
            }
            return;
        }

        async function fetchHistoricalData() {
            setLoading(true);
            try {
                const targetDate = `${debouncedYear}-${String(debouncedMonth + 1).padStart(2, '0')}`;

                const [cpi, tenYear, twoYear, threeMonth, shillerPE, fedFunds, pe5yr, earningsYield5yr] = await Promise.all([
                    fetchValueAtDate('economic', 'CPI', targetDate),
                    fetchValueAtDate('bonds', 'US/TNX', targetDate),
                    fetchValueAtDate('bonds', 'US/US-2yr', targetDate),
                    fetchValueAtDate('bonds', 'US/IRX', targetDate),
                    fetchValueAtDate('valuations', 'Shiller-PE', targetDate),
                    fetchValueAtDate('economic', 'US/FEDFUNDS', targetDate),
                    fetchValueAtDate('valuations', 'PE-5yr', targetDate),
                    fetchValueAtDate('valuations', 'Earnings-Yield-5yr', targetDate),
                ]);

                setValues({
                    inflation: cpi.value,
                    bondYieldNominal: tenYear.value,
                    bondYieldReal: tenYear.value !== null && cpi.value !== null ? tenYear.value - cpi.value : null,
                    yieldCurve: tenYear.value !== null && twoYear.value !== null ? tenYear.value - twoYear.value : null,
                    fedFunds: fedFunds.value,
                    equityPE: shillerPE.value,
                    earningsYieldPremium: shillerPE.value !== null && shillerPE.value > 0 && threeMonth.value !== null
                        ? (100 / shillerPE.value) - threeMonth.value
                        : null,
                    realEarningsYield: shillerPE.value !== null && shillerPE.value > 0 && cpi.value !== null
                        ? (100 / shillerPE.value) - cpi.value
                        : null,
                    equityPE5yr: pe5yr.value,
                    earningsYieldPremium5yr: earningsYield5yr.value !== null && threeMonth.value !== null
                        ? earningsYield5yr.value - threeMonth.value
                        : null,
                    realEarningsYield5yr: earningsYield5yr.value !== null && cpi.value !== null
                        ? earningsYield5yr.value - cpi.value
                        : null,
                });

                setDates({
                    inflation: cpi.date,
                    bondYieldNominal: tenYear.date,
                    bondYieldReal: tenYear.date && cpi.date ? (tenYear.date > cpi.date ? cpi.date : tenYear.date) : null,
                    yieldCurve: tenYear.date && twoYear.date ? (tenYear.date > twoYear.date ? twoYear.date : tenYear.date) : null,
                    fedFunds: fedFunds.date,
                    equityPE: shillerPE.date,
                    earningsYieldPremium: shillerPE.date && threeMonth.date ? (shillerPE.date > threeMonth.date ? threeMonth.date : shillerPE.date) : null,
                    realEarningsYield: shillerPE.date && cpi.date ? (shillerPE.date > cpi.date ? cpi.date : shillerPE.date) : null,
                    equityPE5yr: pe5yr.date,
                    earningsYieldPremium5yr: earningsYield5yr.date && threeMonth.date ? (earningsYield5yr.date > threeMonth.date ? threeMonth.date : earningsYield5yr.date) : null,
                    realEarningsYield5yr: earningsYield5yr.date && cpi.date ? (earningsYield5yr.date > cpi.date ? cpi.date : earningsYield5yr.date) : null,
                });
            } catch (error) {
                console.error('Error fetching historical data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchHistoricalData();
    }, [debouncedSliderValue, totalMonths, debouncedYear, debouncedMonth, initialValues, initialDates]);

    async function fetchValueAtDate(assetClass: string, seriesName: string, targetDate: string): Promise<{ value: number | null; date: string | null }> {
        try {
            const response = await fetch(`/api/data/${assetClass}?series=${seriesName}`);
            if (!response.ok) return { value: null, date: null };

            const result = await response.json();
            if (!result.data || result.data.length === 0) return { value: null, date: null };

            const matchingPoints = result.data.filter((point: any) =>
                point.date.startsWith(targetDate)
            );

            if (matchingPoints.length > 0) {
                const point = matchingPoints[matchingPoints.length - 1];
                const columns = Object.keys(point).filter(k => k !== 'date');
                return {
                    value: columns.length > 0 ? point[columns[0]] : null,
                    date: point.date
                };
            }

            return { value: null, date: null };
        } catch (error) {
            console.error(`Error fetching ${assetClass}/${seriesName}:`, error);
            return { value: null, date: null };
        }
    }

    const getRegimeColor = (value: number | null, thresholds: { low: number; mid: number }): string => {
        if (value === null) return 'border-gray-300 dark:border-gray-700';
        if (value < thresholds.low) return 'border-green-500 dark:border-green-400';
        if (value < thresholds.mid) return 'border-yellow-500 dark:border-yellow-400';
        return 'border-red-500 dark:border-red-400';
    };

    const getRegimeColorReversed = (value: number | null, thresholds: { low: number; mid: number }): string => {
        if (value === null) return 'border-gray-300 dark:border-gray-700';
        if (value < thresholds.low) return 'border-red-500 dark:border-red-400';
        if (value < thresholds.mid) return 'border-yellow-500 dark:border-yellow-400';
        return 'border-green-500 dark:border-green-400';
    };

    const getYieldCurveColor = (value: number | null): string => {
        if (value === null) return 'border-gray-300 dark:border-gray-700';
        if (value < -0.5) return 'border-red-500 dark:border-red-400';
        if (value < 0.5) return 'border-yellow-500 dark:border-yellow-400';
        return 'border-green-500 dark:border-green-400';
    };

    const getRegimeTextColor = (value: number | null, thresholds: { low: number; mid: number }): string => {
        if (value === null) return 'text-gray-500 dark:text-gray-400';
        if (value < thresholds.low) return 'text-green-600 dark:text-green-400';
        if (value < thresholds.mid) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getRegimeTextColorReversed = (value: number | null, thresholds: { low: number; mid: number }): string => {
        if (value === null) return 'text-gray-500 dark:text-gray-400';
        if (value < thresholds.low) return 'text-red-600 dark:text-red-400';
        if (value < thresholds.mid) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getYieldCurveTextColor = (value: number | null): string => {
        if (value === null) return 'text-gray-500 dark:text-gray-400';
        if (value < -0.5) return 'text-red-600 dark:text-red-400';
        if (value < 0.5) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getPercentileSeriesForMetric = (metricType: string): string => {
        const mapping: Record<string, string> = {
            'fedFunds': 'fedfunds',
            'bondYieldNominal': 'tnx',
            'yieldCurve': 'yieldcurve',
            'inflation': 'cpi',
            'bondYieldReal': 'realyield',
            'equityPE': 'shillerpe',
            'earningsYieldPremium': 'eyp',
            'realEarningsYield': 'rey5yr',
            'equityPE5yr': 'pe5yr',
            'earningsYieldPremium5yr': 'eyp5yr',
            'realEarningsYield5yr': 'rey5yr'
        };
        return mapping[metricType] || '';
    };

    const MetricCard = ({
        children,
        metricType,
        className
    }: {
        children: React.ReactNode;
        metricType: string;
        className: string;
    }) => {
        const series = getPercentileSeriesForMetric(metricType);

        if (!series) {
            return <div className={className}>{children}</div>;
        }

        return (
            <div className={`${className} relative group`}>
                <Link
                    href={`/chart/percentile?series=${series}`}
                    className="absolute inset-0 z-10"
                    title={`View ${metricType} in percentile chart`}
                />
                {children}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </div>
            </div>
        );
    };

    const formatValue = (value: number | null | undefined, format: 'percentage' | 'number' = 'percentage'): string => {
        if (value === null || value === undefined) return 'N/A';
        if (format === 'number') return value.toFixed(1);
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const displayDate = `${monthNames[selectedMonth]} ${selectedYear}`;

    return (
        <div className="p-3 rounded-lg border border-border/50 bg-card shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Regime Matrix Snapshot</h2>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <div className="text-sm font-semibold text-primary">{displayDate}</div>
                        <div className="text-[10px] text-muted-foreground">
                            {sliderValue === totalMonths
                                ? 'Latest available'
                                : `${Math.abs(currentYear * 12 + currentDate.getMonth() - (selectedYear * 12 + selectedMonth))} months ago`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Draggable Date Bar */}
            <div className="mb-6 px-2">
                <div className="flex-1 relative">
                    {/* Decade tick marks - positioned by actual calculation */}
                    <div className="absolute -top-2 left-0 right-0 h-2 pointer-events-none">
                        {[1960, 1970, 1980, 1990, 2000, 2010, 2020, currentYear].map(year => {
                            const monthsFromStart = (year - startYear) * 12;
                            const position = (monthsFromStart / totalMonths) * 100;
                            const isAtThisYear = Math.abs(sliderValue - monthsFromStart) < 6;
                            return (
                                <div
                                    key={year}
                                    className={`absolute w-0.5 h-3 transition-colors ${isAtThisYear ? 'bg-primary' : 'bg-muted-foreground/40'
                                        }`}
                                    style={{ left: `${position}%` }}
                                />
                            );
                        })}
                    </div>

                    <input
                        type="range"
                        min={0}
                        max={totalMonths}
                        value={sliderValue}
                        onChange={(e) => setSliderValue(Number(e.target.value))}
                        className="w-full range-slider"
                    />
                    {/* Decade labels - clickable, positioned by calculation */}
                    <div className="relative mt-1 h-4">
                        {[1960, 1970, 1980, 1990, 2000, 2010, 2020, currentYear].map((year) => {
                            const monthsFromStart = (year - startYear) * 12;
                            const position = (monthsFromStart / totalMonths) * 100;
                            const isActive = Math.abs(sliderValue - monthsFromStart) < 6;
                            return (
                                <button
                                    key={year}
                                    onClick={() => setSliderValue(monthsFromStart)}
                                    className={`absolute cursor-pointer hover:text-primary transition-colors text-[10px] font-medium -translate-x-1/2 ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                                        }`}
                                    style={{ left: `${position}%` }}
                                >
                                    {year}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="text-[10px] text-muted-foreground mb-2 text-center">
                Click any metric to view its historical percentile chart
            </div>

            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
                        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-lg border border-border">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="text-sm font-medium">Loading data...</span>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {/* First Row: Fed Funds, 10yr Yield, Yield Curve */}
                    <div>
                        <h3 className="text-xs font-semibold mb-1 text-muted-foreground text-center">Rates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <MetricCard
                                metricType="fedFunds"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColor(values.fedFunds, { low: 2, mid: 4 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">Fed Funds</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColor(values.fedFunds, { low: 2, mid: 4 })}`}>
                                    {formatValue(values.fedFunds)}
                                </div>
                                {dates.fedFunds && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.fedFunds)}</div>
                                )}
                            </MetricCard>

                            <MetricCard
                                metricType="bondYieldNominal"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColor(values.bondYieldNominal, { low: 2, mid: 5 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">10Y Yield</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColor(values.bondYieldNominal, { low: 2, mid: 5 })}`}>
                                    {formatValue(values.bondYieldNominal)}
                                </div>
                                {dates.bondYieldNominal && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.bondYieldNominal)}</div>
                                )}
                            </MetricCard>

                            <MetricCard
                                metricType="yieldCurve"
                                className={`p-3 rounded bg-card border-2 ${getYieldCurveColor(values.yieldCurve)} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">Yield Curve</div>
                                <div className={`text-xl font-bold mb-1 ${getYieldCurveTextColor(values.yieldCurve)}`}>
                                    {formatValue(values.yieldCurve)}
                                </div>
                                <div className="text-[8px] text-muted-foreground/60 mb-1">(10Y - 2Y)</div>
                                {dates.yieldCurve && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.yieldCurve)}</div>
                                )}
                            </MetricCard>
                        </div>
                    </div>

                    {/* Second Row: CPI, Real Yield */}
                    <div>
                        <h3 className="text-xs font-semibold mb-1 text-muted-foreground text-center">Inflation & Real Rates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <MetricCard
                                metricType="inflation"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColor(values.inflation, { low: 3, mid: 6 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">CPI</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColor(values.inflation, { low: 3, mid: 6 })}`}>
                                    {formatValue(values.inflation)}
                                </div>
                                {dates.inflation && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.inflation)}</div>
                                )}
                            </MetricCard>

                            <MetricCard
                                metricType="bondYieldReal"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColor(values.bondYieldReal, { low: 0, mid: 2 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">Real 10Y</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColor(values.bondYieldReal, { low: 0, mid: 2 })}`}>
                                    {formatValue(values.bondYieldReal)}
                                </div>
                                <div className="text-[8px] text-muted-foreground/60 mb-1">(10Y - CPI)</div>
                                {dates.bondYieldReal && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.bondYieldReal)}</div>
                                )}
                            </MetricCard>
                        </div>
                    </div>

                    {/* Third Row: Shiller P/E Equity */}
                    <div>
                        <h3 className="text-xs font-semibold mb-1 text-muted-foreground text-center">Equity Valuation (Shiller P/E)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <MetricCard
                                metricType="equityPE"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColor(values.equityPE, { low: 15, mid: 20 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">Shiller P/E</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColor(values.equityPE, { low: 15, mid: 20 })}`}>
                                    {formatValue(values.equityPE, 'number')}
                                </div>
                                {dates.equityPE && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.equityPE)}</div>
                                )}
                            </MetricCard>

                            <MetricCard
                                metricType="earningsYieldPremium"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColorReversed(values.earningsYieldPremium, { low: 0, mid: 2 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">EY Premium (Shiller)</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColorReversed(values.earningsYieldPremium, { low: 0, mid: 2 })}`}>
                                    {formatValue(values.earningsYieldPremium)}
                                </div>
                                <div className="text-[8px] text-muted-foreground/60 mb-1">(1/PE - 3M)</div>
                                {dates.earningsYieldPremium && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.earningsYieldPremium)}</div>
                                )}
                            </MetricCard>

                            <MetricCard
                                metricType="realEarningsYield"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColorReversed(values.realEarningsYield, { low: 0, mid: 3 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">Real EY (Shiller)</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColorReversed(values.realEarningsYield, { low: 0, mid: 3 })}`}>
                                    {formatValue(values.realEarningsYield)}
                                </div>
                                <div className="text-[8px] text-muted-foreground/60 mb-1">(1/PE - CPI)</div>
                                {dates.realEarningsYield && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.realEarningsYield)}</div>
                                )}
                            </MetricCard>
                        </div>
                    </div>

                    {/* Fourth Row: 5-Year P/E Equity */}
                    <div>
                        <h3 className="text-xs font-semibold mb-1 text-muted-foreground text-center">Equity Valuation (5-Year P/E)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <MetricCard
                                metricType="equityPE5yr"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColor(values.equityPE5yr, { low: 15, mid: 20 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">P/E 5yr</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColor(values.equityPE5yr, { low: 15, mid: 20 })}`}>
                                    {formatValue(values.equityPE5yr, 'number')}
                                </div>
                                {dates.equityPE5yr && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.equityPE5yr)}</div>
                                )}
                            </MetricCard>

                            <MetricCard
                                metricType="earningsYieldPremium5yr"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColorReversed(values.earningsYieldPremium5yr, { low: 0, mid: 2 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">EY Premium (5yr)</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColorReversed(values.earningsYieldPremium5yr, { low: 0, mid: 2 })}`}>
                                    {formatValue(values.earningsYieldPremium5yr)}
                                </div>
                                <div className="text-[8px] text-muted-foreground/60 mb-1">(1/PE5yr - 3M)</div>
                                {dates.earningsYieldPremium5yr && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.earningsYieldPremium5yr)}</div>
                                )}
                            </MetricCard>

                            <MetricCard
                                metricType="realEarningsYield5yr"
                                className={`p-3 rounded bg-card border-2 ${getRegimeColorReversed(values.realEarningsYield5yr, { low: 0, mid: 3 })} transition-all hover:shadow-md text-center`}
                            >
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">Real EY (5yr)</div>
                                <div className={`text-xl font-bold mb-1 ${getRegimeTextColorReversed(values.realEarningsYield5yr, { low: 0, mid: 3 })}`}>
                                    {formatValue(values.realEarningsYield5yr)}
                                </div>
                                <div className="text-[8px] text-muted-foreground/60 mb-1">(EY5yr - CPI)</div>
                                {dates.realEarningsYield5yr && (
                                    <div className="text-[8px] text-muted-foreground/70">{formatDate(dates.realEarningsYield5yr)}</div>
                                )}
                            </MetricCard>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .range-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: linear-gradient(
                        to right,
                        hsl(var(--primary)) 0%,
                        hsl(var(--primary)) ${(sliderValue / totalMonths) * 100}%,
                        hsl(var(--muted)) ${(sliderValue / totalMonths) * 100}%,
                        hsl(var(--muted)) 100%
                    );
                    outline: none;
                    cursor: pointer;
                }
                
                .range-slider::-webkit-slider-track {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: transparent;
                }
                
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: hsl(var(--primary));
                    cursor: grab;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    transition: all 0.2s;
                    border: 3px solid white;
                }
                
                .range-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                }
                
                .range-slider::-webkit-slider-thumb:active {
                    cursor: grabbing;
                    transform: scale(1.1);
                }
                
                .range-slider::-moz-range-track {
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: hsl(var(--muted));
                }
                
                .range-slider::-moz-range-progress {
                    height: 8px;
                    border-radius: 4px;
                    background: hsl(var(--primary));
                }
                
                .range-slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: hsl(var(--primary));
                    cursor: grab;
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    transition: all 0.2s;
                }
                
                .range-slider::-moz-range-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                }
                
                .range-slider::-moz-range-thumb:active {
                    cursor: grabbing;
                    transform: scale(1.1);
                }
                
                .range-slider:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .range-slider:disabled::-webkit-slider-thumb {
                    cursor: not-allowed;
                }
                
                .range-slider:disabled::-moz-range-thumb {
                    cursor: not-allowed;
                }
                
                @media (prefers-color-scheme: dark) {
                    .range-slider::-webkit-slider-thumb {
                        border-color: hsl(var(--background));
                    }
                    .range-slider::-moz-range-thumb {
                        border-color: hsl(var(--background));
                    }
                }
            `}</style>
        </div>
    );
}
