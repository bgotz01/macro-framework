'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTheme } from '../theme-provider';
import { REGIME_TRIGGERS, REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';

interface RegimeMonth {
    date: string;
    regime: string;
}

export const REGIME_COLORS: Record<string, string> = {
    'Broad Growth': '#22c55e',
    'Long Duration': '#3b82f6',
    'Overvaluation': '#eab308',
    'Crisis': '#991b1b',
    'Bond Stress': '#ea580c',
    'Liquidity Shock': '#a855f7',
    'None': '#6b7280',
};

export function getRegimeColor(regime: string, extraColors?: Record<string, string>): string {
    return extraColors?.[regime] ?? REGIME_COLORS[regime] ?? '#06b6d4';
}

const DATE_PRESETS = [
    { label: 'All', value: 'all' },
    { label: '1960s', value: '1960s', start: '1960-01-01', end: '1969-12-31' },
    { label: '1970s', value: '1970s', start: '1970-01-01', end: '1979-12-31' },
    { label: '1980s', value: '1980s', start: '1980-01-01', end: '1989-12-31' },
    { label: '1990s', value: '1990s', start: '1990-01-01', end: '1999-12-31' },
    { label: '2000s', value: '2000s', start: '2000-01-01', end: '2009-12-31' },
    { label: '2010s', value: '2010s', start: '2010-01-01', end: '2019-12-31' },
    { label: '2020s', value: '2020s', start: '2020-01-01', end: '2029-12-31' },
    { label: '5Y', value: '5y' },
    { label: '10Y', value: '10y' },
    { label: '20Y', value: '20y' },
];

/** Merge consecutive months of the same regime into segments for rendering */
function buildSegments(data: { date: string; regime: string }[]) {
    if (data.length === 0) return [];
    const segments: { regime: string; startIdx: number; endIdx: number; startDate: string; endDate: string }[] = [];
    let current = { regime: data[0].regime, startIdx: 0, startDate: data[0].date, endDate: data[0].date };
    for (let i = 1; i < data.length; i++) {
        if (data[i].regime === current.regime) {
            current.endDate = data[i].date;
        } else {
            segments.push({ ...current, endIdx: i - 1 });
            current = { regime: data[i].regime, startIdx: i, startDate: data[i].date, endDate: data[i].date };
        }
    }
    segments.push({ ...current, endIdx: data.length - 1 });
    return segments;
}

export default function RegimeTimelineBarChart({ compact = false }: { compact?: boolean }) {
    const [data, setData] = useState<RegimeMonth[]>([]);
    const [loading, setLoading] = useState(true);
    const [datePreset, setDatePreset] = useState<string>('all');
    const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; regime: string } | null>(null);
    const [modalRegime, setModalRegime] = useState<string | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        fetch('/api/regime-timeline')
            .then(r => r.json())
            .then(result => setData(result.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        if (data.length === 0) return [];
        if (compact || datePreset === 'all') return data;

        let startDate: string | null = null;
        let endDate: string | null = null;

        if (['5y', '10y', '20y'].includes(datePreset)) {
            const years = datePreset === '5y' ? 5 : datePreset === '10y' ? 10 : 20;
            const now = new Date();
            startDate = new Date(now.getFullYear() - years, now.getMonth(), 1)
                .toISOString().split('T')[0];
        } else {
            const preset = DATE_PRESETS.find(p => p.value === datePreset) as any;
            if (preset?.start) { startDate = preset.start; endDate = preset.end; }
        }

        let result = data;
        if (startDate) result = result.filter(d => d.date >= startDate!);
        if (endDate) result = result.filter(d => d.date <= endDate!);
        return result;
    }, [data, datePreset, compact]);

    const segments = useMemo(() => buildSegments(filtered), [filtered]);

    const regimeSummary = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const d of filtered) {
            counts[d.regime] = (counts[d.regime] || 0) + 1;
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([regime, months]) => ({
                regime,
                months,
                pct: filtered.length > 0 ? ((months / filtered.length) * 100).toFixed(1) : '0',
            }));
    }, [filtered]);

    const yearMarkers = useMemo(() => {
        if (filtered.length === 0) return [];
        const markers: { year: string; position: number }[] = [];
        let lastYear = '';
        const interval = filtered.length > 240 ? 5 : filtered.length > 120 ? 2 : 1;
        for (let i = 0; i < filtered.length; i++) {
            const year = filtered[i].date.substring(0, 4);
            if (year !== lastYear) {
                if (interval === 1 || parseInt(year) % interval === 0) {
                    markers.push({ year, position: (i / filtered.length) * 100 });
                }
                lastYear = year;
            }
        }
        return markers;
    }, [filtered]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || filtered.length === 0) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        const idx = Math.min(Math.max(Math.floor(pct * filtered.length), 0), filtered.length - 1);
        const item = filtered[idx];
        if (item) {
            setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, date: item.date, regime: item.regime });
        }
    }, [filtered]);

    const handleMouseLeave = useCallback(() => setTooltip(null), []);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || filtered.length === 0) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        const idx = Math.min(Math.max(Math.floor(pct * filtered.length), 0), filtered.length - 1);
        const item = filtered[idx];
        if (item) {
            setModalRegime(item.regime);
            setTooltip(null);
        }
    }, [filtered]);

    const isDark = theme === 'dark';

    if (loading) {
        return compact ? null : (
            <div className="p-6 rounded-xl border bg-card">
                <div className="flex items-center justify-center h-[180px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Loading timeline…
                    </div>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="mt-3 relative" ref={timelineRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <div className="h-6 rounded-md overflow-hidden flex">
                    {segments.map((seg, i) => {
                        const width = ((seg.endIdx - seg.startIdx + 1) / filtered.length) * 100;
                        return (
                            <div
                                key={i}
                                className="h-full transition-opacity hover:opacity-80"
                                style={{
                                    width: `${width}%`,
                                    backgroundColor: REGIME_COLORS[seg.regime] || '#6b7280',
                                }}
                            />
                        );
                    })}
                </div>
                {/* Year labels */}
                <div className="relative h-4 mt-1">
                    {yearMarkers.map(({ year, position }) => (
                        <span
                            key={year + position}
                            className="absolute text-[9px] text-muted-foreground -translate-x-1/2"
                            style={{ left: `${position}%` }}
                        >
                            {year}
                        </span>
                    ))}
                </div>
                {tooltip && (
                    <TooltipBubble x={tooltip.x} y={tooltip.y} date={tooltip.date} regime={tooltip.regime} />
                )}
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="section-title text-lg tracking-tight">Regime Timeline</h2>
                <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-muted/50">
                    {DATE_PRESETS.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setDatePreset(p.value)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${datePreset === p.value
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline bar */}
            <div
                ref={timelineRef}
                className="relative cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                <div
                    className="h-16 rounded-lg overflow-hidden flex shadow-inner"
                    style={{ boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.06)' }}
                >
                    {segments.map((seg, i) => {
                        const width = ((seg.endIdx - seg.startIdx + 1) / filtered.length) * 100;
                        return (
                            <div
                                key={i}
                                className="h-full relative group"
                                style={{
                                    width: `${width}%`,
                                    backgroundColor: REGIME_COLORS[seg.regime] || '#6b7280',
                                }}
                            >
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                            </div>
                        );
                    })}
                </div>

                {/* Year axis */}
                <div className="relative h-5 mt-2">
                    {yearMarkers.map(({ year, position }) => (
                        <span
                            key={year + position}
                            className="absolute text-[10px] text-muted-foreground -translate-x-1/2 tabular-nums"
                            style={{ left: `${position}%` }}
                        >
                            {year}
                        </span>
                    ))}
                </div>

                {/* Tooltip */}
                {tooltip && (
                    <TooltipBubble x={tooltip.x} y={tooltip.y} date={tooltip.date} regime={tooltip.regime} />
                )}
            </div>

            {/* Legend below */}
            <div className="flex flex-wrap gap-3 pt-1">
                {regimeSummary.map(({ regime, months, pct }) => (
                    <div
                        key={regime}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/50 cursor-pointer hover:bg-muted/60 transition-colors"
                        onClick={() => setModalRegime(regime)}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: REGIME_COLORS[regime] || '#6b7280' }}
                        />
                        <div className="flex flex-col leading-tight">
                            <span className="text-xs font-medium text-foreground">{regime}</span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">{months} mo · {pct}%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Regime parameters modal */}
            {modalRegime && (
                <RegimeParametersModal
                    regime={modalRegime}
                    onClose={() => setModalRegime(null)}
                />
            )}
        </div>
    );
}

function TooltipBubble({ x, y, date, regime }: { x: number; y: number; date: string; regime: string }) {
    const [yr, mo] = date.split('-').map(Number);
    const label = new Date(yr, mo - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    return (
        <div
            className="absolute z-50 pointer-events-none px-3 py-2 rounded-lg bg-popover/95 backdrop-blur-sm border border-border shadow-xl text-xs -translate-x-1/2 -translate-y-full"
            style={{ left: x, top: y - 12 }}
        >
            <p className="font-semibold text-foreground">{label}</p>
            <p className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: REGIME_COLORS[regime] || '#6b7280' }}
                />
                {regime}
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Click for details</p>
        </div>
    );
}

function RegimeParametersModal({ regime, onClose }: { regime: string; onClose: () => void }) {
    const regimeKey = regime as RegimeFamily;
    const trigger = REGIME_TRIGGERS[regimeKey];
    const metadata = REGIME_METADATA[regimeKey];

    if (!trigger || !metadata) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
            <div
                className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-5 border-b border-border">
                    <span
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: REGIME_COLORS[regime] || '#6b7280' }}
                    />
                    <h3 className="text-base font-semibold text-foreground flex-1">{regime}</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Description */}
                    <p className="text-sm text-muted-foreground">{metadata.description}</p>

                    {/* Entry & Exit conditions stacked */}
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry</span>
                            </div>
                            <p className="text-sm font-mono text-foreground pl-3.5">{trigger.entryDescription}</p>
                        </div>
                        {trigger.exitDescription && (
                            <div className="space-y-1 pt-2 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exit</span>
                                </div>
                                <p className="text-sm font-mono text-foreground pl-3.5">{trigger.exitDescription}</p>
                            </div>
                        )}
                    </div>

                    {/* Guidance */}
                    <div className="rounded-lg border border-border bg-primary/5 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guidance</span>
                        </div>
                        <p className="text-sm text-foreground">{metadata.guidance}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
