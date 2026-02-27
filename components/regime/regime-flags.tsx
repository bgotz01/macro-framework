'use client';

import { useState, useEffect } from 'react';

interface RegimeFlagsProps {
    selectedDate: string; // Format: YYYY-MM-DD
}

export default function RegimeFlags({ selectedDate }: RegimeFlagsProps) {
    const [yieldCurveInversionDate, setYieldCurveInversionDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchInversionData() {
            setLoading(true);
            try {
                const response = await fetch(`/api/yield-curve-inversion?date=${selectedDate}`);
                const data = await response.json();
                setYieldCurveInversionDate(data.inversionDate);
            } catch (error) {
                console.error('Error fetching inversion data:', error);
                setYieldCurveInversionDate(null);
            } finally {
                setLoading(false);
            }
        }

        fetchInversionData();
    }, [selectedDate]);

    // Calculate if we're within 24 months of yield curve inversion
    const showEquityWarning = () => {
        if (!yieldCurveInversionDate) return false;

        const inversionDate = new Date(yieldCurveInversionDate);
        const current = new Date(selectedDate);
        const monthsDiff = (current.getFullYear() - inversionDate.getFullYear()) * 12 +
            (current.getMonth() - inversionDate.getMonth());

        return monthsDiff >= 0 && monthsDiff <= 24;
    };

    const isWarningActive = showEquityWarning();

    if (!isWarningActive) return null;

    if (loading) {
        return (
            <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/50 opacity-50">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">⚠️</span>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                🚩 Equity Warning Flag
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const inversionDate = new Date(yieldCurveInversionDate!);
    const current = new Date(selectedDate);
    const monthsSinceInversion = (current.getFullYear() - inversionDate.getFullYear()) * 12 +
        (current.getMonth() - inversionDate.getMonth());
    const monthsRemaining = 24 - monthsSinceInversion;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/50">
                <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">⚠️</span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                🚩 Equity Warning Flag
                            </div>
                            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex-shrink-0">
                                {monthsRemaining} months remaining
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground mb-3">
                            <span className="font-semibold">Last inverted month:</span>{' '}
                            <span>{formatDate(yieldCurveInversionDate!)}</span>
                        </div>

                        {/* Progress bar */}
                        <div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-300"
                                    style={{ width: `${(monthsSinceInversion / 24) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                <span>Inversion</span>
                                <span>24 months</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
