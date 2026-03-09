//components/regime/real-metrics-sidebar.tsx
import type { MetricValue } from './types';

interface RealMetricsSidebarProps {
    metricValues: {
        real3M?: MetricValue;
        real10Y?: MetricValue;
        rey5yr?: MetricValue;
        tnx?: MetricValue;
        irx?: MetricValue;
        eyp5yr?: MetricValue;
    };
}

export default function RealMetricsSidebar({ metricValues }: RealMetricsSidebarProps) {
    // Status functions for Real Metrics
    const getCashStatus = (value: number | null) => {
        if (value === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
        };
        if (value > 1) return {
            emoji: '🟢',
            label: 'Normal',
            description: 'Systemically calm',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= 0) return {
            emoji: '🟠',
            label: 'Constrained',
            description: 'Warning band',
            colorClass: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400'
        };
        return {
            emoji: '🔴',
            label: 'Push',
            description: 'Forcing risk',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

    const getBondsStatus = (value: number | null) => {
        if (value === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
        };
        if (value > 2.5) return {
            emoji: '🟢',
            label: 'Anchored',
            description: 'Capital compounds in real terms',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= 0) return {
            emoji: '🔵',
            label: 'Supportive',
            description: 'System functions normally',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
        };
        return {
            emoji: '🔴',
            label: 'System Stress',
            description: 'No real risk-free rate',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

    const getEquitiesStatus = (value: number | null) => {
        if (value === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
        };
        if (value > 3) return {
            emoji: '🟢',
            label: 'Compelling',
            description: 'Strong real economic tailwind',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= 1) return {
            emoji: '🔵',
            label: 'Supportive',
            description: 'Equities clear inflation',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
        };
        return {
            emoji: '🔴',
            label: 'Adverse',
            description: 'Equity economics impaired',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

    // Status functions for Market Spreads
    const getYieldCurveStatus = (tnxValue: number | null, irxValue: number | null) => {
        if (tnxValue === null || irxValue === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400',
            value: null
        };
        const spread = tnxValue - irxValue;
        if (spread > 1) return {
            emoji: '🟢',
            label: 'Positive',
            description: 'Growth-supportive',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
            value: spread
        };
        if (spread >= 0) return {
            emoji: '🔵',
            label: 'Flat',
            description: 'Late-cycle zone',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
            value: spread
        };
        return {
            emoji: '🔴',
            label: 'Inverted',
            description: 'Danger state',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
            value: spread
        };
    };

    const getEYPStatus = (value: number | null) => {
        if (value === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
        };
        if (value > 1) return {
            emoji: '🟢',
            label: 'Equities Favored',
            description: 'Equities dominate bonds on carry',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= -1) return {
            emoji: '🔵',
            label: 'Balanced',
            description: 'No clear asset-class advantage',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
        };
        return {
            emoji: '🔴',
            label: 'Bonds Favored',
            description: 'Bonds/cash preferred over equities',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

    const cashStatus = getCashStatus(metricValues.real3M?.value ?? null);
    const bondsStatus = getBondsStatus(metricValues.real10Y?.value ?? null);
    const equitiesStatus = getEquitiesStatus(metricValues.rey5yr?.value ?? null);
    const yieldCurveStatus = getYieldCurveStatus(metricValues.tnx?.value ?? null, metricValues.irx?.value ?? null);
    const eypStatus = getEYPStatus(metricValues.eyp5yr?.value ?? null);

    return (
        <div className="space-y-2 sticky top-4 w-48">
            {/* Real Metrics */}
            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 text-center">Real Metrics</h3>
                <div className="space-y-1.5">
                    {/* Cash */}
                    <div className={`p-2 rounded-md border ${cashStatus.colorClass} text-center`}>
                        <div className="text-sm font-bold mb-1">
                            Real 3M {metricValues.real3M && metricValues.real3M.value !== null ? `${metricValues.real3M.value.toFixed(2)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground mb-0.5">{cashStatus.emoji} {cashStatus.label}</div>
                        <div className="text-[10px] text-muted-foreground opacity-70">{cashStatus.description}</div>
                    </div>

                    {/* Bonds */}
                    <div className={`p-2 rounded-md border ${bondsStatus.colorClass} text-center`}>
                        <div className="text-sm font-bold mb-1">
                            Real 10Y {metricValues.real10Y && metricValues.real10Y.value !== null ? `${metricValues.real10Y.value.toFixed(2)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground mb-0.5">{bondsStatus.emoji} {bondsStatus.label}</div>
                        <div className="text-[10px] text-muted-foreground opacity-70">{bondsStatus.description}</div>
                    </div>

                    {/* Equities */}
                    <div className={`p-2 rounded-md border ${equitiesStatus.colorClass} text-center`}>
                        <div className="text-sm font-bold mb-1">
                            Real EY {metricValues.rey5yr && metricValues.rey5yr.value !== null ? `${metricValues.rey5yr.value.toFixed(2)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground mb-0.5">{equitiesStatus.emoji} {equitiesStatus.label}</div>
                        <div className="text-[10px] text-muted-foreground opacity-70">{equitiesStatus.description}</div>
                    </div>
                </div>
            </div>

            {/* Market Spreads */}
            <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 text-center">Market Spreads</h3>
                <div className="space-y-1.5">
                    {/* Yield Curve */}
                    <div className={`p-2 rounded-md border ${yieldCurveStatus.colorClass} text-center`}>
                        <div className="text-sm font-bold mb-1">
                            10Y−3M {yieldCurveStatus.value !== null ? `${yieldCurveStatus.value.toFixed(2)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground mb-0.5">{yieldCurveStatus.emoji} {yieldCurveStatus.label}</div>
                        <div className="text-[10px] text-muted-foreground opacity-70">{yieldCurveStatus.description}</div>
                    </div>

                    {/* EYP */}
                    <div className={`p-2 rounded-md border ${eypStatus.colorClass} text-center`}>
                        <div className="text-sm font-bold mb-1">
                            EY−3M {metricValues.eyp5yr && metricValues.eyp5yr.value !== null ? `${metricValues.eyp5yr.value.toFixed(2)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground mb-0.5">{eypStatus.emoji} {eypStatus.label}</div>
                        <div className="text-[10px] text-muted-foreground opacity-70">{eypStatus.description}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
