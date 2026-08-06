'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import CpiCalculator from '@/components/cpi-calculator';
import PageHeader from '@/components/page-header';

const SERIES_OPTIONS = [
    { value: 'CPI-U', label: 'CPI (Index → YoY%)', placeholder: '314.5', source: 'Released 10th–13th of the month', urls: [{ label: 'bls.gov', href: 'https://www.bls.gov/cpi/' }, { label: 'BLS data query', href: 'https://data.bls.gov/pdq/SurveyOutputServlet' }] },
    { value: 'M2', label: 'M2 ($B → YoY%)', placeholder: '22442.1', source: 'Released 4th Tuesday of every month', urls: [{ label: 'fred.stlouisfed.org', href: 'https://fred.stlouisfed.org/series/WM2NS' }] },
    {
        value: 'SP500-EPS', label: 'SP500 EPS ($)', placeholder: '234.06', source: 'Quarterly', urls: [
            { label: 'gurufocus.com', href: 'https://www.gurufocus.com/economic_indicators/4281/sp-500-eps-with-estimate-ttm' },
            { label: 'spglobal.com', href: 'https://www.spglobal.com/spdji/en/documents/additional-material/sp-500-eps-est.xlsx' },
        ]
    },
];

interface RecentRow {
    date: string;
    value: number;
    yoy?: number | null;
    isFilled?: boolean;
}

