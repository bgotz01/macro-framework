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
    // 5-year metrics
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

interface CompactRegimeMatrixProps {
    initialValues: MatrixValues;
    initialDates?: MatrixDates;
}

export default function CompactRegimeMatrix({ initialValues, initialDates }: CompactRegimeMatrixProps) {
    const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));
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

    // Generate year options (1960 to current year)
    const currentYear = new Date().getFullYear();
    const yearOptions: string[] = [];
    for (let year = currentYear; year >= 1960; year--) {
        yearOptions.push(year.toString());
    }

    // Month options
    const monthOptions = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    useEffect(() => {
        // Check if selected date is current month/year
        const now = new Date();
        const isCurrentMonth = selectedYear === now.getFullYear().toString() &&
            selectedMonth === String(now.getMonth() + 1).padStart(2, '0');

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
                const targetDate = `${selectedYear}-${selectedMonth}`;

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
                    // 5-year metrics
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
    }, [selectedYear, selectedMonth, initialValues, initialDates]);

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

    // Map matrix metrics to percentile chart series
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

    // Create clickable metric card wrapper
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
            <Link
                href={`/chart/percentile?series=${series}`}
                className={`${className} cursor-pointer hover:scale-105 transition-transform relative group`}
                title={`View ${metricType} in percentile chart`}
            >
                {children}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </div>
            </Link>
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

    return (
        <div className="p-3 rounded-lg border border-border/50 bg-card shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Regime Matrix Snapshot</h2>
                <div className="flex items-center gap-2">
                    <label className="text-[10px] font-medium text-muted-foreground">Date:</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-2 py-1 rounded bg-muted text-card-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary text-[10px]"
                        disabled={loading}
                    >
                        {monthOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-2 py-1 rounded bg-muted text-card-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary text-[10px]"
                        disabled={loading}
                    >
                        {yearOptions.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="text-[10px] text-muted-foreground mb-2 text-center">
                Click any metric to view its historical percentile chart
            </div>

            {loading && (
                <div className="flex items-center justify-center py-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
            )}

            {!loading && (
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
                                <div className="text-[9px] font-semibold uppercase tracking-wide mb-1 text-muted-foreground">Real Yield</div>
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
            )}
        </div>
    );
}
