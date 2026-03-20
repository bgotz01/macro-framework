'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const SERIES_OPTIONS = [
    { value: 'CPI', label: 'CPI (YoY %)', placeholder: '2.4' },
    { value: 'M2-YoY', label: 'M2 YoY (%)', placeholder: '4.3' },
    { value: 'SP500-EPS', label: 'SP500 EPS ($)', placeholder: '234.06' },
];

interface RecentRow {
    date: string;
    value: number;
    isFilled?: boolean;
}

export default function DataInputPage() {
    const [series, setSeries] = useState('CPI');
    const [date, setDate] = useState('');
    const [value, setValue] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [recent, setRecent] = useState<RecentRow[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const loadRecent = useCallback(async (s: string) => {
        // Cancel any in-flight request
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoadingRecent(true);
        try {
            const res = await fetch(`/api/data-input?series=${s}`, { signal: abortRef.current.signal });
            const json = await res.json();
            setRecent(json.data || []);
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error(e);
        } finally {
            setLoadingRecent(false);
        }
    }, []);

    useEffect(() => {
        setRecent([]);
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
                setStatus({ type: 'success', message: `Saved ${series} = ${json.value} for ${json.dates ? json.dates.join(', ') : json.date}` });
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
    const isPercent = series !== 'SP500-EPS';

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="text-center mb-8">
                <h2
                    className="text-2xl font-light tracking-wider mb-2"
                    style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}
                >
                    DATA INPUT
                </h2>
                <p className="text-sm text-muted-foreground tracking-widest uppercase" style={{ letterSpacing: '0.2em' }}>
                    Manual data entry
                </p>
            </div>

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
                                        // Start from current quarter-end, go back 12 quarters
                                        let y = now.getFullYear();
                                        let m = Math.ceil((now.getMonth() + 1) / 3) * 3; // snap to 3,6,9,12
                                        for (let i = 0; i < 12; i++) {
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
                                Value {isPercent ? '(%)' : '($)'}
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

            {/* Recent entries */}
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Recent — {selectedOption.label}
                </div>
                {series === 'SP500-EPS' ? (
                    // Group into rows of 3 (anchor + 2 filled months)
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
                            {recent.length === 0 && !loadingRecent ? (
                                <tr><td colSpan={6} className="py-4 text-center text-muted-foreground text-xs">No data</td></tr>
                            ) : (() => {
                                // Group consecutive rows into chunks of 3
                                const chunks: RecentRow[][] = [];
                                for (let i = 0; i < recent.length; i += 3) {
                                    chunks.push(recent.slice(i, i + 3));
                                }
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
                ) : (
                    <table className={`w-full text-sm ${loadingRecent ? 'opacity-40' : ''}`}>
                        <thead>
                            <tr className="text-xs text-muted-foreground border-b border-border">
                                <th className="text-left pb-2">Date</th>
                                <th className="text-right pb-2">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.length === 0 && !loadingRecent ? (
                                <tr><td colSpan={2} className="py-4 text-center text-muted-foreground text-xs">No data</td></tr>
                            ) : recent.map(row => (
                                <tr key={row.date} className="border-b border-border/40 last:border-0">
                                    <td className="py-1.5 text-muted-foreground">{row.date}</td>
                                    <td className="py-1.5 text-right font-medium">
                                        {isPercent ? `${row.value.toFixed(2)}%` : row.value.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
