'use client';

import { useState } from 'react';

interface PercentileData {
    percentile: number | null;
    value: number | null;
    yoyChange: number | null;
}

interface PercentileValues {
    cpi: PercentileData;
    tnx: PercentileData;
    realYield: PercentileData;
    yieldCurve: PercentileData;
    treasury3M: PercentileData;
    pe5yr: PercentileData;
    eyp5yr: PercentileData;
    rey5yr: PercentileData;
}

export default function PeriodComparison() {
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState<PercentileValues | null>(null);
    const [latestValues, setLatestValues] = useState<PercentileValues | null>(null);
    const [similarityScore, setSimilarityScore] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPercentiles, setShowPercentiles] = useState(true);
    const [yoyWeight, setYoyWeight] = useState(10);
    const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
        new Set(['cpi', 'tnx', 'realYield', 'yieldCurve', 'treasury3M', 'pe5yr', 'eyp5yr', 'rey5yr'])
    );

    // Fetch latest period data on mount
    useEffect(() => {
        async function fetchLatest() {
            try {
                const response = await fetch('/api/percentile-year?year=latest');
                if (!response.ok) return;

                const data = await response.json();
                setLatestValues({
                    cpi: {
                        percentile: data.cpi?.percentileRank ?? null,
                        value: data.cpi?.value ?? null,
                        yoyChange: data.cpi?.yoyPercentileChange ?? null
                    },
                    tnx: {
                        percentile: data.tnx?.percentileRank ?? null,
                        value: data.tnx?.value ?? null,
                        yoyChange: data.tnx?.yoyPercentileChange ?? null
                    },
                    realYield: {
                        percentile: data.realYield?.percentileRank ?? null,
                        value: data.realYield?.value ?? null,
                        yoyChange: data.realYield?.yoyPercentileChange ?? null
                    },
                    yieldCurve: {
                        percentile: data.yieldCurve3M?.percentileRank ?? null,
                        value: data.yieldCurve3M?.value ?? null,
                        yoyChange: data.yieldCurve3M?.yoyPercentileChange ?? null
                    },
                    treasury3M: {
                        percentile: data.irx?.percentileRank ?? null,
                        value: data.irx?.value ?? null,
                        yoyChange: data.irx?.yoyPercentileChange ?? null
                    },
                    pe5yr: {
                        percentile: data.pe5yr?.percentileRank ?? null,
                        value: data.pe5yr?.value ?? null,
                        yoyChange: data.pe5yr?.yoyPercentileChange ?? null
                    },
                    eyp5yr: {
                        percentile: data.eyp5yr?.percentileRank ?? null,
                        value: data.eyp5yr?.value ?? null,
                        yoyChange: data.eyp5yr?.yoyPercentileChange ?? null
                    },
                    rey5yr: {
                        percentile: data.rey5yr?.percentileRank ?? null,
                        value: data.rey5yr?.value ?? null,
                        yoyChange: data.rey5yr?.yoyPercentileChange ?? null
                    }
                });
            } catch (err) {
                console.error('Error fetching latest data:', err);
            }
        }
        fetchLatest();
    });

    // Recalculate similarity when yoyWeight or selectedMetrics change
    useState(() => {
        if (values && latestValues) {
            const score = calculateSimilarity(latestValues, values, yoyWeight, selectedMetrics);
            setSimilarityScore(score);
        }
    });

    const toggleMetric = (metric: string) => {
        const newMetrics = new Set(selectedMetrics);
        if (newMetrics.has(metric)) {
            if (newMetrics.size === 1) return;
            newMetrics.delete(metric);
        } else {
            newMetrics.add(metric);
        }
        setSelectedMetrics(newMetrics);
    };

    const metricLabels: Record<string, string> = {
        cpi: 'CPI',
        tnx: '10Y',
        realYield: 'Real 10Y',
        yieldCurve: 'Curve',
        treasury3M: '3M',
        pe5yr: 'P/E 5yr',
        eyp5yr: 'EYP 5yr',
        rey5yr: 'Real EY'
    };

    const metricCategories = {
        nominal: {
            label: 'Nominal',
            metrics: ['cpi', 'treasury3M', 'tnx', 'pe5yr']
        },
        relative: {
            label: 'Relative',
            metrics: ['realYield', 'yieldCurve', 'eyp5yr', 'rey5yr']
        }
    };

    function adjustMonth(delta: number) {
        if (!selectedYear || !selectedMonth) return;

        const currentDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
        currentDate.setMonth(currentDate.getMonth() + delta);

        const newYear = currentDate.getFullYear();
        const newMonth = currentDate.getMonth() + 1;

        // Don't go beyond 2026 or before 1960
        if (newYear > 2026 || newYear < 1960) return;

        setSelectedYear(newYear.toString());
        setSelectedMonth(newMonth.toString());

        // Auto-fetch after adjustment
        setTimeout(() => {
            fetchPeriodData();
        }, 0);
    }

    async function fetchPeriodData() {
        if (!selectedYear || !selectedMonth) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/percentile-year?year=${selectedYear}&month=${selectedMonth}`);

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();

            const fetchedValues = {
                cpi: {
                    percentile: data.cpi?.percentileRank ?? null,
                    value: data.cpi?.value ?? null,
                    yoyChange: data.cpi?.yoyPercentileChange ?? null
                },
                tnx: {
                    percentile: data.tnx?.percentileRank ?? null,
                    value: data.tnx?.value ?? null,
                    yoyChange: data.tnx?.yoyPercentileChange ?? null
                },
                realYield: {
                    percentile: data.realYield?.percentileRank ?? null,
                    value: data.realYield?.value ?? null,
                    yoyChange: data.realYield?.yoyPercentileChange ?? null
                },
                yieldCurve: {
                    percentile: data.yieldCurve3M?.percentileRank ?? null,
                    value: data.yieldCurve3M?.value ?? null,
                    yoyChange: data.yieldCurve3M?.yoyPercentileChange ?? null
                },
                treasury3M: {
                    percentile: data.irx?.percentileRank ?? null,
                    value: data.irx?.value ?? null,
                    yoyChange: data.irx?.yoyPercentileChange ?? null
                },
                pe5yr: {
                    percentile: data.pe5yr?.percentileRank ?? null,
                    value: data.pe5yr?.value ?? null,
                    yoyChange: data.pe5yr?.yoyPercentileChange ?? null
                },
                eyp5yr: {
                    percentile: data.eyp5yr?.percentileRank ?? null,
                    value: data.eyp5yr?.value ?? null,
                    yoyChange: data.eyp5yr?.yoyPercentileChange ?? null
                },
                rey5yr: {
                    percentile: data.rey5yr?.percentileRank ?? null,
                    value: data.rey5yr?.value ?? null,
                    yoyChange: data.rey5yr?.yoyPercentileChange ?? null
                }
            };

            setValues(fetchedValues);

            // Calculate similarity score if we have latest data
            if (latestValues) {
                const score = calculateSimilarity(latestValues, fetchedValues, yoyWeight, selectedMetrics);
                setSimilarityScore(score);
            }
        } catch (err) {
            console.error('Error fetching period data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
            setValues(null);
        } finally {
            setLoading(false);
        }
    }

    function calculateSimilarity(latest: PercentileValues, selected: PercentileValues, yoyWeightPercent: number, metricsToUse: Set<string>): number | null {
        const metrics: (keyof PercentileValues)[] = ['cpi', 'tnx', 'realYield', 'yieldCurve', 'treasury3M', 'pe5yr', 'eyp5yr', 'rey5yr'];

        let sumSquaresPercentile = 0;
        let sumSquaresYoy = 0;
        let countPercentile = 0;
        let countYoy = 0;

        // Calculate distance for percentile values
        for (const metric of metrics) {
            if (!metricsToUse.has(metric)) continue;

            const valA = latest[metric].percentile;
            const valB = selected[metric].percentile;

            if (valA !== null && valB !== null) {
                sumSquaresPercentile += Math.pow(valA - valB, 2);
                countPercentile++;
            }
        }

        // Calculate distance for YoY changes
        for (const metric of metrics) {
            if (!metricsToUse.has(metric)) continue;

            const yoyA = latest[metric].yoyChange;
            const yoyB = selected[metric].yoyChange;

            if (yoyA !== null && yoyB !== null && yoyA !== undefined && yoyB !== undefined) {
                sumSquaresYoy += Math.pow(yoyA - yoyB, 2);
                countYoy++;
            }
        }

        if (countPercentile < 3) return null;

        // Calculate weighted distance
        const percentileWeight = (100 - yoyWeightPercent) / 100;
        const yoyWeightDecimal = yoyWeightPercent / 100;

        const percentileDistance = Math.sqrt(sumSquaresPercentile / countPercentile);

        // Only include YoY if we have at least 2 metrics with YoY data
        if (countYoy >= 2) {
            const yoyDistance = Math.sqrt(sumSquaresYoy / countYoy);
            const distance = (percentileWeight * percentileDistance) + (yoyWeightDecimal * yoyDistance);
            return 100 - distance;
        }

        // If not enough YoY data, just use percentile distance
        return 100 - percentileDistance;
    }

    function getScoreColor(score: number | null): string {
        if (score === null) return 'text-gray-500';
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 80) return 'text-blue-600 dark:text-blue-400';
        if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-orange-600 dark:text-orange-400';
    }

    function formatPercentile(percentile: number | null): string {
        if (percentile === null) return 'N/A';
        return `${percentile.toFixed(0)}%`;
    }

    function formatValue(value: number | null, metric?: keyof PercentileValues): string {
        if (value === null) return 'N/A';

        // P/E is a ratio, not a percentage
        if (metric === 'pe5yr') {
            return value.toFixed(2);
        }

        return `${value.toFixed(2)}%`;
    }

    function formatDisplayValue(metric: keyof PercentileValues): string {
        if (!values) return 'N/A';
        const data = values[metric];

        if (showPercentiles) {
            return formatPercentile(data.percentile);
        } else {
            return formatValue(data.value, metric);
        }
    }

    function formatYoyChange(change: number | null): string {
        if (change === null || change === undefined) return 'N/A';
        const sign = change > 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}`;
    }

    function getYoyColor(change: number | null): string {
        if (change === null || change === undefined) return 'text-gray-500';
        if (change > 10) return 'text-green-600 dark:text-green-400';
        if (change > 0) return 'text-blue-600 dark:text-blue-400';
        if (change > -10) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    }

    function getPercentileColor(percentile: number | null): string {
        if (percentile === null) return 'border-gray-300 dark:border-gray-700';
        if (percentile < 25) return 'border-green-500 dark:border-green-400';
        if (percentile < 50) return 'border-blue-500 dark:border-blue-400';
        if (percentile < 75) return 'border-yellow-500 dark:border-yellow-400';
        return 'border-red-500 dark:border-red-400';
    }

    function getPercentileTextColor(percentile: number | null): string {
        if (percentile === null) return 'text-gray-500 dark:text-gray-400';
        if (percentile < 25) return 'text-green-600 dark:text-green-400';
        if (percentile < 50) return 'text-blue-600 dark:text-blue-400';
        if (percentile < 75) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    }

    return (
        <div className="p-6 rounded-2xl border border-border/50 bg-card shadow-lg">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">Historical Period Lookup</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label htmlFor="yoy-weight" className="text-xs font-medium text-muted-foreground">
                                YoY Weight:
                            </label>
                            <input
                                id="yoy-weight"
                                type="range"
                                min="0"
                                max="20"
                                value={yoyWeight}
                                onChange={(e) => setYoyWeight(Number(e.target.value))}
                                className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs font-medium w-8">{yoyWeight}%</span>
                        </div>
                        <button
                            onClick={() => setShowPercentiles(!showPercentiles)}
                            className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
                        >
                            {showPercentiles ? 'Show Values' : 'Show Percentiles'}
                        </button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                    Select a date to view {showPercentiles ? 'percentile rankings' : 'actual values'} for that period
                    {yoyWeight > 0 && ` (${100 - yoyWeight}% levels, ${yoyWeight}% momentum)`}
                </p>

                {/* Metric Selection */}
                <div className="p-3 rounded-lg bg-muted/30">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {Object.entries(metricCategories).map(([categoryKey, category]) => (
                            category.metrics.map((key) => (
                                <label
                                    key={key}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border cursor-pointer hover:border-primary transition-colors text-xs"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMetrics.has(key)}
                                        onChange={() => toggleMetric(key)}
                                        className="cursor-pointer"
                                    />
                                    <span>{metricLabels[key]}</span>
                                </label>
                            ))
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                        {selectedMetrics.size} metrics selected
                    </div>
                </div>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => adjustMonth(-1)}
                        disabled={!selectedYear || !selectedMonth || loading}
                        className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        title="Previous month"
                    >
                        −
                    </button>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                        <option value="">Month</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                        <option value="">Year</option>
                        {Array.from({ length: 2026 - 1960 + 1 }, (_, i) => 2026 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => adjustMonth(1)}
                        disabled={!selectedYear || !selectedMonth || loading}
                        className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        title="Next month"
                    >
                        +
                    </button>
                    <button
                        onClick={fetchPeriodData}
                        disabled={!selectedYear || !selectedMonth || loading}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {loading ? 'Loading...' : 'View Period'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Results */}
            {values && (
                <div className="space-y-4">
                    {/* Similarity Score */}
                    {similarityScore !== null && (
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                            <div className="text-sm text-muted-foreground mb-1">Similarity to Latest Period</div>
                            <div className={`text-4xl font-bold ${getScoreColor(similarityScore)}`}>
                                {similarityScore.toFixed(1)}%
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Nominal Metrics */}
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Nominal
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className={`p-4 rounded-lg bg-card border-2 ${!selectedMetrics.has('cpi') ? 'opacity-40' : showPercentiles ? getPercentileColor(values.cpi.percentile) : 'border-gray-300 dark:border-gray-700'}`}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-muted-foreground">
                                        CPI {!selectedMetrics.has('cpi') && <span className="text-[10px]">(excluded)</span>}
                                    </div>
                                    <div className={`text-2xl font-bold ${showPercentiles ? getPercentileTextColor(values.cpi.percentile) : 'text-foreground'}`}>
                                        {formatDisplayValue('cpi')}
                                    </div>
                                    {showPercentiles && (
                                        <div className="text-xs mt-1">
                                            <div className="text-muted-foreground">Actual: {formatValue(values.cpi.value, 'cpi')}</div>
                                            <div className={`font-medium ${getYoyColor(values.cpi.yoyChange)}`}>
                                                YoY: {formatYoyChange(values.cpi.yoyChange)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={`p-4 rounded-lg bg-card border-2 ${!selectedMetrics.has('treasury3M') ? 'opacity-40' : showPercentiles ? getPercentileColor(values.treasury3M.percentile) : 'border-gray-300 dark:border-gray-700'}`}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-muted-foreground">
                                        3M {!selectedMetrics.has('treasury3M') && <span className="text-[10px]">(excluded)</span>}
                                    </div>
                                    <div className={`text-2xl font-bold ${showPercentiles ? getPercentileTextColor(values.treasury3M.percentile) : 'text-foreground'}`}>
                                        {formatDisplayValue('treasury3M')}
                                    </div>
                                    {showPercentiles && (
                                        <div className="text-xs mt-1">
                                            <div className="text-muted-foreground">Actual: {formatValue(values.treasury3M.value, 'treasury3M')}</div>
                                            <div className={`font-medium ${getYoyColor(values.treasury3M.yoyChange)}`}>
                                                YoY: {formatYoyChange(values.treasury3M.yoyChange)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={`p-4 rounded-lg bg-card border-2 ${!selectedMetrics.has('tnx') ? 'opacity-40' : showPercentiles ? getPercentileColor(values.tnx.percentile) : 'border-gray-300 dark:border-gray-700'}`}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-muted-foreground">
                                        10Y {!selectedMetrics.has('tnx') && <span className="text-[10px]">(excluded)</span>}
                                    </div>
                                    <div className={`text-2xl font-bold ${showPercentiles ? getPercentileTextColor(values.tnx.percentile) : 'text-foreground'}`}>
                                        {formatDisplayValue('tnx')}
                                    </div>
                                    {showPercentiles && (
                                        <div className="text-xs mt-1">
                                            <div className="text-muted-foreground">Actual: {formatValue(values.tnx.value, 'tnx')}</div>
                                            <div className={`font-medium ${getYoyColor(values.tnx.yoyChange)}`}>
                                                YoY: {formatYoyChange(values.tnx.yoyChange)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={`p-4 rounded-lg bg-card border-2 ${!selectedMetrics.has('pe5yr') ? 'opacity-40' : showPercentiles ? getPercentileColor(values.pe5yr.percentile) : 'border-gray-300 dark:border-gray-700'}`}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-muted-foreground">
                                        P/E 5yr {!selectedMetrics.has('pe5yr') && <span className="text-[10px]">(excluded)</span>}
                                    </div>
                                    <div className={`text-2xl font-bold ${showPercentiles ? getPercentileTextColor(values.pe5yr.percentile) : 'text-foreground'}`}>
                                        {formatDisplayValue('pe5yr')}
                                    </div>
                                    {showPercentiles && (
                                        <div className="text-xs mt-1">
                                            <div className="text-muted-foreground">Actual: {formatValue(values.pe5yr.value, 'pe5yr')}</div>
                                            <div className={`font-medium ${getYoyColor(values.pe5yr.yoyChange)}`}>
                                                YoY: {formatYoyChange(values.pe5yr.yoyChange)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Relative Metrics */}
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Relative
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className={`p-4 rounded-lg bg-card border-2 ${!selectedMetrics.has('realYield') ? 'opacity-40' : showPercentiles ? getPercentileColor(values.realYield.percentile) : 'border-gray-300 dark:border-gray-700'}`}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-muted-foreground">
                                        Real 10Y {!selectedMetrics.has('realYield') && <span className="text-[10px]">(excluded)</span>}
                                    </div>
                                    <div className={`text-2xl font-bold ${showPercentiles ? getPercentileTextColor(values.realYield.percentile) : 'text-foreground'}`}>
                                        {formatDisplayValue('realYield')}
                                    </div>
                                    {showPercentiles && (
                                        <div className="text-xs mt-1">
                                            <div className="text-muted-foreground">Actual: {formatValue(values.realYield.value, 'realYield')}</div>
                                            <div className={`font-medium ${getYoyColor(values.realYield.yoyChange)}`}>
                                                YoY: {formatYoyChange(values.realYield.yoyChange)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={`p-4 rounded-lg bg-card border-2 ${!selectedMetrics.has('yieldCurve') ? 'opacity-40' : showPercentiles ? getPercentileColor(values.yieldCurve.percentile) : 'border-gray-300 dark:border-gray-700'}`}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-muted-foreground">
                                        Curve {!selectedMetrics.has('yieldCurve') && <span className="text-[10px]">(excluded)</span>}
                                    </div>
                                    <div className={`text-2xl font-bold ${showPercentiles ? getPercentileTextColor(values.yieldCurve.percentile) : 'text-foreground'}`}>
                                        {formatDisplayValue('yieldCurve')}
                                    </div>
                                    {showPercentiles && (
                                        <div className="text-xs mt-1">
                                            <div className="text-muted-foreground">Actual: {formatValue(values.yieldCurve.value, 'yieldCurve')}</div>
                                            <div className={`font-medium ${getYoyColor(values.yieldCurve.yoyChange)}`}>
                                                YoY: {formatYoyChange(values.yieldCurve.yoyChange)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={`p-4 rounded-lg bg-card border-2 ${!selectedMetrics.has('eyp5yr') ? 'opacity-40' : showPercentiles ? getPercentileColor(values.eyp5yr.percentile) : 'border-gray-300 dark:border-gray-700'}`}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-muted-foreground">
                                        EYP 5yr {!selectedMetrics.has('eyp5yr') && <span className="text-[10px]">(excluded)</span>}
                                    </div>
                                    <div className={`text-2xl font-bold ${showPercentiles ? getPercentileTextColor(values.eyp5yr.percentile) : 'text-foreground'}`}>
                                        {formatDisplayValue('eyp5yr')}
                                    </div>
                                    {showPercentiles && (
                                        <div className="text-xs mt-1">
                                            <div className="text-muted-foreground">Actual: {formatValue(values.eyp5yr.value, 'eyp5yr')}</div>
                                            <div className={`font-medium ${getYoyColor(values.eyp5yr.yoyChange)}`}>
                                                YoY: {formatYoyChange(values.eyp5yr.yoyChange)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={`p-4 rounded-lg bg-card border-2 ${!selectedMetrics.has('rey5yr') ? 'opacity-40' : showPercentiles ? getPercentileColor(values.rey5yr.percentile) : 'border-gray-300 dark:border-gray-700'}`}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-muted-foreground">
                                        Real EY {!selectedMetrics.has('rey5yr') && <span className="text-[10px]">(excluded)</span>}
                                    </div>
                                    <div className={`text-2xl font-bold ${showPercentiles ? getPercentileTextColor(values.rey5yr.percentile) : 'text-foreground'}`}>
                                        {formatDisplayValue('rey5yr')}
                                    </div>
                                    {showPercentiles && (
                                        <div className="text-xs mt-1">
                                            <div className="text-muted-foreground">Actual: {formatValue(values.rey5yr.value, 'rey5yr')}</div>
                                            <div className={`font-medium ${getYoyColor(values.rey5yr.yoyChange)}`}>
                                                YoY: {formatYoyChange(values.rey5yr.yoyChange)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!values && !error && !loading && (
                <div className="text-center text-sm text-muted-foreground py-8">
                    Select a date and click "View Period" to see percentile data
                </div>
            )}
        </div>
    );
}