'use client';

import { useState } from 'react';
import RegimeDetectorCard from './regime-detector-card';

interface DataPoint {
    percentile: number | null;
    value: number | null;
    yoy: number | null;
    date: string | null;
}

interface RegimeData {
    cpi: DataPoint;
    fedFunds: DataPoint;
    tnx: DataPoint;
    irx: DataPoint;
    pe5yr: DataPoint;
    ey5yr: DataPoint;
    real10Y: DataPoint;
    real3M: DataPoint;
    rey5yr: DataPoint;
    eyp5yr: DataPoint;
    yieldCurve: DataPoint;
}

interface RegimeComparisonProps {
    currentData: RegimeData;
    previousData: RegimeData;
    currentDate?: string;
    previousPeriod: string;
    currentPeriod: string;
}

export default function RegimeComparison({
    currentData,
    previousData,
    currentDate,
    previousPeriod,
    currentPeriod
}: RegimeComparisonProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Regime Context</h2>
                        <p className="text-sm text-muted-foreground">
                            Compare current regime with previous cycle
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                    >
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            Previous Regime
                        </div>
                        <div className="text-2xl font-bold">{previousPeriod}</div>
                        <div className="text-xs text-muted-foreground mt-1">Average values</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                            Current Regime
                        </div>
                        <div className="text-2xl font-bold">{currentPeriod}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Latest: {currentDate ? new Date(currentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Regime Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Previous Regime */}
                <RegimeDetectorCard
                    title="Previous Regime (2008-2020)"
                    subtitle="Average of 12-year cycle"
                    metricValues={{
                        real10Y: { value: previousData.real10Y?.value || null, yoy: null },
                        real3M: { value: previousData.real3M?.value || null, yoy: null },
                        rey5yr: { value: previousData.rey5yr?.value || null, yoy: null },
                        eyp5yr: { value: previousData.eyp5yr?.value || null, yoy: null },
                        yieldCurve: { value: previousData.yieldCurve?.value || null, yoy: null },
                    }}
                    showDetails={showDetails}
                />

                {/* Current Regime */}
                <RegimeDetectorCard
                    title="Current Regime (2020-Present)"
                    subtitle={`Latest: ${currentDate ? new Date(currentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}`}
                    metricValues={{
                        real10Y: { value: currentData.real10Y?.value || null, yoy: null },
                        real3M: { value: currentData.real3M?.value || null, yoy: null },
                        rey5yr: { value: currentData.rey5yr?.value || null, yoy: null },
                        eyp5yr: { value: currentData.eyp5yr?.value || null, yoy: null },
                        yieldCurve: { value: currentData.yieldCurve?.value || null, yoy: null },
                    }}
                    showDetails={showDetails}
                    isCurrent={true}
                />
            </div>

            {/* Metric Changes */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card shadow-lg">
                <h3 className="text-xl font-bold mb-4">Key Metric Changes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetricChangeCard
                        label="Real 10Y"
                        previous={previousData.real10Y?.value}
                        current={currentData.real10Y?.value}
                    />
                    <MetricChangeCard
                        label="Real 3M"
                        previous={previousData.real3M?.value}
                        current={currentData.real3M?.value}
                    />
                    <MetricChangeCard
                        label="Real EY 5yr"
                        previous={previousData.rey5yr?.value}
                        current={currentData.rey5yr?.value}
                    />
                    <MetricChangeCard
                        label="EY Premium 5yr"
                        previous={previousData.eyp5yr?.value}
                        current={currentData.eyp5yr?.value}
                    />
                    <MetricChangeCard
                        label="Yield Curve"
                        previous={previousData.yieldCurve?.value}
                        current={currentData.yieldCurve?.value}
                    />
                    <MetricChangeCard
                        label="CPI"
                        previous={previousData.cpi?.value}
                        current={currentData.cpi?.value}
                    />
                </div>
            </div>
        </div>
    );
}

interface MetricChangeCardProps {
    label: string;
    previous: number | null;
    current: number | null;
}

function MetricChangeCard({ label, previous, current }: MetricChangeCardProps) {
    const change = previous !== null && current !== null ? current - previous : null;
    const changePercent = previous !== null && current !== null && previous !== 0
        ? ((current - previous) / Math.abs(previous)) * 100
        : null;

    const getChangeColor = (val: number | null) => {
        if (val === null) return 'text-gray-500';
        if (Math.abs(val) < 0.1) return 'text-gray-500';
        return val > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    };

    const formatValue = (val: number | null) => {
        if (val === null) return 'N/A';
        return `${val.toFixed(2)}%`;
    };

    return (
        <div className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {label}
            </div>
            <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm text-muted-foreground">Previous:</span>
                <span className="text-sm font-medium">{formatValue(previous)}</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current:</span>
                <span className="text-sm font-medium">{formatValue(current)}</span>
            </div>
            <div className="pt-2 border-t border-border">
                <div className={`text-sm font-bold ${getChangeColor(change)}`}>
                    {change !== null ? (
                        <>
                            {change > 0 ? '+' : ''}{change.toFixed(2)}%
                            {changePercent !== null && (
                                <span className="text-xs ml-1">
                                    ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(0)}%)
                                </span>
                            )}
                        </>
                    ) : (
                        'N/A'
                    )}
                </div>
            </div>
        </div>
    );
}
