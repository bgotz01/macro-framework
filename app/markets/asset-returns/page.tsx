'use client';

import { useEffect, useState } from 'react';

interface IndexReturn {
    series: string;
    label: string;
    region: string;
    latest: number | null;
    latestDate: string | null;
    r1y: number | null;
    r5y: number | null;
    r10y: number | null;
}

function ReturnCell({ value }: { value: number | null }) {
    if (value === null) return <td className="px-2 sm:px-4 py-3 text-center text-muted-foreground text-xs sm:text-sm">—</td>;
    const color = value >= 0 ? 'text-emerald-500' : 'text-red-500';
    return (
        <td className={`px-2 sm:px-4 py-3 text-center font-mono text-xs sm:text-sm font-medium ${color}`}>
            {value >= 0 ? '+' : ''}{value.toFixed(1)}%
        </td>
    );
}

function ReturnsTable({ rows, regions, formatLatest }: {
    rows: IndexReturn[];
    regions: string[];
    formatLatest: (v: number) => string;
}) {
    return (
        <div className="space-y-6">
            {regions.map(region => {
                const group = rows.filter(d => d.region === region);
                if (group.length === 0) return null;
                return (
                    <div key={region} className="rounded-xl border border-border overflow-hidden">
                        <div className="px-3 sm:px-4 py-2 bg-muted/40 border-b border-border">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{region}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-border text-xs text-muted-foreground">
                                        <th className="px-2 sm:px-4 py-2 text-left font-medium min-w-[120px]">Pair</th>
                                        <th className="px-2 sm:px-4 py-2 text-center font-medium min-w-[80px]">Latest</th>
                                        <th className="px-2 sm:px-4 py-2 text-center font-medium min-w-[80px]">1Y</th>
                                        <th className="px-2 sm:px-4 py-2 text-center font-medium min-w-[80px]">5Y</th>
                                        <th className="px-2 sm:px-4 py-2 text-center font-medium min-w-[80px]">10Y</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {group.map(row => (
                                        <tr key={row.series} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-2 sm:px-4 py-3 text-sm font-medium">{row.label}</td>
                                            <td className="px-2 sm:px-4 py-3 text-center font-mono text-xs sm:text-sm text-muted-foreground">
                                                {row.latest !== null ? formatLatest(row.latest) : '—'}
                                            </td>
                                            <ReturnCell value={row.r1y} />
                                            <ReturnCell value={row.r5y} />
                                            <ReturnCell value={row.r10y} />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const EQUITY_REGIONS = ['North America', 'Europe', 'Asia'];
const FX_REGIONS = ['Major', 'EM'];

export default function CockpitReturnsPage() {
    const [equities, setEquities] = useState<IndexReturn[]>([]);
    const [fx, setFx] = useState<IndexReturn[]>([]);
    const [commodities, setCommodities] = useState<IndexReturn[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/cockpit-returns')
            .then(r => r.json())
            .then(j => { setEquities(j.equities); setFx(j.fx); setCommodities(j.commodities); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const latestDate = equities.find(d => d.latestDate)?.latestDate;

    return (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Asset Returns</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    1yr, 5yr, 10yr price returns for major global assets
                    {latestDate && <span className="ml-2 opacity-60">as of {latestDate}</span>}
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : (
                <div className="space-y-10">
                    <section>
                        <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Equity Indexes</h2>
                        <ReturnsTable
                            rows={equities}
                            regions={EQUITY_REGIONS}
                            formatLatest={v => v.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        />
                    </section>
                    <section>
                        <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Commodities</h2>
                        <ReturnsTable
                            rows={commodities}
                            regions={['Metals', 'Energy']}
                            formatLatest={v => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        />
                    </section>
                    <section>
                        <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">FX Pairs</h2>
                        <ReturnsTable
                            rows={fx}
                            regions={FX_REGIONS}
                            formatLatest={v => v.toFixed(4)}
                        />
                    </section>
                </div>
            )}
        </div>
    );
}
