//components/regime/regime-state-display.tsx
'use client';

import { REGIME_METADATA } from '@/lib/regime-state-machine';
import type { RegimeFamily } from '@/lib/regime-state-machine';
import { REGIME_TRIGGERS } from '@/lib/regime-state-machine';

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
    };
}

function getLiquidityLabel(score: number): string {
    if (score >= 2) return 'Supportive';
    if (score >= -1) return 'Neutral';
    return 'Restrictive';
}

export default function RegimeStateDisplay({
    regime,
    entryDate,
    currentDate,
    daysInRegime,
    triggerReason,
    conditions
}: RegimeStateDisplayProps) {
    const metadata = REGIME_METADATA[regime];

    return (
        <div className="max-w-7xl mx-auto mb-8">
            <div className="p-6 rounded-xl border-2 bg-card shadow-lg" style={{ borderColor: metadata.color }}>
                {/* Header */}
                <div className="text-center mb-6">
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
                </div>

                {/* Two-Section Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left: Regime Info */}
                    <div className="space-y-4">
                        {/* Trigger Reason */}
                        <div className="p-4 rounded-lg bg-muted/20 border border-border">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Current Status
                            </div>
                            <p className="text-sm text-foreground leading-relaxed mb-3">
                                {triggerReason}
                            </p>
                            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                                <div className="font-semibold mb-1">Trigger Thresholds:</div>
                                <div className="leading-relaxed space-y-0.5">
                                    <div>{REGIME_TRIGGERS[regime].entryDescription}</div>
                                    {REGIME_TRIGGERS[regime].exitDescription && (
                                        <div>{REGIME_TRIGGERS[regime].exitDescription}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Guidance */}
                        <div className="p-4 rounded-lg border-2" style={{ borderColor: metadata.color, backgroundColor: `${metadata.color}10` }}>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Where To Look
                            </div>
                            <p className="text-sm font-medium" style={{ color: metadata.color }}>
                                {metadata.guidance}
                            </p>
                        </div>
                    </div>

                    {/* Right: Current Conditions */}
                    <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
                            Current Conditions
                        </div>
                        {/* Liquidity Row - Real 3M, Real M2, Real 10Y */}
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            {/* Real 3M */}
                            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    Real 3M
                                </div>
                                <div className="text-base font-bold" style={{ color: metadata.color }}>
                                    {conditions.real3M != null ? `${conditions.real3M.toFixed(2)}%` : 'N/A'}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    Short-term rate
                                </div>
                            </div>

                            {/* Real M2 */}
                            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    Real M2
                                </div>
                                <div className="text-base font-bold" style={{ color: metadata.color }}>
                                    {conditions.realM2 != null ? `${conditions.realM2.toFixed(1)}%` : 'N/A'}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    Money growth
                                </div>
                            </div>

                            {/* Real 10Y */}
                            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    Real 10Y
                                </div>
                                <div className="text-base font-bold" style={{ color: metadata.color }}>
                                    {conditions.real10Y != null ? `${conditions.real10Y.toFixed(2)}%` : 'N/A'}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    Long-term rate
                                </div>
                            </div>
                        </div>

                        {/* Valuation Row - REY, EYP */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* REY */}
                            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    Real EY
                                </div>
                                <div className="text-base font-bold" style={{ color: metadata.color }}>
                                    {conditions.rey != null ? `${conditions.rey.toFixed(2)}%` : 'N/A'}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    Real earnings yield
                                </div>
                            </div>

                            {/* EYP */}
                            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    EYP
                                </div>
                                <div className="text-base font-bold" style={{ color: metadata.color }}>
                                    {conditions.eyp != null ? `${conditions.eyp.toFixed(2)}%` : 'N/A'}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    Equity yield premium
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Note about regime persistence */}
                <div className="text-center pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">
                        {daysInRegime > 0
                            ? 'Regime persists until a new outlier trigger fires. Current conditions update monthly.'
                            : 'Regime calculated from current conditions. Run "npm run build-regime-timeline" to see historical regime transitions with persistence.'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
