'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTheme } from '../theme-provider';

interface RegimeChartProps {
    height?: number;
}

interface ChartDataPoint {
    date: string;
    [key: string]: number | string | null | undefined;
}

const SERIES = [
    { value: 'rey5yr', label: 'Real EY-5yr (REY)', color: '#0d9488' },
    { value: 'eyp5yr', label: 'EYP-5yr', color: '#a78bfa' },
    { value: 'realm2yoy', label: 'Real M2 YoY', color: '#eab308' },
    { value: 'realyield3m', label: 'Real 3M', color: '#0891b2' },
    { value: 'realyield', label: 'Real 10Y', color: '#06d469' },
];

const DATE_PRESETS = [
    { label: 'All Time', value: 'all' },
    { label: '1970s', value: '1970s', start: '1970-01-01', end: '1979-12-31' },
    { label: '1980s', value: '1980s', start: '1980-01-01', end: '1989-12-31' },
    { label: '2000s', value: '2000s', start: '2000-01-01', end: '2009-12-31' },
    { label: '2020s', value: '2020s', start: '2020-01-01', end: '2029-12-31' },
    { label: 'Last 5Y', value: '5y' },
    { label: 'Last 10Y', value: '10y' },
    { label: 'Last 20Y', value: '20y' },
];

export default function RegimeChart({ height = 450 }: RegimeChartProps) {
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [metric, setMetric] = useState<'percentile' | 'value' | 'yoy'>('value');
    const [selected, setSelected] = useState<string[]>(['rey5yr']);
    const [datePreset, setDatePreset] = useState<string>('all');
    const { theme } = useTheme();

    useEffect(() => {
        fetch('/api/percentile-history')
            .then(r => r.json())
            .then(result => setData(result.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const getFilteredData = () => {
        if (data.length === 0) return [];
        if (datePreset === 'all') return data;

        let startDate: string | null = null;
        let endDate: string | null = null;

        if (['5y', '10y', '20y'].includes(datePreset)) {
            const years = datePreset === '5y' ? 5 : datePreset === '10y' ? 10 : 20;
            const now = new Date();
            startDate = new Date(now.getFullYear() - years, now.getMonth(), now.getDate()).toISOString().split('T')[0];
        } else {
            const preset = DATE_PRESETS.find(p => p.value === datePreset) as any;
            if (preset?.start) { startDate = preset.start; endDate = preset.end; }
        }

        let filtered = data;
        if (startDate) filtered = filtered.filter(d => d.date! >= startDate!);
        if (endDate) filtered = filtered.filter(d => d.date! <= endDate!);
        return filtered;
    };

    const toggle = (v: string) => {
        setSelected(prev => prev.includes(v)
            ? (prev.length > 1 ? prev.filter(s => s !== v) : prev)
            : [...prev, v]
        );
    };

    if (loading) {
        return (
            <div className="p-6 rounded-xl border bg-card">
                <div className="text-center text-muted-foreground">Loading regime chart...</div>
            </div>
        );
    }

    const filtered = getFilteredData().filter(point =>
        selected.some(s => point[`${s}_value`] !== null && point[`${s}_value`] !== undefined)
    );

    const isDark = theme === 'dark';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const textColor = isDark ? '#9ca3af' : '#6b7280';

    const yearlyTicks = filtered
        .filter((_, i) => {
            const year = parseInt(filtered[i].date!.toString().split('-')[0]);
            const prevYear = i > 0 ? parseInt(filtered[i - 1].date!.toString().split('-')[0]) : null;
            return year !== prevYear && year % 5 === 0;
        })
        .map(d => d.date);

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0].payload;
        const [y, m] = String(d.date).split('-').map(Number);
        const date = new Date(y, m - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        return (
            <div className="bg-background border-2 border-border rounded-lg p-3 shadow-lg text-sm space-y-1">
                <p className="font-semibold">{date}</p>
                {selected.map(sv => {
                    const s = SERIES.find(x => x.value === sv);
                    const key = metric === 'percentile' ? `${sv}_percentile` : metric === 'value' ? `${sv}_value` : `${sv}_yoy`;
                    const val = d[key];
                    if (val === null || val === undefined) return null;
                    const suffix = metric === 'percentile' ? 'th pctl' : metric === 'yoy' ? ' pts' : '%';
                    return (
                        <p key={sv}>
                            <span style={{ color: s?.color }}>{s?.label}:</span>{' '}
                            {metric === 'yoy' ? (
                                <span className={val > 0 ? 'text-red-500' : val < 0 ? 'text-green-500' : ''}>
                                    {val > 0 ? '+' : ''}{Number(val).toFixed(1)}{suffix}
                                </span>
                            ) : `${Number(val).toFixed(metric === 'percentile' ? 1 : 2)}${suffix}`}
                        </p>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-6 rounded-xl border bg-card">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Regime Parameters</h2>
                    {filtered.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            Latest: {(() => {
                                const [y, m, d] = String(filtered[filtered.length - 1].date).split('-').map(Number);
                                return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                            })()}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <label className="text-sm font-medium">View:</label>
                    <select
                        value={metric}
                        onChange={e => setMetric(e.target.value as any)}
                        className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-sm cursor-pointer hover:border-primary transition-colors"
                    >
                        <option value="percentile">Percentile Rank</option>
                        <option value="value">Actual Value</option>
                        <option value="yoy">Percentile Growth (YoY)</option>
                    </select>
                </div>

                {/* Date presets */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {DATE_PRESETS.map(p => (
                        <button
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

                {/* Series toggles */}
                <div className="flex flex-wrap gap-2">
                    {SERIES.map(s => (
                        <button
                            key={s.value}
                            onClick={() => toggle(s.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected.includes(s.value)
                                ? 'border-current opacity-100'
                                : 'border-border opacity-40'
                                }`}
                            style={{ color: s.color }}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={filtered} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="date"
                        stroke={textColor}
                        ticks={yearlyTicks}
                        tick={{ fontSize: 12 }}
                        tickFormatter={v => { const [y] = String(v).split('-'); return y; }}
                    />
                    <YAxis
                        stroke={textColor}
                        tick={{ fontSize: 12 }}
                        domain={metric === 'percentile' ? [0, 100] : ['auto', 'auto']}
                        tickFormatter={v => metric === 'percentile' ? `${v}%` : `${v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {metric === 'percentile' && (
                        <>
                            <ReferenceLine y={25} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
                            <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="3 3" strokeOpacity={0.5} />
                            <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                        </>
                    )}
                    {(metric === 'value' || metric === 'yoy') && (
                        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={2} />
                    )}

                    {selected.map(sv => {
                        const s = SERIES.find(x => x.value === sv);
                        if (!s) return null;
                        const key = metric === 'percentile' ? `${sv}_percentile` : metric === 'value' ? `${sv}_value` : `${sv}_yoy`;
                        return (
                            <Line
                                key={sv}
                                type="monotone"
                                dataKey={key}
                                stroke={s.color}
                                strokeWidth={2}
                                dot={false}
                                name={s.label}
                                connectNulls
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
