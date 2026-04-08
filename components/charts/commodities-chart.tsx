'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatTooltipValue } from '@/lib/format-utils';
import { generateYearlyTicks } from '@/lib/chart-utils';
import HistoricalDataTable from './historical-data-table';

interface ChartDataPoint {
    date: string;
    [key: string]: any;
}

interface SeriesInfo {
    series_name: string;
    display_name: string;
    units?: string;
}

const CHART_COLORS = ['#2563eb', '#dc2626'];

const DATE_PRESETS: Array<
    | { label: string; value: string }
    | { label: string; value: string; start: string; end: string }
> = [
        { label: 'All Time', value: 'all' },
        { label: '1970s', value: '1970s', start: '1970-01-01', end: '1979-12-31' },
        { label: '1980s', value: '1980s', start: '1980-01-01', end: '1989-12-31' },
        { label: '1990s', value: '1990s', start: '1990-01-01', end: '1999-12-31' },
        { label: '2000s', value: '2000s', start: '2000-01-01', end: '2009-12-31' },
        { label: '2010s', value: '2010s', start: '2010-01-01', end: '2019-12-31' },
        { label: '2020s', value: '2020s', start: '2020-01-01', end: '2029-12-31' },
        { label: 'Last 5Y', value: '5y' },
        { label: 'Last 10Y', value: '10y' },
        { label: 'Custom', value: 'custom' },
    ];

const COMMODITY_GROUPS = [
    { label: 'Energy', series: ['CL=F', 'NG=F', 'RB=F', 'HO=F'] },
    { label: 'Metals', series: ['GC=F', 'SI=F', 'HG=F'] },
    { label: 'Grains', series: ['ZC=F', 'ZW=F', 'ZS=F'] },
];

const RATIO_PRESETS = [
    { label: 'Gold / Silver', s1: 'GC=F', s2: 'SI=F' },
    { label: 'WTI / Gasoline', s1: 'CL=F', s2: 'RB=F' },
    { label: 'Corn / Wheat', s1: 'ZC=F', s2: 'ZW=F' },
];

interface CommoditiesChartProps {
    height?: number;
    className?: string;
}

