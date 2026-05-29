'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useTheme } from '@/components/theme-provider';
import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataPoint {
    date: string;
    liquidityShock: number;
    crisis: number;
    bondStress: number;
    overvaluation: number;
    broadGrowth: number;
    longDuration: number;
}

type RegimeKey = keyof Omit<DataPoint, 'date'>;
type CategoryFilter = 'all' | 'buy' | 'sell';

interface RegimeConfig {
    key: RegimeKey;
    label: RegimeFamily;
    color: string;
    category: 'buy' | 'sell';
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BUY_KEYS: RegimeKey[] = ['broadGrowth', 'longDuration', 'liquidityShock'];
const SELL_KEYS: RegimeKey[] = ['crisis', 'bondStress', 'overvaluation'];

const REGIMES: RegimeConfig[] = [
    // BUY group
    { key: 'broadGrowth', label: 'Broad Growth', color: REGIME_METADATA['Broad Growth'].color, category: 'buy' },
    { key: 'longDuration', label: 'Long Duration', color: REGIME_METADATA['Long Duration'].color, category: 'buy' },
    { key: 'liquidityShock', label: 'Liquidity Shock', color: REGIME_METADATA['Liquidity Shock'].color, category: 'buy' },
    // SELL group
    { key: 'crisis', label: 'Crisis', color: REGIME_METADATA['Crisis'].color, category: 'sell' },
    { key: 'bondStress', label: 'Bond Stress', color: REGIME_METADATA['Bond Stress'].color, category: 'sell' },
    { key: 'overvaluation', label: 'Overvaluation', color: REGIME_METADATA['Overvaluation'].color, category: 'sell' },
];

const DATE_PRESETS = [
    { label: 'All Time', value: 'all' },
    { label: '1960s', value: '1960s', start: '1960-01-01', end: '1969-12-31' },
    { label: '1970s', value: '1970s', start: '1970-01-01', end: '1979-12-31' },
    { label: '1980s', value: '1980s', start: '1980-01-01', end: '1989-12-31' },
    { label: '1990s', value: '1990s', start: '1990-01-01', end: '1999-12-31' },
    { label: '2000s', value: '2000s', start: '2000-01-01', end: '2009-12-31' },
    { label: '2010s', value: '2010s', start: '2010-01-01', end: '2019-12-31' },
    { label: '2020s', value: '2020s', start: '2020-01-01', end: '2029-12-31' },
    { label: 'Last 5Y', value: '5y' },
    { label: 'Last 10Y', value: '10y' },
    { label: 'Last 20Y', value: '20y' },
    { label: 'Custom', value: 'custom' },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function DatePresetSelector({
    datePreset,
    setDatePreset,
    customStart,
    customEnd,
    setCustomStart,
    setCustomEnd,
    dataRange,
}: {
    datePreset: string;
    setDatePreset: (v: string) => void;
    customStart: string;
    customEnd: string;
    setCustomStart: (v: string) => void;
    setCustomEnd: (v: string) => void;
    dataRange: { min: string; max: string };
}) {
    const [open, setOpen] = useState(false);
    const selected = DATE_PRESETS.find(p => p.value === datePreset);

    return (
        <div className="mb-4 space-y-2">
            {/* Mobile */}
            <div className="sm:hidden border border-border rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors min-h-[44px]"
                >
                    <span>Date Range: {selected?.label}</span>
                    <span className="text-base leading-none">{open ? '▲' : '▼'}</span>
                </button>
                {open && (
                    <div className="border-t border-border bg-muted/20">
                        <div className="grid grid-cols-3 gap-2 p-3">
                            {DATE_PRESETS.map(p => (
                                <button
                                    type="button"
                                    key={p.value}
                                    onClick={() => { setDatePreset(p.value); if (p.value !== 'custom') setOpen(false); }}
                                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all min-h-[36px] ${datePreset === p.value
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-background text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {datePreset === 'custom' && (
                            <div className="border-t border-border p-3 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-muted-foreground w-12">From</label>
                                    <input
                                        type="date"
                                        value={customStart}
                                        max={customEnd || undefined}
                                        onChange={e => setCustomStart(e.target.value)}
                                        className="flex-1 px-2 py-1.5 rounded-md border border-border bg-background text-foreground text-xs min-h-[36px]"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-muted-foreground w-12">To</label>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        min={customStart || undefined}
                                        onChange={e => setCustomEnd(e.target.value)}
                                        className="flex-1 px-2 py-1.5 rounded-md border border-border bg-background text-foreground text-xs min-h-[36px]"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop */}
            <div className="hidden sm:flex sm:flex-wrap gap-2 items-center">
                {DATE_PRESETS.map(p => (
                    <button
                        type="button"
                        key={p.value}
                        onClick={() => setDatePreset(p.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${datePreset === p.value
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Custom date inputs (desktop) */}
            {datePreset === 'custom' && (
                <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">From</label>
                        <input
                            type="date"
                            value={customStart}
                            max={customEnd || undefined}
                            onChange={e => setCustomStart(e.target.value)}
                            className="px-2 py-1 rounded-md border border-border bg-background text-foreground text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">To</label>
                        <input
                            type="date"
                            value={customEnd}
                            min={customStart || undefined}
                            onChange={e => setCustomEnd(e.target.value)}
                            className="px-2 py-1 rounded-md border border-border bg-background text-foreground text-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function RegimeToggle({
    visible,
    toggle,
    category,
    setCategory,
}: {
    visible: Set<RegimeKey>;
    toggle: (key: RegimeKey) => void;
    category: CategoryFilter;
    setCategory: (c: CategoryFilter) => void;
}) {
    const buyRegimes = REGIMES.filter(r => r.category === 'buy');
    const sellRegimes = REGIMES.filter(r => r.category === 'sell');

    return (
        <div className="mb-4 space-y-2">
            {/* Category toggles */}
            <div className="flex items-center gap-2">
                {([
                    { value: 'all', label: 'All' },
                    { value: 'buy', label: '↑ Buy' },
                    { value: 'sell', label: '↓ Sell' },
                ] as { value: CategoryFilter; label: string }[]).map(opt => (
                    <button
                        type="button"
                        key={opt.value}
                        onClick={() => setCategory(opt.value)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all ${category === opt.value
                            ? opt.value === 'buy'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                : opt.value === 'sell'
                                    ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400'
                                    : 'bg-primary/10 border-primary text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
                <span className="text-xs text-muted-foreground ml-1">— click regimes to toggle individually</span>
            </div>

            {/* Individual regime buttons, grouped */}
            <div className="flex flex-wrap gap-2">
                {/* BUY group */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mr-0.5">
                        Buy
                    </span>
                    {buyRegimes.map(r => {
                        const active = visible.has(r.key);
                        return (
                            <button
                                type="button"
                                key={r.key}
                                onClick={() => toggle(r.key)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all min-h-[28px]"
                                style={{
                                    backgroundColor: active ? r.color : 'transparent',
                                    color: active ? '#fff' : undefined,
                                    borderColor: active ? r.color : undefined,
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: active ? '#fff' : r.color }}
                                />
                                {r.label}
                            </button>
                        );
                    })}
                </div>

                {/* Divider */}
                <div className="w-px bg-border self-stretch mx-1" />

                {/* SELL group */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500 dark:text-red-400 mr-0.5">
                        Sell
                    </span>
                    {sellRegimes.map(r => {
                        const active = visible.has(r.key);
                        return (
                            <button
                                type="button"
                                key={r.key}
                                onClick={() => toggle(r.key)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all min-h-[28px]"
                                style={{
                                    backgroundColor: active ? r.color : 'transparent',
                                    color: active ? '#fff' : undefined,
                                    borderColor: active ? r.color : undefined,
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: active ? '#fff' : r.color }}
                                />
                                {r.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface RegimeProximityChartProps {
    height?: number;
}

export default function RegimeProximityChart({ height = 420 }: RegimeProximityChartProps) {
    const [raw, setRaw] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [datePreset, setDatePreset] = useState('10y');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [category, setCategory] = useState<CategoryFilter>('all');
    const [visible, setVisible] = useState<Set<RegimeKey>>(
        new Set(REGIMES.map(r => r.key))
    );
    const { theme } = useTheme();

    // Compute the min/max dates available in the dataset
    const dataRange = useMemo(() => {
        if (!raw.length) return { min: '1960-01-01', max: '2029-12-31' };
        return { min: raw[0].date, max: raw[raw.length - 1].date };
    }, [raw]);

    // Initialize custom range to last 5 years when data loads
    useEffect(() => {
        if (raw.length && !customStart && !customEnd) {
            const end = raw[raw.length - 1].date;
            const startDate = new Date(end);
            startDate.setFullYear(startDate.getFullYear() - 5);
            setCustomStart(startDate.toISOString().split('T')[0]);
            setCustomEnd(end);
        }
    }, [raw, customStart, customEnd]);

    // Sync visible set when category toggle changes
    const handleSetCategory = useCallback((c: CategoryFilter) => {
        setCategory(c);
        if (c === 'all') setVisible(new Set(REGIMES.map(r => r.key)));
        if (c === 'buy') setVisible(new Set(BUY_KEYS));
        if (c === 'sell') setVisible(new Set(SELL_KEYS));
    }, []);

    // When individual toggle is clicked, revert category to 'all' if it no longer matches
    const toggle = useCallback((key: RegimeKey) => {
        setVisible(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);

            // Update category pill to reflect current state
            const hasBuy = BUY_KEYS.every(k => next.has(k)) && SELL_KEYS.every(k => !next.has(k));
            const hasSell = SELL_KEYS.every(k => next.has(k)) && BUY_KEYS.every(k => !next.has(k));
            const hasAll = REGIMES.every(r => next.has(r.key));
            setCategory(hasAll ? 'all' : hasBuy ? 'buy' : hasSell ? 'sell' : 'all');

            return next;
        });
    }, []);

    useEffect(() => {
        fetch('/api/regime-proximity-history')
            .then(r => r.json())
            .then(json => setRaw(json.data ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        if (!raw.length) return [];
        if (datePreset === 'all') return raw;

        if (datePreset === 'custom') {
            if (!customStart || !customEnd) return raw;
            return raw.filter(d => d.date >= customStart && d.date <= customEnd);
        }

        const preset = DATE_PRESETS.find(p => p.value === datePreset);
        if (preset && 'start' in preset) {
            return raw.filter(d => d.date >= preset.start && d.date <= preset.end);
        }

        const years = datePreset === '5y' ? 5 : datePreset === '10y' ? 10 : 20;
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - years);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        return raw.filter(d => d.date >= cutoffStr);
    }, [raw, datePreset, customStart, customEnd]);

    const yearlyTicks = useMemo(() => {
        if (!filtered.length) return [];
        const firstYr = parseInt(filtered[0].date.split('-')[0]);
        const lastYr = parseInt(filtered[filtered.length - 1].date.split('-')[0]);
        const span = lastYr - firstYr;
        const step = span > 30 ? 10 : span > 15 ? 5 : span > 8 ? 2 : 1;
        return filtered
            .filter((d, i) => {
                const yr = parseInt(d.date.split('-')[0]);
                const prev = i > 0 ? parseInt(filtered[i - 1].date.split('-')[0]) : null;
                return yr !== prev && yr % step === 0;
            })
            .map(d => d.date);
    }, [filtered]);

    const isDark = theme === 'dark';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const textColor = isDark ? '#9ca3af' : '#6b7280';

    const visibleRegimes = useMemo(() => REGIMES.filter(r => visible.has(r.key)), [visible]);

    const tooltipContent = useCallback(({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0].payload as DataPoint;
        const [y, m, dy] = d.date.split('-').map(Number);
        const dateStr = new Date(y, m - 1, dy).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short',
        });

        const buyItems = REGIMES.filter(r => r.category === 'buy' && visible.has(r.key)).map(r => ({ ...r, value: d[r.key] }));
        const sellItems = REGIMES.filter(r => r.category === 'sell' && visible.has(r.key)).map(r => ({ ...r, value: d[r.key] }));

        const renderGroup = (items: typeof buyItems, label: string, labelColor: string) =>
            items.length > 0 ? (
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: labelColor }}>
                        {label}
                    </p>
                    {items.sort((a, b) => b.value - a.value).map(r => (
                        <div key={r.key} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                                <span className="text-muted-foreground">{r.label}</span>
                            </div>
                            <span className="font-mono font-semibold" style={{ color: r.value >= 100 ? r.color : undefined }}>
                                {r.value}%
                            </span>
                        </div>
                    ))}
                </div>
            ) : null;

        return (
            <div className="bg-background border border-border rounded-lg p-3 shadow-lg text-xs space-y-2 min-w-[170px]">
                <p className="font-semibold text-sm">{dateStr}</p>
                {renderGroup(buyItems, 'Buy', '#10b981')}
                {renderGroup(sellItems, 'Sell', '#ef4444')}
            </div>
        );
    }, [visible]);

    if (loading) {
        return (
            <div className="p-6 rounded-xl border bg-card text-center text-muted-foreground">
                Loading proximity history…
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300">
            <div className="mb-5">
                <h3 className="section-title text-lg text-foreground">Regime Proximity</h3>
                <p className="text-xs text-muted-foreground mt-1 tracking-wide">
                    How close each regime's entry conditions were to triggering, per month (0–100%)
                </p>
                <div className="mt-2 h-px w-full max-w-[120px] bg-gradient-to-r from-foreground/20 to-transparent" />
            </div>

            <DatePresetSelector
                datePreset={datePreset}
                setDatePreset={setDatePreset}
                customStart={customStart}
                customEnd={customEnd}
                setCustomStart={setCustomStart}
                setCustomEnd={setCustomEnd}
                dataRange={dataRange}
            />
            <RegimeToggle
                visible={visible}
                toggle={toggle}
                category={category}
                setCategory={handleSetCategory}
            />

            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={filtered} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                        dataKey="date"
                        ticks={yearlyTicks}
                        tickFormatter={d => d.split('-')[0]}
                        tick={{ fontSize: 11, fill: textColor }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={v => `${v}%`}
                        tick={{ fontSize: 11, fill: textColor }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                    />
                    <Tooltip content={tooltipContent} />
                    <ReferenceLine y={100} stroke={isDark ? '#4b5563' : '#d1d5db'} strokeDasharray="4 2" />

                    {visibleRegimes.map(r => (
                        <Line
                            key={r.key}
                            type="monotone"
                            dataKey={r.key}
                            stroke={r.color}
                            strokeWidth={1.5}
                            dot={false}
                            activeDot={{ r: 3, strokeWidth: 0 }}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>

            {/* Legend — grouped */}
            {visibleRegimes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                    {(['buy', 'sell'] as const).map(cat => {
                        const group = visibleRegimes.filter(r => r.category === cat);
                        if (!group.length) return null;
                        const latest = filtered[filtered.length - 1];
                        return (
                            <div key={cat} className="flex items-center gap-3 flex-wrap">
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${cat === 'buy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                                    }`}>
                                    {cat === 'buy' ? '↑ Buy' : '↓ Sell'}
                                </span>
                                {group.map(r => {
                                    const val = latest ? latest[r.key] : null;
                                    return (
                                        <div key={r.key} className="flex items-center gap-1.5 text-xs">
                                            <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: r.color }} />
                                            <span className="text-muted-foreground">{r.label}</span>
                                            {val !== null && (
                                                <span
                                                    className="font-mono font-medium"
                                                    style={{ color: val >= 100 ? r.color : undefined }}
                                                >
                                                    {val}%
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
