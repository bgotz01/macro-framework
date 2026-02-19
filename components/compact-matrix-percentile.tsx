'use client';

import { useState, useEffect } from 'react';

// Tooltip component for metric explanations
function MetricTooltip({ children, content }: { children: React.ReactNode; content: string }) {
    const [show, setShow] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="absolute z-50 px-3 py-2 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-lg -top-10 left-1/2 -translate-x-1/2 w-64 pointer-events-none whitespace-normal">
                    {content}
                    <div className="absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
            )}
        </div>
    );
}

interface PercentileValues {
    inflation: { percentile: number | null; value: number | null };
    bondYieldNominal: { percentile: number | null; value: number | null };
    bondYieldReal: { percentile: number | null; value: number | null };
    yieldCurve: { percentile: number | null; value: number | null };
    fedFunds: { percentile: number | null; value: number | null };
    equityPE: { percentile: number | null; value: number | null };
    earningsYieldPremium: { percentile: number | null; value: number | null };
    realEarningsYield: { percentile: number | null; value: number | null };
}

interface CompactMatrixPercentileProps {
    initialValues: PercentileValues;
}

export default function CompactMatrixPercentile({ initialValues }: CompactMatrixPercentileProps) {
    const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));
    const [values, setValues] = useState<PercentileValues>(initialValues);
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

        async function fetchHistoricalPercentiles() {
            setLoading(true);
            try {
                const targetDate = `${selectedYear}-${selectedMonth}`;

                // Fetch percentile data for the selected date
                const response = await fetch(`/api/percentile-year?year=${selectedYear}&month=${selectedMonth}`);
                if (response.ok) {
                    const data = await response.json();
                    setValues({
                        inflation: {
                            percentile: data.cpi?.percentileRank ?? null,
                            value: data.cpi?.value ?? null
                        },
                        bondYieldNominal: {
                            percentile: data.tnx?.percentileRank ?? null,
                            value: data.tnx?.value ?? null
                        },
                        bondYieldReal: {
                            percentile: data.realYield?.percentileRank ?? null,
                            value: data.realYield?.value ?? null
                        },
                        yieldCurve: {
                            percentile: data.yieldCurve?.percentileRank ?? null,
                            value: data.yieldCurve?.value ?? null
                        },
                        fedFunds: {
                            percentile: data.fedFunds?.percentileRank ?? null,
                            value: data.fedFunds?.value ?? null
                        },
                        equityPE: {
                            percentile: data.shillerPE?.percentileRank ?? null,
                            value: data.shillerPE?.value ?? null
                        },
                        earningsYieldPremium: {
                            percentile: data.eyp?.percentileRank ?? null,
                            value: data.eyp?.value ?? null
                        },
                        realEarningsYield: {
                            percentile: data.rey?.percentileRank ?? null,
                            value: data.rey?.value ?? null
                        },
                    });
                }
            } catch (error) {
                console.error('Error fetching historical percentiles:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchHistoricalPercentiles();
    }, [selectedYear, selectedMonth, initialValues]);

    const getPercentileColor = (percentile: number | null): string => {
        if (percentile === null) return 'border-gray-300 dark:border-gray-700';
        if (percentile < 25) return 'border-green-500 dark:border-green-400';
        if (percentile < 50) return 'border-blue-500 dark:border-blue-400';
        if (percentile < 75) return 'border-yellow-500 dark:border-yellow-400';
        return 'border-red-500 dark:border-red-400';
    };

    const getPercentileTextColor = (percentile: number | null): string => {
        if (percentile === null) return 'text-gray-500 dark:text-gray-400';
        if (percentile < 25) return 'text-green-600 dark:text-green-400';
        if (percentile < 50) return 'text-blue-600 dark:text-blue-400';
        if (percentile < 75) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getPercentileLabel = (percentile: number | null): string => {
        if (percentile === null) return 'N/A';
        if (percentile < 25) return 'Bottom Quartile';
        if (percentile < 50) return 'Below Average';
        if (percentile < 75) return 'Above Average';
        return 'Top Quartile';
    };

    const formatPercentile = (percentile: number | null): string => {
        if (percentile === null) return 'N/A';
        return `${percentile.toFixed(0)}%`;
    };

    const formatValue = (value: number | null, format: 'percentage' | 'number' = 'percentage'): string => {
        if (value === null) return 'N/A';
        if (format === 'number') return value.toFixed(1);
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    return (
        <div className="p-6 rounded-2xl border border-border/50 bg-card shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Percentile Matrix Snapshot</h2>
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
                            <div className={`p-6 rounded-xl bg-card border-2 ${getPercentileColor(values.fedFunds.percentile)} transition-all hover:shadow-md text-center`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Fed Funds</div>
                                <div className={`text-3xl font-bold mb-1 ${getPercentileTextColor(values.fedFunds.percentile)}`}>
                                    {formatPercentile(values.fedFunds.percentile)}
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Value: <span className="font-semibold">{formatValue(values.fedFunds.value)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getPercentileLabel(values.fedFunds.percentile)}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getPercentileColor(values.bondYieldNominal.percentile)} transition-all hover:shadow-md text-center`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">10Y Yield</div>
                                <div className={`text-3xl font-bold mb-1 ${getPercentileTextColor(values.bondYieldNominal.percentile)}`}>
                                    {formatPercentile(values.bondYieldNominal.percentile)}
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Value: <span className="font-semibold">{formatValue(values.bondYieldNominal.value)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getPercentileLabel(values.bondYieldNominal.percentile)}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getPercentileColor(values.yieldCurve.percentile)} transition-all hover:shadow-md text-center`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Yield Curve (10Y-2Y)</div>
                                <div className={`text-3xl font-bold mb-1 ${getPercentileTextColor(values.yieldCurve.percentile)}`}>
                                    {formatPercentile(values.yieldCurve.percentile)}
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Value: <span className="font-semibold">{formatValue(values.yieldCurve.value)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getPercentileLabel(values.yieldCurve.percentile)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Row: CPI, Real Yield */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Inflation & Real Rates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-6 rounded-xl bg-card border-2 ${getPercentileColor(values.inflation.percentile)} transition-all hover:shadow-md text-center`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">CPI</div>
                                <div className={`text-3xl font-bold mb-1 ${getPercentileTextColor(values.inflation.percentile)}`}>
                                    {formatPercentile(values.inflation.percentile)}
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Value: <span className="font-semibold">{formatValue(values.inflation.value)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getPercentileLabel(values.inflation.percentile)}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getPercentileColor(values.bondYieldReal.percentile)} transition-all hover:shadow-md text-center`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Real Yield (10Y-CPI)</div>
                                <div className={`text-3xl font-bold mb-1 ${getPercentileTextColor(values.bondYieldReal.percentile)}`}>
                                    {formatPercentile(values.bondYieldReal.percentile)}
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Value: <span className="font-semibold">{formatValue(values.bondYieldReal.value)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getPercentileLabel(values.bondYieldReal.percentile)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Third Row: All Equity */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Equity Valuation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`p-6 rounded-xl bg-card border-2 ${getPercentileColor(values.equityPE.percentile)} transition-all hover:shadow-md text-center`}>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">Shiller P/E</div>
                                <div className={`text-3xl font-bold mb-1 ${getPercentileTextColor(values.equityPE.percentile)}`}>
                                    {formatPercentile(values.equityPE.percentile)}
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Value: <span className="font-semibold">{formatValue(values.equityPE.value, 'number')}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getPercentileLabel(values.equityPE.percentile)}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getPercentileColor(values.earningsYieldPremium.percentile)} transition-all hover:shadow-md text-center`}>
                                <MetricTooltip content="Earnings Yield Premium = (1 / Shiller P/E) - 3M Treasury Rate. Measures equity risk premium over cash.">
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground cursor-help border-b border-dotted border-current inline-block">
                                        EY Premium
                                    </div>
                                </MetricTooltip>
                                <div className={`text-3xl font-bold mb-1 ${getPercentileTextColor(values.earningsYieldPremium.percentile)}`}>
                                    {formatPercentile(values.earningsYieldPremium.percentile)}
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Value: <span className="font-semibold">{formatValue(values.earningsYieldPremium.value)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getPercentileLabel(values.earningsYieldPremium.percentile)}
                                </div>
                            </div>

                            <div className={`p-6 rounded-xl bg-card border-2 ${getPercentileColor(values.realEarningsYield.percentile)} transition-all hover:shadow-md text-center`}>
                                <MetricTooltip content="Real Earnings Yield = (1 / Shiller P/E) - CPI Inflation. Measures real return potential of equities.">
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground cursor-help border-b border-dotted border-current inline-block">
                                        Real EY
                                    </div>
                                </MetricTooltip>
                                <div className={`text-3xl font-bold mb-1 ${getPercentileTextColor(values.realEarningsYield.percentile)}`}>
                                    {formatPercentile(values.realEarningsYield.percentile)}
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Value: <span className="font-semibold">{formatValue(values.realEarningsYield.value)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getPercentileLabel(values.realEarningsYield.percentile)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 text-xs text-muted-foreground text-center">
                Select a date to view historical percentile rankings
            </div>
        </div>
    );
}