export default function DataInputPage() {
    const [series, setSeries] = useState('CPI-U');
    const [date, setDate] = useState('');
    const [value, setValue] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [recent, setRecent] = useState<RecentRow[]>([]);
    const [quarterly, setQuarterly] = useState<{ date: string; eps: number }[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(false);
    const [page, setPage] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    const PAGE_SIZE = 20;

    const loadRecent = useCallback(async (s: string) => {
        // Cancel any in-flight request
        const prev = abortRef.current;
        const controller = new AbortController();
        abortRef.current = controller;
        // Abort the previous controller after wiring up the new one
        prev?.abort();
        setLoadingRecent(true);
        try {
            const res = await fetch(`/api/data-input?series=${s}`, { signal: controller.signal });
            if (controller.signal.aborted) return;
            const json = await res.json();
            setPage(0);
            setRecent(json.data || []);
            setQuarterly(json.quarterly || []);
        } catch (e: any) {
            if (e.name === 'AbortError') return;
            console.error(e);
        } finally {
            if (!controller.signal.aborted) setLoadingRecent(false);
        }
    }, []);

    useEffect(() => {
        loadRecent(series);
    }, [series, loadRecent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !value) return;

        setSubmitting(true);
        setStatus(null);

        try {
            const res = await fetch('/api/data-input', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ series, date, value: parseFloat(value) }),
            });
            const json = await res.json();

            if (!res.ok) {
                setStatus({ type: 'error', message: json.error || 'Failed to save' });
            } else {
                setStatus({ type: 'success', message: `Saved ${series === 'M2' ? 'M2 nominal' : series} = ${json.value} for ${json.dates ? json.dates.join(', ') : json.date}${json.extra || ''}` });
                setValue('');
                loadRecent(series);
            }
        } catch {
            setStatus({ type: 'error', message: 'Network error' });
        } finally {
            setSubmitting(false);
        }
    };

    const selectedOption = SERIES_OPTIONS.find(o => o.value === series)!;
    const isPercent = false;
    const valueLabel = series === 'M2' ? '($B)' : series === 'CPI-U' ? '(Index)' : '($)';

    const totalPages = Math.ceil(recent.length / PAGE_SIZE);
    // For CPI MoM% we need the row immediately after the visible slice too,
    // so keep a reference to the full array for index lookups.
    const pageRows = recent.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <PageHeader title="DATA INPUT" subtitle="Manual data entry" />

            <div className="rounded-xl border border-border bg-card p-6 mb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Series */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Series</label>
                        <div className="flex gap-2 flex-wrap">
                            {SERIES_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => { setSeries(opt.value); setStatus(null); }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${series === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {selectedOption.source && (
                            <div className="text-xs text-muted-foreground mt-1.5">
                                {selectedOption.source} —{' '}
                                {selectedOption.urls.map((u, i) => (
                                    <span key={u.href}>
                                        {i > 0 && ' · '}
                                        <a href={u.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
                                            {u.label}
                                        </a>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date + Value */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Month</label>
                            {series === 'SP500-EPS' ? (
                                <select
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select quarter...</option>
                                    {(() => {
                                        const options = [];
                                        const now = new Date();
                                        // Snap to next quarter boundary
                                        const currentQMonth = Math.ceil((now.getMonth() + 1) / 3) * 3;
                                        let y = now.getFullYear();
                                        let m = currentQMonth;

                                        // 4 future quarters (forward estimates)
                                        const futureOptions = [];
                                        let fy = y, fm = m;
                                        for (let i = 0; i < 4; i++) {
                                            fm += 3;
                                            if (fm > 12) { fm -= 12; fy += 1; }
                                            const val = `${fy}-${String(fm).padStart(2, '0')}`;
                                            const label = new Date(fy, fm - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                            futureOptions.push(<option key={val} value={val}>{label} (est)</option>);
                                        }
                                        // Add future options in chronological order
                                        options.push(...futureOptions.reverse());

                                        // 16 past quarters (actuals), starting from current
                                        for (let i = 0; i < 16; i++) {
                                            const val = `${y}-${String(m).padStart(2, '0')}`;
                                            const label = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                            options.push(<option key={val} value={val}>{label}</option>);
                                            m -= 3;
                                            if (m < 1) { m += 12; y -= 1; }
                                        }
                                        return options;
                                    })()}
                                </select>
                            ) : (
                                <input
                                    type="month"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                                Value {valueLabel}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                placeholder={selectedOption.placeholder}
                                required
                                className="w-full px-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </button>
                </form>

                {status && (
                    <div className={`mt-4 px-4 py-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'}`}>
                        {status.message}
                    </div>
                )}
            </div>

            {/* CPI Calculator */}
            {series === 'CPI-U' && (
                <div className="mb-6">
                    <CpiCalculator targetMonth={date} onUseValue={(v) => setValue(v)} />
                </div>
            )}

            {/* Recent entries */}
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Recent — {selectedOption.label}
                </div>
                {series === 'SP500-EPS' ? (
                    <>
                        {/* Quarterly actuals — primary table */}
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quarterly Actuals</div>
                        {quarterly.length === 0 && !loadingRecent ? (
                            <p className="text-xs text-muted-foreground py-4 text-center">No data</p>
                        ) : (
                            <table className={`w-full text-sm ${loadingRecent ? 'opacity-40' : ''}`}>
                                <thead>
                                    <tr className="text-xs text-muted-foreground border-b border-border">
                                        <th className="text-left pb-2">Quarter End</th>
                                        <th className="text-right pb-2">EPS ($)</th>
                                        <th className="text-right pb-2">TTM ($)</th>
                                        <th className="text-right pb-2">YoY %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quarterly.map((row, i) => {
                                        const prevYear = quarterly.find(r => {
                                            const d1 = new Date(row.date), d2 = new Date(r.date);
                                            return d2.getFullYear() === d1.getFullYear() - 1 && d2.getMonth() === d1.getMonth();
                                        });
                                        const yoy = prevYear ? ((row.eps - prevYear.eps) / Math.abs(prevYear.eps)) * 100 : null;
                                        const ttmSlice = quarterly.slice(i, i + 4);
                                        const ttm = ttmSlice.length === 4 ? ttmSlice.reduce((s, r) => s + r.eps, 0) : null;
                                        return (
                                            <tr key={i} className="border-b border-border/40 last:border-0">
                                                <td className="py-1.5 text-muted-foreground">{row.date}</td>
                                                <td className="py-1.5 text-right font-medium">{row.eps.toFixed(2)}</td>
                                                <td className="py-1.5 text-right text-muted-foreground">{ttm != null ? ttm.toFixed(2) : <span className="text-muted-foreground/40">—</span>}</td>
                                                <td className={`py-1.5 text-right font-medium ${yoy == null ? '' : yoy >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {yoy != null ? `${yoy.toFixed(1)}%` : <span className="text-muted-foreground/40">—</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                        {/* TTM entries (filled months) */}
                        {recent.length > 0 && (
                            <div className="mt-6">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">TTM — Monthly Fill</div>
                                <table className={`w-full text-sm ${loadingRecent ? 'opacity-40' : ''}`}>
                                    <thead>
                                        <tr className="text-xs text-muted-foreground border-b border-border">
                                            <th className="text-left pb-2">Q-End</th>
                                            <th className="text-left pb-2 text-muted-foreground/50">+1mo</th>
                                            <th className="text-left pb-2 text-muted-foreground/50">+2mo</th>
                                            <th className="text-right pb-2">Q-End</th>
                                            <th className="text-right pb-2 text-muted-foreground/50">+1mo</th>
                                            <th className="text-right pb-2 text-muted-foreground/50">+2mo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const chunks: RecentRow[][] = [];
                                            for (let i = 0; i < recent.length; i += 3) chunks.push(recent.slice(i, i + 3));
                                            return chunks.map((chunk, ci) => (
                                                <tr key={ci} className="border-b border-border/40 last:border-0">
                                                    {[0, 1, 2].map(j => (
                                                        <td key={j} className={`py-1.5 pr-3 ${j > 0 ? 'text-muted-foreground/40 text-xs' : 'text-muted-foreground'}`}>
                                                            {chunk[j]?.date ?? '—'}
                                                        </td>
                                                    ))}
                                                    {[0, 1, 2].map(j => (
                                                        <td key={j} className={`py-1.5 text-right ${j > 0 ? 'text-muted-foreground/40 text-xs' : 'font-medium'}`}>
                                                            {chunk[j] != null ? chunk[j].value.toFixed(2) : '—'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <table className={`w-full text-sm ${loadingRecent ? 'opacity-40' : ''}`}>
                            <thead>
                                <tr className="text-xs text-muted-foreground border-b border-border">
                                    <th className="text-left pb-2">Date</th>
                                    {series === 'M2' ? (
                                        <>
                                            <th className="text-right pb-2">Nominal ($B)</th>
                                            <th className="text-right pb-2">YoY %</th>
                                        </>
                                    ) : series === 'CPI-U' ? (
                                        <>
                                            <th className="text-right pb-2">Index</th>
                                            <th className="text-right pb-2">MoM %</th>
                                            <th className="text-right pb-2">YoY %</th>
                                        </>
                                    ) : (
                                        <th className="text-right pb-2">Value</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {recent.length === 0 && !loadingRecent ? (
                                    <tr><td colSpan={series === 'CPI-U' ? 4 : series === 'M2' ? 3 : 2} className="py-4 text-center text-muted-foreground text-xs">No data</td></tr>
                                ) : pageRows.map((row, localIdx) => {
                                    const globalIdx = page * PAGE_SIZE + localIdx;
                                    return (
                                        <tr key={row.date} className="border-b border-border/40 last:border-0">
                                            <td className="py-1.5 text-muted-foreground">{row.date}</td>
                                            {series === 'M2' ? (
                                                <>
                                                    <td className="py-1.5 text-right font-medium">{row.value.toFixed(1)}</td>
                                                    <td className="py-1.5 text-right font-medium">
                                                        {row.yoy != null ? `${row.yoy.toFixed(2)}%` : <span className="text-muted-foreground/40">—</span>}
                                                    </td>
                                                </>
                                            ) : series === 'CPI-U' ? (
                                                <>
                                                    <td className="py-1.5 text-right font-medium">{row.value?.toFixed(3)}</td>
                                                    <td className="py-1.5 text-right font-medium">
                                                        {(() => {
                                                            const prev = recent[globalIdx + 1];
                                                            if (!prev || !prev.value || !row.value) return <span className="text-muted-foreground/40">—</span>;
                                                            const mom = ((row.value - prev.value) / prev.value) * 100;
                                                            return <span className={mom >= 0 ? 'text-green-400' : 'text-red-400'}>{mom.toFixed(2)}%</span>;
                                                        })()}
                                                    </td>
                                                    <td className="py-1.5 text-right font-medium">
                                                        {row.yoy != null ? `${row.yoy.toFixed(2)}%` : <span className="text-muted-foreground/40">—</span>}
                                                    </td>
                                                </>
                                            ) : (
                                                <td className="py-1.5 text-right font-medium">
                                                    {isPercent ? `${row.value.toFixed(2)}%` : row.value?.toFixed(2)}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                                <span className="text-xs text-muted-foreground">
                                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, recent.length)} of {recent.length}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={page === 0}
                                        className="px-2.5 py-1 rounded text-xs font-medium bg-muted/60 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ← Prev
                                    </button>
                                    <span className="px-2.5 py-1 text-xs text-muted-foreground">
                                        {page + 1} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= totalPages - 1}
                                        className="px-2.5 py-1 rounded text-xs font-medium bg-muted/60 text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
