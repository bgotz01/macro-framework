'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../theme-provider';

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
    'Normal': '#6b7280',
};

export function getRegimeColor(regime: string, extraColors?: Record<string, string>): string {
    return extraColors?.[regime] ?? REGIME_COLORS[regime] ?? '#06b6d4';
}

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
];

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const [y, m] = d.date.split('-').map(Number);
    const label = new Date(y, m - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    return (
        <div className="bg-background border-2 border-border rounded-lg p-3 shadow-lg text-sm">
            <p className="font-semibold">{label}</p>
            <p className="flex items-center gap-2 mt-1">
                <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: REGIME_COLORS[d.regime] || '#6b7280' }}
                />
                {d.regime}
            </p>
        </div>
    );
}

export default function RegimeTimelineBarChart({ compact = false }: { compact?: boolean }) {
    const [data, setData] = useState<RegimeMonth[]>([]);
    const [loading, setLoading] = useState(true);
    const [datePreset, setDatePreset] = useState<string>('all');
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

    const chartData = useMemo(() => {
        return filtered.map(d => ({ date: d.date, regime: d.regime, value: 1 }));
    }, [filtered]);

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

    const yearTicks = useMemo(() => {
        if (chartData.length === 0) return [];
        const ticks: string[] = [];
        let lastYear = '';
        const interval = chartData.length > 240 ? 5 : chartData.length > 120 ? 2 : 1;
        for (const d of chartData) {
            const year = d.date.substring(0, 4);
            if (year !== lastYear) {
                if (interval === 1 || parseInt(year) % interval === 0) {
                    ticks.push(d.date);
                }
                lastYear = year;
            }
        }
        return ticks;
    }, [chartData]);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#9ca3af' : '#6b7280';

    if (loading) {
        return compact ? null : (
            <div className="p-6 rounded-xl border bg-card">
                <div className="text-center text-muted-foreground">Loading regime timeline...</div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="mt-3">
                <ResponsiveContainer width="100%" height={40}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={0} barGap={0}>
                        <XAxis
                            dataKey="date"
                            stroke={textColor}
                            ticks={yearTicks}
                            tick={{ fontSize: 9 }}
                            tickFormatter={v => v.substring(0, 4)}
                            axisLine={false}
                            tickLine={false}
                            height={14}
                        />
                        <YAxis hide domain={[0, 1]} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar dataKey="value" isAnimationActive={false}>
                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={REGIME_COLORS[entry.regime] || '#6b7280'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-xl border bg-card">
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Regime Timeline</h2>
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
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {regimeSummary.map(({ regime, months, pct }) => (
                        <span key={regime} className="flex items-center gap-1.5">
                            <span
                                className="inline-block w-3 h-3 rounded-sm"
                                style={{ backgroundColor: REGIME_COLORS[regime] || '#6b7280' }}
                            />
                            <span className="text-muted-foreground">
                                {regime} <span className="font-mono">{months}mo ({pct}%)</span>
                            </span>
                        </span>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={0} barGap={0}>
                    <XAxis
                        dataKey="date"
                        stroke={textColor}
                        ticks={yearTicks}
                        tick={{ fontSize: 11 }}
                        tickFormatter={v => v.substring(0, 4)}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis hide domain={[0, 1]} />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar dataKey="value" isAnimationActive={false}>
                        {chartData.map((entry, index) => (
                            <Cell key={index} fill={REGIME_COLORS[entry.regime] || '#6b7280'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
