//components/regime/regime-state-display.tsx
'use client';

import { useState } from 'react';
import { REGIME_METADATA } from '@/lib/regime-state-machine';
import type { RegimeFamily } from '@/lib/regime-state-machine';
import { REGIME_TRIGGERS } from '@/lib/regime-state-machine';

const REGIME_METRICS: Record<RegimeFamily, Set<string>> = {
    'Broad Growth': new Set(['rey']),
    'Long Duration': new Set(['eyp', 'real10Y']),
    'Overvaluation': new Set(['eyp', 'rey']),
    'Crisis': new Set(['real10Y', 'realM2']),
    'Bond Stress': new Set(['real10Y', 'real3M']),
    'Liquidity Shock': new Set(['realM2']),
    'Liquidity Contraction': new Set(['realM2', 'eyp']),
    'Normal': new Set([])
};

function formatTriggerDescription(text: string) {
    const parts = text.split(/\b(AND|OR)\b/);
    return parts.map((part, i) =>
        part === 'AND' || part === 'OR'
            ? <span key={i} className="text-muted-foreground/50 text-xs font-medium mx-0.5">{part}</span>
            : <span key={i}>{part}</span>
    );
}

interface Signal {
    type: 'warning' | 'extreme';
    short: string;
    message: string;
}

function FlagBadge({ flag }: { flag: Signal }) {
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold select-none ${flag.type === 'warning'
            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500'
            : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500'
            }`}>
            {flag.short}
        </span>
    );
}

function MomBadge({ pf }: { pf: { label: string; delta: number } }) {
    const sign = pf.delta > 0 ? '+' : '';
    const isUp = pf.delta > 0;
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold select-none ${isUp
            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500'
            : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500'
            }`}>
            {pf.label} {sign}{pf.delta.toFixed(0)}
        </span>
    );
}

