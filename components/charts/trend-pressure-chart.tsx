'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    ComposedChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useTheme } from '../theme-provider';

interface DataPoint {
    date: string;
    divergence_value: number;
    divergence_percentile: number;
    days_above_value: number;
    days_above_percentile: number;
    slope_value: number;
    slope_percentile: number;
    trend_pressure_score?: number;
    score_ma20?: number;
    divergence_pct_ma20?: number;
    days_above_pct_ma20?: number;
    slope_pct_ma20?: number;
}

type ViewMode = 'percentile' | 'value';

interface MetricConfig {
    label: string;
    color: string;
    ma20Color: string;
    valueSuffix: string;
    percentileKey: keyof DataPoint;
    valueKey: keyof DataPoint;
    ma20Key: keyof DataPoint;
}

const METRICS: MetricConfig[] = [
    { label: 'Divergence', color: '#6366f1', ma20Color: '#a78bfa', valueSuffix: '%', percentileKey: 'divergence_percentile', valueKey: 'divergence_value', ma20Key: 'divergence_pct_ma20' },
    { label: 'Days Above MA', color: '#06b6d4', ma20Color: '#67e8f9', valueSuffix: ' days', percentileKey: 'days_above_percentile', valueKey: 'days_above_value', ma20Key: 'days_above_pct_ma20' },
    { label: 'MA Slope', color: '#22c55e', ma20Color: '#86efac', valueSuffix: '%', percentileKey: 'slope_percentile', valueKey: 'slope_value', ma20Key: 'slope_pct_ma20' },
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
] as const;

interface TrendPressureChartProps {
    height?: number;
}

const SCORE_COLOR = '#f59e0b';

