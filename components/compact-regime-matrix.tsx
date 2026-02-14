'use client';

import { useState, useEffect } from 'react';

interface MatrixValues {
    inflation: number | null;
    bondYieldNominal: number | null;
    bondYieldReal: number | null;
    yieldCurve: number | null;
    fedFunds: number | null;
    equityPE: number | null;
    earningsYieldPremium: number | null;
    realEarningsYield: number | null;
}

interface CompactRegimeMatrixProps {
    initialValues: MatrixValues;
}

export default function CompactRegimeMatrix({ initialValues }: CompactRegimeMatrixProps) {
    const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));
    const [values, setValues] = useState<MatrixValues>(initialValues);
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
            return;
        }

        async function fetchHistoricalData() {
            setLoading(true);
            try {
                const targetDate = `${selectedYear}-${selectedMonth}`;

                const [cpi, tenYear, twoYear, threeMonth, shillerPE, fedFunds] = await Promise.all([
                    fetchValueAtDate('economic', 'CPI', targetDate),
                    fetchValueAtDate('bonds', 'US/TNX', targetDate),
                    fetchValueAtDate('bonds', 'US/US-2yr', targetDate),
                    fetchValueAtDate('bonds', 'US/IRX', targetDate),
                    fetchValueAtDate('valuations', 'Shiller-PE', targetDate),
                    fetchValueAtDate('economic', 'US/FEDFUNDS', targetDate),
                ]);

                setValues({
                    inflation: cpi,
                    bondYieldNominal: tenYear,
                    bondYieldReal: tenYear !== null && cpi !== null ? tenYear - cpi : null,
                    yieldCurve: tenYear !== null && twoYear !== null ? tenYear - twoYear : null,
                    fedFunds,
                    equityPE: shillerPE,
                    earningsYieldPremium: shillerPE !== null && shillerPE > 0 && threeMonth !== null
                        ? (100 / shillerPE) - threeMonth
                        : null,
                    realEarningsYield: shillerPE !== null && shillerPE > 0 && cpi !== null
                        ? (100 / shillerPE) - cpi
                        : null,
                });
            } catch (error) {
                console.error('Error fetching historical data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchHistoricalData();
    }, [selectedYear, selectedMonth, initialValues]);

    async function fetchValueAtDate(assetClass: string, seriesName: string, targetDate: string): Promise<number | null> {
        try {
            const response = await fetch(`/api/data/${assetClass}?series=${seriesName}`);
            if (!response.ok) return null;

            const result = await response.json();
            if (!result.data || result.data.length === 0) return null;

            const matchingPoints = result.data.filter((point: any) =>
                point.date.startsWith(targetDate)
            );

            if (matchingPoints.length > 0) {
                const point = matchingPoints[matchingPoints.length - 1];
                const columns = Object.keys(point).filter(k => k !== 'date');
                return columns.length > 0 ? point[columns[0]] : null;
            }

            return null;
        } catch (error) {
            console.error(`Error fetching ${assetClass}/${seriesName}:`, error);
            return null;
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

    const formatValue = (value: number | null, format: 'percentage' | 'number' = 'percentage'): string => {
        if (value === null) return 'N/A';
        if (format === 'number') return value.toFixed(1);
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    return (
        <div className="p-6 rounded-2xl border border-border/50 bg-card shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Regime Matrix Snapshot</h2>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-muted-foreground">Date:</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                        className="px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {!loading && (
                <div className="space-y-6">
                    {/* First Row: Fed Funds, 10yr Yield, Yield Curve */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Rates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`p-6 rounded-xl bg-card border-2 ${getRegimeColor(values.fedFunds, { low: 2, mid: 4 })} transition-all hover:shadow-md`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Fed Funds</div>
                                <div className={`text-3xl font-bold mb-2 ${getRegimeTextColor(values.fedFunds, { low: 2, mid: 4 })}`}>
                                    {formatValue(values.fedFunds)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {values.fedFunds !== null && values.fedFunds < 2 && 'Low'}
                                    {values.fedFunds !== null && values.fedFunds >= 2 && values.fedFunds < 4 && 'Mid'}
                                    {values.fedFunds !== null && values.fedFunds >= 4 && 'High'}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getRegimeColor(values.bondYieldNominal, { low: 2, mid: 5 })} transition-all hover:shadow-md`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">10Y Yield</div>
                                <div className={`text-3xl font-bold mb-2 ${getRegimeTextColor(values.bondYieldNominal, { low: 2, mid: 5 })}`}>
                                    {formatValue(values.bondYieldNominal)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {values.bondYieldNominal !== null && values.bondYieldNominal < 2 && 'Low'}
                                    {values.bondYieldNominal !== null && values.bondYieldNominal >= 2 && values.bondYieldNominal < 5 && 'Mid'}
                                    {values.bondYieldNominal !== null && values.bondYieldNominal >= 5 && 'High'}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getYieldCurveColor(values.yieldCurve)} transition-all hover:shadow-md`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Yield Curve (10Y-2Y)</div>
                                <div className={`text-3xl font-bold mb-2 ${getYieldCurveTextColor(values.yieldCurve)}`}>
                                    {formatValue(values.yieldCurve)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {values.yieldCurve !== null && values.yieldCurve < -0.5 && 'Inverted'}
                                    {values.yieldCurve !== null && values.yieldCurve >= -0.5 && values.yieldCurve < 0.5 && 'Flat'}
                                    {values.yieldCurve !== null && values.yieldCurve >= 0.5 && 'Steep'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Row: CPI, Real Yield */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Inflation & Real Rates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-6 rounded-xl bg-card border-2 ${getRegimeColor(values.inflation, { low: 3, mid: 6 })} transition-all hover:shadow-md`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">CPI</div>
                                <div className={`text-3xl font-bold mb-2 ${getRegimeTextColor(values.inflation, { low: 3, mid: 6 })}`}>
                                    {formatValue(values.inflation)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {values.inflation !== null && values.inflation < 3 && 'Low'}
                                    {values.inflation !== null && values.inflation >= 3 && values.inflation < 6 && 'Mid'}
                                    {values.inflation !== null && values.inflation >= 6 && 'High'}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getRegimeColor(values.bondYieldReal, { low: 0, mid: 2 })} transition-all hover:shadow-md`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Real Yield (10Y-CPI)</div>
                                <div className={`text-3xl font-bold mb-2 ${getRegimeTextColor(values.bondYieldReal, { low: 0, mid: 2 })}`}>
                                    {formatValue(values.bondYieldReal)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {values.bondYieldReal !== null && values.bondYieldReal < 0 && 'Negative'}
                                    {values.bondYieldReal !== null && values.bondYieldReal >= 0 && values.bondYieldReal < 2 && 'Neutral'}
                                    {values.bondYieldReal !== null && values.bondYieldReal >= 2 && 'High'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Third Row: All Equity */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Equity Valuation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`p-6 rounded-xl bg-card border-2 ${getRegimeColor(values.equityPE, { low: 15, mid: 20 })} transition-all hover:shadow-md`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Shiller P/E</div>
                                <div className={`text-3xl font-bold mb-2 ${getRegimeTextColor(values.equityPE, { low: 15, mid: 20 })}`}>
                                    {formatValue(values.equityPE, 'number')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {values.equityPE !== null && values.equityPE < 15 && 'Cheap'}
                                    {values.equityPE !== null && values.equityPE >= 15 && values.equityPE < 20 && 'Fair'}
                                    {values.equityPE !== null && values.equityPE >= 20 && 'Expensive'}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getRegimeColorReversed(values.earningsYieldPremium, { low: 0, mid: 2 })} transition-all hover:shadow-md`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">EY Premium</div>
                                <div className={`text-3xl font-bold mb-2 ${getRegimeTextColorReversed(values.earningsYieldPremium, { low: 0, mid: 2 })}`}>
                                    {formatValue(values.earningsYieldPremium)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {values.earningsYieldPremium !== null && values.earningsYieldPremium < 0 && 'Negative'}
                                    {values.earningsYieldPremium !== null && values.earningsYieldPremium >= 0 && values.earningsYieldPremium < 2 && 'Neutral'}
                                    {values.earningsYieldPremium !== null && values.earningsYieldPremium >= 2 && 'Positive'}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getRegimeColorReversed(values.realEarningsYield, { low: 0, mid: 3 })} transition-all hover:shadow-md`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Real EY</div>
                                <div className={`text-3xl font-bold mb-2 ${getRegimeTextColorReversed(values.realEarningsYield, { low: 0, mid: 3 })}`}>
                                    {formatValue(values.realEarningsYield)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {values.realEarningsYield !== null && values.realEarningsYield < 0 && 'Negative'}
                                    {values.realEarningsYield !== null && values.realEarningsYield >= 0 && values.realEarningsYield < 3 && 'Low'}
                                    {values.realEarningsYield !== null && values.realEarningsYield >= 3 && 'Positive'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 text-xs text-muted-foreground text-center">
                Select a date to view historical regime conditions
            </div>
        </div>
    );
}
