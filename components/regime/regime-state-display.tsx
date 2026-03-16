//components/regime/regime-state-display.tsx
'use client';

import { useState } from 'react';
import { REGIME_METADATA } from '@/lib/regime-state-machine';
import type { RegimeFamily } from '@/lib/regime-state-machine';
import { REGIME_TRIGGERS } from '@/lib/regime-state-machine';

// Map which metrics each regime uses in its triggers
const REGIME_METRICS: Record<RegimeFamily, Set<string>> = {
    'Deep Value': new Set(['rey']),
    'Broad Growth': new Set(['rey']),
    'Fragile': new Set(['rey', 'real10Y', 'realM2']),
    'Contraction': new Set(['rey', 'eyp', 'real10Y']),
    'Long Duration': new Set(['eyp', 'real10Y']),
    'Overvaluation': new Set(['eyp']),
    'Crisis': new Set(['real10Y', 'realM2']),
    'Bond Stress': new Set(['real10Y', 'real3M']),
    'Liquidity Shock': new Set(['realM2']),
    'Normal': new Set([])
};

interface RegimeStateDisplayProps {
    regime: RegimeFamily;
    entryDate: string;
    currentDate: string;
    daysInRegime: number;
    triggerReason: string;
    description: string;
    guidance: string;
    color: string;
    conditions: {
        real3M: number | null;
        realM2: number | null;
        rey: number | null;
        eyp: number | null;
        real10Y: number | null;
        stage: string;
        pressure: string;
        risk: string;
        direction: string;
        yieldCurve?: number | null;
        slope500MAPercentile?: number | null;
    };
    yieldCurveInversion?: {
        isInverted: boolean;
        monthsSinceUninversion: number | null;
        lastInversionEndDate: string | null;
        currentValue?: number;
    } | null;
}

