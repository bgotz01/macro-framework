'use client';

import { useState, Fragment } from 'react';

interface MetricData {
    assetClass: string;
    seriesName: string;
    date: number;
    dateStr: string;
    value: number;
    percentileRank: number;
}

interface PercentileBarsProps {
    initialData: any;
    availableYears: number[];
    initialYear?: number;
}

interface MetricConfig {
    key: string;
    label: string;
    shortLabel: string;
    category: string;
    format: (value: number) => string;
}

const METRICS: MetricConfig[] = [
    { key: 'cpi', label: 'CPI Inflation', shortLabel: 'CPI', category: 'Inflation & Policy', format: (v) => `${v.toFixed(2)}%` },
    { key: 'fedFunds', label: 'Fed Funds Rate', shortLabel: 'Fed Funds', category: 'Inflation & Policy', format: (v) => `${v.toFixed(2)}%` },
    { key: 'tnx', label: '10Y Treasury', shortLabel: '10Y', category: 'Bond Yields', format: (v) => `${v.toFixed(2)}%` },
    { key: 'us2yr', label: '2Y Treasury', shortLabel: '2Y', category: 'Bond Yields', format: (v) => `${v.toFixed(2)}%` },
    { key: 'irx', label: '3M Treasury', shortLabel: '3M', category: 'Bond Yields', format: (v) => `${v.toFixed(2)}%` },
    { key: 'realYield', label: 'Real Yield (10Y-CPI)', shortLabel: '10Y-CPI', category: 'Implied Yields & Spreads', format: (v) => `${v.toFixed(2)}%` },
    { key: 'yieldCurve', label: 'Yield Curve (10Y-2Y)', shortLabel: '10Y-2Y', category: 'Implied Yields & Spreads', format: (v) => `${v.toFixed(2)}%` },
    { key: 'yieldCurve3M', label: 'Yield Curve (10Y-3M)', shortLabel: '10Y-3M', category: 'Implied Yields & Spreads', format: (v) => `${v.toFixed(2)}%` },
    { key: 'eyp', label: 'Earnings Yield Premium (EY-3M)', shortLabel: 'EY-3M', category: 'Implied Yields & Spreads', format: (v) => `${v.toFixed(2)}%` },
    { key: 'eyCAPE', label: 'Earnings Yield CAPE (1/CAPE)', shortLabel: 'EY CAPE', category: 'Implied Yields & Spreads', format: (v) => `${v.toFixed(2)}%` },
    { key: 'ey5yr', label: 'Earnings Yield 5yr (1/P/E-5yr)', shortLabel: 'EY-5yr', category: 'Implied Yields & Spreads', format: (v) => `${v.toFixed(2)}%` },
    { key: 'rey5yr', label: 'Real Earnings Yield 5yr (EY5yr-CPI)', shortLabel: 'Real EY-5yr', category: 'Implied Yields & Spreads', format: (v) => `${v.toFixed(2)}%` },
    { key: 'shillerPE', label: 'Shiller P/E (CAPE)', shortLabel: 'CAPE', category: 'Equity Valuation', format: (v) => `${v.toFixed(1)}x` },
    { key: 'pe5yr', label: 'P/E-5yr', shortLabel: 'P/E-5yr', category: 'Equity Valuation', format: (v) => `${v.toFixed(1)}x` },
];

