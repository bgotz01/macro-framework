'use client';

import { useState, useEffect } from 'react';
import { REGIME_METADATA, determineNextRegime, type RegimeFamily } from '@/lib/regime-state-machine';
import type { RegimeData } from '@/components/regime/regime-parameters-types';
import CockpitGlossary from './cockpit-glossary';

interface MetricVal {
    value: number | null;
    percentile: number | null;
}

interface CockpitData {
    refDate: string | null;
    sp500Date: string | null;
    sp500: { price: number; date: string } | null;
    regime: {
        name: string; entryDate: string; months: number;
        trigger: string; color: string; description: string; guidance: string;
    } | null;
    liquidity: {
        regime: string; score: number;
        metrics: { real3M: MetricVal; real10Y: MetricVal; yieldCurve: MetricVal; realM2: MetricVal };
    };
    valuation: {
        regime: string; score: number;
        metrics: { eyp5yr: MetricVal; rey5yr: MetricVal; pe5yr: MetricVal; ey5yr: MetricVal };
    };
    price: { regime: string; score: number; cpi: MetricVal };
    trend: {
        direction: string; stage: string; pressure: string; risk: string;
        pressureColor: string; slope: number | null; divergence: number | null;
        streak: number | null; daysAbove: number | null;
    };
    inputs: { fedFunds: MetricVal; irx: MetricVal; tnx: MetricVal; cpi: MetricVal };
    signals: {
        all: { id: string; title: string; level: 'risk-off' | 'risk-on'; priority: number; active: boolean; detail: string; tooltip: string; date: string | null }[];
        active: { id: string; title: string; level: 'risk-off' | 'risk-on'; priority: number; active: boolean; detail: string; tooltip: string; date: string | null }[];
        highest: { id: string; title: string; level: 'risk-off' | 'risk-on'; priority: number; active: boolean; detail: string; tooltip: string; date: string | null };
    };
    proximityData: RegimeData;
}

function fmt(v: number | null, decimals = 1): string {
    if (v === null) return '—';
    return v.toFixed(decimals);
}

function pctColor(p: number | null, invert = false): string {
    if (p === null) return 'text-muted-foreground';
    const v = invert ? 100 - p : p;
    if (v >= 90) return 'text-red-500';
    if (v >= 75) return 'text-yellow-500';
    if (v <= 10) return 'text-green-500';
    if (v <= 25) return 'text-green-400';
    return 'text-muted-foreground';
}

function Metric({ label, value, unit = '%', percentile, invert = false, date = null }: {
    label: string; value: number | null; unit?: string; percentile: number | null; invert?: boolean; date?: string | null;
}) {
    const fmtDate = (d: string) => {
        const [y, m] = d.split('-');
        return `${new Date(+y, +m - 1).toLocaleString('default', { month: 'short' })} ${y}`;
    };
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                {date && <span className="text-[9px] font-mono text-muted-foreground/50">{fmtDate(date)}</span>}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-medium">{fmt(value)}{value !== null ? unit : ''}</span>
                {percentile !== null && (
                    <span className={`text-[10px] font-mono ${pctColor(percentile, invert)}`}>
                        P{Math.round(percentile)}
                    </span>
                )}
            </div>
        </div>
    );
}

