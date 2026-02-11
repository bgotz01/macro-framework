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

interface PercentileViewerProps {
    initialYear: number;
    availableYears: number[];
    initialData: any;
}

interface MetricConfig {
    key: string;
    label: string;
    category: string;
    format: (value: number) => string;
}

const METRICS: MetricConfig[] = [
    { key: 'cpi', label: 'CPI Inflation', category: 'Inflation & Policy', format: (v) => `${v.toFixed(2)}%` },
    { key: 'fedFunds', label: 'Fed Funds Rate', category: 'Inflation & Policy', format: (v) => `${v.toFixed(2)}%` },
    { key: 'tnx', label: '10Y Treasury', category: 'Bond Yields', format: (v) => `${v.toFixed(2)}%` },
    { key: 'us2yr', label: '2Y Treasury', category: 'Bond Yields', format: (v) => `${v.toFixed(2)}%` },
    { key: 'irx', label: '3M Treasury', category: 'Bond Yields', format: (v) => `${v.toFixed(2)}%` },
    { key: 'realYield', label: 'Real Yield (10Y-CPI)', category: 'Bond Yields', format: (v) => `${v.toFixed(2)}%` },
    { key: 'yieldCurve', label: 'Yield Curve (10Y-2Y)', category: 'Bond Yields', format: (v) => `${v.toFixed(2)}%` },
    { key: 'shillerPE', label: 'Shiller P/E (CAPE)', category: 'Equity Valuation', format: (v) => `${v.toFixed(1)}x` },
    { key: 'pe5yr', label: 'P/E-5yr', category: 'Equity Valuation', format: (v) => `${v.toFixed(1)}x` },
    { key: 'eyp', label: 'Earnings Yield Premium', category: 'Equity Valuation', format: (v) => `${v.toFixed(2)}%` },
    { key: 'rey', label: 'Real Earnings Yield', category: 'Equity Valuation', format: (v) => `${v.toFixed(2)}%` },
];

export default function PercentileViewer({
    initialYear,
    availableYears,
    initialData
}: PercentileViewerProps) {
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);

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

    function getPercentileColor(percentile: number): string {
        if (percentile < 25) return 'text-green-600 dark:text-green-400';
        if (percentile < 50) return 'text-blue-600 dark:text-blue-400';
        if (percentile < 75) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    }

    function getPercentileBg(percentile: number): string {
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

    const isLatest = selectedYear === 9999;
    const displayYear = isLatest ? 'Latest' : selectedYear.toString();

    return (
        <>
            {/* Year Selector */}
            <div className="mb-6 p-4 rounded-xl border-2 bg-card">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-lg font-bold mb-1">Select Time Period</h2>
                        <p className="text-xs text-muted-foreground">
                            {isLatest ? 'View most recent percentile rankings' : 'View percentile rankings as of December 31st'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label htmlFor="year-select" className="text-sm font-medium">
                            Period:
                        </label>
                        <select
                            id="year-select"
                            value={isLatest ? 'latest' : selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="px-4 py-2 rounded-lg border-2 bg-background text-foreground font-medium text-lg min-w-[120px] cursor-pointer hover:border-primary transition-colors"
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

            {/* Loading State */}
            {loading && (
                <div className="mb-6 p-4 rounded-xl bg-muted text-center">
                    <p className="text-muted-foreground">Loading data for {displayYear}...</p>
                </div>
            )}

            {/* Compact Table View */}
            {!loading && (
                <div className="mb-6 rounded-xl border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 font-semibold">Metric</th>
                                    <th className="text-right p-3 font-semibold">Value</th>
                                    <th className="text-right p-3 font-semibold">Percentile</th>
                                    <th className="text-left p-3 font-semibold">Interpretation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedMetrics).map(([category, metrics]) => (
                                    <Fragment key={category}>
                                        <tr className="bg-muted/30">
                                            <td colSpan={4} className="p-2 px-3 font-semibold text-xs uppercase tracking-wide">
                                                {category}
                                            </td>
                                        </tr>
                                        {metrics.map(metric => {
                                            const metricData = data[metric.key] as MetricData | null;

                                            if (!metricData) {
                                                return (
                                                    <tr key={metric.key} className="border-t">
                                                        <td className="p-3">{metric.label}</td>
                                                        <td colSpan={3} className="p-3 text-muted-foreground text-center">
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
                                                    <td className="p-3 font-medium">{metric.label}</td>
                                                    <td className="p-3 text-right font-mono">
                                                        {metric.format(metricData.value)}
                                                    </td>
                                                    <td className={`p-3 text-right font-bold ${getPercentileColor(percentile)}`}>
                                                        {percentile.toFixed(1)}th
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPercentileBg(percentile)} ${getPercentileColor(percentile)}`}>
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

            {/* Key Insights */}
            {!loading && data && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <h3 className="font-bold mb-2 text-blue-900 dark:text-blue-100">
                        💡 Key Insights for {displayYear}
                    </h3>
                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
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
        </>
    );
}
