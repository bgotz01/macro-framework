'use client';

import { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts';
import PageHeader from '@/components/page-header';
import { useTheme } from '@/components/theme-provider';
import type { IPORow } from '@/app/(app)/ipo-data/page';

type MetricKey = 'ipos' | 'firstDayEW' | 'firstDayPW' | 'firstDayMedian' | 'leftOnTable' | 'proceeds';

interface MetricDef {
    value: MetricKey;
    label: string;
    shortLabel: string;
    unit: string;
    isPercent: boolean;
}

const METRICS: MetricDef[] = [
    { value: 'ipos', label: 'Number of IPOs', shortLabel: 'IPOs', unit: '', isPercent: false },
    { value: 'firstDayEW', label: 'First-Day Return — Equal Weighted', shortLabel: 'Equal Weighted', unit: '%', isPercent: true },
    { value: 'firstDayPW', label: 'First-Day Return — Proceeds Weighted', shortLabel: 'Proceeds Weighted', unit: '%', isPercent: true },
    { value: 'firstDayMedian', label: 'First-Day Return — Median', shortLabel: 'Median', unit: '%', isPercent: true },
    { value: 'leftOnTable', label: 'Aggregate Amount Left on the Table', shortLabel: 'Left on Table', unit: '$B', isPercent: false },
    { value: 'proceeds', label: 'Aggregate Proceeds', shortLabel: 'Proceeds', unit: '$B', isPercent: false },
];

function fmt(value: number, metric: MetricDef): string {
    if (metric.value === 'ipos') return value.toFixed(0);
    return value.toFixed(1) + (metric.unit ? ` ${metric.unit}` : '');
}

export default function IPOChart({ data }: { data: IPORow[] }) {
    const [selectedMetric, setSelectedMetric] = useState<MetricKey>('ipos');
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const metric = METRICS.find(m => m.value === selectedMetric)!;

    const chartData = useMemo(() => {
        return data.map(row => ({
            year: row.year,
            value: row[selectedMetric] as number,
        }));
    }, [data, selectedMetric]);

    const stats = useMemo(() => {
        const values = chartData.map(d => d.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const max = Math.max(...values);
        const maxYear = chartData[values.indexOf(max)]?.year;
        const min = Math.min(...values);
        const minYear = chartData[values.indexOf(min)]?.year;
        return { avg, max, maxYear, min, minYear };
    }, [chartData]);

    const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const axisColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    const tooltipBg = isDark ? '#0f0f12' : '#ffffff';
    const tooltipBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
    const barColor = isDark ? '#3b82f6' : '#2563eb';
    const negBarColor = isDark ? '#f87171' : '#dc2626';

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <PageHeader
                    title="IPO Market Data"
                    subtitle="Historical IPO activity and first-day returns · 1980–2025"
                />

                <div className="space-y-6">
                    {/* Metric pills */}
                    <div className="p-1.5 rounded-xl bg-muted/50 border border-border/50 flex flex-wrap gap-1">
                        {METRICS.map(m => (
                            <button
                                key={m.value}
                                onClick={() => setSelectedMetric(m.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedMetric === m.value
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {m.shortLabel}
                            </button>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Average', value: fmt(stats.avg, metric) },
                            { label: 'Maximum', value: `${fmt(stats.max, metric)} (${stats.maxYear})` },
                            { label: 'Minimum', value: `${fmt(stats.min, metric)} (${stats.minYear})` },
                            { label: 'Years', value: `${data.length}` },
                        ].map(stat => (
                            <div key={stat.label} className="p-4 rounded-xl border border-border/50 bg-card">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                    {stat.label}
                                </div>
                                <div className="text-xl font-semibold text-foreground tabular-nums leading-tight">
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bar chart */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <h2 className="section-title text-base mb-6">
                            {metric.label} by Year
                        </h2>
                        <ResponsiveContainer width="100%" height={460}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 16, right: 24, left: 8, bottom: 64 }}
                                barCategoryGap="20%"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    angle={-55}
                                    textAnchor="end"
                                    height={80}
                                    tick={{ fill: axisColor, fontSize: 10 }}
                                    axisLine={{ stroke: gridColor }}
                                    tickLine={false}
                                    interval={1}
                                />
                                <YAxis
                                    tick={{ fill: axisColor, fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={v =>
                                        metric.value === 'ipos' ? String(v) : `${v}${metric.unit}`
                                    }
                                    width={52}
                                />
                                <Tooltip
                                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: tooltipBg,
                                        border: `1px solid ${tooltipBorder}`,
                                        borderRadius: '10px',
                                        padding: '10px 14px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                    }}
                                    labelStyle={{ color: axisColor, fontWeight: 600, marginBottom: 4 }}
                                    itemStyle={{ color: isDark ? '#e5e7eb' : '#111' }}
                                    formatter={(value: number | undefined) => [fmt(value ?? 0, metric), metric.label]}
                                    labelFormatter={(label) => `Year: ${label}`}
                                />
                                {metric.isPercent && (
                                    <ReferenceLine
                                        y={0}
                                        stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                        strokeWidth={1}
                                    />
                                )}
                                <Bar
                                    dataKey="value"
                                    radius={[3, 3, 0, 0]}
                                    fill={barColor}
                                    // Color negative bars differently for % metrics
                                    label={false}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Data table */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <h2 className="section-title text-base mb-4">Full Data</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-border">
                                        {['Year', 'IPOs', '1st Day EW', '1st Day PW', '1st Day Med', 'Left on Table', 'Proceeds'].map(h => (
                                            <th key={h} className="py-2.5 px-3 text-left font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(row => (
                                        <tr key={row.year} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                                            <td className="py-2 px-3 font-medium text-foreground tabular-nums">{row.year}</td>
                                            <td className="py-2 px-3 text-muted-foreground tabular-nums">{row.ipos}</td>
                                            <td className="py-2 px-3 text-muted-foreground tabular-nums">
                                                <span className={row.firstDayEW < 0 ? 'text-red-500' : ''}>
                                                    {row.firstDayEW.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-muted-foreground tabular-nums">
                                                <span className={row.firstDayPW < 0 ? 'text-red-500' : ''}>
                                                    {row.firstDayPW.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-muted-foreground tabular-nums">
                                                <span className={row.firstDayMedian < 0 ? 'text-red-500' : ''}>
                                                    {row.firstDayMedian.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-muted-foreground tabular-nums">${row.leftOnTable.toFixed(2)}B</td>
                                            <td className="py-2 px-3 text-muted-foreground tabular-nums">${row.proceeds.toFixed(2)}B</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
