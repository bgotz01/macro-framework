'use client';

import { useState, useEffect } from 'react';

interface SimilarPeriodsProps {
    targetDate?: string; // ISO date string, defaults to latest
}

interface PercentileSnapshot {
    date: string;
    cpi: number | null;
    tnx: number | null;
    realYield: number | null;
    yieldCurve: number | null;
    treasury3M: number | null;
    pe5yr: number | null;
    eyp5yr: number | null;
    rey5yr: number | null;
}

interface ValueSnapshot {
    date: string;
    cpi: number | null;
    tnx: number | null;
    realYield: number | null;
    yieldCurve: number | null;
    treasury3M: number | null;
    pe5yr: number | null;
    eyp5yr: number | null;
    rey5yr: number | null;
}

interface YoySnapshot {
    date: string;
    cpi: number | null;
    tnx: number | null;
    realYield: number | null;
    yieldCurve: number | null;
    treasury3M: number | null;
    pe5yr: number | null;
    eyp5yr: number | null;
    rey5yr: number | null;
}

interface SimilarPeriod {
    date: string;
    distance: number;
    percentiles: PercentileSnapshot;
    values: ValueSnapshot;
    yoy: YoySnapshot;
}

export default function SimilarPeriods({ targetDate }: SimilarPeriodsProps) {
    const [loading, setLoading] = useState(true);
    const [targetPeriod, setTargetPeriod] = useState<PercentileSnapshot | null>(null);
    const [targetValues, setTargetValues] = useState<ValueSnapshot | null>(null);
    const [targetYoy, setTargetYoy] = useState<YoySnapshot | null>(null);
    const [allData, setAllData] = useState<any[]>([]); // Store all data
    const [similarPeriods, setSimilarPeriods] = useState<SimilarPeriod[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showPercentiles, setShowPercentiles] = useState(true);
    const [yoyWeight, setYoyWeight] = useState(10); // Default 10% weight for YoY
    const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
        new Set(['cpi', 'tnx', 'realYield', 'yieldCurve', 'treasury3M', 'pe5yr', 'eyp5yr', 'rey5yr'])
    );

    useEffect(() => {
        async function fetchSimilarPeriods() {
            setLoading(true);
            setError(null);

            try {
                // Fetch all historical percentile data
                const response = await fetch('/api/percentile-history');
                if (!response.ok) throw new Error('Failed to fetch data');

                const { data } = await response.json();

                // Store all data for recalculation
                setAllData(data);

                // Find target period (latest or specified date)
                let target: PercentileSnapshot | null = null;
                if (targetDate) {
                    const targetData = data.find((d: any) => d.date === targetDate);
                    if (targetData) {
                        target = extractPercentiles(targetData);
                    }
                } else {
                    // Find the latest data point with the most complete metrics
                    // Sort by date descending and find first with good data
                    const sortedData = [...data].sort((a: any, b: any) => {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    });

                    for (const point of sortedData) {
                        const snapshot = extractPercentiles(point);
                        const nonNullCount = Object.values(snapshot).filter(v => v !== null && typeof v === 'number').length;

                        // Require at least 6 metrics to have data
                        if (nonNullCount >= 6) {
                            target = snapshot;
                            break;
                        }
                    }
                }

                if (!target) {
                    throw new Error('Target period not found');
                }

                setTargetPeriod(target);

                // Extract target values
                const targetData = data.find((d: any) => d.date === target.date);
                if (targetData) {
                    setTargetValues(extractValues(targetData));
                    setTargetYoy(extractYoy(targetData));
                }

                console.log('Target period:', target);
                console.log('Total data points:', data.length);

                // Get target YoY for distance calculation
                const targetYoyData = targetData ? extractYoy(targetData) : null;

                // Calculate distances for all historical periods
                const distances: SimilarPeriod[] = [];

                for (const point of data) {
                    const snapshot = extractPercentiles(point);
                    const snapshotYoy = extractYoy(point);

                    // Skip if it's the target date or within 6 months
                    if (snapshot.date === target.date) continue;

                    const targetTime = new Date(target.date).getTime();
                    const snapshotTime = new Date(snapshot.date).getTime();
                    const monthsDiff = Math.abs(targetTime - snapshotTime) / (1000 * 60 * 60 * 24 * 30);
                    if (monthsDiff < 6) continue;

                    // Calculate Euclidean distance (with YoY if available)
                    const distance = targetYoyData
                        ? calculateDistance(target, snapshot, targetYoyData, snapshotYoy, yoyWeight, selectedMetrics)
                        : calculateDistance(target, snapshot, { date: target.date, cpi: null, tnx: null, realYield: null, yieldCurve: null, treasury3M: null, pe5yr: null, eyp5yr: null, rey5yr: null }, snapshotYoy, yoyWeight, selectedMetrics);

                    if (distance !== null) {
                        distances.push({
                            date: snapshot.date,
                            distance,
                            percentiles: snapshot,
                            values: extractValues(point),
                            yoy: snapshotYoy
                        });
                    }
                }

                // Sort by distance and take top 10
                distances.sort((a, b) => a.distance - b.distance);
                console.log('Found similar periods:', distances.length);
                console.log('Top 5 distances:', distances.slice(0, 5).map(d => ({ date: d.date, distance: d.distance })));
                setSimilarPeriods(distances.slice(0, 10));

            } catch (err) {
                console.error('Error fetching similar periods:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        }

        fetchSimilarPeriods();
    }, [targetDate]); // Only re-fetch when targetDate changes

    // Recalculate distances when yoyWeight changes (without re-fetching)
    useEffect(() => {
        if (!targetPeriod || !targetYoy || allData.length === 0) return;

        const distances: SimilarPeriod[] = [];

        for (const point of allData) {
            const snapshot = extractPercentiles(point);
            const snapshotYoy = extractYoy(point);

            // Skip if it's the target date or within 6 months
            if (snapshot.date === targetPeriod.date) continue;

            const targetTime = new Date(targetPeriod.date).getTime();
            const snapshotTime = new Date(snapshot.date).getTime();
            const monthsDiff = Math.abs(targetTime - snapshotTime) / (1000 * 60 * 60 * 24 * 30);
            if (monthsDiff < 6) continue;

            // Calculate distance with current yoyWeight
            const distance = calculateDistance(targetPeriod, snapshot, targetYoy, snapshotYoy, yoyWeight, selectedMetrics);

            if (distance !== null) {
                distances.push({
                    date: snapshot.date,
                    distance,
                    percentiles: snapshot,
                    values: extractValues(point),
                    yoy: snapshotYoy
                });
            }
        }

        // Sort by distance and take top 10
        distances.sort((a, b) => a.distance - b.distance);
        setSimilarPeriods(distances.slice(0, 10));
    }, [yoyWeight, targetPeriod, targetYoy, allData, selectedMetrics]); // Recalculate when weight or metrics change

    const toggleMetric = (metric: string) => {
        const newMetrics = new Set(selectedMetrics);
        if (newMetrics.has(metric)) {
            // Don't allow deselecting if it's the last one
            if (newMetrics.size <= 2) return;
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
            metrics: ['yieldCurve', 'realYield', 'eyp5yr', 'rey5yr']
        }
    };

    function extractPercentiles(data: any): PercentileSnapshot {
        const snapshot = {
            date: data.date,
            cpi: data.cpi_percentile ?? null,
            tnx: data.tnx_percentile ?? null,
            realYield: data.realyield_percentile ?? null,
            yieldCurve: data.yieldcurve3m_percentile ?? null,
            treasury3M: data.irx_percentile ?? null,
            pe5yr: data.pe5yr_percentile ?? null,
            eyp5yr: data.eyp5yr_percentile ?? null,
            rey5yr: data.rey5yr_percentile ?? null,
        };

        // Debug: log first data point to see structure
        if (data.date === '2026-01-31') {
            console.log('All percentile keys:', Object.keys(data).filter(k => k.includes('percentile')));
            console.log('Fed Funds percentile value:', data.fedfunds_percentile);
        }

        return snapshot;
    }

    function extractValues(data: any): ValueSnapshot {
        return {
            date: data.date,
            cpi: data.cpi_value ?? null,
            tnx: data.tnx_value ?? null,
            realYield: data.realyield_value ?? null,
            yieldCurve: data.yieldcurve3m_value ?? null,
            treasury3M: data.irx_value ?? null,
            pe5yr: data.pe5yr_value ?? null,
            eyp5yr: data.eyp5yr_value ?? null,
            rey5yr: data.rey5yr_value ?? null,
        };
    }

    function extractYoy(data: any): YoySnapshot {
        return {
            date: data.date,
            cpi: data.cpi_yoy ?? null,
            tnx: data.tnx_yoy ?? null,
            realYield: data.realyield_yoy ?? null,
            yieldCurve: data.yieldcurve3m_yoy ?? null,
            treasury3M: data.irx_yoy ?? null,
            pe5yr: data.pe5yr_yoy ?? null,
            eyp5yr: data.eyp5yr_yoy ?? null,
            rey5yr: data.rey5yr_yoy ?? null,
        };
    }

    function calculateDistance(a: PercentileSnapshot, b: PercentileSnapshot, aYoy: YoySnapshot, bYoy: YoySnapshot, yoyWeightPercent: number, metricsToUse: Set<string>): number | null {
        const metrics = ['cpi', 'tnx', 'realYield', 'yieldCurve', 'treasury3M', 'pe5yr', 'eyp5yr', 'rey5yr'] as const;

        let sumSquaresPercentile = 0;
        let sumSquaresYoy = 0;
        let countPercentile = 0;
        let countYoy = 0;

        // Calculate distance for percentile values
        for (const metric of metrics) {
            if (!metricsToUse.has(metric)) continue; // Skip if not selected

            const valA = a[metric];
            const valB = b[metric];

            if (valA !== null && valB !== null) {
                sumSquaresPercentile += Math.pow(valA - valB, 2);
                countPercentile++;
            }
        }

        // Calculate distance for YoY changes
        for (const metric of metrics) {
            if (!metricsToUse.has(metric)) continue; // Skip if not selected

            const yoyA = aYoy[metric];
            const yoyB = bYoy[metric];

            if (yoyA !== null && yoyB !== null && yoyA !== undefined && yoyB !== undefined) {
                sumSquaresYoy += Math.pow(yoyA - yoyB, 2);
                countYoy++;
            }
        }

        // Require at least 2 metrics to have percentile data
        if (countPercentile < 2) return null;

        // Calculate weighted distance
        const percentileWeight = (100 - yoyWeightPercent) / 100;
        const yoyWeightDecimal = yoyWeightPercent / 100;

        const percentileDistance = Math.sqrt(sumSquaresPercentile / countPercentile);

        // Only include YoY if we have at least 2 metrics with YoY data
        if (countYoy >= 2) {
            const yoyDistance = Math.sqrt(sumSquaresYoy / countYoy);
            return (percentileWeight * percentileDistance) + (yoyWeightDecimal * yoyDistance);
        }

        // If not enough YoY data, just use percentile distance
        return percentileDistance;
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    function formatValue(value: number | null, metric?: string): string {
        if (value === null) return 'N/A';
        // P/E is a ratio, not a percentage
        if (metric === 'pe5yr') {
            return value.toFixed(2);
        }
        return `${value.toFixed(2)}%`;
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

    function formatDisplayValue(percentile: number | null, value: number | null, metric?: string): string {
        if (showPercentiles) {
            return percentile !== null ? `${percentile.toFixed(0)}%` : 'N/A';
        } else {
            return formatValue(value, metric);
        }
    }

    function getDistanceColor(distance: number): string {
        if (distance < 10) return 'text-green-600 dark:text-green-400';
        if (distance < 20) return 'text-blue-600 dark:text-blue-400';
        if (distance < 30) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-orange-600 dark:text-orange-400';
    }

    if (loading) {
        return (
            <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Similar Historical Periods</h2>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Similar Historical Periods</h2>
                <div className="text-red-500 text-center py-4">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card shadow-lg">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold">Similar Historical Periods</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label htmlFor="yoy-weight" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                YoY Weight:
                            </label>
                            <input
                                id="yoy-weight"
                                type="range"
                                min="0"
                                max="20"
                                value={yoyWeight}
                                onChange={(e) => setYoyWeight(Number(e.target.value))}
                                className="w-20 sm:w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs font-medium w-8">{yoyWeight}%</span>
                        </div>
                        <button
                            onClick={() => setShowPercentiles(!showPercentiles)}
                            className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium transition-colors whitespace-nowrap"
                        >
                            {showPercentiles ? 'Show Values' : 'Show Percentiles'}
                        </button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                    Periods with similar percentile patterns to {targetPeriod ? formatDate(targetPeriod.date) : 'current'}
                    {yoyWeight > 0 && ` (${100 - yoyWeight}% levels, ${yoyWeight}% momentum)`}
                </p>

                {/* Metric Selection */}
                <div className="p-3 rounded-lg bg-muted/30">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-2">
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
                                    <span className="truncate">{metricLabels[key]}</span>
                                </label>
                            ))
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                        {selectedMetrics.size} metrics selected
                    </div>
                </div>

                {/* Methodology note */}
                <details className="mt-3 text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground transition-colors font-medium select-none">
                        How similarity is calculated
                    </summary>
                    <div className="mt-2 p-3 rounded-lg bg-muted/30 space-y-2 leading-relaxed">
                        <p>
                            Each metric is converted to a <strong>percentile rank</strong> (0–100) across the full historical dataset.
                            Distance between two periods is the <strong>normalized Euclidean distance</strong> across selected metrics:
                        </p>
                        <p className="font-mono bg-background rounded px-2 py-1 text-[11px]">
                            d_levels = √( Σ (pct_A − pct_B)² / n )
                        </p>
                        <p>
                            If YoY weight &gt; 0, a momentum component is blended in using the year-over-year change in each percentile rank:
                        </p>
                        <p className="font-mono bg-background rounded px-2 py-1 text-[11px]">
                            d_momentum = √( Σ (yoy_A − yoy_B)² / n )
                        </p>
                        <p className="font-mono bg-background rounded px-2 py-1 text-[11px]">
                            distance = (1 − w) × d_levels + w × d_momentum
                        </p>
                        <p>
                            where <em>w</em> is the YoY weight (default 10%). The <strong>similarity score</strong> is then:
                        </p>
                        <p className="font-mono bg-background rounded px-2 py-1 text-[11px]">
                            similarity = 100 − distance
                        </p>
                        <p>
                            Periods within 6 months of the target are excluded. At least 2 metrics must have data for a period to qualify.
                        </p>
                    </div>
                </details>
            </div>

            {/* Current Period Display */}
            {targetPeriod && targetValues && targetYoy && (
                <div className="mb-6 p-4 rounded-lg bg-primary/10 border-2 border-primary">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <span className="text-lg font-semibold text-primary">
                                Current Period
                            </span>
                            <span className="text-lg font-medium">
                                {formatDate(targetPeriod.date)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
                        <div className={!selectedMetrics.has('cpi') ? 'opacity-40' : ''}>
                            <div className="text-muted-foreground">
                                CPI {!selectedMetrics.has('cpi') && <span className="text-[10px]">(excl)</span>}
                            </div>
                            <div className="font-medium">{formatDisplayValue(targetPeriod.cpi, targetValues.cpi, 'cpi')}</div>
                            {showPercentiles && (
                                <div className={`text-[10px] ${getYoyColor(targetYoy.cpi)}`}>
                                    YoY: {formatYoyChange(targetYoy.cpi)}
                                </div>
                            )}
                        </div>
                        <div className={!selectedMetrics.has('treasury3M') ? 'opacity-40' : ''}>
                            <div className="text-muted-foreground">
                                3M {!selectedMetrics.has('treasury3M') && <span className="text-[10px]">(excl)</span>}
                            </div>
                            <div className="font-medium">{formatDisplayValue(targetPeriod.treasury3M, targetValues.treasury3M, 'treasury3M')}</div>
                            {showPercentiles && (
                                <div className={`text-[10px] ${getYoyColor(targetYoy.treasury3M)}`}>
                                    YoY: {formatYoyChange(targetYoy.treasury3M)}
                                </div>
                            )}
                        </div>
                        <div className={!selectedMetrics.has('tnx') ? 'opacity-40' : ''}>
                            <div className="text-muted-foreground">
                                10Y {!selectedMetrics.has('tnx') && <span className="text-[10px]">(excl)</span>}
                            </div>
                            <div className="font-medium">{formatDisplayValue(targetPeriod.tnx, targetValues.tnx, 'tnx')}</div>
                            {showPercentiles && (
                                <div className={`text-[10px] ${getYoyColor(targetYoy.tnx)}`}>
                                    YoY: {formatYoyChange(targetYoy.tnx)}
                                </div>
                            )}
                        </div>
                        <div className={!selectedMetrics.has('pe5yr') ? 'opacity-40' : ''}>
                            <div className="text-muted-foreground">
                                P/E 5yr {!selectedMetrics.has('pe5yr') && <span className="text-[10px]">(excl)</span>}
                            </div>
                            <div className="font-medium">{formatDisplayValue(targetPeriod.pe5yr, targetValues.pe5yr, 'pe5yr')}</div>
                            {showPercentiles && (
                                <div className={`text-[10px] ${getYoyColor(targetYoy.pe5yr)}`}>
                                    YoY: {formatYoyChange(targetYoy.pe5yr)}
                                </div>
                            )}
                        </div>
                        <div className={!selectedMetrics.has('yieldCurve') ? 'opacity-40' : ''}>
                            <div className="text-muted-foreground">
                                Curve {!selectedMetrics.has('yieldCurve') && <span className="text-[10px]">(excl)</span>}
                            </div>
                            <div className="font-medium">{formatDisplayValue(targetPeriod.yieldCurve, targetValues.yieldCurve, 'yieldCurve')}</div>
                            {showPercentiles && (
                                <div className={`text-[10px] ${getYoyColor(targetYoy.yieldCurve)}`}>
                                    YoY: {formatYoyChange(targetYoy.yieldCurve)}
                                </div>
                            )}
                        </div>
                        <div className={!selectedMetrics.has('realYield') ? 'opacity-40' : ''}>
                            <div className="text-muted-foreground">
                                Real 10Y {!selectedMetrics.has('realYield') && <span className="text-[10px]">(excl)</span>}
                            </div>
                            <div className="font-medium">{formatDisplayValue(targetPeriod.realYield, targetValues.realYield, 'realYield')}</div>
                            {showPercentiles && (
                                <div className={`text-[10px] ${getYoyColor(targetYoy.realYield)}`}>
                                    YoY: {formatYoyChange(targetYoy.realYield)}
                                </div>
                            )}
                        </div>
                        <div className={!selectedMetrics.has('eyp5yr') ? 'opacity-40' : ''}>
                            <div className="text-muted-foreground">
                                EYP 5yr {!selectedMetrics.has('eyp5yr') && <span className="text-[10px]">(excl)</span>}
                            </div>
                            <div className="font-medium">{formatDisplayValue(targetPeriod.eyp5yr, targetValues.eyp5yr, 'eyp5yr')}</div>
                            {showPercentiles && (
                                <div className={`text-[10px] ${getYoyColor(targetYoy.eyp5yr)}`}>
                                    YoY: {formatYoyChange(targetYoy.eyp5yr)}
                                </div>
                            )}
                        </div>
                        <div className={!selectedMetrics.has('rey5yr') ? 'opacity-40' : ''}>
                            <div className="text-muted-foreground">
                                Real EY {!selectedMetrics.has('rey5yr') && <span className="text-[10px]">(excl)</span>}
                            </div>
                            <div className="font-medium">{formatDisplayValue(targetPeriod.rey5yr, targetValues.rey5yr, 'rey5yr')}</div>
                            {showPercentiles && (
                                <div className={`text-[10px] ${getYoyColor(targetYoy.rey5yr)}`}>
                                    YoY: {formatYoyChange(targetYoy.rey5yr)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-3 text-sm font-semibold text-muted-foreground">
                Most Similar Historical Periods
            </div>

            <div className="space-y-3">
                {similarPeriods.map((period, index) => (
                    <div
                        key={period.date}
                        className="p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <span className="text-lg font-semibold text-foreground">
                                    #{index + 1}
                                </span>
                                <span className="text-lg font-medium">
                                    {formatDate(period.date)}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Similarity Score</div>
                                <div className={`text-lg font-bold ${getDistanceColor(period.distance)}`}>
                                    {(100 - period.distance).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
                            <div className={!selectedMetrics.has('cpi') ? 'opacity-40' : ''}>
                                <div className="text-muted-foreground">
                                    CPI {!selectedMetrics.has('cpi') && <span className="text-[10px]">(excl)</span>}
                                </div>
                                <div className="font-medium">{formatDisplayValue(period.percentiles.cpi, period.values.cpi, 'cpi')}</div>
                                {showPercentiles && (
                                    <div className={`text-[10px] ${getYoyColor(period.yoy.cpi)}`}>
                                        YoY: {formatYoyChange(period.yoy.cpi)}
                                    </div>
                                )}
                            </div>
                            <div className={!selectedMetrics.has('treasury3M') ? 'opacity-40' : ''}>
                                <div className="text-muted-foreground">
                                    3M {!selectedMetrics.has('treasury3M') && <span className="text-[10px]">(excl)</span>}
                                </div>
                                <div className="font-medium">{formatDisplayValue(period.percentiles.treasury3M, period.values.treasury3M, 'treasury3M')}</div>
                                {showPercentiles && (
                                    <div className={`text-[10px] ${getYoyColor(period.yoy.treasury3M)}`}>
                                        YoY: {formatYoyChange(period.yoy.treasury3M)}
                                    </div>
                                )}
                            </div>
                            <div className={!selectedMetrics.has('tnx') ? 'opacity-40' : ''}>
                                <div className="text-muted-foreground">
                                    10Y {!selectedMetrics.has('tnx') && <span className="text-[10px]">(excl)</span>}
                                </div>
                                <div className="font-medium">{formatDisplayValue(period.percentiles.tnx, period.values.tnx, 'tnx')}</div>
                                {showPercentiles && (
                                    <div className={`text-[10px] ${getYoyColor(period.yoy.tnx)}`}>
                                        YoY: {formatYoyChange(period.yoy.tnx)}
                                    </div>
                                )}
                            </div>
                            <div className={!selectedMetrics.has('pe5yr') ? 'opacity-40' : ''}>
                                <div className="text-muted-foreground">
                                    P/E 5yr {!selectedMetrics.has('pe5yr') && <span className="text-[10px]">(excl)</span>}
                                </div>
                                <div className="font-medium">{formatDisplayValue(period.percentiles.pe5yr, period.values.pe5yr, 'pe5yr')}</div>
                                {showPercentiles && (
                                    <div className={`text-[10px] ${getYoyColor(period.yoy.pe5yr)}`}>
                                        YoY: {formatYoyChange(period.yoy.pe5yr)}
                                    </div>
                                )}
                            </div>
                            <div className={!selectedMetrics.has('yieldCurve') ? 'opacity-40' : ''}>
                                <div className="text-muted-foreground">
                                    Curve {!selectedMetrics.has('yieldCurve') && <span className="text-[10px]">(excl)</span>}
                                </div>
                                <div className="font-medium">{formatDisplayValue(period.percentiles.yieldCurve, period.values.yieldCurve, 'yieldCurve')}</div>
                                {showPercentiles && (
                                    <div className={`text-[10px] ${getYoyColor(period.yoy.yieldCurve)}`}>
                                        YoY: {formatYoyChange(period.yoy.yieldCurve)}
                                    </div>
                                )}
                            </div>
                            <div className={!selectedMetrics.has('realYield') ? 'opacity-40' : ''}>
                                <div className="text-muted-foreground">
                                    Real 10Y {!selectedMetrics.has('realYield') && <span className="text-[10px]">(excl)</span>}
                                </div>
                                <div className="font-medium">{formatDisplayValue(period.percentiles.realYield, period.values.realYield, 'realYield')}</div>
                                {showPercentiles && (
                                    <div className={`text-[10px] ${getYoyColor(period.yoy.realYield)}`}>
                                        YoY: {formatYoyChange(period.yoy.realYield)}
                                    </div>
                                )}
                            </div>
                            <div className={!selectedMetrics.has('eyp5yr') ? 'opacity-40' : ''}>
                                <div className="text-muted-foreground">
                                    EYP 5yr {!selectedMetrics.has('eyp5yr') && <span className="text-[10px]">(excl)</span>}
                                </div>
                                <div className="font-medium">{formatDisplayValue(period.percentiles.eyp5yr, period.values.eyp5yr, 'eyp5yr')}</div>
                                {showPercentiles && (
                                    <div className={`text-[10px] ${getYoyColor(period.yoy.eyp5yr)}`}>
                                        YoY: {formatYoyChange(period.yoy.eyp5yr)}
                                    </div>
                                )}
                            </div>
                            <div className={!selectedMetrics.has('rey5yr') ? 'opacity-40' : ''}>
                                <div className="text-muted-foreground">
                                    Real EY {!selectedMetrics.has('rey5yr') && <span className="text-[10px]">(excl)</span>}
                                </div>
                                <div className="font-medium">{formatDisplayValue(period.percentiles.rey5yr, period.values.rey5yr, 'rey5yr')}</div>
                                {showPercentiles && (
                                    <div className={`text-[10px] ${getYoyColor(period.yoy.rey5yr)}`}>
                                        YoY: {formatYoyChange(period.yoy.rey5yr)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-xs text-muted-foreground text-center">
                Similarity calculated using Euclidean distance across 8 metrics
            </div>
        </div>
    );
}