export default function TrendPressureChart({ height = 450 }: TrendPressureChartProps) {
    const [raw, setRaw] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [datePreset, setDatePreset] = useState<string>('10y');
    const [ma, setMa] = useState<'200' | '500'>('200');
    const [index, setIndex] = useState<'sp500' | 'ndx'>('sp500');
    const [viewMode, setViewMode] = useState<ViewMode>('percentile');
    const [scoreMetrics, setScoreMetrics] = useState<Set<string>>(
        new Set(METRICS.map(m => m.percentileKey as string))
    );
    const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set<string>());
    const [visibleMA20s, setVisibleMA20s] = useState<Set<string>>(new Set<string>());
    const [showScore, setShowScore] = useState(true);
    const [showScoreMA20, setShowScoreMA20] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const isFirst = raw.length === 0;
        if (isFirst) setLoading(true);
        else setFetching(true);
        fetch(`/api/trend-pressure-history?ma=${ma}&index=${index}`)
            .then(r => r.json())
            .then(json => setRaw(json.data || []))
            .catch(console.error)
            .finally(() => { setLoading(false); setFetching(false); });
    }, [ma, index]);

    const data = useMemo(() => {
        // Compute 20D MA for each metric's percentile
        const withMA = raw.map((d, i) => {
            const win = raw.slice(Math.max(0, i - 19), i + 1);
            const ma20 = (key: keyof DataPoint) =>
                parseFloat((win.reduce((s, r) => s + (r[key] as number), 0) / win.length).toFixed(2));
            return {
                ...d,
                divergence_pct_ma20: ma20('divergence_percentile'),
                days_above_pct_ma20: ma20('days_above_percentile'),
                slope_pct_ma20: ma20('slope_percentile'),
            };
        });
        // Always compute score (percentile-based composite) regardless of view mode
        const active = METRICS.filter(m => scoreMetrics.has(m.percentileKey as string));
        if (!active.length) return withMA;
        const withScore = withMA.map(d => {
            const sum = active.reduce((acc, m) => acc + (d[m.percentileKey] as number), 0);
            return { ...d, trend_pressure_score: sum / active.length };
        });
        // Compute 20D MA of the score
        return withScore.map((d, i) => {
            const win = withScore.slice(Math.max(0, i - 19), i + 1);
            const avg = win.reduce((s, r) => s + (r.trend_pressure_score ?? 0), 0) / win.length;
            return { ...d, score_ma20: parseFloat(avg.toFixed(2)) };
        });
    }, [raw, scoreMetrics]);

    const toggleScore = (key: string) => {
        setScoreMetrics(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                if (next.size === 1) return prev;
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const toggleVisible = (key: string) => {
        setVisibleMetrics(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const toggleMA20 = (key: string) => {
        setVisibleMA20s(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

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

    const yearlyTicks = filtered
        .filter((d, i) => {
            const yr = parseInt(d.date.split('-')[0]);
            const prev = i > 0 ? parseInt(filtered[i - 1].date.split('-')[0]) : null;
            return yr !== prev && yr % 5 === 0;
        })
        .map(d => d.date);

    const isDark = theme === 'dark';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const latest = filtered[filtered.length - 1];

    const tooltipContent = useCallback(({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0].payload as DataPoint;
        const [y, m, dy] = d.date.split('-').map(Number);
        const date = new Date(y, m - 1, dy).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        return (
            <div className="bg-background border-2 border-border rounded-lg p-3 shadow-lg text-sm space-y-1">
                <p className="font-semibold">{date}</p>
                {showScore && (
                    <p><span style={{ color: SCORE_COLOR }}>Score:</span> {d.trend_pressure_score?.toFixed(1)}</p>
                )}
                {viewMode === 'percentile' && showScoreMA20 && d.score_ma20 != null && (
                    <p><span style={{ color: '#fcd34d' }}>Score 20D MA:</span> {d.score_ma20.toFixed(1)}</p>
                )}
                {METRICS.filter(m => visibleMetrics.has(m.percentileKey as string)).map(m => {
                    const key = viewMode === 'percentile' ? m.percentileKey : m.valueKey;
                    const val = d[key] as number;
                    const actualVal = d[m.valueKey] as number;
                    return (
                        <p key={m.label} style={{ color: m.color }}>
                            {m.label}: {val?.toFixed(1)}{viewMode === 'percentile' ? '' : m.valueSuffix}
                            {viewMode === 'percentile' && actualVal != null && (
                                <span className="text-muted-foreground ml-1">
                                    ({actualVal.toFixed(m.valueSuffix === ' days' ? 0 : 2)}{m.valueSuffix})
                                </span>
                            )}
                        </p>
                    );
                })}
                {viewMode === 'percentile' && METRICS.filter(m => visibleMA20s.has(m.ma20Key as string)).map(m => {
                    const val = d[m.ma20Key] as number;
                    return val != null ? (
                        <p key={`${m.label}-ma20`} style={{ color: m.ma20Color }}>
                            {m.label} 20D MA: {val.toFixed(1)}
                        </p>
                    ) : null;
                })}
            </div>
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showScore, showScoreMA20, viewMode, visibleMetrics, visibleMA20s]);

    if (loading) {
        return <div className="p-6 rounded-xl border bg-card text-center text-muted-foreground">Loading...</div>;
    }
    return (
        <div className="p-6 rounded-xl border bg-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold">Trend Pressure Score</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Average of selected {ma}MA percentiles{fetching && <span className="ml-2 opacity-60">updating…</span>}
                        </p>
                    </div>
                    {latest && (
                        <div>
                            <div className="text-2xl font-bold" style={{ color: SCORE_COLOR }}>
                                {latest.trend_pressure_score?.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Score %ile · {(() => { const [y, m, d] = latest.date.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })()}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
                        {(['percentile', 'value'] as const).map(mode => (
                            <button
                                type="button"
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1.5 transition-colors capitalize ${viewMode === mode
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                {mode === 'percentile' ? 'Percentile' : 'Actual'}
                            </button>
                        ))}
                    </div>
                    <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
                        {(['200', '500'] as const).map(period => (
                            <button
                                type="button"
                                key={period}
                                onClick={() => setMa(period)}
                                className={`px-3 py-1.5 transition-colors ${ma === period
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                {period}MA
                            </button>
                        ))}
                    </div>
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
                </div>
            </div>

            {/* Show Lines row */}
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-20 shrink-0">Show Lines:</span>
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                    {viewMode === 'percentile' && (
                        <button
                            type="button"
                            onClick={() => setShowScore(s => !s)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border border-border transition-all ${showScore ? 'text-background' : 'bg-transparent text-muted-foreground'}`}
                            style={{ backgroundColor: showScore ? SCORE_COLOR : 'transparent' }}
                        >
                            Score
                        </button>
                    )}
                    {viewMode === 'value' && (
                        <button
                            type="button"
                            onClick={() => setShowScore(s => !s)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border border-border transition-all ${showScore ? 'text-background' : 'bg-transparent text-muted-foreground'}`}
                            style={{ backgroundColor: showScore ? SCORE_COLOR : 'transparent' }}
                            title="Percentile score shown on right axis"
                        >
                            Score %ile →
                        </button>
                    )}
                    {METRICS.map(m => {
                        const active = visibleMetrics.has(m.percentileKey as string);
                        return (
                            <button
                                type="button"
                                key={m.label}
                                onClick={() => toggleVisible(m.percentileKey as string)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border border-border transition-all ${active ? 'text-background' : 'bg-transparent text-muted-foreground'}`}
                                style={{ backgroundColor: active ? m.color : 'transparent' }}
                            >
                                {m.label}
                            </button>
                        );
                    })}
                </div>
                {viewMode === 'percentile' && (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">In Score:</span>
                        {METRICS.map(m => {
                            const active = scoreMetrics.has(m.percentileKey as string);
                            return (
                                <button
                                    type="button"
                                    key={m.label}
                                    onClick={() => toggleScore(m.percentileKey as string)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all ${active ? 'text-foreground' : 'border-muted-foreground/30 text-muted-foreground'}`}
                                    style={{ borderColor: active ? SCORE_COLOR : undefined, backgroundColor: 'transparent' }}
                                >
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 20D MA row — percentile mode only */}
            {viewMode === 'percentile' && (
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-20 shrink-0">20D MA:</span>
                    <button
                        type="button"
                        onClick={() => setShowScoreMA20(s => !s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border border-border transition-all ${showScoreMA20 ? 'text-background' : 'bg-transparent text-muted-foreground'}`}
                        style={{ backgroundColor: showScoreMA20 ? '#fcd34d' : 'transparent' }}
                    >
                        Score
                    </button>
                    {METRICS.map(m => {
                        const active = visibleMA20s.has(m.ma20Key as string);
                        return (
                            <button
                                type="button"
                                key={`${m.label}-ma20`}
                                onClick={() => toggleMA20(m.ma20Key as string)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border border-border transition-all ${active ? 'text-background' : 'bg-transparent text-muted-foreground'}`}
                                style={{ backgroundColor: active ? m.ma20Color : 'transparent' }}
                            >
                                {m.label}
                            </button>
                        );
                    })}
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
                        domain={viewMode === 'percentile' ? [0, 100] : ['auto', 'auto']}
                        label={{
                            value: viewMode === 'percentile' ? 'Percentile' : 'Value',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: textColor }
                        }}
                    />
                    {viewMode === 'value' && showScore && (
                        <YAxis
                            yAxisId="score"
                            orientation="right"
                            stroke={SCORE_COLOR}
                            tick={{ fontSize: 11, fill: SCORE_COLOR }}
                            domain={[0, 100]}
                            label={{
                                value: 'Score %ile',
                                angle: 90,
                                position: 'insideRight',
                                style: { fill: SCORE_COLOR }
                            }}
                        />
                    )}
                    <Tooltip content={tooltipContent} />
                    <Legend />

                    {viewMode === 'percentile' && (
                        <>
                            <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: '75th', fill: textColor, fontSize: 10 }} />
                            <ReferenceLine y={50} stroke={gridColor} strokeDasharray="4 4" strokeOpacity={0.8} />
                            <ReferenceLine y={25} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: '25th', fill: textColor, fontSize: 10 }} />
                        </>
                    )}
                    {viewMode === 'value' && (
                        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={2} />
                    )}

                    {/* Individual metric lines */}
                    {METRICS.filter(m => visibleMetrics.has(m.percentileKey as string)).map(m => (
                        <Line
                            key={m.label}
                            type="monotone"
                            dataKey={viewMode === 'percentile' ? m.percentileKey : m.valueKey}
                            stroke={m.color}
                            strokeWidth={1}
                            dot={false}
                            name={viewMode === 'percentile' ? `${m.label} %ile` : m.label}
                            strokeOpacity={viewMode === 'percentile' ? 0.4 : 0.8}
                            connectNulls
                        />
                    ))}

                    {/* 20D MA lines — percentile mode only */}
                    {viewMode === 'percentile' && METRICS.filter(m => visibleMA20s.has(m.ma20Key as string)).map(m => (
                        <Line
                            key={`${m.label}-ma20`}
                            type="monotone"
                            dataKey={m.ma20Key}
                            stroke={m.ma20Color}
                            strokeWidth={1.5}
                            dot={false}
                            name={`${m.label} 20D MA`}
                            strokeDasharray="4 2"
                            connectNulls
                        />
                    ))}

                    {/* Composite score line */}
                    {showScore && (
                        <Line
                            type="monotone"
                            dataKey="trend_pressure_score"
                            stroke={SCORE_COLOR}
                            strokeWidth={2.5}
                            dot={false}
                            name="Trend Pressure Score"
                            connectNulls
                            yAxisId={viewMode === 'value' ? 'score' : undefined}
                        />
                    )}

                    {/* Score 20D MA */}
                    {viewMode === 'percentile' && showScoreMA20 && (
                        <Line
                            type="monotone"
                            dataKey="score_ma20"
                            stroke="#fcd34d"
                            strokeWidth={1.5}
                            dot={false}
                            name="Score 20D MA"
                            strokeDasharray="4 2"
                            connectNulls
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-3 text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
                <p>
                    <span className="font-medium text-foreground">Score</span> = simple average of the {Array.from(scoreMetrics).map(k => METRICS.find(m => m.percentileKey === k)?.label).filter(Boolean).join(', ')} percentiles (0–100). Always percentile-based regardless of view mode.{viewMode === 'value' && ' Plotted on the right axis.'}
                </p>
                <p>
                    <span className="font-medium text-foreground">Divergence</span> = % gap between price and its {ma}MA &nbsp;·&nbsp;
                    <span className="font-medium text-foreground">Days Above MA</span> = consecutive days price has stayed above the {ma}MA &nbsp;·&nbsp;
                    <span className="font-medium text-foreground">MA Slope</span> = rate of change of the {ma}MA itself
                </p>
                <p>Each metric is ranked against its full history to produce a percentile. The score reflects how stretched trend conditions are relative to the past.</p>
            </div>
        </div>
    );
}