function FlagsModal({ signals, momMoves, onClose }: {
    signals: Signal[];
    momMoves: Array<{ label: string; delta: number }>;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50" />
            <div
                className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h3 className="text-base font-semibold">Active Flags</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-5 space-y-6">
                    {signals.length > 0 && (
                        <div>
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Signals</div>
                            <div className="space-y-2">
                                {signals.map((flag, i) => (
                                    <div key={i} className={`flex gap-3 p-3 rounded-lg border ${flag.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-red-500/5 border-red-500/30'
                                        }`}>
                                        <span className={`mt-0.5 flex-shrink-0 inline-block px-2 py-0.5 rounded text-[10px] font-bold h-fit ${flag.type === 'warning'
                                            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500'
                                            : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500'
                                            }`}>{flag.short}</span>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{flag.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {momMoves.length > 0 && (
                        <div>
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Month-over-Month Percentile Moves</div>
                            <div className="space-y-2">
                                {momMoves.map((pf, i) => {
                                    const sign = pf.delta > 0 ? '+' : '';
                                    const isUp = pf.delta > 0;
                                    return (
                                        <div key={i} className={`flex gap-3 p-3 rounded-lg border ${isUp ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-red-500/5 border-red-500/30'
                                            }`}>
                                            <span className={`mt-0.5 flex-shrink-0 inline-block px-2 py-0.5 rounded text-[10px] font-bold h-fit ${isUp
                                                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500'
                                                : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500'
                                                }`}>{pf.label} {sign}{pf.delta.toFixed(0)}</span>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                <span className="font-medium text-foreground">{pf.label}</span> percentile shifted{' '}
                                                <span className={`font-semibold ${isUp ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {sign}{pf.delta.toFixed(1)} points
                                                </span>{' '}
                                                this month — a significant move that may signal a shift in macro conditions.
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

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
        slope200MA?: number | null;
    };
    yieldCurveInversion?: {
        isInverted: boolean;
        monthsSinceUninversion: number | null;
        lastInversionEndDate: string | null;
        currentValue?: number;
    } | null;
    triggerDescriptions?: {
        entryDescription: string;
        exitDescription: string;
    } | null;
    percentileFlags?: Array<{ label: string; delta: number }>;
}

export default function RegimeStateDisplay({
    regime,
    entryDate,
    daysInRegime,
    conditions,
    yieldCurveInversion,
    triggerDescriptions,
    percentileFlags = []
}: RegimeStateDisplayProps) {
    const metadata = REGIME_METADATA[regime];
    const [isExpanded, setIsExpanded] = useState(false);

    // Build structural signals
    const signals: Signal[] = [];

    if (yieldCurveInversion?.isInverted) {
        signals.push({
            type: 'warning',
            short: 'YC INV',
            message: `Yield Curve Inverted (${conditions.yieldCurve?.toFixed(2)}%) — historically a leading recession indicator. Inversions have preceded every US recession since the 1960s, typically with a 12–24 month lag.`
        });
    } else if (yieldCurveInversion?.monthsSinceUninversion != null && yieldCurveInversion.monthsSinceUninversion <= 18) {
        const mo = 18 - yieldCurveInversion.monthsSinceUninversion;
        signals.push({
            type: 'warning',
            short: `YC -${mo}mo`,
            message: `Yield Curve Recently Uninverted — ${mo} months remaining in the 18-month recession watch window. Historical data shows recessions most commonly begin within 18 months of uninversion.`
        });
    }

    if (conditions.eyp != null && conditions.eyp < -2) {
        signals.push({
            type: 'warning',
            short: `EYP ${conditions.eyp.toFixed(1)}%`,
            message: `Earnings Yield Premium is ${conditions.eyp.toFixed(2)}% — equities are significantly below the risk-free rate. This indicates stocks are expensive relative to bonds and historically correlates with poor forward equity returns.`
        });
    }

    if (conditions.slope500MAPercentile != null && conditions.slope500MAPercentile > 85) {
        signals.push({
            type: 'warning',
            short: 'Overvalued',
            message: `500-Day MA slope is at the ${conditions.slope500MAPercentile.toFixed(0)}th percentile — trend pressure is historically elevated. Markets at this level of trend extension have shown increased vulnerability to mean reversion.`
        });
    }

    if (conditions.slope200MA != null && conditions.slope200MA < -0.02) {
        signals.push({
            type: 'extreme',
            short: '200MA ↓',
            message: `200-Day MA slope is negative (${conditions.slope200MA.toFixed(3)}) — the long-term trend is declining. A falling 200MA is a classic bear market signal and often precedes sustained drawdowns.`
        });
    }


    return (
        <>
            <div className="max-w-7xl mx-auto mb-8">
                <div className="rounded-xl border-2 bg-card shadow-lg" style={{ borderColor: metadata.color }}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full p-6 hover:bg-muted/10 transition-colors rounded-xl"
                    >
                        <div className="relative text-center">
                            {/* Two-column flags — always visible, badges appear when triggered */}
                            <div
                                className="absolute top-0 right-0 flex gap-3 items-start"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex flex-col gap-1 items-end">
                                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Signals</div>
                                    {signals.length > 0
                                        ? signals.map((flag, i) => <FlagBadge key={i} flag={flag} />)
                                        : <span className="text-[9px] text-muted-foreground/40 italic">none</span>
                                    }
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">MoM Moves</div>
                                    {percentileFlags.length > 0
                                        ? percentileFlags.map((pf, i) => <MomBadge key={i} pf={pf} />)
                                        : <span className="text-[9px] text-muted-foreground/40 italic">none</span>
                                    }
                                </div>
                            </div>

                            <h2
                                className="text-3xl font-light tracking-wider mb-2"
                                style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}
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
                                <span>{daysInRegime} months in regime</span>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="p-4 rounded-lg bg-muted/20 border border-border">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
                                        Trigger Thresholds
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-[10px] font-semibold text-green-600 dark:text-green-400 mb-1">ENTRY</div>
                                            <div className="text-sm text-foreground leading-relaxed">
                                                {formatTriggerDescription(triggerDescriptions?.entryDescription ?? REGIME_TRIGGERS[regime].entryDescription)}
                                            </div>
                                        </div>
                                        {(triggerDescriptions?.exitDescription ?? REGIME_TRIGGERS[regime].exitDescription) && (
                                            <div>
                                                <div className="text-[10px] font-semibold text-red-600 dark:text-red-400 mb-1">EXIT</div>
                                                <div className="text-sm text-foreground leading-relaxed">
                                                    {formatTriggerDescription(triggerDescriptions?.exitDescription ?? REGIME_TRIGGERS[regime].exitDescription)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
                                        Current Conditions
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Real M2', key: 'realM2', val: conditions.realM2 },
                                                { label: 'Real 3M', key: 'real3M', val: conditions.real3M },
                                                { label: 'Real 10Y', key: 'real10Y', val: conditions.real10Y },
                                            ].map(({ label, key, val }) => (
                                                <div key={key} className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                                    <div className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">{label}</div>
                                                    <div className="text-sm font-bold" style={{ color: REGIME_METRICS[regime].has(key) ? metadata.color : 'inherit' }}>
                                                        {val != null ? `${val.toFixed(1)}%` : 'N/A'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Real EY', key: 'rey', val: conditions.rey },
                                                { label: 'EYP', key: 'eyp', val: conditions.eyp },
                                            ].map(({ label, key, val }) => (
                                                <div key={key} className="p-2 rounded-lg bg-muted/30 border border-border text-center">
                                                    <div className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">{label}</div>
                                                    <div className="text-sm font-bold" style={{ color: REGIME_METRICS[regime].has(key) ? metadata.color : 'inherit' }}>
                                                        {val != null ? `${val.toFixed(1)}%` : 'N/A'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border-2 mb-6" style={{ borderColor: metadata.color, backgroundColor: `${metadata.color}10` }}>
                                <p className="text-sm font-medium leading-relaxed text-center" style={{ color: metadata.color }}>
                                    {metadata.guidance}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
