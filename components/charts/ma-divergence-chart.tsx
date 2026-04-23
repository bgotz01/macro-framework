'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    ComposedChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useTheme } from '../theme-provider';
import { getResponsiveHeight, getResponsiveMargin, getResponsiveFontSize, getResponsiveYAxisWidth } from '@/lib/responsive-chart-utils';

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

function DatePresetSelector({ datePreset, setDatePreset, DATE_PRESETS }: {
    datePreset: string;
    setDatePreset: (preset: string) => void;
    DATE_PRESETS: readonly { label: string; value: string; start?: string; end?: string; }[];
}) {
    const [open, setOpen] = useState(false);

    const selectedPreset = DATE_PRESETS.find(p => p.value === datePreset);

    return (
        <div className="mb-4">
            {/* Mobile: Expandable selector */}
            <div className="sm:hidden border border-border rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors min-h-[44px]"
                >
                    <span>Date Range: {selectedPreset?.label}</span>
                    <span className="text-base leading-none">{open ? '▲' : '▼'}</span>
                </button>
                {open && (
                    <div className="border-t border-border bg-muted/20">
                        <div className="grid grid-cols-2 gap-2 p-3">
                            {DATE_PRESETS.map(p => (
                                <button
                                    type="button"
                                    key={p.value}
                                    onClick={() => {
                                        setDatePreset(p.value);
                                        setOpen(false);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[36px] ${datePreset === p.value
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-background text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop: Inline buttons */}
            <div className="hidden sm:flex sm:flex-wrap gap-2">
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
        </div>
    );
}

export default function MaDivergenceChart({ height = 450 }: { height?: number }) {
    const [raw, setRaw] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [datePreset, setDatePreset] = useState<string>('10y');
    const [viewMode, setViewMode] = useState<ViewMode>('divergence');
    const [index, setIndex] = useState<IndexKey>('sp500');
    const [show50_200, setShow50_200] = useState(true);
    const [show200_500, setShow200_500] = useState(true);
    const [responsiveHeight, setResponsiveHeight] = useState(height);
    const { theme } = useTheme();

    useEffect(() => {
        const handleResize = () => {
            setResponsiveHeight(getResponsiveHeight(height));
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [height]);

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

    const responsiveMargin = getResponsiveMargin();
    const responsiveFontSize = getResponsiveFontSize();
    const responsiveYAxisWidth = getResponsiveYAxisWidth();

    if (loading) {
        return <div className="p-2 sm:p-6 rounded-xl border bg-card text-center text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="p-2 sm:p-6 rounded-xl border bg-card">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold">MA Divergence</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">50/200MA and 200/500MA spread</p>
                    </div>
                    {latest && (
                        <div className="text-right text-[10px] sm:text-xs space-y-0.5">
                            <p style={{ color: COLOR_50_200 }}>
                                50/200: <span className="font-bold text-xs sm:text-sm">{latest.div_50_200 > 0 ? '+' : ''}{latest.div_50_200.toFixed(2)}%</span>
                            </p>
                            <p style={{ color: COLOR_200_500 }}>
                                200/500: <span className="font-bold text-xs sm:text-sm">{latest.div_200_500 > 0 ? '+' : ''}{latest.div_200_500.toFixed(2)}%</span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                    {/* Index */}
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block sm:hidden">Index</span>
                        <div className="flex rounded-lg border border-border overflow-hidden text-xs sm:text-sm font-medium">
                            {(['sp500', 'ndx'] as const).map(idx => (
                                <button
                                    type="button"
                                    key={idx}
                                    onClick={() => setIndex(idx)}
                                    className={`flex-1 py-2 sm:px-3 sm:py-1.5 transition-colors min-h-[36px] sm:min-h-0 ${index === idx
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {idx === 'sp500' ? 'S&P' : 'NDX'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* View Mode */}
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block sm:hidden">View</span>
                        <div className="flex rounded-lg border border-border overflow-hidden text-xs sm:text-sm font-medium">
                            {(['divergence', 'price'] as const).map(mode => (
                                <button
                                    type="button"
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`flex-1 py-2 sm:px-3 sm:py-1.5 transition-colors min-h-[36px] sm:min-h-0 ${viewMode === mode
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    {mode === 'divergence' ? 'Div' : 'MA'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Show Lines */}
            {viewMode === 'divergence' && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Show Lines:</span>
                    {[
                        { label: '50/200', active: show50_200, toggle: () => setShow50_200(s => !s) },
                        { label: '200/500', active: show200_500, toggle: () => setShow200_500(s => !s) },
                    ].map(({ label, active, toggle }) => (
                        <button
                            type="button"
                            key={label}
                            onClick={toggle}
                            className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border border-border transition-all min-h-[28px] sm:min-h-0 ${active
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-transparent text-muted-foreground hover:bg-muted'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Date presets - Expandable on mobile */}
            <DatePresetSelector
                datePreset={datePreset}
                setDatePreset={setDatePreset}
                DATE_PRESETS={DATE_PRESETS}
            />

            <ResponsiveContainer width="100%" height={responsiveHeight}>
                <ComposedChart data={filtered} margin={responsiveMargin}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="date"
                        stroke={textColor}
                        ticks={yearlyTicks}
                        tick={{ fontSize: responsiveFontSize }}
                        tickFormatter={v => new Date(v).getFullYear().toString()}
                    />
                    <YAxis
                        width={responsiveYAxisWidth}
                        stroke={textColor}
                        tick={{ fontSize: responsiveFontSize }}
                        domain={['auto', 'auto']}
                        tickFormatter={v => viewMode === 'divergence' ? `${v}%` : v.toLocaleString()}
                        label={{
                            value: viewMode === 'divergence' ? 'Divergence (%)' : 'Price',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: textColor, fontSize: responsiveFontSize },
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: responsiveFontSize }} />

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

            <div className="mt-3 text-[10px] sm:text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
                <p>
                    <span className="font-medium text-foreground">50/200 Divergence</span> = (50MA − 200MA) / 200MA × 100 &nbsp;·&nbsp;
                    <span className="font-medium text-foreground">200/500 Divergence</span> = (200MA − 500MA) / 500MA × 100
                </p>
                <p className="hidden sm:block">Positive values mean the faster MA is above the slower MA (bullish alignment). Negative values indicate bearish crossover.</p>
            </div>
        </div>
    );
}
