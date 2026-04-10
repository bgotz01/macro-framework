'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    ComposedChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useTheme } from '../theme-provider';

interface DataPoint {
    date: string;
    ma50: number;
    ma200: number;
    ma500: number;
    div_50_200: number;
    div_200_500: number;
}

interface Computed extends DataPoint {
    div_50_200_ma20: number;
    div_200_500_ma20: number;
}

const DATE_PRESETS = [
    { label: 'All Time', value: 'all' },
    { label: '1970s', value: '1970s', start: '1970-01-01', end: '1979-12-31' },
    { label: '1980s', value: '1980s', start: '1980-01-01', end: '1989-12-31' },
    { label: '1990s', value: '1990s', start: '1990-01-01', end: '1999-12-31' },
    { label: '2000s', value: '2000s', start: '2000-01-01', end: '2009-12-31' },
    { label: '2010s', value: '2010s', start: '2010-01-01', end: '2019-12-31' },
    { label: '2020s', value: '2020s', start: '2020-01-01', end: '2029-12-31' },
    { label: 'Last 5Y', value: '5y' },
    { label: 'Last 10Y', value: '10y' },
    { label: 'Last 20Y', value: '20y' },
] as const;

const COLOR_50_200 = '#6366f1'; // indigo
const COLOR_200_500 = '#06b6d4'; // cyan

type ViewMode = 'divergence' | 'price';
type IndexKey = 'sp500' | 'ndx';