export default function CommoditiesChart({ height = 500, className = '' }: CommoditiesChartProps) {
    const [availableSeries, setAvailableSeries] = useState<SeriesInfo[]>([]);
    const [selectedSeries, setSelectedSeries] = useState<string>('');
    const [selectedUnits, setSelectedUnits] = useState<string | undefined>(undefined);
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);
    const [datePreset, setDatePreset] = useState<string>('10y');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [show200MA, setShow200MA] = useState(false);
    const [show50MA, setShow50MA] = useState(false);

    // Ratio mode
    const [calculationMode, setCalculationMode] = useState<'single' | 'ratio'>('single');
    const [series1, setSeries1] = useState<string>('');
    const [series2, setSeries2] = useState<string>('');
    const [ratioData, setRatioData] = useState<ChartDataPoint[]>([]);

    // Load available series
    useEffect(() => {
        fetch('/api/data/commodities', { cache: 'no-store' })
            .then(r => r.json())
            .then(result => {
                const series: SeriesInfo[] = result.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name,
                    units: s.units,
                }));
                setAvailableSeries(series);
                if (series.length > 0) {
                    setSelectedSeries(series[0].series_name);
                    setSelectedUnits(series[0].units);
                    setSeries1(series[0].series_name);
                    setSeries2(series[1]?.series_name ?? series[0].series_name);
                }
            })
            .catch(() => setAvailableSeries([]));
    }, []);

    // Load single series data
    useEffect(() => {
        if (calculationMode !== 'single' || !selectedSeries) return;
        setLoading(true);
        setError(null);
        fetch(`/api/data/commodities?series=${selectedSeries}`)
            .then(r => r.json())
            .then(result => setData(result.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [selectedSeries, calculationMode]);

    // Load ratio data
    useEffect(() => {
        if (calculationMode !== 'ratio' || !series1 || !series2) return;
        setLoading(true);
        setError(null);
        Promise.all([
            fetch(`/api/data/commodities?series=${encodeURIComponent(series1)}`).then(r => r.json()),
            fetch(`/api/data/commodities?series=${encodeURIComponent(series2)}`).then(r => r.json()),
        ])
            .then(([r1, r2]) => {
                const map2 = new Map<string, number>(r2.data.map((p: ChartDataPoint) => [p.date, p.Value]));
                const calculated = r1.data
                    .map((p: ChartDataPoint) => {
                        const v2 = map2.get(p.date);
                        if (v2 == null || v2 === 0) return null;
                        return { date: p.date, Value: p.Value / v2 };
                    })
                    .filter(Boolean) as ChartDataPoint[];
                setRatioData(calculated);
                setSelectedUnits('ratio');
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [calculationMode, series1, series2]);

    // Filter by date
    useEffect(() => {
        const source = calculationMode === 'ratio' ? ratioData : data;
        if (!source.length) { setFilteredData([]); return; }

        let filtered = [...source];
        let startDate: string | null = null;
        let endDate: string | null = null;

        if (datePreset === 'all') { setFilteredData(filtered); return; }
        if (datePreset === 'custom') { startDate = customStartDate; endDate = customEndDate; }
        else if (datePreset === '5y') {
            const now = new Date();
            startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()).toISOString().split('T')[0];
            endDate = now.toISOString().split('T')[0];
        } else if (datePreset === '10y') {
            const now = new Date();
            startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate()).toISOString().split('T')[0];
            endDate = now.toISOString().split('T')[0];
        } else {
            const preset = DATE_PRESETS.find(p => p.value === datePreset);
            if (preset && 'start' in preset) { startDate = preset.start; endDate = preset.end; }
        }

        if (startDate) filtered = filtered.filter(d => d.date >= startDate!);
        if (endDate) filtered = filtered.filter(d => d.date <= endDate!);
        setFilteredData(filtered);
    }, [data, ratioData, datePreset, customStartDate, customEndDate, calculationMode]);

    // Moving averages
    const maData = (() => {
        const source = calculationMode === 'ratio' ? ratioData : filteredData;
        return source.map((point, i) => {
            const win200 = source.slice(Math.max(0, i - 199), i + 1);
            const win50 = source.slice(Math.max(0, i - 49), i + 1);
            return {
                ...point,
                MA200: win200.length === 200 ? win200.reduce((s, p) => s + (p.Value ?? 0), 0) / 200 : null,
                MA50: win50.length === 50 ? win50.reduce((s, p) => s + (p.Value ?? 0), 0) / 50 : null,
            };
        });
    })();

    const chartData = show200MA || show50MA ? maData : (filteredData.length > 0 ? filteredData : (calculationMode === 'ratio' ? ratioData : data));
    const latestDate = data.length > 0 ? data[data.length - 1].date : null;

    const displayName1 = availableSeries.find(s => s.series_name === series1)?.display_name ?? series1;
    const displayName2 = availableSeries.find(s => s.series_name === series2)?.display_name ?? series2;
    const selectedDisplayName = availableSeries.find(s => s.series_name === selectedSeries)?.display_name ?? selectedSeries;

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${className}`}>
            {latestDate && (
                <div className="mb-4 text-xs text-muted-foreground text-right">
                    Latest data: {(() => { const [y, m, d] = latestDate.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); })()}
                </div>
            )}

            <div className="mb-6 space-y-4">
                {/* Mode */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <label className="text-sm font-medium text-card-foreground">Chart Mode:</label>
                    <div className="flex gap-2">
                        {(['single', 'ratio'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setCalculationMode(mode)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${calculationMode === mode ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                {mode === 'single' ? 'Single Series' : 'Ratio (S1 / S2)'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Series selectors */}
                {calculationMode === 'single' ? (
                    <div>
                        <label className="block text-sm font-medium text-card-foreground mb-2">Series</label>
                        <select
                            value={selectedSeries}
                            onChange={e => {
                                setSelectedSeries(e.target.value);
                                setSelectedUnits(availableSeries.find(s => s.series_name === e.target.value)?.units);
                            }}
                            className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {COMMODITY_GROUPS.map(group => (
                                <optgroup key={group.label} label={group.label}>
                                    {group.series.map(sn => {
                                        const s = availableSeries.find(x => x.series_name === sn);
                                        return s ? <option key={s.series_name} value={s.series_name}>{s.display_name}</option> : null;
                                    })}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Quick presets */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">Quick:</span>
                            {RATIO_PRESETS.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => { setSeries1(p.s1); setSeries2(p.s2); }}
                                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${series1 === p.s1 && series2 === p.s2 ? 'bg-primary text-primary-foreground border-transparent' : 'border-border text-muted-foreground hover:bg-muted/70'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {([{ label: 'Series 1', val: series1, set: setSeries1 }, { label: 'Series 2', val: series2, set: setSeries2 }] as const).map(({ label, val, set }) => (
                                <div key={label}>
                                    <label className="block text-sm font-medium text-card-foreground mb-2">{label}</label>
                                    <select
                                        value={val}
                                        onChange={e => set(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {COMMODITY_GROUPS.map(group => (
                                            <optgroup key={group.label} label={group.label}>
                                                {group.series.map(sn => {
                                                    const s = availableSeries.find(x => x.series_name === sn);
                                                    return s ? <option key={s.series_name} value={s.series_name}>{s.display_name}</option> : null;
                                                })}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MA toggles */}
                {calculationMode === 'single' && (
                    <div className="flex items-center gap-6 p-3 rounded-lg bg-muted/50">
                        {[{ label: '200-Day MA', state: show200MA, set: setShow200MA }, { label: '50-Day MA', state: show50MA, set: setShow50MA }].map(({ label, state, set }) => (
                            <label key={label} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={state} onChange={e => set(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary" />
                                <span className="text-sm font-medium text-card-foreground">{label}</span>
                            </label>
                        ))}
                    </div>
                )}

                {/* Date range */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-card-foreground">Date Range</label>
                    <div className="flex flex-wrap gap-2">
                        {DATE_PRESETS.map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => setDatePreset(preset.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${datePreset === preset.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    {datePreset === 'custom' && (
                        <div className="flex gap-3 mt-3">
                            {[{ label: 'Start Date', val: customStartDate, set: setCustomStartDate }, { label: 'End Date', val: customEndDate, set: setCustomEndDate }].map(({ label, val, set }) => (
                                <div key={label} className="flex-1">
                                    <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                                    <input type="date" value={val} onChange={e => set(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            {loading ? (
                <div className="flex items-center justify-center" style={{ height }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : error ? (
                <div className="flex items-center justify-center" style={{ height }}>
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={v => new Date(v).getFullYear().toString()} ticks={generateYearlyTicks(chartData)} />
                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={['auto', 'auto']} tickFormatter={v => v.toLocaleString('en-US', { maximumFractionDigits: 0 })} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' }}
                            labelStyle={{ color: '#9ca3af' }}
                            formatter={(value: any) => formatTooltipValue(Number(value), selectedUnits)}
                        />
                        <Legend wrapperStyle={{ color: '#9ca3af' }} />
                        <Line type="monotone" dataKey="Value" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false}
                            name={calculationMode === 'ratio' ? `${displayName1} / ${displayName2}` : selectedDisplayName}
                        />
                        {show200MA && <Line type="monotone" dataKey="MA200" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="200-Day MA" connectNulls={false} />}
                        {show50MA && <Line type="monotone" dataKey="MA50" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="50-Day MA" connectNulls={false} />}
                    </LineChart>
                </ResponsiveContainer>
            )}

            {/* Latest data */}
            {!loading && !error && (calculationMode === 'single' ? data.length > 0 : ratioData.length > 0) && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <h4 className="text-sm font-semibold text-card-foreground mb-3">Latest Data</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {calculationMode === 'single' ? (
                            <>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Current Value</div>
                                    <div className="text-2xl font-bold text-card-foreground">
                                        {formatTooltipValue(data[data.length - 1].Value, selectedUnits)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">As of</div>
                                    <div className="text-lg font-semibold text-card-foreground">
                                        {(() => { const [y, m, d] = data[data.length - 1].date.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); })()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Series</div>
                                    <div className="text-sm font-medium text-card-foreground">{selectedDisplayName}</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Current Ratio</div>
                                    <div className="text-2xl font-bold text-card-foreground">{ratioData[ratioData.length - 1].Value.toFixed(4)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">As of</div>
                                    <div className="text-lg font-semibold text-card-foreground">
                                        {(() => { const [y, m, d] = ratioData[ratioData.length - 1].date.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); })()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Calculation</div>
                                    <div className="text-sm font-medium text-card-foreground">{displayName1} / {displayName2}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            {!loading && !error && (calculationMode === 'single' ? filteredData.length > 0 : ratioData.length > 0) && (
                <HistoricalDataTable
                    data={calculationMode === 'single' ? filteredData : ratioData}
                    seriesName={calculationMode === 'single' ? selectedDisplayName : `${displayName1} / ${displayName2}`}
                    units={calculationMode === 'single' ? selectedUnits : 'ratio'}
                />
            )}
        </div>
    );
}
