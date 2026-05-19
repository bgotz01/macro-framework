'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';
import { DEFAULT_THRESHOLDS } from '@/components/regime/custom-regime-modal';

interface RegimeResponse {
    regime: string;
    entryDate: string;
    daysInRegime: number;
    triggerReason: string;
}

export default function CurrentRegimeBanner() {
    const [data, setData] = useState<RegimeResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/custom-regime-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thresholds: DEFAULT_THRESHOLDS, targetDate: 'latest' }),
        })
            .then(r => r.json())
            .then(setData)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center mt-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                    Current Regime
                </span>
                <div className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-muted/50 text-muted-foreground text-sm animate-pulse">
                    <span className="w-3.5 h-3.5 rounded-full bg-muted-foreground/30" />
                    Loading...
                </div>
            </div>
        );
    }

    if (!data) return null;

    const regime = data.regime as RegimeFamily;
    const metadata = REGIME_METADATA[regime];
    if (!metadata) return null;

    const months = data.daysInRegime;

    return (
        <div className="flex flex-col items-center mt-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                Current Regime
            </span>
            <Link
                href="/regime-active"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/40 hover:shadow-lg transition-all duration-200 group"
            >
                <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: metadata.color, boxShadow: `0 0 14px ${metadata.color}50` }}
                />
                <span className="text-lg font-semibold text-foreground tracking-wide">
                    {regime}
                </span>
                {months > 0 && (
                    <span className="text-sm text-muted-foreground font-medium">
                        · {months} mo
                    </span>
                )}
                <span className="text-sm text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                    →
                </span>
            </Link>
        </div>
    );
}
