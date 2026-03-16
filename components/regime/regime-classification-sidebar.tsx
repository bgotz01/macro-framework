'use client';

import { useState } from 'react';
import {
    getReal3MLabel,
    getReal10YLabel,
    getYieldCurveLabel,
    getEYPLabel,
    getRealEYLabel
} from '@/lib/regime-config';
import { formatValue, formatDate, formatDateFull } from './regime-parameters-utils';
import type { RegimeData } from './regime-parameters-types';

function getTrendPressurePercentileColor(percentile: number | null | undefined): string {
    if (percentile === null || percentile === undefined) return '#3b82f6';
    if (percentile > 90) return '#ef4444';
    if (percentile > 75) return '#eab308';
    if (percentile < 10) return '#15803d';
    if (percentile < 25) return '#22c55e';
    return '#3b82f6';
}

function getValueColor(label: string, rawValue: number | null): string {
    if (rawValue === null) return '#3b82f6';
    // reuse same thresholds as SmallMetricCard value-based coloring
    if (label === 'Real 3M') {
        if (rawValue < -1.0) return '#84cc16';
        if (rawValue < 0.0) return '#22c55e';
        if (rawValue <= 1.5) return '#3b82f6';
        if (rawValue <= 3.0) return '#eab308';
        return '#ef4444';
    }
    if (label === 'Real 10Y') {
        if (rawValue < 0.0) return '#84cc16';
        if (rawValue < 1.0) return '#22c55e';
        if (rawValue <= 2.5) return '#3b82f6';
        if (rawValue <= 4.0) return '#eab308';
        return '#ef4444';
    }
    if (label === 'Yield Curve') {
        if (rawValue > 1.75) return '#84cc16';
        if (rawValue > 0.75) return '#22c55e';
        if (rawValue >= 0.25) return '#3b82f6';
        if (rawValue >= -0.25) return '#eab308';
        return '#ef4444';
    }
    if (label === 'EYP 5yr') {
        if (rawValue > 4.0) return '#84cc16';
        if (rawValue > 2.0) return '#22c55e';
        if (rawValue >= 0.0) return '#3b82f6';
        if (rawValue >= -2.0) return '#eab308';
        return '#ef4444';
    }
    if (label === 'Real EY') {
        if (rawValue > 6.0) return '#84cc16';
        if (rawValue > 4.0) return '#22c55e';
        if (rawValue > 2.0) return '#3b82f6';
        if (rawValue >= 0.0) return '#eab308';
        return '#ef4444';
    }
    if (label === 'Real M2') {
        if (rawValue > 5.0) return '#84cc16';
        if (rawValue > 1.0) return '#22c55e';
        if (rawValue >= -1.0) return '#3b82f6';
        if (rawValue >= -5.0) return '#eab308';
        return '#ef4444';
    }
    return '#3b82f6';
}

function MiniCard({ label, value, percentile, color }: {
    label: string;
    value: string;
    percentile: number | null | undefined;
    color: string;
}) {
    return (
        <div className="p-1.5 rounded border bg-card text-center" style={{ borderColor: color }}>
            <div className="text-[9px] text-muted-foreground mb-0.5 truncate">{label}</div>
            <div className="text-xs font-bold leading-none mb-0.5">{value}</div>
            {percentile != null && (
                <div className="text-[9px] font-medium" style={{ color }}>
                    {percentile.toFixed(0)}%
                </div>
            )}
        </div>
    );
}

interface Props {
    data: RegimeData;
    liquidityRegime: any;
    valuationRegime: any;
    flowTrendState: any;
}

export default function RegimeClassificationSidebar({ data, liquidityRegime, valuationRegime, flowTrendState }: Props) {
    const [open, setOpen] = useState(true);

    return (
        <div className="flex flex-col items-end">
            <button
                onClick={() => setOpen(o => !o)}
                className="mb-2 flex items-center gap-1 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
            >
                {open ? (
                    <>
                        <span>Hide</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </>
                ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                )}
            </button>

            {open && (
                <div className="w-[200px] flex flex-col gap-3 border-l border-border pl-3">
                    {/* Liquidity */}
                    <div>
                        <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Liquidity</div>
                        <div className="text-[10px] font-medium text-foreground mb-1.5 truncate">{liquidityRegime.regime?.name ?? '—'}</div>
                        <div className="grid grid-cols-2 gap-1">
                            <MiniCard
                                label="Real 3M"
                                value={formatValue(data.real3M.value)}
                                percentile={data.real3M.percentile}
                                color={getValueColor('Real 3M', data.real3M.value)}
                            />
                            <MiniCard
                                label="Real 10Y"
                                value={formatValue(data.real10Y.value)}
                                percentile={data.real10Y.percentile}
                                color={getValueColor('Real 10Y', data.real10Y.value)}
                            />
                            <MiniCard
                                label="Yld Curve"
                                value={formatValue(data.yieldCurve.value)}
                                percentile={data.yieldCurve.percentile}
                                color={getValueColor('Yield Curve', data.yieldCurve.value)}
                            />
                            <MiniCard
                                label="Real M2"
                                value={formatValue(data.realM2.value)}
                                percentile={data.realM2.percentile}
                                color={getValueColor('Real M2', data.realM2.value)}
                            />
                        </div>
                    </div>

                    {/* Valuation */}
                    <div>
                        <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Valuation</div>
                        <div className="text-[10px] font-medium text-foreground mb-1.5 truncate">{valuationRegime.regime?.name ?? '—'}</div>
                        <div className="grid grid-cols-2 gap-1">
                            <MiniCard
                                label="EYP 5yr"
                                value={formatValue(data.eyp5yr.value)}
                                percentile={data.eyp5yr.percentile}
                                color={getValueColor('EYP 5yr', data.eyp5yr.value)}
                            />
                            <MiniCard
                                label="Real EY"
                                value={formatValue(data.rey5yr.value)}
                                percentile={data.rey5yr.percentile}
                                color={getValueColor('Real EY', data.rey5yr.value)}
                            />
                        </div>
                    </div>

                    {/* Trend Pressure */}
                    <div>
                        <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Trend Pressure</div>
                        <div className="text-[10px] font-medium text-foreground mb-1.5 truncate">{flowTrendState.risk?.label ?? '—'}</div>
                        <div className="grid grid-cols-2 gap-1">
                            <MiniCard
                                label="Direction"
                                value={flowTrendState.direction.label.replace('Strong ', '').replace('trend', '')}
                                percentile={data.slope200MA.percentile}
                                color={getTrendPressurePercentileColor(data.slope200MA.percentile)}
                            />
                            <MiniCard
                                label="Stage"
                                value={flowTrendState.stage.label}
                                percentile={data.slopeStreak200MA.percentile}
                                color={getTrendPressurePercentileColor(data.slopeStreak200MA.percentile)}
                            />
                            <MiniCard
                                label="Pressure"
                                value={flowTrendState.pressure.label}
                                percentile={data.divergence200MA.percentile}
                                color={getTrendPressurePercentileColor(data.divergence200MA.percentile)}
                            />
                            <MiniCard
                                label="Days >200MA"
                                value={data.daysAbove200MA.value !== null ? `${data.daysAbove200MA.value.toFixed(0)}d` : 'N/A'}
                                percentile={data.daysAbove200MA.percentile}
                                color={getTrendPressurePercentileColor(data.daysAbove200MA.percentile)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
