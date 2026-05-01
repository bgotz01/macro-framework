//components/regime/regime-state-display.tsx
'use client';

import { useState, useEffect } from 'react';
import { REGIME_METADATA } from '@/lib/regime-state-machine';
import type { RegimeFamily } from '@/lib/regime-state-machine';
import { REGIME_TRIGGERS } from '@/lib/regime-state-machine';
import CapitalAllocation from './capital-allocation';

const REGIME_METRICS: Record<RegimeFamily, Set<string>> = {
    'Broad Growth': new Set(['rey']),
    'Long Duration': new Set(['eyp', 'real10Y']),
    'Overvaluation': new Set(['eyp', 'rey']),
    'Crisis': new Set(['real10Y', 'realM2']),
    'Bond Stress': new Set(['real10Y', 'real3M']),
    'Liquidity Shock': new Set(['realM2']),
    'None': new Set([])
};

function formatTriggerDescription(text: string) {
    const parts = text.split(/\b(AND|OR)\b/);
    return parts.map((part, i) =>
        part === 'AND' || part === 'OR'
            ? <span key={i} className="text-muted-foreground/50 text-xs font-medium mx-0.5">{part}</span>
            : <span key={i}>{part}</span>
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
    currentDate,
    daysInRegime,
    conditions,
    triggerDescriptions
}: RegimeStateDisplayProps) {
    const metadata = REGIME_METADATA[regime];
    const [isExpanded, setIsExpanded] = useState(false);
    const [liveRegime, setLiveRegime] = useState<string | null>(null);
    const [liveRegimeDate, setLiveRegimeDate] = useState<string | null>(null);

    // Fetch live daily regime from cockpit - calculate it the same way cockpit does
    useEffect(() => {
        const fetchLiveRegime = async () => {
            try {
                // Add cache-busting parameter to ensure fresh data
                const response = await fetch(`/api/cockpit-live?t=${Date.now()}`, {
                    cache: 'no-store'
                });
                if (response.ok) {
                    const live = await response.json();

                    // Calculate exactly like cockpit-client does
                    // Round CPI to 2 decimals to match cockpit's display/calculation
                    const cpi = parseFloat((live.cpi.value || 0).toFixed(2));
                    const m2yoy = parseFloat(live.m2yoy.value) || 0;
                    const eps5yr = live.eps5yr.value || 0;
                    const tnx = live.tnx.value ?? 0;
                    const irx = live.irx.value ?? 0;
                    const price = live.gspc.value ?? 0;

                    const real10Y = tnx - cpi;
                    const real3M = irx - cpi;
                    const realM2 = m2yoy - cpi;

                    // Use 5yr EPS to match cockpit exactly
                    const pe5yr = eps5yr > 0 && price > 0 ? price / eps5yr : null;
                    const ey5yr = pe5yr !== null ? (1 / pe5yr) * 100 : null;
                    const eyp = ey5yr !== null ? ey5yr - irx : null;
                    const realEY = ey5yr !== null ? ey5yr - cpi : null;

                    console.log('Live regime calculation:', {
                        price,
                        eps5yr,
                        cpi,
                        irx,
                        pe5yr: pe5yr?.toFixed(2),
                        ey5yr: ey5yr?.toFixed(2),
                        realEY: realEY?.toFixed(2),
                        eyp: eyp?.toFixed(2),
                        overvaluationThreshold: -0.5,
                        triggersOvervaluation: realEY !== null && realEY <= -0.5
                    });

                    const { determineNextRegime } = await import('@/lib/regime-state-machine');
                    const liveRegimeResult = determineNextRegime(null, {
                        rey: realEY, eyp, real10Y, real3M, realM2,
                        liquidityScore: 0, stage: 'N/A', pressure: 'N/A', risk: 'N/A', direction: 'N/A', trendAge: null,
                    }, new Date().toISOString().split('T')[0]);

                    console.log('Live regime result:', liveRegimeResult.regime);

                    setLiveRegime(liveRegimeResult.regime);
                    // Use the most recent date from the data (typically GSPC is most current)
                    setLiveRegimeDate(live.gspc.date || live.eps5yr.date || live.cpi.date);
                } else {
                    console.error('Live regime API error:', await response.text());
                }
            } catch (err) {
                console.error('Failed to fetch live regime:', err);
            }
        };

        fetchLiveRegime();
    }, []);


    return (
        <>
            <div className="max-w-7xl mx-auto">
                <div className="rounded-xl border-2 bg-card shadow-lg" style={{ borderColor: metadata.color }}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full p-6 hover:bg-muted/10 transition-colors rounded-xl"
                    >
                        <div className="relative">
                            {/* Small title at the very top */}
                            <div className="text-center mb-3">
                                <h2
                                    className="text-xs font-light tracking-widest text-muted-foreground uppercase"
                                    style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.2em' }}
                                >
                                    ACTIVE REGIME
                                </h2>
                            </div>

                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2" style={{ color: metadata.color }}>
                                    {regime}
                                </div>
                                <p className="text-sm text-muted-foreground italic mb-1">
                                    {metadata.description}
                                </p>
                                {liveRegime && (
                                    <div className="flex items-center justify-center gap-2 mt-2 mb-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Live Daily: <span className="font-medium" style={{ color: REGIME_METADATA[liveRegime as RegimeFamily]?.color || metadata.color }}>{liveRegime}</span>
                                            {liveRegimeDate && (
                                                <span className="text-[10px] ml-1 opacity-60">
                                                    (as of {(() => {
                                                        const [y, m, d] = liveRegimeDate.split('-');
                                                        return new Date(`${y}-${m}-${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                                    })()})
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-3">
                                    <span>Entry: {new Date(entryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                    <span>•</span>
                                    <span>{daysInRegime} months in regime</span>
                                    <span>•</span>
                                    <span>as of {(() => {
                                        const d = currentDate || entryDate;
                                        if (!d) return '—';
                                        const [y, m, day] = d.split('-').map(Number);
                                        if (!y || !m || !day) return '—';
                                        return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    })()}</span>
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

                            <CapitalAllocation regime={regime} />
                        </div>
                    )}
                </div >
            </div >
        </>
    );
}
