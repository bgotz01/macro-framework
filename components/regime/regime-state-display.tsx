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

    return (
        <div className="max-w-7xl mx-auto mb-8">
            <div className="rounded-xl border-2 bg-card shadow-lg" style={{ borderColor: metadata.color }}>
                {/* Collapsible Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-6 hover:bg-muted/10 transition-colors rounded-xl"
                >
                    <div className="text-center">
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

                        {/* Flags Section */}
                        {(() => {
                            const flags: Array<{ type: 'warning' | 'extreme'; message: string }> = [];

                            if (yieldCurveInversion) {
                                if (yieldCurveInversion.isInverted) {
                                    flags.push({ type: 'warning', message: `Yield Curve Inverted (${conditions.yieldCurve?.toFixed(2)}%) - Historical recession indicator` });
                                } else if (yieldCurveInversion.monthsSinceUninversion !== null && yieldCurveInversion.monthsSinceUninversion <= 18) {
                                    const monthsRemaining = 18 - yieldCurveInversion.monthsSinceUninversion;
                                    flags.push({ type: 'warning', message: `Yield Curve Recently Uninverted (${monthsRemaining} months remaining in 18-month recession watch window)` });
                                }
                            }

                            if (conditions.eyp != null && conditions.eyp < -2) {
                                flags.push({ type: 'warning', message: `Overvaluation: EYP ${conditions.eyp.toFixed(2)}% — equities significantly below risk-free rate` });
                            }

                            if (conditions.slope500MAPercentile != null) {
                                if (conditions.slope500MAPercentile >= 95) {
                                    flags.push({ type: 'extreme', message: `500MA Slope at ${conditions.slope500MAPercentile.toFixed(0)}th percentile - Extreme uptrend momentum` });
                                } else if (conditions.slope500MAPercentile <= 5) {
                                    flags.push({ type: 'extreme', message: `500MA Slope at ${conditions.slope500MAPercentile.toFixed(0)}th percentile - Extreme downtrend momentum` });
                                }
                            }

                            if (flags.length === 0) return null;

                            return (
                                <div className="mb-6 space-y-2">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">Flags</div>
                                    {flags.map((flag, index) => (
                                        <div key={index} className={`p-3 rounded-lg border-2 flex items-start gap-3 ${flag.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500' : 'bg-red-50 dark:bg-red-950/20 border-red-500'}`}>
                                            <div className="flex-shrink-0 mt-0.5">
                                                {flag.type === 'warning' ? (
                                                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className={`text-sm font-medium ${flag.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' : 'text-red-800 dark:text-red-200'}`}>
                                                {flag.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