export default function RegimeStateDisplay({
    regime,
    entryDate,
    daysInRegime,
    conditions,
    yieldCurveInversion
}: RegimeStateDisplayProps) {
    const metadata = REGIME_METADATA[regime];
    const [isExpanded, setIsExpanded] = useState(true);
    const [tooltip, setTooltip] = useState<string | null>(null);

    // Build flags
    const flags: Array<{ type: 'warning' | 'extreme'; short: string; message: string }> = [];

    if (yieldCurveInversion) {
        if (yieldCurveInversion.isInverted) {
            flags.push({
                type: 'warning',
                short: `YC INV`,
                message: `Yield Curve Inverted (${conditions.yieldCurve?.toFixed(2)}%) — Historical recession indicator`
            });
        } else if (yieldCurveInversion.monthsSinceUninversion !== null && yieldCurveInversion.monthsSinceUninversion <= 18) {
            const monthsRemaining = 18 - yieldCurveInversion.monthsSinceUninversion;
            flags.push({
                type: 'warning',
                short: `YC -${monthsRemaining}mo`,
                message: `Yield Curve Recently Uninverted — ${monthsRemaining} months remaining in 18-month recession watch window`
            });
        }
    }

    if (conditions.eyp != null && conditions.eyp < -2) {
        flags.push({
            type: 'warning',
            short: `EYP ${conditions.eyp.toFixed(1)}%`,
            message: `Overvaluation: EYP ${conditions.eyp.toFixed(2)}% — equities significantly below risk-free rate`
        });
    }

    if (conditions.slope500MAPercentile != null) {
        if (conditions.slope500MAPercentile >= 95) {
            flags.push({
                type: 'extreme',
                short: `500MA ${conditions.slope500MAPercentile.toFixed(0)}p`,
                message: `500MA Slope at ${conditions.slope500MAPercentile.toFixed(0)}th percentile — Extreme uptrend momentum`
            });
        } else if (conditions.slope500MAPercentile <= 5) {
            flags.push({
                type: 'extreme',
                short: `500MA ${conditions.slope500MAPercentile.toFixed(0)}p`,
                message: `500MA Slope at ${conditions.slope500MAPercentile.toFixed(0)}th percentile — Extreme downtrend momentum`
            });
        }
    }

    return (
        <div className="max-w-7xl mx-auto mb-8">
            <div className="rounded-xl border-2 bg-card shadow-lg" style={{ borderColor: metadata.color }}>
                {/* Collapsible Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-6 hover:bg-muted/10 transition-colors rounded-xl"
                >
                    <div className="relative text-center">
                        {/* Flags — top right corner */}
                        {flags.length > 0 && (
                            <div className="absolute top-0 right-0 flex flex-col gap-1 items-end" onClick={e => e.stopPropagation()}>
                                <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Flags</div>
                                {flags.map((flag, i) => (
                                    <div key={i} className="relative">
                                        <span
                                            onMouseEnter={() => setTooltip(`flag-${i}`)}
                                            onMouseLeave={() => setTooltip(null)}
                                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold cursor-default select-none ${flag.type === 'warning'
                                                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500'
                                                : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500'
                                                }`}
                                        >
                                            {flag.short}
                                        </span>
                                        {tooltip === `flag-${i}` && (
                                            <div className="absolute right-0 top-6 z-50 w-64 p-2 rounded-lg shadow-lg bg-popover border border-border text-xs text-popover-foreground text-left leading-relaxed">
                                                {flag.message}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <h2
                            className="text-3xl font-light tracking-wider mb-2"
                            style={{
                                fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                                letterSpacing: '0.15em'
                            }}
                        >
                            ACTIVE REGIME
                        </h2>
                        <div className="text-3xl font-bold mb-2" style={{ color: metadata.color }}>
                            {regime}
                        </div>
                        <p className="text-sm text-muted-foreground italic mb-1">
                            {metadata.description}
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-3">
                            <span>Entry: {new Date(entryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>{daysInRegime} days in regime</span>
                        </div>
                        <div className="flex justify-center mt-3">
                            <svg
                                className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </button>

                {isExpanded && (
                    <div className="px-6 pb-6">
                        {/* Two-Column Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Left: Trigger Thresholds */}
                            <div className="p-4 rounded-lg bg-muted/20 border border-border">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
                                    Trigger Thresholds
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-[10px] font-semibold text-green-600 dark:text-green-400 mb-1">ENTRY</div>
                                        <div className="text-sm text-foreground leading-relaxed">
                                            {REGIME_TRIGGERS[regime].entryDescription}
                                        </div>
                                    </div>
                                    {REGIME_TRIGGERS[regime].exitDescription && (
                                        <div>
                                            <div className="text-[10px] font-semibold text-red-600 dark:text-red-400 mb-1">EXIT</div>
                                            <div className="text-sm text-foreground leading-relaxed">
                                                {REGIME_TRIGGERS[regime].exitDescription}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Current Conditions */}
                            <div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
                                    Current Conditions
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                            <div className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">Real M2</div>
                                            <div className="text-sm font-bold" style={{ color: REGIME_METRICS[regime].has('realM2') ? metadata.color : 'inherit' }}>
                                                {conditions.realM2 != null ? `${conditions.realM2.toFixed(1)}%` : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                            <div className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">Real 3M</div>
                                            <div className="text-sm font-bold" style={{ color: REGIME_METRICS[regime].has('real3M') ? metadata.color : 'inherit' }}>
                                                {conditions.real3M != null ? `${conditions.real3M.toFixed(1)}%` : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                            <div className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">Real 10Y</div>
                                            <div className="text-sm font-bold" style={{ color: REGIME_METRICS[regime].has('real10Y') ? metadata.color : 'inherit' }}>
                                                {conditions.real10Y != null ? `${conditions.real10Y.toFixed(1)}%` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                            <div className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">Real EY</div>
                                            <div className="text-sm font-bold" style={{ color: REGIME_METRICS[regime].has('rey') ? metadata.color : 'inherit' }}>
                                                {conditions.rey != null ? `${conditions.rey.toFixed(1)}%` : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                            <div className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">EYP</div>
                                            <div className="text-sm font-bold" style={{ color: REGIME_METRICS[regime].has('eyp') ? metadata.color : 'inherit' }}>
                                                {conditions.eyp != null ? `${conditions.eyp.toFixed(1)}%` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guidance */}
                        <div className="p-4 rounded-lg border-2 mb-6" style={{ borderColor: metadata.color, backgroundColor: `${metadata.color}10` }}>
                            <p className="text-sm font-medium leading-relaxed text-center" style={{ color: metadata.color }}>
                                {metadata.guidance}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
