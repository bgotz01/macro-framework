'use client';

import { useState, useEffect, useMemo } from 'react';

interface AnnualRow {
    year: number;
    sp500Price: number | null;
    annualReturn: number | null;
    reyStart: number | null;
    reyValue: number | null;
    eypStart: number | null;
    eypValue: number | null;
    real10YStart: number | null;
    real10YValue: number | null;
}

const PAGE_SIZE = 10;

const DECADES = [
    { label: 'All', value: 'all' },
    { label: '1960s', value: '1960' },
    { label: '1970s', value: '1970' },
    { label: '1980s', value: '1980' },
    { label: '1990s', value: '1990' },
    { label: '2000s', value: '2000' },
    { label: '2010s', value: '2010' },
    { label: '2020s', value: '2020' },
];

function formatReturn(val: number | null): string {
    if (val === null) return '—';
    return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
}

function returnColor(val: number | null): string {
    if (val === null) return 'text-muted-foreground';
    if (val > 0) return 'text-green-600 dark:text-green-400';
    if (val < 0) return 'text-red-600 dark:text-red-400';
    return '';
}

function reyColor(val: number | null): string {
    if (val === null) return 'text-muted-foreground';
    if (val < -2) return 'text-red-700 dark:text-red-400';
    if (val < 0) return 'text-red-500 dark:text-red-400';
    if (val < 0.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
}

function eypColor(val: number | null): string {
    if (val === null) return 'text-muted-foreground';
    if (val < 0) return 'text-red-600 dark:text-red-400';
    if (val < 1) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
}

function real10YColor(val: number | null): string {
    if (val === null) return 'text-muted-foreground';
    if (val < 0) return 'text-red-600 dark:text-red-400';
    if (val < 1) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
}

export default function AnnualRegimeTable() {
    const [data, setData] = useState<AnnualRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [decade, setDecade] = useState('all');
    const [page, setPage] = useState(1);
    const [sortCol, setSortCol] = useState<'none' | 'year' | 'return'>('none');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [showStart, setShowStart] = useState(true);
    const [showEnd, setShowEnd] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [reyMin, setReyMin] = useState('');
    const [reyMax, setReyMax] = useState('');
    const [eypMin, setEypMin] = useState('');
    const [eypMax, setEypMax] = useState('');
    const [real10YMin, setReal10YMin] = useState('');
    const [real10YMax, setReal10YMax] = useState('');

    useEffect(() => {
        fetch('/api/annual-regime')
            .then(res => res.json())
            .then(json => {
                const rows = (json.data ?? []).filter((r: AnnualRow) => r.year >= 1960);
                setData(rows.reverse());
            })
            .catch(err => console.error('Failed to load annual data:', err))
            .finally(() => setLoading(false));
    }, []);

    const toggleSort = (col: 'year' | 'return') => {
        if (sortCol === col) {
            if (sortDir === 'desc') setSortDir('asc');
            else { setSortCol('none'); setSortDir('desc'); }
        } else {
            setSortCol(col);
            setSortDir('desc');
        }
    };

    // Reset page when decade or sort changes
    useEffect(() => { setPage(1); }, [decade, sortCol, sortDir, reyMin, reyMax, eypMin, eypMax, real10YMin, real10YMax]);

    const filtered = useMemo(() => {
        let rows = decade === 'all' ? data : data.filter(r => {
            const start = parseInt(decade);
            return r.year >= start && r.year < start + 10;
        });

        // Apply range filters on Year Start values
        if (showFilters) {
            const rMin = reyMin !== '' ? parseFloat(reyMin) : null;
            const rMax = reyMax !== '' ? parseFloat(reyMax) : null;
            const eMin = eypMin !== '' ? parseFloat(eypMin) : null;
            const eMax = eypMax !== '' ? parseFloat(eypMax) : null;
            const r10Min = real10YMin !== '' ? parseFloat(real10YMin) : null;
            const r10Max = real10YMax !== '' ? parseFloat(real10YMax) : null;

            rows = rows.filter(r => {
                if (rMin !== null && (r.reyStart === null || r.reyStart < rMin)) return false;
                if (rMax !== null && (r.reyStart === null || r.reyStart > rMax)) return false;
                if (eMin !== null && (r.eypStart === null || r.eypStart < eMin)) return false;
                if (eMax !== null && (r.eypStart === null || r.eypStart > eMax)) return false;
                if (r10Min !== null && (r.real10YStart === null || r.real10YStart < r10Min)) return false;
                if (r10Max !== null && (r.real10YStart === null || r.real10YStart > r10Max)) return false;
                return true;
            });
        }

        if (sortCol === 'year') {
            rows = [...rows].sort((a, b) => sortDir === 'asc' ? a.year - b.year : b.year - a.year);
        } else if (sortCol === 'return') {
            rows = [...rows].sort((a, b) => {
                const av = a.annualReturn ?? -Infinity;
                const bv = b.annualReturn ?? -Infinity;
                return sortDir === 'asc' ? av - bv : bv - av;
            });
        }
        return rows;
    }, [data, decade, sortCol, sortDir, showFilters, reyMin, reyMax, eypMin, eypMax, real10YMin, real10YMax]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const avgReturn = useMemo(() => {
        const returns = filtered.map(r => r.annualReturn).filter((v): v is number => v !== null);
        return returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : null;
    }, [filtered]);

    if (loading) {
        return <div className="text-center py-12 text-muted-foreground">Loading annual data…</div>;
    }

    if (!data.length) {
        return <div className="text-center py-12 text-muted-foreground">No data available.</div>;
    }

    return (
        <div className="space-y-4">
            {/* Decade presets */}
            <div className="flex flex-wrap gap-2">
                {DECADES.map(d => (
                    <button
                        key={d.value}
                        onClick={() => setDecade(d.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${decade === d.value
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-card border-border hover:bg-muted'
                            }`}
                    >
                        {d.label}
                    </button>
                ))}
            </div>

            {/* Column toggles */}
            <div className="flex gap-2">
                <button
                    onClick={() => setShowStart(s => !s)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${showStart
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card border-border hover:bg-muted'
                        }`}
                >
                    Year Start
                </button>
                <button
                    onClick={() => setShowEnd(s => !s)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${showEnd
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card border-border hover:bg-muted'
                        }`}
                >
                    Year End
                </button>
                <button
                    onClick={() => setShowFilters(s => !s)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${showFilters
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card border-border hover:bg-muted'
                        }`}
                >
                    Add Filters
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border-2 border-border">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th
                                className="px-4 py-3 text-sm font-semibold text-left cursor-pointer select-none hover:text-foreground transition-colors"
                                onClick={() => toggleSort('year')}
                            >
                                Year {sortCol === 'year' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            <th className="px-4 py-3 text-sm font-semibold text-right">S&P 500</th>
                            <th
                                className="px-4 py-3 text-sm font-semibold text-right cursor-pointer select-none hover:text-foreground transition-colors"
                                onClick={() => toggleSort('return')}
                            >
                                Annual Return {sortCol === 'return' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                            </th>
                            {showStart && <th className="px-4 py-3 text-sm font-semibold text-right">REY Start</th>}
                            {showEnd && <th className="px-4 py-3 text-sm font-semibold text-right">REY End</th>}
                            {showStart && <th className="px-4 py-3 text-sm font-semibold text-right">EYP Start</th>}
                            {showEnd && <th className="px-4 py-3 text-sm font-semibold text-right">EYP End</th>}
                            {showStart && <th className="px-4 py-3 text-sm font-semibold text-right">Real 10Y Start</th>}
                            {showEnd && <th className="px-4 py-3 text-sm font-semibold text-right">Real 10Y End</th>}
                        </tr>
                        {showFilters && (
                            <tr className="border-t border-border bg-muted/50">
                                <td className="px-2 py-2" />
                                <td className="px-2 py-2" />
                                <td className="px-2 py-2" />
                                {showStart && (
                                    <td className="px-2 py-2">
                                        <div className="flex flex-col gap-1">
                                            <input type="number" step="0.1" placeholder="Min" value={reyMin} onChange={e => setReyMin(e.target.value)}
                                                className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs tabular-nums" />
                                            <input type="number" step="0.1" placeholder="Max" value={reyMax} onChange={e => setReyMax(e.target.value)}
                                                className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs tabular-nums" />
                                        </div>
                                    </td>
                                )}
                                {showEnd && <td className="px-2 py-2" />}
                                {showStart && (
                                    <td className="px-2 py-2">
                                        <div className="flex flex-col gap-1">
                                            <input type="number" step="0.1" placeholder="Min" value={eypMin} onChange={e => setEypMin(e.target.value)}
                                                className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs tabular-nums" />
                                            <input type="number" step="0.1" placeholder="Max" value={eypMax} onChange={e => setEypMax(e.target.value)}
                                                className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs tabular-nums" />
                                        </div>
                                    </td>
                                )}
                                {showEnd && <td className="px-2 py-2" />}
                                {showStart && (
                                    <td className="px-2 py-2">
                                        <div className="flex flex-col gap-1">
                                            <input type="number" step="0.1" placeholder="Min" value={real10YMin} onChange={e => setReal10YMin(e.target.value)}
                                                className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs tabular-nums" />
                                            <input type="number" step="0.1" placeholder="Max" value={real10YMax} onChange={e => setReal10YMax(e.target.value)}
                                                className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs tabular-nums" />
                                        </div>
                                    </td>
                                )}
                                {showEnd && <td className="px-2 py-2" />}
                            </tr>
                        )}
                    </thead>
                    <tbody className="bg-card">
                        {pageData.map(row => (
                            <tr key={row.year} className="border-t border-border hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-medium">{row.year}</td>
                                <td className="px-4 py-3 text-right tabular-nums">
                                    {row.sp500Price !== null ? row.sp500Price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
                                </td>
                                <td className={`px-4 py-3 text-right tabular-nums font-medium ${returnColor(row.annualReturn)}`}>
                                    {formatReturn(row.annualReturn)}
                                </td>
                                {showStart && (
                                    <td className={`px-4 py-3 text-right tabular-nums font-medium ${reyColor(row.reyStart)}`}>
                                        {row.reyStart !== null ? `${row.reyStart.toFixed(2)}%` : '—'}
                                    </td>
                                )}
                                {showEnd && (
                                    <td className={`px-4 py-3 text-right tabular-nums font-medium ${reyColor(row.reyValue)}`}>
                                        {row.reyValue !== null ? `${row.reyValue.toFixed(2)}%` : '—'}
                                    </td>
                                )}
                                {showStart && (
                                    <td className={`px-4 py-3 text-right tabular-nums font-medium ${eypColor(row.eypStart)}`}>
                                        {row.eypStart !== null ? `${row.eypStart.toFixed(2)}%` : '—'}
                                    </td>
                                )}
                                {showEnd && (
                                    <td className={`px-4 py-3 text-right tabular-nums font-medium ${eypColor(row.eypValue)}`}>
                                        {row.eypValue !== null ? `${row.eypValue.toFixed(2)}%` : '—'}
                                    </td>
                                )}
                                {showStart && (
                                    <td className={`px-4 py-3 text-right tabular-nums font-medium ${real10YColor(row.real10YStart)}`}>
                                        {row.real10YStart !== null ? `${row.real10YStart.toFixed(2)}%` : '—'}
                                    </td>
                                )}
                                {showEnd && (
                                    <td className={`px-4 py-3 text-right tabular-nums font-medium ${real10YColor(row.real10YValue)}`}>
                                        {row.real10YValue !== null ? `${row.real10YValue.toFixed(2)}%` : '—'}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-muted/70 border-t-2 border-border">
                        <tr>
                            <td className="px-4 py-3 font-semibold" colSpan={2}>
                                Average ({filtered.filter(r => r.annualReturn !== null).length} years)
                            </td>
                            <td className={`px-4 py-3 text-right tabular-nums font-semibold ${returnColor(avgReturn)}`}>
                                {formatReturn(avgReturn)}
                            </td>
                            {showStart && <td className="px-4 py-3" />}
                            {showEnd && <td className="px-4 py-3" />}
                            {showStart && <td className="px-4 py-3" />}
                            {showEnd && <td className="px-4 py-3" />}
                            {showStart && <td className="px-4 py-3" />}
                            {showEnd && <td className="px-4 py-3" />}
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
