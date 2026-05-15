'use client';

import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    getResponsiveHeight,
    getResponsiveMargin,
    getResponsiveFontSize,
    getResponsiveYAxisWidth,
} from '@/lib/responsive-chart-utils';
import { generateYearlyTicks } from '@/lib/chart-utils';

interface ChartPoint {
    date: string;
    value: number;
}

const DATE_PRESETS = [
    { label: 'All Time', value: 'all' },
    { label: '1900s–20s', value: '1900s', start: '1900-01-01', end: '1929-12-31' },
    { label: '1930s–50s', value: '1930s', start: '1930-01-01', end: '1959-12-31' },
    { label: '1960s–80s', value: '1960s', start: '1960-01-01', end: '1989-12-31' },
    { label: '1990s–00s', value: '1990s', start: '1990-01-01', end: '2009-12-31' },
    { label: '2010s', value: '2010s', start: '2010-01-01', end: '2019-12-31' },
    { label: '2020s', value: '2020s', start: '2020-01-01', end: '2029-12-31' },
    { label: 'Last 10Y', value: '10y' },
    { label: 'Last 20Y', value: '20y' },
];

function filterByPreset(data: ChartPoint[], preset: string): ChartPoint[] {
    const found = DATE_PRESETS.find(p => p.value === preset);
    if (!found || preset === 'all') return data;

    if ('start' in found) {
        return data.filter(d => d.date >= found.start! && d.date <= found.end!);
    }

    const years = preset === '10y' ? 10 : preset === '20y' ? 20 : null;
    if (!years) return data;

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - years);
    return data.filter(d => d.date >= cutoff.toISOString().slice(0, 10));
}

function formatPrice(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return v.toFixed(0);
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: ChartPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const dateLabel = new Date(d.date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
    return (
        <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
        }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{dateLabel}</div>
            <div>DJIA: {d.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
        </div>
    );
}

export default function DjiChart() {
    const [allData, setAllData] = useState<ChartPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartPoint[]>([]);
    const [preset, setPreset] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [responsiveHeight, setResponsiveHeight] = useState(380);
    const [responsiveMargin, setResponsiveMargin] = useState(getResponsiveMargin());
    const [fontSize, setFontSize] = useState(12);
    const [yAxisWidth, setYAxisWidth] = useState(60);

    useEffect(() => {
        const handleResize = () => {
            setResponsiveHeight(getResponsiveHeight(380));
            setResponsiveMargin(getResponsiveMargin());
            setFontSize(getResponsiveFontSize());
            setYAxisWidth(getResponsiveYAxisWidth());
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/data/equities?series=US%2FDJI&columns=Value');
                if (!res.ok) throw new Error('Failed to load DJI data');
                const json = await res.json();

                const raw: ChartPoint[] = (json.data ?? [])
                    .map((row: Record<string, unknown>) => ({
                        date: String(row.date ?? ''),
                        value: Number(row['Value'] ?? 0),
                    }))
                    .filter((r: ChartPoint) => r.date && r.value > 0);

                setAllData(raw);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        setFilteredData(filterByPreset(allData, preset));
    }, [allData, preset]);

    // Y-axis: nice round ticks
    const values = filteredData.map(d => d.value);
    const maxVal = values.length ? Math.max(...values) : 45000;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const step = magnitude >= 10000 ? 10000 : magnitude >= 1000 ? 5000 : magnitude;
    const yMax = Math.ceil(maxVal / step) * step;
    const yTicks: number[] = [];
    for (let t = 0; t <= yMax; t += step) yTicks.push(t);

    if (loading) {
        return (
            <div className="bg-card border border-border/50 rounded-2xl p-6 flex items-center justify-center" style={{ height: 380 }}>
                <p className="text-muted-foreground text-sm">Loading Dow Jones data…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card border border-border/50 rounded-2xl p-6 flex items-center justify-center" style={{ height: 380 }}>
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            {/* Header */}
            <div>
                <h3 className="text-lg font-bold">Dow Jones Industrial Average — Price</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Daily closing price, 1900–present.
                </p>
            </div>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map(p => (
                    <button
                        key={p.value}
                        onClick={() => setPreset(p.value)}
                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${preset === p.value
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-card border-border hover:bg-muted'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={responsiveHeight}>
                <AreaChart data={filteredData} margin={responsiveMargin}>
                    <defs>
                        <linearGradient id="djiGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                    <XAxis
                        dataKey="date"
                        tick={{ fontSize }}
                        tickFormatter={(v) => new Date(v).getFullYear().toString()}
                        ticks={generateYearlyTicks(filteredData)}
                        height={30}
                    />

                    <YAxis
                        width={yAxisWidth}
                        tick={{ fontSize }}
                        tickFormatter={formatPrice}
                        domain={[0, yMax]}
                        ticks={yTicks}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        fill="url(#djiGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#3b82f6' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
