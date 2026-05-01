'use client';

import { useState, useEffect } from 'react';

interface CpiCalculatorProps {
    targetMonth: string; // YYYY-MM from the main form
    onUseValue: (indexLevel: string) => void;
}

export default function CpiCalculator({ targetMonth, onUseValue }: CpiCalculatorProps) {
    const [open, setOpen] = useState(false);
    const [yoyPct, setYoyPct] = useState('');
    const [priorIndex, setPriorIndex] = useState<number | null>(null);
    const [priorDate, setPriorDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch the same-month prior year index level whenever targetMonth changes
    useEffect(() => {
        if (!targetMonth) { setPriorIndex(null); setPriorDate(null); return; }

        const [y, m] = targetMonth.split('-').map(Number);
        const lastDay = new Date(y - 1, m, 0).getDate();
        const prior = `${y - 1}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        setPriorDate(prior);

        setLoading(true);
        fetch('/api/data-input?series=CPI-U')
            .then(r => r.json())
            .then(json => {
                const row = (json.data as { date: string; value: number }[])?.find(d => d.date === prior);
                setPriorIndex(row?.value ?? null);
            })
            .catch(() => setPriorIndex(null))
            .finally(() => setLoading(false));
    }, [targetMonth]);

    const pct = parseFloat(yoyPct);
    const implied = priorIndex !== null && !isNaN(pct) ? priorIndex * (1 + pct / 100) : null;

    return (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 overflow-hidden">
            {/* Header / toggle */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
                <span>CPI Index Calculator</span>
                <span className="text-base leading-none">{open ? '−' : '+'}</span>
            </button>

            {/* Expandable body */}
            {open && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/40">
                    <div className="flex gap-3 items-end pt-3">
                        <div className="flex-1">
                            <label className="block text-xs text-muted-foreground mb-1">YoY %</label>
                            <input
                                type="number"
                                step="0.01"
                                value={yoyPct}
                                onChange={e => setYoyPct(e.target.value)}
                                placeholder="2.80"
                                className="w-full px-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex-1 text-xs text-muted-foreground pb-2.5">
                            {!targetMonth ? (
                                'Select a month above first'
                            ) : loading ? (
                                'Loading prior year...'
                            ) : priorIndex === null ? (
                                <>No data for {priorDate}<br />Enter that month first</>
                            ) : (
                                <>Prior year ({priorDate}): <span className="font-medium text-foreground">{priorIndex.toFixed(3)}</span></>
                            )}
                        </div>
                    </div>

                    {implied !== null && (
                        <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 border border-border/50 px-4 py-3">
                            <div>
                                <span className="text-xs text-muted-foreground">Implied index: </span>
                                <span className="text-base font-bold">{implied.toFixed(3)}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => onUseValue(implied.toFixed(3))}
                                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity shrink-0"
                            >
                                Use ↑
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
