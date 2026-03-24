'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface Contributor {
    symbol: string;
    company: string;
    performance: number;
    contribution: number;
    mcap_change: number | null;
}

interface PeriodStats {
    distribution: { label: string; count: number }[];
    concentration: {
        totalContribution: number;
        positiveContributors: number;
        negativeContributors: number;
        stocksFor50Pct: number;
        stocksFor80Pct: number;
        top10Contributors: Contributor[];
        bottom10Contributors: Contributor[];
    };
}

interface ReturnDistributionProps {
    stats1y: PeriodStats;
    stats2y: PeriodStats | null;
    stats2025: PeriodStats | null;
    stats2026: PeriodStats | null;
}

function formatMcapChange(value: number | null) {
    if (value === null) return '—';
    const abs = Math.abs(value);
    const sign = value >= 0 ? '+' : '-';
    if (abs >= 1_000_000_000_000) return `${sign}$${(abs / 1_000_000_000_000).toFixed(1)}T`;
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(0)}B`;
    return `${sign}$${(abs / 1_000_000).toFixed(0)}M`;
}

function ContributorRow({ s, rank }: { s: Contributor; rank?: number }) {
    return (
        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
            <div className="flex items-center gap-2">
                {rank !== undefined && <span className="text-muted-foreground w-4">{rank}.</span>}
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{s.symbol}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className={`w-14 text-right font-semibold ${s.contribution >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {s.contribution >= 0 ? '+' : ''}{s.contribution.toFixed(1)}pp
                </span>
                <span className={`w-12 text-right ${s.performance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {s.performance >= 0 ? '+' : ''}{s.performance}%
                </span>
                <span className={`w-16 text-right ${(s.mcap_change ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatMcapChange(s.mcap_change)}
                </span>
            </div>
        </div>
    );
}

function ColumnHeader() {
    return (
        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase mb-1 px-0">
            <span>Symbol</span>
            <div className="flex items-center gap-3">
                <span className="w-14 text-right">Impact</span>
                <span className="w-12 text-right">Return</span>
                <span className="w-16 text-right">MCap Δ</span>
            </div>
        </div>
    );
}

export default function ReturnDistribution({ stats1y, stats2y, stats2025, stats2026 }: ReturnDistributionProps) {
    const [period, setPeriod] = useState<'1y' | '2y' | '2025' | '2026'>('1y');
    const statsMap: Record<string, PeriodStats | null> = { '1y': stats1y, '2y': stats2y, '2025': stats2025, '2026': stats2026 };
    const stats = statsMap[period] || stats1y;
    const { distribution, concentration } = stats;
    const periodLabels: Record<string, string> = { '1y': '1Y', '2y': '2Y', '2025': '2025', '2026': '2026 YTD' };
    const periodLabel = periodLabels[period];

    return (
        <div className="mb-8">
            {/* Period Toggle */}
            <div className="flex gap-2 items-center mb-4">
                <span className="text-sm text-muted-foreground">Period:</span>
                {(['1y', '2y', '2025', '2026'] as const).map(p => {
                    const labels: Record<string, string> = { '1y': '1 Year', '2y': '2 Year', '2025': '2025', '2026': '2026' };
                    const available = statsMap[p];
                    if (!available) return null;
                    return (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-sm rounded-lg border transition-colors ${period === p ? 'bg-blue-600 text-white border-blue-600' : 'border-border hover:bg-muted'}`}
                        >
                            {labels[p]}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Col 1: Top 10 Contributors */}
                <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold mb-1">Top 10 Contributors</h3>
                    <p className="text-sm text-muted-foreground mb-3">Largest positive impact ({periodLabel})</p>
                    <ColumnHeader />
                    <div className="text-xs space-y-1">
                        {concentration.top10Contributors.map((s, i) => (
                            <ContributorRow key={s.symbol} s={s} rank={i + 1} />
                        ))}
                    </div>
                </div>

                {/* Col 2: Concentration Stats + Distribution Chart */}
                <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold mb-1">Concentration</h3>
                    <p className="text-sm text-muted-foreground mb-3">Who's driving the index? ({periodLabel})</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-muted/30 rounded-xl p-3">
                            <div className="text-2xl font-bold">{concentration.positiveContributors}</div>
                            <div className="text-xs text-muted-foreground">Positive contributors</div>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-3">
                            <div className="text-2xl font-bold">{concentration.negativeContributors}</div>
                            <div className="text-xs text-muted-foreground">Negative contributors</div>
                        </div>
                    </div>
                    <h4 className="text-sm font-semibold mb-2">{periodLabel} Return Distribution</h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={distribution.map(d => {
                            const shortLabels: Record<string, string> = {
                                '< -50%': '<-50%',
                                '-50% to -20%': '-20%',
                                '-20% to -10%': '-10%',
                                '-10% to 0%': '0%',
                                '0% to 10%': '+10%',
                                '10% to 20%': '+20%',
                                '20% to 50%': '+50%',
                                '50% to 100%': '+100%',
                                '> 100%': '>100%',
                            };
                            return {
                                ...d,
                                shortLabel: shortLabels[d.label] || d.label,
                                fill: d.label.startsWith('<') || d.label.startsWith('-') ? '#ef4444' : '#22c55e',
                            };
                        })} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="shortLabel"
                                interval={0}
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[4, 4, 0, 0]}
                                shape={(props: any) => {
                                    const { x, y, width, height: h, fill } = props;
                                    return <rect x={x} y={y} width={width} height={h} rx={4} ry={4} fill={fill} fillOpacity={0.85} />;
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Col 3: Top 10 Losers */}
                <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold mb-1">Top 10 Losers</h3>
                    <p className="text-sm text-muted-foreground mb-3">Largest negative impact ({periodLabel})</p>
                    <ColumnHeader />
                    <div className="text-xs space-y-1">
                        {concentration.bottom10Contributors.map((s, i) => (
                            <ContributorRow key={s.symbol} s={s} rank={i + 1} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
