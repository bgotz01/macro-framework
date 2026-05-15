'use client';

import { useState, useEffect } from 'react';
import {
    ComposedChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
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
    yoy: number | null;
}

const DATE_PRESETS = [
    { label: 'All Time', value: 'all' },
    { label: '1960s–70s', value: '1960s70s', start: '1960-01-01', end: '1979-12-31' },
    { label: '1980s–90s', value: '1980s90s', start: '1980-01-01', end: '1999-12-31' },
    { label: '2000s', value: '2000s', start: '2000-01-01', end: '2009-12-31' },
    { label: '2010s', value: '2010s', start: '2010-01-01', end: '2019-12-31' },
    { label: '2020s', value: '2020s', start: '2020-01-01', end: '2029-12-31' },
    { label: 'Last 10Y', value: '10y' },
    { label: 'Last 20Y', value: '20y' },
];

function buildChartPoints(raw: Array<{ date: string; value: number }>): ChartPoint[] {
    return raw
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(point => ({ date: point.date, yoy: point.value }));
}

function filterByPreset(data: ChartPoint[], preset: string): ChartPoint[] {
    const found = DATE_PRESETS.find(p => p.value === preset);
    if (!found || preset === 'all') return data;

    if ('start' in found && found.start) {
        return data.filter(d => d.date >= found.start! && d.date <= found.end!);
    }

    // Relative presets
    const years = preset === '10y' ? 10 : preset === '20y' ? 20 : null;
    if (!years) return data;

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - years);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return data.filter(d => d.date >= cutoffStr);
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: ChartPoint }>;
    label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const val = d.yoy;
    const color =
        val === null ? '#6b7280' : val > 3 ? '#ef4444' : val < -3 ? '#3b82f6' : '#22c55e';

    const dateLabel = new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <div
            style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{dateLabel}</div>
            <div style={{ color }}>
                CPI YoY: {val !== null ? `${val.toFixed(2)}%` : '—'}
            </div>
        </div>
    );
}

export default function CpiChart() {
    const [allData, setAllData] = useState<ChartPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartPoint[]>([]);
    const [preset, setPreset] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [responsiveHeight, setResponsiveHeight] = useState(420);
    const [responsiveMargin, setResponsiveMargin] = useState(getResponsiveMargin());
    const [fontSize, setFontSize] = useState(12);
    const [yAxisWidth, setYAxisWidth] = useState(60);

    useEffect(() => {
        const handleResize = () => {
            setResponsiveHeight(getResponsiveHeight(420));
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
                const res = await fetch('/api/data/economic?series=CPI');
                if (!res.ok) throw new Error('Failed to load CPI data');
                const json = await res.json();

                // The API returns { data: [{date, value}], columns, metadata }
                const raw = (json.data ?? []).map((row: Record<string, unknown>) => ({
                    date: String(row.date ?? ''),
                    // DB stores column_name="Value" → mapped as row['Value']
                    value: Number(row['Value'] ?? 0),
                })).filter((r: { date: string; value: number }) => r.date && r.value !== 0);

                const computed = buildChartPoints(raw);
                setAllData(computed);
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

    // Dynamic Y-axis domain with padding, snapped to clean integers
    const values = filteredData.map(d => d.yoy).filter((v): v is number => v !== null);
    const minVal = values.length ? Math.min(...values) : -5;
    const maxVal = values.length ? Math.max(...values) : 15;
    const yMin = Math.floor(minVal / 5) * 5;   // round down to nearest 5
    const yMax = Math.ceil(maxVal / 5) * 5;    // round up to nearest 5
    // Generate ticks every 5 percentage points
    const ticks: number[] = [];
    for (let t = yMin; t <= yMax; t += 5) ticks.push(t);

    if (loading) {
        return (
            <div className="bg-card border border-border/50 rounded-2xl p-6 flex items-center justify-center" style={{ height: 420 }}>
                <p className="text-muted-foreground text-sm">Loading CPI data…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card border border-border/50 rounded-2xl p-6 flex items-center justify-center" style={{ height: 420 }}>
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            {/* Header */}
            <div>
                <h3 className="text-lg font-bold">U.S. CPI Inflation — Year-over-Year %</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Monthly CPI YoY change. Dashed lines mark the ±3% threshold.
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
                <ComposedChart data={filteredData} margin={responsiveMargin}>
                    <defs>
                        <linearGradient id="cpiGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                    <XAxis
                        dataKey="date"
                        tick={{ fontSize }}
                        tickFormatter={(value) => new Date(value).getFullYear().toString()}
                        ticks={generateYearlyTicks(filteredData)}
                        height={30}
                    />

                    <YAxis
                        width={yAxisWidth}
                        tick={{ fontSize }}
                        tickFormatter={(v) => `${v}%`}
                        domain={[yMin, yMax]}
                        ticks={ticks}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Zero baseline */}
                    <ReferenceLine y={0} stroke="#ef4444" strokeWidth={1.5} />

                    {/* +3% threshold */}
                    <ReferenceLine
                        y={3}
                        stroke="#ef4444"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                        label={{
                            value: '+3%',
                            position: 'right',
                            fontSize: 10,
                            fill: '#ef4444',
                        }}
                    />

                    {/* -3% threshold */}
                    <ReferenceLine
                        y={-3}
                        stroke="#ef4444"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                        label={{
                            value: '−3%',
                            position: 'right',
                            fontSize: 10,
                            fill: '#ef4444',
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="yoy"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        fill="url(#cpiGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#3b82f6' }}
                        connectNulls={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-6 border-t-2 border-dashed border-red-500" />
                    ±3% threshold
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-6 border-t-2 border-blue-500" />
                    CPI YoY %
                </span>
            </div>
        </div>
    );
}
