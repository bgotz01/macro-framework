'use client';

import { useEffect, useState } from 'react';
import { getRegimeLevel, getRegimeColors, getRegimeLabel } from '@/lib/regime-thresholds';

interface CycleMetricsProps {
    startYear: number;
    endYear: number;
}

interface Metrics {
    cpi: number | null;
    fedFunds: number | null;
    bondYield: number | null;
    shillerPE: number | null;
}

async function fetchValueAtDate(assetClass: string, seriesName: string, targetDate: string): Promise<number | null> {
    try {
        const response = await fetch(`/api/data/${assetClass}?series=${seriesName}`);
        if (!response.ok) return null;

        const result = await response.json();
        if (!result.data || result.data.length === 0) return null;

        const matchingPoints = result.data.filter((point: any) =>
            point.date.startsWith(targetDate)
        );

        if (matchingPoints.length > 0) {
            const point = matchingPoints[matchingPoints.length - 1];
            const columns = Object.keys(point).filter(k => k !== 'date');
            return columns.length > 0 ? point[columns[0]] : null;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching ${assetClass}/${seriesName}:`, error);
        return null;
    }
}

function MetricCard({
    label,
    value,
    format = 'percentage',
    metricKey
}: {
    label: string;
    value: number | null;
    format?: 'percentage' | 'number';
    metricKey: 'inflation' | 'fedFunds' | 'bondYieldsNominal' | 'equityPE';
}) {
    const formatValue = (val: number | null): string => {
        if (val === null) return 'N/A';
        if (format === 'number') return val.toFixed(1);
        return `${val.toFixed(1)}%`;
    };

    const level = getRegimeLevel(metricKey, value);
    const colors = getRegimeColors(level);
    const displayLabel = getRegimeLabel(level);

    return (
        <div className={`p-4 rounded-lg bg-card border-2 ${colors.border} transition-all hover:shadow-sm`}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-muted-foreground">
                {label}
            </div>
            <div className={`text-2xl font-bold mb-1 ${colors.text}`}>
                {formatValue(value)}
            </div>
            <div className="text-xs text-muted-foreground">
                {displayLabel}
            </div>
        </div>
    );
}

export default function CycleMetrics({ startYear, endYear }: CycleMetricsProps) {
    const [startMetrics, setStartMetrics] = useState<Metrics>({
        cpi: null,
        fedFunds: null,
        bondYield: null,
        shillerPE: null,
    });
    const [endMetrics, setEndMetrics] = useState<Metrics>({
        cpi: null,
        fedFunds: null,
        bondYield: null,
        shillerPE: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMetrics() {
            setLoading(true);
            const startDate = `${startYear}-12`;
            const endDate = `${endYear}-12`;

            const [startCpi, startFedFunds, startBondYield, startShillerPE] = await Promise.all([
                fetchValueAtDate('economic', 'CPI', startDate),
                fetchValueAtDate('economic', 'US/FEDFUNDS', startDate),
                fetchValueAtDate('bonds', 'US/TNX', startDate),
                fetchValueAtDate('valuations', 'Shiller-PE', startDate),
            ]);

            const [endCpi, endFedFunds, endBondYield, endShillerPE] = await Promise.all([
                fetchValueAtDate('economic', 'CPI', endDate),
                fetchValueAtDate('economic', 'US/FEDFUNDS', endDate),
                fetchValueAtDate('bonds', 'US/TNX', endDate),
                fetchValueAtDate('valuations', 'Shiller-PE', endDate),
            ]);

            setStartMetrics({
                cpi: startCpi,
                fedFunds: startFedFunds,
                bondYield: startBondYield,
                shillerPE: startShillerPE,
            });

            setEndMetrics({
                cpi: endCpi,
                fedFunds: endFedFunds,
                bondYield: endBondYield,
                shillerPE: endShillerPE,
            });

            setLoading(false);
        }

        loadMetrics();
    }, [startYear, endYear]);

    if (loading) {
        return (
            <div className="rounded-2xl border border-border/50 bg-card p-5">
                <div className="flex items-center justify-center h-16">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="text-base font-bold mb-4">Macro Metrics</h3>

            <div className="space-y-3">
                <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Start — Dec {startYear}</div>
                    <div className="grid grid-cols-4 gap-3">
                        <MetricCard
                            label="CPI"
                            value={startMetrics.cpi}
                            format="percentage"
                            metricKey="inflation"
                        />
                        <MetricCard
                            label="Fed Funds"
                            value={startMetrics.fedFunds}
                            format="percentage"
                            metricKey="fedFunds"
                        />
                        <MetricCard
                            label="10Y Bond"
                            value={startMetrics.bondYield}
                            format="percentage"
                            metricKey="bondYieldsNominal"
                        />
                        <MetricCard
                            label="Shiller P/E"
                            value={startMetrics.shillerPE}
                            format="number"
                            metricKey="equityPE"
                        />
                    </div>
                </div>

                <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">End — Dec {endYear}</div>
                    <div className="grid grid-cols-4 gap-3">
                        <MetricCard
                            label="CPI"
                            value={endMetrics.cpi}
                            format="percentage"
                            metricKey="inflation"
                        />
                        <MetricCard
                            label="Fed Funds"
                            value={endMetrics.fedFunds}
                            format="percentage"
                            metricKey="fedFunds"
                        />
                        <MetricCard
                            label="10Y Bond"
                            value={endMetrics.bondYield}
                            format="percentage"
                            metricKey="bondYieldsNominal"
                        />
                        <MetricCard
                            label="Shiller P/E"
                            value={endMetrics.shillerPE}
                            format="number"
                            metricKey="equityPE"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
