//components/regime/regime-parameters-cards.tsx
'use client';

import { getRegimeColor } from '@/lib/regime-config';
import type { FlowTrendState } from '@/lib/regime-config/flow-trend-config';
import { formatPercentile, getQuartileStyles } from './regime-parameters-utils';

interface ClassificationRegime {
    name: string;
    description: string;
    examples?: string;
}

export function MetricCard({
    label,
    value,
    percentile,
    date,
    invertQuartiles = false
}: {
    label: string;
    value: string;
    percentile: number | null;
    date: string;
    invertQuartiles?: boolean;
}) {
    const styles = getQuartileStyles(percentile, invertQuartiles);

    return (
        <div className={`p-2 rounded-lg border-2 bg-card ${styles.border} text-center`}>
            <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
            <div className="text-lg font-semibold mb-1">{value}</div>
            <div className={`text-[9px] font-medium mb-0.5 ${styles.text}`}>
                {formatPercentile(percentile)}
            </div>
            <div className="text-[9px] text-muted-foreground">{date}</div>
        </div>
    );
}

export function SmallMetricCard({
    label,
    concept,
    value,
    percentile,
    date,
    interpretation,
    invertQuartiles = false,
    useValueForColor = false,
    rawValue = null,
    customColor = null
}: {
    label: string;
    concept: string;
    value: string;
    percentile: number | null;
    date: string;
    interpretation?: string;
    invertQuartiles?: boolean;
    useValueForColor?: boolean;
    rawValue?: number | null;
    customColor?: string | null;
}) {
    let styles;

    if (customColor) {
        // Use custom color from flow-trend-config
        const borderStyle = { borderColor: customColor };
        const textStyle = { color: customColor };

        return (
            <div className="p-2 rounded-lg border-2 bg-card text-center" style={borderStyle}>
                <div className="text-xs font-medium mb-0.5">{label}</div>
                <div className="text-[9px] text-muted-foreground italic mb-1">{concept}</div>
                <div className="text-base font-semibold mb-1">{value}</div>
                {interpretation && (
                    <div className="text-[9px] text-muted-foreground mb-1 italic">
                        {interpretation}
                    </div>
                )}
                {percentile !== null && (
                    <div className="text-[9px] font-medium mb-0.5" style={textStyle}>
                        P: {formatPercentile(percentile)}
                    </div>
                )}
                <div className="text-[9px] text-muted-foreground">{date}</div>
            </div>
        );
    }

    if (useValueForColor && rawValue !== null) {
        // Value-based coloring for liquidity metrics
        if (label === 'Real 3M') {
            if (rawValue < -1.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue < 0.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue <= 1.5) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue <= 3.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'Real 10Y') {
            if (rawValue < 0.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue < 1.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue <= 2.5) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue <= 4.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'Yield Curve') {
            if (rawValue > 1.75) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue > 0.75) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue >= 0.25) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue >= -0.25) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'CPI') {
            if (rawValue < 0.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue < 2.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue <= 3.0) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue <= 5.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'EYP 5yr') {
            if (rawValue > 4.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue > 2.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue >= 0.0) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue >= -2.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'Real EY (5yr)') {
            if (rawValue > 6.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue > 4.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue > 2.0) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue >= 0.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'Real M2') {
            if (rawValue > 5.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue > 1.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue >= -1.0) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue >= -5.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else {
            styles = getQuartileStyles(percentile, invertQuartiles);
        }
    } else {
        styles = getQuartileStyles(percentile, invertQuartiles);
    }

    return (
        <div className={`p-2 rounded-lg border-2 bg-card ${styles.border} text-center`}>
            <div className="text-xs font-medium mb-0.5">{label}</div>
            <div className="text-[9px] text-muted-foreground italic mb-1">{concept}</div>
            <div className="text-base font-semibold mb-1">{value}</div>
            {interpretation && (
                <div className="text-[9px] text-muted-foreground mb-1 italic">
                    {interpretation}
                </div>
            )}
            <div className={`text-[9px] font-medium mb-0.5 ${styles.text}`}>
                P: {formatPercentile(percentile)}
            </div>
            <div className="text-[9px] text-muted-foreground">{date}</div>
        </div>
    );
}

export function ClassificationCard({
    regime
}: {
    regime: ClassificationRegime;
}) {
    const colorClass = getRegimeColor(regime.name);

    return (
        <div className={`p-3 rounded-lg border-2 ${colorClass} h-[140px] flex flex-col items-center justify-center text-center`}>
            <div className="text-base font-bold mb-1">{regime.name}</div>
            <div className="text-xs mb-2 opacity-80">{regime.description}</div>

            {regime.examples && (
                <div className="text-[10px] opacity-70 mt-1">
                    Examples: {regime.examples}
                </div>
            )}
        </div>
    );
}

export function FlowTrendCard({
    flowTrendState
}: {
    flowTrendState: FlowTrendState;
}) {
    // Use color from pressure assessment
    const borderStyle = { borderColor: flowTrendState.pressure.color };

    // Determine if trend is negative (MA slope has been negative)
    const isNegativeTrend = flowTrendState.stage.value !== null && flowTrendState.stage.value < 0;

    return (
        <div className="p-3 rounded-lg border-2 bg-card h-[140px] flex flex-col items-center justify-center text-center" style={borderStyle}>
            <div className="text-[10px] opacity-70 mb-1">
                {flowTrendState.direction.label} • {flowTrendState.side.label}
            </div>
            <div className="text-xs opacity-80 mb-1">
                Stage: {flowTrendState.stage.label}
            </div>
            <div className="text-xs opacity-80">
                Pressure: {flowTrendState.pressure.label}
            </div>
        </div>
    );
}
