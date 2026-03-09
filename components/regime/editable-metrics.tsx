'use client';

import { useState, useEffect } from 'react';

interface EditableMetricsProps {
    onMetricsChange: (metrics: {
        tnx: number | null;
        irx: number | null;
        cpi: number | null;
        ey5yr: number | null;
        real10Y: number | null;
        real3M: number | null;
        rey5yr: number | null;
        eyp5yr: number | null;
        yieldCurve: number | null;
    }) => void;
}

export default function EditableMetrics({ onMetricsChange }: EditableMetricsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tnx, setTnx] = useState<string>('');
    const [irx, setIrx] = useState<string>('');
    const [cpi, setCpi] = useState<string>('');
    const [ey5yr, setEy5yr] = useState<string>('');

    // Fetch latest nominal values
    const fetchLatestNominals = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/latest-nominals');
            const data = await response.json();

            setTnx(data.tnx ? parseFloat(data.tnx).toFixed(2) : '');
            setIrx(data.irx ? parseFloat(data.irx).toFixed(2) : '');
            setCpi(data.cpi ? parseFloat(data.cpi).toFixed(2) : '');
            setEy5yr(data.ey5yr ? parseFloat(data.ey5yr).toFixed(2) : '');
        } catch (error) {
            console.error('Error fetching latest nominals:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch latest nominal values
    useEffect(() => {
        if (isExpanded) {
            fetchLatestNominals();
        }
    }, [isExpanded]);

    // Calculate real rates whenever inputs change
    useEffect(() => {
        const tnxNum = parseFloat(tnx);
        const irxNum = parseFloat(irx);
        const cpiNum = parseFloat(cpi);
        const ey5yrNum = parseFloat(ey5yr);

        const real10Y = !isNaN(tnxNum) && !isNaN(cpiNum) ? tnxNum - cpiNum : null;
        const real3M = !isNaN(irxNum) && !isNaN(cpiNum) ? irxNum - cpiNum : null;
        const rey5yr = !isNaN(ey5yrNum) && !isNaN(cpiNum) ? ey5yrNum - cpiNum : null;
        const eyp5yr = !isNaN(ey5yrNum) && !isNaN(irxNum) ? ey5yrNum - irxNum : null;
        const yieldCurve = !isNaN(tnxNum) && !isNaN(irxNum) ? tnxNum - irxNum : null;

        onMetricsChange({
            tnx: !isNaN(tnxNum) ? tnxNum : null,
            irx: !isNaN(irxNum) ? irxNum : null,
            cpi: !isNaN(cpiNum) ? cpiNum : null,
            ey5yr: !isNaN(ey5yrNum) ? ey5yrNum : null,
            real10Y,
            real3M,
            rey5yr,
            eyp5yr,
            yieldCurve
        });
    }, [tnx, irx, cpi, ey5yr, onMetricsChange]);

    const real10Y = !isNaN(parseFloat(tnx)) && !isNaN(parseFloat(cpi))
        ? (parseFloat(tnx) - parseFloat(cpi)).toFixed(2)
        : 'N/A';

    const real3M = !isNaN(parseFloat(irx)) && !isNaN(parseFloat(cpi))
        ? (parseFloat(irx) - parseFloat(cpi)).toFixed(2)
        : 'N/A';

    const rey5yr = !isNaN(parseFloat(ey5yr)) && !isNaN(parseFloat(cpi))
        ? (parseFloat(ey5yr) - parseFloat(cpi)).toFixed(2)
        : 'N/A';

    const eyp5yr = !isNaN(parseFloat(ey5yr)) && !isNaN(parseFloat(irx))
        ? (parseFloat(ey5yr) - parseFloat(irx)).toFixed(2)
        : 'N/A';

    const yieldCurve = !isNaN(parseFloat(tnx)) && !isNaN(parseFloat(irx))
        ? (parseFloat(tnx) - parseFloat(irx)).toFixed(2)
        : 'N/A';

    return (
        <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg">
            <div className="w-full flex items-center justify-between">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex-1 flex items-center justify-between hover:opacity-70 transition-opacity"
                >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Latest Metrics (Editable)
                    </h3>
                    <span className="text-sm text-muted-foreground">
                        {isExpanded ? '▼' : '▶'}
                    </span>
                </button>
                {isExpanded && (
                    <button
                        onClick={() => fetchLatestNominals()}
                        className="ml-2 px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-4">
                    {loading ? (
                        <div className="text-center text-sm text-muted-foreground">Loading...</div>
                    ) : (
                        <>
                            {/* Nominal Inputs */}
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                                        10Y Treasury (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={tnx}
                                        onChange={(e) => setTnx(e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                                        placeholder="4.50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                                        3M Treasury (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={irx}
                                        onChange={(e) => setIrx(e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                                        placeholder="4.25"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                                        CPI YoY (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={cpi}
                                        onChange={(e) => setCpi(e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                                        placeholder="3.00"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                                        EY 5yr (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={ey5yr}
                                        onChange={(e) => setEy5yr(e.target.value)}
                                        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                                        placeholder="5.00"
                                    />
                                    <div className="text-xs text-muted-foreground mt-1">
                                        P/E: {!isNaN(parseFloat(ey5yr)) && parseFloat(ey5yr) > 0 ? (100 / parseFloat(ey5yr)).toFixed(2) : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Calculated Metrics */}
                            <div className="pt-3 border-t border-border">
                                <div className="text-xs font-semibold text-muted-foreground mb-2">
                                    Calculated Metrics
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 rounded-md bg-muted/30 border border-border">
                                        <div className="text-xs text-muted-foreground mb-1">Real 10Y</div>
                                        <div className="text-lg font-bold">{real10Y !== 'N/A' ? `${real10Y}%` : 'N/A'}</div>
                                    </div>
                                    <div className="p-3 rounded-md bg-muted/30 border border-border">
                                        <div className="text-xs text-muted-foreground mb-1">Real 3M</div>
                                        <div className="text-lg font-bold">{real3M !== 'N/A' ? `${real3M}%` : 'N/A'}</div>
                                    </div>
                                    <div className="p-3 rounded-md bg-muted/30 border border-border">
                                        <div className="text-xs text-muted-foreground mb-1">Real EY</div>
                                        <div className="text-lg font-bold">{rey5yr !== 'N/A' ? `${rey5yr}%` : 'N/A'}</div>
                                    </div>
                                    <div className="p-3 rounded-md bg-muted/30 border border-border">
                                        <div className="text-xs text-muted-foreground mb-1">EYP</div>
                                        <div className="text-lg font-bold">{eyp5yr !== 'N/A' ? `${eyp5yr}%` : 'N/A'}</div>
                                    </div>
                                    <div className="p-3 rounded-md bg-muted/30 border border-border">
                                        <div className="text-xs text-muted-foreground mb-1">Yield Curve</div>
                                        <div className="text-lg font-bold">{yieldCurve !== 'N/A' ? `${yieldCurve}%` : 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
