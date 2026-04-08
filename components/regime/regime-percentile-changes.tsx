'use client';

import { useEffect, useState } from 'react';
import { formatDate, formatPercentile } from './regime-parameters-utils';

interface PercentileChangeItem {
    label: string;
    current: number | null;
    previous: number | null;
    delta: number | null;
    date: string | null;
    prevDate: string | null;
}

type PercentileChangesData = Record<string, PercentileChangeItem>;

interface Props {
    date: string; // 'latest' or 'YYYY-MM-DD'
}

function formatDelta(delta: number | null): string {
    if (delta === null) return 'N/A';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}`;
}

function getDeltaStyles(delta: number | null): { border: string; text: string } {
    if (delta === null) return { border: 'border-gray-300 dark:border-gray-700', text: 'text-gray-500 dark:text-gray-400' };
    if (delta > 10) return { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
    if (delta < -10) return { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
    return { border: 'border-border', text: 'text-muted-foreground' };
}

function DeltaCard({ label, delta, percentile, date }: {
    label: string;
    delta: number | null;
    percentile: number | null;
    date: string | null;
}) {
    const styles = getDeltaStyles(delta);
    return (
        <div className={`p-2 rounded-lg border-2 bg-card ${styles.border} text-center`}>
            <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
            <div className="text-lg font-semibold mb-1">{formatDelta(delta)}</div>
            <div className={`text-[9px] font-medium mb-0.5 ${styles.text}`}>
                {formatPercentile(percentile)}
            </div>
            <div className="text-[9px] text-muted-foreground">{formatDate(date)}</div>
        </div>
    );
}

export default function RegimePercentileChanges({ date }: Props) {
    const [data, setData] = useState<PercentileChangesData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/percentile-changes?date=${date}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [date]);

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            </div>
        );
    }

    if (!data) return null;

    const keys = ['fedFunds', 'irx', 'tnx', 'cpi', 'realM2', 'pe5yr', 'ey5yr', 'eyp5yr', 'rey5yr'];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
            {keys.map((key) => {
                const item = data[key];
                if (!item) return null;
                return (
                    <DeltaCard
                        key={key}
                        label={item.label}
                        delta={item.delta}
                        percentile={item.current}
                        date={item.date}
                    />
                );
            })}
        </div>
    );
}
