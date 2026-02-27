'use client';

import { useState } from 'react';
import type { PercentileValues, MetricValues } from './types';

interface PercentileMetricsSectionProps {
    values: PercentileValues;
    metricValues: MetricValues;
    loading: boolean;
}

const marketMetrics = [
    { key: 'cpi' as const, label: 'CPI', format: 'percent', reversed: false },
    { key: 'fedFunds' as const, label: 'Fed Funds', format: 'percent', reversed: false },
    { key: 'tnx' as const, label: '10Y Treasury', format: 'percent', reversed: false },
    { key: 'irx' as const, label: '3M Treasury', format: 'percent', reversed: false },
    { key: 'pe5yr' as const, label: 'P/E (5yr)', format: 'number', reversed: false },
    { key: 'ey5yr' as const, label: 'Earnings Yield (5yr)', format: 'percent', reversed: true },
];

const realMetrics = [
    { key: 'real10Y' as const, label: 'Real 10Y', format: 'percent', reversed: true },
    { key: 'real3M' as const, label: 'Real 3M', format: 'percent', reversed: true },
    { key: 'rey5yr' as const, label: 'Real EY (5yr)', format: 'percent', reversed: true },
    { key: 'eyp5yr' as const, label: 'EY Premium (5yr)', format: 'percent', reversed: true },
    { key: 'yieldCurve' as const, label: 'Yield Curve (10Y-3M)', format: 'percent', reversed: true },
];

export default function PercentileMetricsSection({ values, metricValues, loading }: PercentileMetricsSectionProps) {
    const [showPercentileMetrics, setShowPercentileMetrics] = useState(true);

    const formatValue = (value: number | null, format: string) => {
        if (value === null) return 'N/A';
        if (format === 'percent') return `${value.toFixed(2)}%`;
        return value.toFixed(2);
    };

    const formatYoY = (yoy: number | null) => {
        if (yoy === null) return 'N/A';
        const sign = yoy > 0 ? '+' : '';
        return `${sign}${yoy.toFixed(1)}`;
    };

    const getBarColor = (percentile: number | null, reversed: boolean) => {
        if (percentile === null) return 'bg-gray-400';
        const effectivePercentile = reversed ? 100 - percentile : percentile;
        if (effectivePercentile < 33) return 'bg-green-500';
        if (effectivePercentile < 67) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getTextColor = (percentile: number | null, reversed: boolean) => {
        if (percentile === null) return 'text-gray-400';
        const effectivePercentile = reversed ? 100 - percentile : percentile;
        if (effectivePercentile < 33) return 'text-green-600 dark:text-green-400';
        if (effectivePercentile < 67) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getYoYColor = (yoy: number | null) => {
        if (yoy === null) return 'text-muted-foreground';
        if (yoy > 0) return 'text-green-600 dark:text-green-400';
        if (yoy < 0) return 'text-red-600 dark:text-red-400';
        return 'text-muted-foreground';
    };

    return (
        <div className="mt-6">
            <button
                onClick={() => setShowPercentileMetrics(!showPercentileMetrics)}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
            >
                <h2 className="text-lg font-bold">Percentile Metrics</h2>
                <span className="text-xl">{showPercentileMetrics ? '▼' : '▶'}</span>
            </button>

            {showPercentileMetrics && (
                <div className={`mt-4 space-y-4 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    {/* Market Metrics */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Market Metrics</h3>
                        {/* Column Headers */}
                        <div className="flex items-center gap-3 mb-1 pb-1 border-b border-border/50">
                            <div className="w-32 flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase">Metric</div>
                            <div className="w-20 flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase text-right">Value</div>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="flex-1 text-[10px] font-semibold text-muted-foreground uppercase text-center">Percentile</div>
                                <div className="w-14 text-[10px] font-semibold text-muted-foreground uppercase text-right">%ile</div>
                            </div>
                            <div className="w-16 text-[10px] font-semibold text-muted-foreground uppercase text-right">Δ%ile</div>
                        </div>
                        <div className="space-y-2">
                            {marketMetrics.map(metric => {
                                const percentile = values[metric.key];
                                const metricData = metricValues[metric.key];
                                return (
                                    <div key={metric.key} className="flex items-center gap-3">
                                        <div className="w-32 flex-shrink-0 text-xs font-medium">{metric.label}</div>
                                        <div className="w-20 flex-shrink-0 text-xs font-semibold text-right">
                                            {formatValue(metricData.value, metric.format)}
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                                                <div className={`h-full ${getBarColor(percentile, metric.reversed)} transition-all duration-500`} style={{ width: `${percentile || 0}%` }} />
                                            </div>
                                            <div className="w-14 text-right">
                                                <span className={`text-xs font-semibold ${getTextColor(percentile, metric.reversed)}`}>
                                                    {percentile !== null ? `${percentile.toFixed(1)}%` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-16 text-right">
                                            <span className={`text-xs font-semibold ${getYoYColor(metricData.yoy)}`}>
                                                {formatYoY(metricData.yoy)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Real Metrics */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Real Metrics</h3>
                        {/* Column Headers */}
                        <div className="flex items-center gap-3 mb-1 pb-1 border-b border-border/50">
                            <div className="w-32 flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase">Metric</div>
                            <div className="w-20 flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase text-right">Value</div>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="flex-1 text-[10px] font-semibold text-muted-foreground uppercase text-center">Percentile</div>
                                <div className="w-14 text-[10px] font-semibold text-muted-foreground uppercase text-right">%ile</div>
                            </div>
                            <div className="w-16 text-[10px] font-semibold text-muted-foreground uppercase text-right">Δ%ile</div>
                        </div>
                        <div className="space-y-2">
                            {realMetrics.map(metric => {
                                const percentile = values[metric.key];
                                const metricData = metricValues[metric.key];
                                if (!metricData) return null;
                                return (
                                    <div key={metric.key} className="flex items-center gap-3">
                                        <div className="w-32 flex-shrink-0 text-xs font-medium">{metric.label}</div>
                                        <div className="w-20 flex-shrink-0 text-xs font-semibold text-right">
                                            {formatValue(metricData.value, metric.format)}
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                                                <div className={`h-full ${getBarColor(percentile, metric.reversed)} transition-all duration-500`} style={{ width: `${percentile || 0}%` }} />
                                            </div>
                                            <div className="w-14 text-right">
                                                <span className={`text-xs font-semibold ${getTextColor(percentile, metric.reversed)}`}>
                                                    {percentile !== null ? `${percentile.toFixed(1)}%` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-16 text-right">
                                            <span className={`text-xs font-semibold ${getYoYColor(metricData.yoy)}`}>
                                                {formatYoY(metricData.yoy)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded"></div><span>Low (0-33rd)</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-500 rounded"></div><span>Mid (33-67th)</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded"></div><span>High (67-100th)</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