export default function MaDivergenceChart({ height = 450 }: { height?: number }) {
    const [raw, setRaw] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [datePreset, setDatePreset] = useState<string>('10y');
    const [viewMode, setViewMode] = useState<ViewMode>('divergence');
    const [index, setIndex] = useState<IndexKey>('sp500');
    const [show50_200, setShow50_200] = useState(true);
    const [show200_500, setShow200_500] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        setLoading(true);
        fetch(`/api/ma-divergence?index=${index}`)
            .then(r => r.json())
            .then(json => setRaw(json.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [index]);

    const data = useMemo<Computed[]>(() => {
        return raw.map((d, i) => {
            const win = raw.slice(Math.max(0, i - 19), i + 1);
            const avg = (key: keyof DataPoint) =>
                parseFloat((win.reduce((s, r) => s + (r[key] as number), 0) / win.length).toFixed(3));
            return {
                ...d,
                div_50_200_ma20: avg('div_50_200'),
                div_200_500_ma20: avg('div_200_500'),
            };
        });
    }, [raw]);

    const filtered = useMemo(() => {
        if (!data.length) return [];
        if (datePreset === 'all') return data;
        const preset = DATE_PRESETS.find(p => p.value === datePreset);
        if (preset && 'start' in preset) {
            return data.filter(d => d.date >= preset.start && d.date <= preset.end);
        }
        const years = datePreset === '5y' ? 5 : datePreset === '10y' ? 10 : 20;
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - years);
        return data.filter(d => d.date >= cutoff.toISOString().split('T')[0]);
    }, [data, datePreset]);

    const yearlyTicks = useMemo(() => filtered
        .filter((d, i) => {
            const yr = parseInt(d.date.split('-')[0]);
            const prev = i > 0 ? parseInt(filtered[i - 1].date.split('-')[0]) : null;
            return yr !== prev && yr % 5 === 0;
        })
        .map(d => d.date), [filtered]);

    const isDark = theme === 'dark';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const latest = filtered[filtered.length - 1];

    const fmtDate = (date: string) => {
        const [y, m, d] = date.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0].payload as Computed;
        return (
            <div className="bg-background border-2 border-border rounded-lg p-3 shadow-lg text-sm space-y-1">
                <p className="font-semibold">{fmtDate(d.date)}</p>
                {viewMode === 'divergence' ? (
                    <>
                        {show50_200 && (
                            <p><span style={{ color: COLOR_50_200 }}>50/200 Div:</span> {d.div_50_200 > 0 ? '+' : ''}{d.div_50_200.toFixed(2)}%</p>
                        )}
                        {show200_500 && (
                            <p><span style={{ color: COLOR_200_500 }}>200/500 Div:</span> {d.div_200_500 > 0 ? '+' : ''}{d.div_200_500.toFixed(2)}%</p>
                        )}
                    </>
                ) : (
                    <>
                        <p><span style={{ color: '#f59e0b' }}>50MA:</span> {d.ma50.toFixed(0)}</p>
                        <p><span style={{ color: COLOR_50_200 }}>200MA:</span> {d.ma200.toFixed(0)}</p>
                        <p><span style={{ color: COLOR_200_500 }}>500MA:</span> {d.ma500.toFixed(0)}</p>
                    </>
                )}
            </div>
        );
    };

    if (loading) {
        return <div className="p-6 rounded-xl border bg-card text-center text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="p-6 rounded-xl border bg-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">MA Divergence</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">50/200MA and 200/500MA spread</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
                        {(['sp500', 'ndx'] as const).map(idx => (
                            <button
                                type="button"
                                key={idx}
                                onClick={() => setIndex(idx)}
                                className={`px-3 py-1.5 transition-colors ${index === idx
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                {idx === 'sp500' ? 'S&P 500' : 'NDX 100'}
                            </button>
                        ))}
                    </div>
                    <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
                        {(['divergence', 'price'] as const).map(mode => (
                            <button
                                type="button"
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1.5 transition-colors capitalize ${viewMode === mode
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                {mode === 'divergence' ? 'Divergence' : 'MA Levels'}
                            </button>
                        ))}
                    </div>
                    {latest && (
                        <div className="text-right text-xs space-y-0.5">
                            <p style={{ color: COLOR_50_200 }}>
                                50/200: <span className="font-bold text-sm">{latest.div_50_200 > 0 ? '+' : ''}{latest.div_50_200.toFixed(2)}%</span>
                            </p>
                            <p style={{ color: COLOR_200_500 }}>
                                200/500: <span className="font-bold text-sm">{latest.div_200_500 > 0 ? '+' : ''}{latest.div_200_500.toFixed(2)}%</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Show Lines */}
            {viewMode === 'divergence' && (
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-20 shrink-0">Show Lines:</span>
                    {[
                        { label: '50/200', active: show50_200, toggle: () => setShow50_200(s => !s), color: COLOR_50_200 },
                        { label: '200/500', active: show200_500, toggle: () => setShow200_500(s => !s), color: COLOR_200_500 },
                    ].map(({ label, active, toggle, color }) => (
                        <button
                            type="button"
                            key={label}
                            onClick={toggle}
                            className={`px-3 py-1 rounded-full text-xs font-medium border border-border transition-all ${active ? 'text-background' : 'bg-transparent text-muted-foreground'}`}
                            style={{ backgroundColor: active ? color : 'transparent' }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Date presets */}
            <div className="flex flex-wrap gap-2 mb-5">
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

            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={filtered} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="date"
                        stroke={textColor}
                        ticks={yearlyTicks}
                        tick={{ fontSize: 12 }}
                        tickFormatter={v => new Date(v).getFullYear().toString()}
                    />
                    <YAxis
                        stroke={textColor}
                        tick={{ fontSize: 12 }}
                        domain={['auto', 'auto']}
                        tickFormatter={v => viewMode === 'divergence' ? `${v}%` : v.toLocaleString()}
                        label={{
                            value: viewMode === 'divergence' ? 'Divergence (%)' : 'Price',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: textColor },
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {viewMode === 'divergence' && (
                        <ReferenceLine y={0} stroke={gridColor} strokeWidth={1.5} />
                    )}

                    {viewMode === 'divergence' && show50_200 && (
                        <Line
                            type="monotone"
                            dataKey="div_50_200"
                            stroke={COLOR_50_200}
                            strokeWidth={1.5}
                            dot={false}
                            name="50/200 Divergence"
                            connectNulls
                        />
                    )}
                    {viewMode === 'divergence' && show200_500 && (
                        <Line
                            type="monotone"
                            dataKey="div_200_500"
                            stroke={COLOR_200_500}
                            strokeWidth={1.5}
                            dot={false}
                            name="200/500 Divergence"
                            connectNulls
                        />
                    )}
                    {viewMode === 'price' && (<>
                        <Line type="monotone" dataKey="ma50" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="50MA" connectNulls />
                        <Line type="monotone" dataKey="ma200" stroke={COLOR_50_200} strokeWidth={1.5} dot={false} name="200MA" connectNulls />
                        <Line type="monotone" dataKey="ma500" stroke={COLOR_200_500} strokeWidth={1.5} dot={false} name="500MA" connectNulls />
                    </>
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-3 text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
                <p>
                    <span className="font-medium text-foreground">50/200 Divergence</span> = (50MA − 200MA) / 200MA × 100 &nbsp;·&nbsp;
                    <span className="font-medium text-foreground">200/500 Divergence</span> = (200MA − 500MA) / 500MA × 100
                </p>
                <p>Positive values mean the faster MA is above the slower MA (bullish alignment). Negative values indicate bearish crossover.</p>
            </div>
        </div>
    );
}
