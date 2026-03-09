'use client';

import { useState, useEffect } from 'react';
import type { MetricValue } from './types';

interface RegimeDetectorCardProps {
    title: string;
    subtitle?: string;
    date?: string;
    metricValues: {
        real10Y?: MetricValue;
        real3M?: MetricValue;
        rey5yr?: MetricValue;
        eyp5yr?: MetricValue;
        yieldCurve?: MetricValue;
    };
    showDetails: boolean;
    isCurrent?: boolean;
}

export default function RegimeDetectorCard({
    title,
    subtitle,
    date,
    metricValues,
    showDetails,
    isCurrent = false
}: RegimeDetectorCardProps) {
    const [yieldCurveInversionDate, setYieldCurveInversionDate] = useState<string | null>(null);

    useEffect(() => {
        if (!date) return;

        async function fetchInversionData() {
            try {
                const response = await fetch(`/api/yield-curve-inversion?date=${date}`);
                const data = await response.json();
                setYieldCurveInversionDate(data.inversionDate);
            } catch (error) {
                console.error('Error fetching inversion data:', error);
                setYieldCurveInversionDate(null);
            }
        }

        fetchInversionData();
    }, [date]);

    const real10Y = metricValues.real10Y?.value ?? null;
    const realEY = metricValues.rey5yr?.value ?? null;
    const eyp = metricValues.eyp5yr?.value ?? null;
    const yieldCurve = metricValues.yieldCurve?.value ?? null;

    const getRegime = () => {
        // System Stress
        if (real10Y !== null && real10Y < -0.5) {
            return {
                name: 'System Stress',
                emoji: '🔻',
                trigger: 'Real 10Y < -0.5%',
                colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                rotation: 'Gold / Real Assets',
                rotationColor: 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400'
            };
        }

        // Equity Value Breakdown
        if (realEY !== null && realEY < -2) {
            const rotation = real10Y !== null && real10Y > 0 ? 'EXIT Equities' : 'Gold / Real Assets';
            const rotationColor = real10Y !== null && real10Y > 0
                ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
                : 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400';
            return {
                name: 'Equity Value Breakdown',
                emoji: '🔴',
                trigger: 'Real EY < -2%',
                colorClass: 'bg-red-600/20 border-red-600 text-red-800 dark:text-red-300',
                rotation,
                rotationColor
            };
        }

        // Equity Sell Zone
        if (realEY !== null && realEY < -1) {
            const rotation = real10Y !== null && real10Y > 0 ? 'SELL Equities' : 'Gold / Real Assets';
            const rotationColor = real10Y !== null && real10Y > 0
                ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
                : 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400';
            return {
                name: 'Equity Sell Zone',
                emoji: '🔴',
                trigger: 'Real EY < -1%',
                colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                rotation,
                rotationColor
            };
        }

        // Equity Risk Warning
        if (realEY !== null && realEY < 0.5) {
            return {
                name: 'Equity Risk Warning',
                emoji: '🟠',
                trigger: 'Real EY < +0.5%',
                colorClass: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400',
                rotation: 'Reduce Equity Aggressiveness',
                rotationColor: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400'
            };
        }

        // Equity Danger
        if (real10Y !== null && real10Y >= 0 && realEY !== null && realEY >= 0 &&
            eyp !== null && eyp < -1 && yieldCurve !== null && yieldCurve < 0) {
            const rotation = real10Y > 0 ? 'Bonds' : 'Gold / Real Assets';
            const rotationColor = real10Y > 0
                ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
                : 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400';
            return {
                name: 'Equity Danger',
                emoji: '🔻',
                trigger: 'EYP < -1% AND Curve < 0%',
                colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                rotation,
                rotationColor
            };
        }

        // Growth Regime
        if (real10Y !== null && real10Y >= 0 && realEY !== null && realEY >= 0 &&
            eyp !== null && eyp < -1 && yieldCurve !== null && yieldCurve > 0) {
            return {
                name: 'Growth Regime',
                emoji: '🚀',
                trigger: 'EYP < -1% AND Curve > 0%',
                colorClass: 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-400',
                rotation: 'Growth Equities',
                rotationColor: 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-400'
            };
        }

        // Extreme Value
        if (realEY !== null && realEY >= 5.0) {
            return {
                name: 'Equity Value Window',
                emoji: '⭐',
                trigger: 'Real EY ≥ +5.0%',
                colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                rotation: 'STRONG BUY Equities',
                rotationColor: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                isExtreme: true
            };
        }

        // Good Value
        if (realEY !== null && realEY >= 3.0) {
            return {
                name: 'Equity Value Window',
                emoji: '✅',
                trigger: 'Real EY ≥ +3.0%',
                colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                rotation: 'BUY Equities',
                rotationColor: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
            };
        }

        // Normal
        return {
            name: 'Normal',
            emoji: '✅',
            trigger: 'All metrics healthy',
            colorClass: 'bg-blue-500/10 border-blue-400 text-blue-700 dark:text-blue-400',
            rotation: 'Balanced',
            rotationColor: 'bg-blue-500/10 border-blue-400 text-blue-700 dark:text-blue-400'
        };
    };

    const regime = getRegime();

    const getEquityWarning = () => {
        if (!yieldCurveInversionDate || !date) return null;

        const inversionDate = new Date(yieldCurveInversionDate);
        const current = new Date(date);
        const monthsSinceInversion = (current.getFullYear() - inversionDate.getFullYear()) * 12 +
            (current.getMonth() - inversionDate.getMonth());

        if (monthsSinceInversion >= 0 && monthsSinceInversion <= 24) {
            return 24 - monthsSinceInversion;
        }
        return null;
    };

    const equityWarning = getEquityWarning();

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card shadow-lg ${isCurrent ? 'ring-2 ring-green-500/50' : ''}`}>
            <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">{title}</h3>
                {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
            </div>

            {/* Regime Display */}
            <div className={`p-6 rounded-xl border-2 ${regime.colorClass} ${regime.isExtreme ? 'ring-2 ring-green-500 animate-pulse' : ''}`}>
                <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{regime.emoji}</div>
                    <div className="text-2xl font-bold mb-1">{regime.name}</div>
                    <div className="text-sm opacity-70">{regime.trigger}</div>
                </div>

                <div className={`mt-4 p-4 rounded-lg border ${regime.rotationColor}`}>
                    <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1 text-center">
                        Rotation
                    </div>
                    <div className="text-lg font-bold text-center">{regime.rotation}</div>
                </div>

                {equityWarning !== null && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/50">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-base">⚠️</span>
                            <div className="text-center">
                                <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                    🚩 Inverted Yield Curve
                                </div>
                                <div className="text-[10px] text-amber-600 dark:text-amber-300 opacity-80 mt-0.5">
                                    {equityWarning} months remaining
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Metric Values */}
            {showDetails && (
                <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Metric Values
                    </div>
                    <div className="space-y-2">
                        <MetricRow label="Real 10Y" value={real10Y} />
                        <MetricRow label="Real EY 5yr" value={realEY} />
                        <MetricRow label="EY Premium 5yr" value={eyp} />
                        <MetricRow label="Yield Curve" value={yieldCurve} />
                    </div>
                </div>
            )}
        </div>
    );
}

interface MetricRowProps {
    label: string;
    value: number | null;
}

function MetricRow({ label, value }: MetricRowProps) {
    const formatValue = (val: number | null) => {
        if (val === null) return 'N/A';
        return `${val.toFixed(2)}%`;
    };

    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium">{formatValue(value)}</span>
        </div>
    );
}
