'use client';

import { useState, useEffect } from 'react';
import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';

interface PeriodDetail {
    startDate: string;
    endDate: string;
    months: number;
    isCurrent: boolean;
    duringReturn: number | null;
    forward1Y: number | null;
    forward3Y: number | null;
    forward5Y: number | null;
    entryPrice: number | null;
    exitPrice: number | null;
}

interface RegimeReturnStats {
    regime: string;
    occurrences: number;
    avgDurationMonths: number;
    medianDurationMonths: number;
    avgDuringReturn: number | null;
    medianDuringReturn: number | null;
    minDuringReturn: number | null;
    maxDuringReturn: number | null;
    avg1Y: number | null;
    avg3Y: number | null;
    avg5Y: number | null;
    median1Y: number | null;
    median3Y: number | null;
    median5Y: number | null;
    periods: PeriodDetail[];
}

const ASSETS = [
    { key: 'sp500', label: 'S&P 500', subtitle: '1960–Present' },
    { key: 'nasdaq', label: 'Nasdaq 100', subtitle: '1985–Present' },
    { key: 'gold', label: 'Gold', subtitle: '1975–Present' },
];

function formatReturn(val: number | null): string {
    if (val === null) return '—';
    return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}

function returnColor(val: number | null): string {
    if (val === null) return 'text-muted-foreground';
    if (val > 0) return 'text-green-600 dark:text-green-400';
    if (val < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
}

function formatDate(d: string): string {
    if (d === 'Current') return 'Current';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function RegimeTag({ regime }: { regime: string }) {
    const meta = REGIME_METADATA[regime as RegimeFamily];
    if (!meta) return <span className="text-sm font-medium">{regime}</span>;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold"
            style={{ backgroundColor: meta.color + '20', color: meta.color, border: `1px solid ${meta.color}40` }}
        >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
            {regime}
        </span>
    );
}

function SummaryTable({ data, statType }: { data: RegimeReturnStats[]; statType: 'avg' | 'median' }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Regime</th>
                        <th className="text-center py-3 px-2 font-semibold text-muted-foreground">#</th>
                        <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Avg Duration</th>
                        <th className="text-center py-3 px-3 font-semibold text-muted-foreground">During Regime</th>
                        <th className="text-center py-3 px-3 font-semibold text-muted-foreground">1Y Forward</th>
                        <th className="text-center py-3 px-3 font-semibold text-muted-foreground">3Y Forward</th>
                        <th className="text-center py-3 px-3 font-semibold text-muted-foreground">5Y Forward</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((r) => {
                        const during = statType === 'avg' ? r.avgDuringReturn : r.medianDuringReturn;
                        const fwd1 = statType === 'avg' ? r.avg1Y : r.median1Y;
                        const fwd3 = statType === 'avg' ? r.avg3Y : r.median3Y;
                        const fwd5 = statType === 'avg' ? r.avg5Y : r.median5Y;
                        return (
                            <tr key={r.regime} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                <td className="py-3 px-3"><RegimeTag regime={r.regime} /></td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{r.occurrences}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{r.avgDurationMonths}mo</td>
                                <td className={`text-center py-3 px-3 font-mono font-medium ${returnColor(during)}`}>{formatReturn(during)}</td>
                                <td className={`text-center py-3 px-3 font-mono font-medium ${returnColor(fwd1)}`}>{formatReturn(fwd1)}</td>
                                <td className={`text-center py-3 px-3 font-mono font-medium ${returnColor(fwd3)}`}>{formatReturn(fwd3)}</td>
                                <td className={`text-center py-3 px-3 font-mono font-medium ${returnColor(fwd5)}`}>{formatReturn(fwd5)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function PeriodTable({ periods }: { periods: PeriodDetail[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Period</th>
                        <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Months</th>
                        <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Entry Price</th>
                        <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Exit Price</th>
                        <th className="text-center py-2 px-3 font-semibold text-muted-foreground">During</th>
                        <th className="text-center py-2 px-3 font-semibold text-muted-foreground">1Y Fwd</th>
                        <th className="text-center py-2 px-3 font-semibold text-muted-foreground">3Y Fwd</th>
                        <th className="text-center py-2 px-3 font-semibold text-muted-foreground">5Y Fwd</th>
                    </tr>
                </thead>
                <tbody>
                    {periods.map((p, i) => (
                        <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                            <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                                {formatDate(p.startDate)} → {formatDate(p.endDate)}
                                {p.isCurrent && <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">ACTIVE</span>}
                            </td>
                            <td className="text-center py-2 px-2 text-muted-foreground">{p.months}</td>
                            <td className="text-center py-2 px-2 font-mono text-muted-foreground">{p.entryPrice?.toLocaleString() ?? '—'}</td>
                            <td className="text-center py-2 px-2 font-mono text-muted-foreground">{p.exitPrice?.toLocaleString() ?? '—'}</td>
                            <td className={`text-center py-2 px-3 font-mono font-medium ${returnColor(p.duringReturn)}`}>{formatReturn(p.duringReturn)}</td>
                            <td className={`text-center py-2 px-3 font-mono font-medium ${returnColor(p.forward1Y)}`}>{formatReturn(p.forward1Y)}</td>
                            <td className={`text-center py-2 px-3 font-mono font-medium ${returnColor(p.forward3Y)}`}>{formatReturn(p.forward3Y)}</td>
                            <td className={`text-center py-2 px-3 font-mono font-medium ${returnColor(p.forward5Y)}`}>{formatReturn(p.forward5Y)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function RegimeReturns() {
    const [activeAsset, setActiveAsset] = useState('sp500');
    const [dataByAsset, setDataByAsset] = useState<Record<string, RegimeReturnStats[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRegime, setExpandedRegime] = useState<string | null>(null);
    const [statType, setStatType] = useState<'avg' | 'median'>('avg');

    useEffect(() => {
        setLoading(true);
        setError(null);
        if (dataByAsset[activeAsset]) {
            setLoading(false);
            return;
        }
        fetch(`/api/regime-returns?asset=${activeAsset}`)
            .then(res => res.json())
            .then(json => {
                setDataByAsset(prev => ({ ...prev, [activeAsset]: json.regimeReturns }));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [activeAsset]);

    const data = dataByAsset[activeAsset] ?? [];
    const activeAssetMeta = ASSETS.find(a => a.key === activeAsset)!;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h2
                    className="text-2xl font-light tracking-wider mb-2"
                    style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}
                >
                    REGIME-CONDITIONED RETURNS
                </h2>
                <p
                    className="text-sm font-light text-muted-foreground tracking-widest uppercase mb-4"
                    style={{ letterSpacing: '0.2em' }}
                >
                    {activeAssetMeta.label} Returns by Market Regime • {activeAssetMeta.subtitle}
                </p>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                    How did {activeAssetMeta.label} perform during each regime, and what were forward returns
                    from the point of regime entry?
                </p>
            </div>

            {/* Asset tabs */}
            <div className="flex gap-1 mb-6 p-1 rounded-lg bg-muted/50 w-fit">
                {ASSETS.map(a => (
                    <button
                        key={a.key}
                        onClick={() => { setActiveAsset(a.key); setExpandedRegime(null); }}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeAsset === a.key
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {a.label}
                    </button>
                ))}
            </div>

            {/* Stat type toggle */}
            <div className="flex justify-end mb-4">
                <div className="inline-flex rounded-lg border border-border overflow-hidden text-sm">
                    <button
                        onClick={() => setStatType('avg')}
                        className={`px-4 py-1.5 transition-colors ${statType === 'avg' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                        Average
                    </button>
                    <button
                        onClick={() => setStatType('median')}
                        className={`px-4 py-1.5 transition-colors ${statType === 'median' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                        Median
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-12">Error: {error}</div>
            ) : (
                <>
                    {/* Summary table */}
                    <div className="rounded-xl border border-border bg-card mb-8">
                        <SummaryTable data={data} statType={statType} />
                    </div>

                    {/* Expandable detail sections */}
                    <div className="space-y-3">
                        {data.map((r) => (
                            <div key={r.regime} className="rounded-xl border border-border bg-card overflow-hidden">
                                <button
                                    onClick={() => setExpandedRegime(expandedRegime === r.regime ? null : r.regime)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <RegimeTag regime={r.regime} />
                                        <span className="text-sm text-muted-foreground">
                                            {r.occurrences} occurrence{r.occurrences !== 1 ? 's' : ''}
                                        </span>
                                        {r.minDuringReturn !== null && r.maxDuringReturn !== null && (
                                            <span className="text-xs text-muted-foreground">
                                                Range: <span className={returnColor(r.minDuringReturn)}>{formatReturn(r.minDuringReturn)}</span>
                                                {' to '}
                                                <span className={returnColor(r.maxDuringReturn)}>{formatReturn(r.maxDuringReturn)}</span>
                                            </span>
                                        )}
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-muted-foreground transition-transform ${expandedRegime === r.regime ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {expandedRegime === r.regime && (
                                    <div className="border-t border-border">
                                        <div className="px-4 py-2 bg-muted/20 text-xs text-muted-foreground">
                                            {REGIME_METADATA[r.regime as RegimeFamily]?.description}
                                        </div>
                                        <PeriodTable periods={r.periods} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Methodology note */}
                    <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Methodology</p>
                        <p className="mb-2">
                            Returns are calculated using {activeAssetMeta.label} daily closing prices. &quot;During Regime&quot; measures the total return
                            from regime entry to exit. Forward returns (1Y/3Y/5Y) are measured from the regime entry date.
                            Regime periods are identified from the persistent state machine timeline (1960–present).
                            Forward returns may be null for recent periods where insufficient time has elapsed.
                        </p>
                        <p>
                            <span className="font-semibold">Entry &amp; exit dates</span> are month-end dates (e.g. Apr 30, 2020).
                            Regime classification is based on monthly macro data — a regime change detected in April uses April&apos;s
                            month-end readings, which are estimable by month-end even if official data releases follow shortly after.
                            Entry and exit prices are the closest daily close to that month-end date (within a 10-day window).
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
