//components/regime-tracker-section.tsx
import { useState } from 'react';
import RegimeTracker from '../regime-tracker';
import type { MetricValue } from './types';

interface SignalTrackerSectionProps {
    title: string;
    metricValues: {
        real3M?: MetricValue;
        real10Y?: MetricValue;
        rey5yr?: MetricValue;
        tnx?: MetricValue;
        irx?: MetricValue;
        eyp5yr?: MetricValue;
    };
    type: 'real-metrics' | 'market-spreads';
}

export default function SignalTrackerSection({ title, metricValues, type }: SignalTrackerSectionProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    // Status functions for each tracker
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
            description: 'Real 3M > 1% • Systemically calm',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= 0) return {
            emoji: '🟠',
            label: 'Constrained',
            description: 'Real 3M 0–1% • Warning band',
            colorClass: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400'
        };
        return {
            emoji: '🔴',
            label: 'Push',
            description: 'Real 3M < 0% • Forcing risk',
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
            description: 'Real 10Y > 2.5% • Capital compounds in real terms',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= 0) return {
            emoji: '🔵',
            label: 'Supportive',
            description: 'Real 10Y 0–2.5% • System functions normally',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
        };
        return {
            emoji: '🔴',
            label: 'System Stress',
            description: 'Real 10Y < 0% • No real risk-free rate',
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
            description: 'Real EY > 3% • Strong real economic tailwind',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= 1) return {
            emoji: '🔵',
            label: 'Supportive',
            description: 'Real EY 1–3% • Equities clear inflation',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
        };
        return {
            emoji: '🔴',
            label: 'Adverse',
            description: 'Real EY < 1% • Equity economics impaired',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

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
            description: '10Y−3M > 1% • Growth-supportive',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
            value: spread
        };
        if (spread >= 0) return {
            emoji: '🔵',
            label: 'Flat',
            description: '10Y−3M 0–1% • Late-cycle zone',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
            value: spread
        };
        return {
            emoji: '🔴',
            label: 'Inverted',
            description: '10Y−3M < 0% • Danger state',
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
            description: 'EYP > 1% • Equities dominate bonds on carry',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= -1) return {
            emoji: '🔵',
            label: 'Balanced',
            description: 'EYP −1% to 1% • No clear asset-class advantage',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
        };
        return {
            emoji: '🔴',
            label: 'Bonds Favored',
            description: 'EYP < −1% • Bonds/cash preferred over equities',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

    return (
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-between mb-3 hover:opacity-70 transition-opacity"
            >
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
                <span className="text-sm text-muted-foreground">
                    {isCollapsed ? '▶' : '▼'}
                </span>
            </button>

            {!isCollapsed && (
                <div className="space-y-3">
                    {type === 'real-metrics' ? (
                        <div className="grid grid-cols-3 gap-3">
                            <RegimeTracker
                                label="Cash: Capital Pressure"
                                value={metricValues.real3M?.value ?? null}
                                metricLabel="Real 3M"
                                centerLabel={true}
                                getStatus={getCashStatus}
                            />
                            <RegimeTracker
                                label="Bonds: System Anchor"
                                value={metricValues.real10Y?.value ?? null}
                                metricLabel="Real 10Y"
                                centerLabel={true}
                                getStatus={getBondsStatus}
                            />
                            <RegimeTracker
                                label="Equities: Real Earnings Yield"
                                value={metricValues.rey5yr?.value ?? null}
                                metricLabel="Real EY"
                                centerLabel={true}
                                getStatus={getEquitiesStatus}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <RegimeTracker
                                    label="Yield Curve: Liquidity Transmission"
                                    value={
                                        metricValues.tnx?.value !== null && metricValues.irx?.value !== null
                                            ? (metricValues.tnx?.value ?? 0) - (metricValues.irx?.value ?? 0)
                                            : null
                                    }
                                    metricLabel="10Y−3M"
                                    centerLabel={true}
                                    getStatus={(val) => getYieldCurveStatus(metricValues.tnx?.value ?? null, metricValues.irx?.value ?? null)}
                                />
                                <RegimeTracker
                                    label="EYP: Asset Preference"
                                    value={metricValues.eyp5yr?.value ?? null}
                                    metricLabel="EY−3M"
                                    centerLabel={true}
                                    getStatus={getEYPStatus}
                                />
                            </div>
                            {/* Growth Equities Override Indicator */}
                            {metricValues.eyp5yr?.value !== null &&
                                metricValues.tnx?.value !== null &&
                                metricValues.irx?.value !== null &&
                                (metricValues.eyp5yr?.value ?? 0) < 0 &&
                                ((metricValues.tnx?.value ?? 0) - (metricValues.irx?.value ?? 0)) > 0 && (
                                    <div className="mt-2 p-3 rounded-lg bg-purple-500/10 border-2 border-purple-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-lg">🚀</span>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-purple-700 dark:text-purple-400">
                                                    Growth Equities Regime
                                                </div>
                                                <div className="text-xs text-purple-600 dark:text-purple-300 opacity-80">
                                                    Negative EYP + Positive Curve • Duration & growth favored
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