export default function PercentileBars({ initialData, availableYears, initialYear = 9999 }: PercentileBarsProps) {
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);

    const handleYearChange = async (yearValue: string) => {
        const year = yearValue === 'latest' ? 9999 : parseInt(yearValue);
        setSelectedYear(year);
        setLoading(true);

        try {
            const response = await fetch(`/api/percentile-year?year=${yearValue}`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching percentile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const isLatest = selectedYear === 9999;
    const displayYear = isLatest ? 'Latest' : selectedYear.toString();

    function getPercentileColor(percentile: number, metricKey?: string): string {
        const isReversed = metricKey === 'eyp' || metricKey === 'eyCAPE' || metricKey === 'ey5yr' || metricKey === 'rey5yr' || metricKey === 'realYield' || metricKey === 'yieldCurve' || metricKey === 'yieldCurve3M';

        if (isReversed) {
            if (percentile < 25) return 'bg-red-500';
            if (percentile < 50) return 'bg-yellow-500';
            if (percentile < 75) return 'bg-blue-500';
            return 'bg-green-500';
        }

        if (percentile < 25) return 'bg-green-500';
        if (percentile < 50) return 'bg-blue-500';
        if (percentile < 75) return 'bg-yellow-500';
        return 'bg-red-500';
    }

    function getPercentileTextColor(percentile: number, metricKey?: string): string {
        const isReversed = metricKey === 'eyp' || metricKey === 'eyCAPE' || metricKey === 'ey5yr' || metricKey === 'rey5yr' || metricKey === 'realYield' || metricKey === 'yieldCurve' || metricKey === 'yieldCurve3M';

        if (isReversed) {
            if (percentile < 25) return 'text-red-600 dark:text-red-400';
            if (percentile < 50) return 'text-yellow-600 dark:text-yellow-400';
            if (percentile < 75) return 'text-blue-600 dark:text-blue-400';
            return 'text-green-600 dark:text-green-400';
        }

        if (percentile < 25) return 'text-green-600 dark:text-green-400';
        if (percentile < 50) return 'text-blue-600 dark:text-blue-400';
        if (percentile < 75) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    }

    function getPercentileBg(percentile: number, metricKey?: string): string {
        const isReversed = metricKey === 'eyp' || metricKey === 'eyCAPE' || metricKey === 'ey5yr' || metricKey === 'rey5yr' || metricKey === 'realYield' || metricKey === 'yieldCurve' || metricKey === 'yieldCurve3M';

        if (isReversed) {
            if (percentile < 25) return 'bg-red-50 dark:bg-red-950';
            if (percentile < 50) return 'bg-yellow-50 dark:bg-yellow-950';
            if (percentile < 75) return 'bg-blue-50 dark:bg-blue-950';
            return 'bg-green-50 dark:bg-green-950';
        }

        if (percentile < 25) return 'bg-green-50 dark:bg-green-950';
        if (percentile < 50) return 'bg-blue-50 dark:bg-blue-950';
        if (percentile < 75) return 'bg-yellow-50 dark:bg-yellow-950';
        return 'bg-red-50 dark:bg-red-950';
    }

    // Group metrics by category
    const groupedMetrics = METRICS.reduce((acc, metric) => {
        if (!acc[metric.category]) acc[metric.category] = [];
        acc[metric.category].push(metric);
        return acc;
    }, {} as Record<string, MetricConfig[]>);

    return (
        <div className="mb-6 rounded-xl border bg-card p-4">
            {/* Year Selector */}
            <div className="mb-4 p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-base font-bold mb-0.5">Select Time Period</h2>
                        <p className="text-xs text-muted-foreground">
                            {isLatest ? 'Most recent percentile rankings' : 'Rankings as of December 31st'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="year-select" className="text-sm font-medium">
                            Period:
                        </label>
                        <select
                            id="year-select"
                            value={isLatest ? 'latest' : selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border-2 bg-background text-foreground font-medium min-w-[100px] cursor-pointer hover:border-primary transition-colors"
                            disabled={loading}
                        >
                            <option value="latest">Latest</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Percentile Bars */}
            <div className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Percentile Rankings - {displayYear}</h2>
                    {loading && (
                        <span className="text-xs text-muted-foreground">Loading...</span>
                    )}
                </div>

                <div className="space-y-4">
                    {Object.entries(groupedMetrics).map(([category, metrics]) => (
                        <div key={category}>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {metrics.map(metric => {
                                    const metricData = data[metric.key] as MetricData | null;

                                    if (!metricData) {
                                        return (
                                            <div key={metric.key} className="flex items-center gap-3">
                                                <div className="w-32 flex-shrink-0">
                                                    <div className="font-medium text-xs">{metric.shortLabel}</div>
                                                </div>
                                                <div className="flex-1 text-muted-foreground text-xs">
                                                    No data
                                                </div>
                                            </div>
                                        );
                                    }

                                    const percentile = metricData.percentileRank;
                                    const barColor = getPercentileColor(percentile, metric.key);
                                    const textColor = getPercentileTextColor(percentile, metric.key);

                                    return (
                                        <div key={metric.key} className="flex items-center gap-3">
                                            <div className="w-32 flex-shrink-0">
                                                <div className="font-medium text-xs">{metric.shortLabel}</div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {metric.format(metricData.value)}
                                                </div>
                                            </div>
                                            <div className="flex-1 flex items-center gap-2">
                                                <div className="flex-1 h-6 bg-muted rounded overflow-hidden relative">
                                                    <div
                                                        className={`h-full ${barColor} transition-all duration-500 ease-out`}
                                                        style={{ width: `${percentile}%` }}
                                                    />
                                                </div>
                                                <div className="w-16 text-right">
                                                    <span className={`text-xs font-semibold ${textColor}`}>
                                                        {percentile.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Low (0-25th)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Below Avg (25-50th)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span>Above Avg (50-75th)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>High (75-100th)</span>
                        </div>
                    </div>
                    <div className="mt-2 text-center space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                            * Implied Yields & Spreads use reversed colors (higher is better)
                        </p>
                        <p className="text-xs text-muted-foreground">
                            10Y-CPI = 10Y Treasury - CPI
                        </p>
                        <p className="text-xs text-muted-foreground">
                            EY-3M = (1 / CAPE) - 3M Treasury | EY-CPI = (1 / CAPE) - CPI
                        </p>
                        <p className="text-xs text-muted-foreground">
                            CAPE (Shiller P/E) uses 10-year trailing inflation-adjusted earnings
                        </p>
                    </div>
                </div>

                {/* Key Insights */}
                {data && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <h3 className="font-bold mb-2 text-sm text-blue-900 dark:text-blue-100">
                            💡 Key Insights for {displayYear}
                        </h3>
                        <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                            {data.shillerPE && data.shillerPE.percentileRank > 90 && (
                                <p>• <strong>Extreme Valuation (CAPE):</strong> Shiller P/E at {data.shillerPE.percentileRank.toFixed(1)}th percentile - historically elevated</p>
                            )}
                            {data.pe5yr && data.pe5yr.percentileRank > 90 && (
                                <p>• <strong>Extreme Valuation (P/E-5yr):</strong> P/E-5yr at {data.pe5yr.percentileRank.toFixed(1)}th percentile - historically elevated</p>
                            )}
                            {data.cpi && data.cpi.percentileRank > 75 && (
                                <p>• <strong>High Inflation:</strong> CPI at {data.cpi.percentileRank.toFixed(1)}th percentile - above historical norms</p>
                            )}
                            {data.cpi && data.cpi.percentileRank < 25 && (
                                <p>• <strong>Low Inflation:</strong> CPI at {data.cpi.percentileRank.toFixed(1)}th percentile - below historical norms</p>
                            )}
                            {data.yieldCurve && data.yieldCurve.value < 0 && (
                                <p>• <strong>Inverted Yield Curve:</strong> 10Y-2Y spread negative - historically precedes recessions</p>
                            )}
                            {data.eyp && data.eyp.percentileRank < 25 && (
                                <p>• <strong>Compressed Risk Premium:</strong> Earnings Yield Premium at {data.eyp.percentileRank.toFixed(1)}th percentile - stocks less attractive vs bonds</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Expandable Table */}
                <div className="mt-4">
                    <button
                        onClick={() => setShowTable(!showTable)}
                        className="w-full px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                        {showTable ? '▼' : '▶'} {showTable ? 'Hide' : 'Show'} Detailed Table View ({displayYear})
                    </button>

                    {showTable && (
                        <div className="mt-3 rounded-lg border bg-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-2 font-semibold">Metric</th>
                                            <th className="text-right p-2 font-semibold">Value</th>
                                            <th className="text-right p-2 font-semibold">Percentile</th>
                                            <th className="text-left p-2 font-semibold">Interpretation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(groupedMetrics).map(([category, metrics]) => (
                                            <Fragment key={category}>
                                                <tr className="bg-muted/30">
                                                    <td colSpan={4} className="p-1.5 px-2 font-semibold text-xs uppercase tracking-wide">
                                                        {category}
                                                    </td>
                                                </tr>
                                                {metrics.map(metric => {
                                                    const metricData = data[metric.key] as MetricData | null;

                                                    if (!metricData) {
                                                        return (
                                                            <tr key={metric.key} className="border-t">
                                                                <td className="p-2">{metric.label}</td>
                                                                <td colSpan={3} className="p-2 text-muted-foreground text-center">
                                                                    No data
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    const percentile = metricData.percentileRank;
                                                    let interpretation = '';
                                                    if (percentile < 25) interpretation = 'Low (Bottom Quartile)';
                                                    else if (percentile < 50) interpretation = 'Below Average';
                                                    else if (percentile < 75) interpretation = 'Above Average';
                                                    else interpretation = 'High (Top Quartile)';

                                                    return (
                                                        <tr key={metric.key} className="border-t hover:bg-muted/20 transition-colors">
                                                            <td className="p-2 font-medium">{metric.label}</td>
                                                            <td className="p-2 text-right font-mono">
                                                                {metric.format(metricData.value)}
                                                            </td>
                                                            <td className={`p-2 text-right font-bold ${getPercentileTextColor(percentile, metric.key)}`}>
                                                                {percentile.toFixed(1)}th
                                                            </td>
                                                            <td className="p-2">
                                                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPercentileBg(percentile, metric.key)} ${getPercentileTextColor(percentile, metric.key)}`}>
                                                                    {interpretation}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