function SignalRow({ signal: s }: { signal: CockpitData['signals']['all'][0] }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const fmtDate = (d: string | null) => {
        if (!d) return null;
        const [y, m] = d.split('-');
        return `${new Date(+y, +m - 1).toLocaleString('default', { month: 'short' })} ${y}`;
    };
    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className={`flex items-center gap-2 cursor-default ${s.active ? '' : 'opacity-50'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.active
                    ? s.level === 'risk-off' ? 'bg-red-500' : 'bg-green-500'
                    : 'bg-muted-foreground/30'
                    }`} />
                <span className="text-xs flex-1">{s.title}</span>
                {s.active && (
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${s.level === 'risk-off'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-green-500/10 text-green-500'
                        }`}>
                        {s.level === 'risk-off' ? 'RISK-OFF' : 'RISK-ON'}
                    </span>
                )}
            </div>
            {showTooltip && (
                <div className="absolute left-0 bottom-full mb-1.5 z-50 w-64 p-2.5 rounded-lg shadow-lg bg-popover border border-border text-xs text-popover-foreground leading-relaxed">
                    <div className="font-semibold mb-1">{s.title}</div>
                    <p className="text-muted-foreground mb-1.5">{s.tooltip}</p>
                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{s.detail}</code>
                    {s.date && (
                        <div className="mt-1.5 text-[10px] text-muted-foreground/70 font-mono">as of {fmtDate(s.date)}</div>
                    )}
                </div>
            )}
        </div>
    );
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</div>
            {children}
        </div>
    );
}

// ── Live Snapshot ────────────────────────────────────────────────────────────

interface LiveData {
    tnx: { value: number | null; date: string | null };
    irx: { value: number | null; date: string | null };
    gspc: { value: number | null; date: string | null };
    cpi: { value: number | null; date: string | null };
    m2yoy: { value: number | null; date: string | null };
    eps5yr: { value: number | null; date: string | null };
    eps2yr: { value: number | null; date: string | null };
}

function LiveSnapshot() {
    const [live, setLive] = useState<LiveData | null>(null);
    const [cpiOverride, setCpiOverride] = useState<string>('');
    const [m2Override, setM2Override] = useState<string>('');
    const [defaults, setDefaults] = useState({ cpi: '', m2: '' });

    useEffect(() => {
        fetch('/api/cockpit-live')
            .then(r => r.json())
            .then((d: LiveData) => {
                const cpi = d.cpi.value?.toFixed(1) ?? '';
                const m2 = d.m2yoy.value?.toFixed(2) ?? '';
                setLive(d);
                setCpiOverride(cpi);
                setM2Override(m2);
                setDefaults({ cpi, m2 });
            });
    }, []);

    const isDirty = live && (cpiOverride !== defaults.cpi || m2Override !== defaults.m2);
    const reset = () => { setCpiOverride(defaults.cpi); setM2Override(defaults.m2); };

    if (!live) return (
        <div className="rounded-xl border border-border bg-card p-4 mt-3 animate-pulse h-32" />
    );

    const cpi = parseFloat(cpiOverride) || live.cpi.value || 0;
    const m2yoy = parseFloat(m2Override) || live.m2yoy.value || 0;
    const eps5yr = live.eps5yr.value || 0;
    const eps2yr = live.eps2yr.value || 0;
    const tnx = live.tnx.value ?? 0;
    const irx = live.irx.value ?? 0;
    const price = live.gspc.value ?? 0;

    const real10Y = tnx - cpi;
    const real3M = irx - cpi;
    const realM2 = m2yoy - cpi;
    const pe5yr = eps5yr > 0 && price > 0 ? price / eps5yr : null;
    const ey5yr = pe5yr !== null ? (1 / pe5yr) * 100 : null;
    const pe2yr = eps2yr > 0 && price > 0 ? price / eps2yr : null;
    const ey2yr = pe2yr !== null ? (1 / pe2yr) * 100 : null;
    const eyp = ey5yr !== null ? ey5yr - irx : null;
    const realEY = ey5yr !== null ? ey5yr - cpi : null;

    const liveRegime = determineNextRegime(null, {
        rey: realEY, eyp, real10Y, real3M, realM2,
        liquidityScore: 0, stage: 'N/A', pressure: 'N/A', risk: 'N/A', direction: 'N/A', trendAge: null,
    }, new Date().toISOString().split('T')[0]);
    const liveRegimeMeta = REGIME_METADATA[liveRegime.regime];

    const fmtDate = (d: string | null) => {
        if (!d) return '—';
        const [y, m, day] = d.split('-').map(Number);
        return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const row = (label: string, value: number | null, date: string | null, unit = '%', decimals = 2, color?: string) => (
        <div className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground/50 font-mono">{fmtDate(date)}</span>
            </div>
            <span className={`text-xs font-mono font-medium ${color ?? ''}`}>
                {value !== null ? `${value.toFixed(decimals)}${unit}` : '—'}
            </span>
        </div>
    );

    // Color helpers for derived metrics
    const signColor = (v: number | null, goodPositive = true) => {
        if (v === null) return '';
        if (goodPositive) return v > 0 ? 'text-green-500' : v < -1 ? 'text-red-500' : 'text-yellow-500';
        return v < 0 ? 'text-green-500' : v > 1 ? 'text-red-500' : 'text-yellow-500';
    };
    const peColor = (v: number | null) => {
        if (v === null) return '';
        if (v < 20) return 'text-green-500';
        if (v > 30) return 'text-red-500';
        return 'text-yellow-500';
    };

    const editRow = (label: string, date: string | null, value: string, onChange: (v: string) => void) => (
        <div className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground/50 font-mono">{fmtDate(date)}</span>
            </div>
            <input
                type="number" step="0.1" value={value}
                onChange={e => onChange(e.target.value)}
                className="w-16 text-xs font-mono text-right bg-muted rounded px-1.5 py-0.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
        </div>
    );

    return (
        <div className="rounded-xl border border-border bg-card p-4 mt-3 mb-3">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Live Snapshot — Daily</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Derived */}
                <div>
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Derived (live)</div>
                    {row('Real 10Y', real10Y, live.tnx.date, '%', 2, signColor(real10Y))}
                    {row('Real 3M', real3M, live.irx.date, '%', 2, signColor(real3M))}
                    {row('Real M2', realM2, live.m2yoy.date, '%', 2, signColor(realM2))}
                    {row('EYP 5yr', eyp, live.gspc.date, '%', 2, signColor(eyp))}
                    {row('Real EY 5yr', realEY, live.gspc.date, '%', 2, signColor(realEY))}
                </div>

                {/* Macro inputs */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Macro <span className="normal-case font-normal text-muted-foreground/60">(editable)</span>
                        </div>
                        {isDirty && (
                            <button
                                onClick={reset}
                                className="text-[9px] text-primary hover:underline font-medium"
                            >
                                reset
                            </button>
                        )}
                    </div>
                    {editRow('CPI YoY', live.cpi.date, cpiOverride, setCpiOverride)}
                    {editRow('M2 YoY', live.m2yoy.date, m2Override, setM2Override)}
                    {row('EY 5yr', ey5yr, live.eps5yr.date, '%', 2, signColor(ey5yr))}
                    {row('EY 2yr', ey2yr, live.eps2yr.date, '%', 2, signColor(ey2yr))}
                    {row('PE 5yr', pe5yr, live.gspc.date, 'x', 1, peColor(pe5yr))}
                    {row('PE 2yr', pe2yr, live.gspc.date, 'x', 1, peColor(pe2yr))}
                </div>

                {/* Market */}
                <div>
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Market</div>
                    {row('10Y Yield', live.tnx.value, live.tnx.date)}
                    {row('3M Yield', live.irx.value, live.irx.date)}
                    {row('S&P 500', live.gspc.value, live.gspc.date, '', 0)}
                </div>
            </div>

            {/* Live Regime */}
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-3 flex-wrap">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Live Regime</div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: liveRegimeMeta.color }} />
                    <span className="text-sm font-bold" style={{ color: liveRegimeMeta.color }}>{liveRegime.regime}</span>
                </div>
                <span className="text-xs text-muted-foreground">—</span>
                <span className="text-xs text-muted-foreground">{liveRegimeMeta.guidance}</span>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────



const PROXIMITY_DEFS = [
    { regime: 'Liquidity Shock' as RegimeFamily, conditions: [{ dataKey: 'realM2' as keyof RegimeData, threshold: 10, direction: 'gte' as const, range: 8 }], logic: 'AND' as const },
    { regime: 'Crisis' as RegimeFamily, conditions: [{ dataKey: 'real10Y' as keyof RegimeData, threshold: -1, direction: 'lte' as const, range: 3 }, { dataKey: 'realM2' as keyof RegimeData, threshold: 5, direction: 'lte' as const, range: 6 }], logic: 'AND' as const },
    { regime: 'Bond Stress' as RegimeFamily, conditions: [{ dataKey: 'real10Y' as keyof RegimeData, threshold: -0.5, direction: 'lte' as const, range: 3 }, { dataKey: 'real3M' as keyof RegimeData, threshold: -1, direction: 'lte' as const, range: 3 }], logic: 'AND' as const },
    { regime: 'Overvaluation' as RegimeFamily, conditions: [{ dataKey: 'eyp5yr' as keyof RegimeData, threshold: -2.5, direction: 'lte' as const, range: 3 }, { dataKey: 'rey5yr' as keyof RegimeData, threshold: -0.5, direction: 'lte' as const, range: 3 }], logic: 'OR' as const },
    { regime: 'Broad Growth' as RegimeFamily, conditions: [{ dataKey: 'rey5yr' as keyof RegimeData, threshold: 3, direction: 'gte' as const, range: 4 }], logic: 'AND' as const },
    { regime: 'Long Duration' as RegimeFamily, conditions: [{ dataKey: 'eyp5yr' as keyof RegimeData, threshold: 0, direction: 'lte' as const, range: 3 }, { dataKey: 'real10Y' as keyof RegimeData, threshold: 1, direction: 'gte' as const, range: 3 }], logic: 'AND' as const },
];

function condProximity(value: number | null, threshold: number, direction: 'lte' | 'gte', range: number): number {
    if (value === null) return 0;
    if (direction === 'lte') {
        if (value <= threshold) return 100;
        const d = value - threshold;
        return d >= range ? 0 : Math.round(((range - d) / range) * 100);
    } else {
        if (value >= threshold) return 100;
        const d = threshold - value;
        return d >= range ? 0 : Math.round(((range - d) / range) * 100);
    }
}

function getTop2Proximity(data: RegimeData, currentRegime?: string) {
    return PROXIMITY_DEFS
        .map(def => {
            const proximities = def.conditions.map(c => condProximity(data[c.dataKey].value, c.threshold, c.direction, c.range));
            const overall = def.logic === 'OR'
                ? Math.max(...proximities)
                : Math.min(...proximities);
            const allMet = def.logic === 'OR'
                ? proximities.some(p => p === 100)
                : proximities.every(p => p === 100);
            return { regime: def.regime, overall, allMet };
        })
        .filter(r => r.regime !== currentRegime)
        .sort((a, b) => b.overall - a.overall)
        .slice(0, 2);
}

// ────────────────────────────────────────────────────────────────────────────

export default function CockpitClient({ data }: { data: CockpitData }) {
    const { regime, liquidity, valuation, price, trend, signals, sp500, sp500Date, refDate, proximityData } = data;
    const top2 = getTop2Proximity(proximityData, regime?.name);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
                <h2
                    className="text-2xl font-light tracking-wider mb-1"
                    style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}
                >
                    COCKPIT
                </h2>
                <p className="text-xs text-muted-foreground">
                    {sp500Date ? (() => { const [y, m, d] = sp500Date.split('-').map(Number); return `Data as of ${new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`; })() : ''}
                    {sp500 ? ` • S&P 500: ${sp500.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ''}
                </p>
            </div>

            {/* Live Snapshot */}
            <LiveSnapshot />

            {/* Section divider */}
            <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Monthly — Last Close</span>
                <div className="flex-1 h-px bg-border" />
                <CockpitGlossary />
            </div>

            {/* Row 1: Regime + Signals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {/* Active Regime + Proximity — spans 2 cols */}
                <div className="md:col-span-2 rounded-xl border-2 bg-card p-5" style={{ borderColor: regime?.color ?? '#6b7280' }}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Active Regime — Monthly</div>
                            <div className="text-[10px] text-muted-foreground/60 mb-1">
                                {refDate ? (() => { const [y, m, d] = refDate.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })() : ''}
                            </div>
                            <div className="text-2xl font-bold mb-1" style={{ color: regime?.color }}>{regime?.name ?? 'Unknown'}</div>
                            <p className="text-xs text-muted-foreground mb-2">{regime?.description}</p>
                            <p className="text-xs font-medium" style={{ color: regime?.color }}>{regime?.guidance}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                            <div className="text-xs text-muted-foreground">
                                Since {regime ? new Date(regime.entryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                            </div>
                            <div className="text-lg font-mono font-bold text-muted-foreground">{regime?.months ?? 0}mo</div>
                        </div>
                    </div>
                    {/* Proximity */}
                    <div className="border-t border-border/40 pt-3">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Regime Proximity</div>
                        <div className="space-y-2">
                            {top2.map(r => {
                                const meta = REGIME_METADATA[r.regime];
                                return (
                                    <div key={r.regime} className="flex items-center gap-2 h-6">
                                        <div className="flex items-center gap-1.5 w-[130px] flex-shrink-0">
                                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                                            <span className="text-xs text-muted-foreground truncate">{r.regime}</span>
                                        </div>
                                        <div className="flex-1 h-4 rounded overflow-hidden relative" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                                            <div
                                                className="h-full rounded transition-all duration-500"
                                                style={{ width: `${r.overall}%`, backgroundColor: meta.color, opacity: r.allMet ? 0.9 : 0.5 }}
                                            />
                                            {r.allMet && (
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white drop-shadow-sm">TRIGGERED</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-mono w-[36px] text-right flex-shrink-0 text-muted-foreground">
                                            {r.overall}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Signals */}
                <Card title="Signals">
                    <div className="space-y-2">
                        {signals.all.map(s => (
                            <SignalRow key={s.id} signal={s} />
                        ))}
                    </div>
                </Card>
            </div>

            {/* Row 2: Liquidity + Valuation + Price + Trend */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                {/* Liquidity */}
                <Card title="Liquidity">
                    <div className="text-center mb-3">
                        <div className="text-lg font-bold">{liquidity.regime}</div>
                    </div>
                    <Metric label="Real 3M" value={liquidity.metrics.real3M.value} percentile={liquidity.metrics.real3M.percentile} date={proximityData.real3M.date} />
                    <Metric label="Real 10Y" value={liquidity.metrics.real10Y.value} percentile={liquidity.metrics.real10Y.percentile} date={proximityData.real10Y.date} />
                    <Metric label="Yield Curve" value={liquidity.metrics.yieldCurve.value} percentile={liquidity.metrics.yieldCurve.percentile} date={proximityData.yieldCurve.date} />
                    <Metric label="Real M2" value={liquidity.metrics.realM2.value} percentile={liquidity.metrics.realM2.percentile} invert date={proximityData.realM2.date} />
                </Card>

                {/* Valuation */}
                <Card title="Valuation">
                    <div className="text-center mb-3">
                        <div className="text-lg font-bold">{valuation.regime}</div>
                    </div>
                    <Metric label="EYP 5yr" value={valuation.metrics.eyp5yr.value} percentile={valuation.metrics.eyp5yr.percentile} invert date={proximityData.eyp5yr.date} />
                    <Metric label="Real EY 5yr" value={valuation.metrics.rey5yr.value} percentile={valuation.metrics.rey5yr.percentile} invert date={proximityData.rey5yr.date} />
                    <Metric label="PE 5yr" value={valuation.metrics.pe5yr.value} unit="x" percentile={valuation.metrics.pe5yr.percentile} date={proximityData.pe5yr.date} />
                    <Metric label="EY 5yr" value={valuation.metrics.ey5yr.value} percentile={valuation.metrics.ey5yr.percentile} invert date={proximityData.ey5yr.date} />
                </Card>

                {/* Price Environment */}
                <Card title="Price Environment">
                    <div className="text-center mb-3">
                        <div className="text-lg font-bold">{price.regime}</div>
                    </div>
                    <Metric label="CPI YoY" value={price.cpi.value} percentile={price.cpi.percentile} date={proximityData.cpi.date} />
                    <Metric label="Fed Funds" value={data.inputs.fedFunds.value} percentile={data.inputs.fedFunds.percentile} date={proximityData.fedFunds.date} />
                </Card>

                {/* Trend Pressure */}
                <Card title="Trend Pressure">
                    <div className="text-center mb-3">
                        <div className="text-lg font-bold">{trend.direction}</div>
                        <div className="text-xs" style={{ color: trend.pressureColor }}>{trend.pressure} Pressure</div>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                        <span className="text-xs text-muted-foreground">Stage</span>
                        <span className="text-sm font-medium">{trend.stage}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                        <span className="text-xs text-muted-foreground">Risk</span>
                        <span className="text-sm font-medium">{trend.risk}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                        <span className="text-xs text-muted-foreground">200MA Slope</span>
                        <span className="text-sm font-mono">{fmt(trend.slope, 3)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                        <span className="text-xs text-muted-foreground">Divergence</span>
                        <span className="text-sm font-mono">{fmt(trend.divergence)}%</span>
                    </div>
                </Card>
            </div>

            {/* Row 3: Quick context */}
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Signal</div>
                <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${signals.highest.level === 'risk-off' ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className="text-sm font-semibold">{signals.highest.title}</span>
                    <span className="text-xs text-muted-foreground">—</span>
                    <span className="text-xs text-muted-foreground">{signals.highest.detail}</span>
                </div>
            </div>
        </div>
    );
}
