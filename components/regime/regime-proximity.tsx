'use client';

import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';
import type { RegimeData } from './regime-parameters-types';

interface RegimeProximityProps {
    data: RegimeData;
    currentRegime?: string;
}

/**
 * For each regime entry condition, define the metric, threshold, and direction.
 * direction: 'lte' means the condition triggers when value <= threshold
 *            'gte' means the condition triggers when value >= threshold
 * 
 * We also define a "range" — the distance over which we consider the metric
 * to be approaching the threshold. Outside this range = 0% proximity.
 */
interface ConditionDef {
    metric: string;           // display label
    dataKey: keyof RegimeData; // key into RegimeData
    threshold: number;
    direction: 'lte' | 'gte';
    range: number;            // how far from threshold = 0% proximity
}

interface RegimeProximityDef {
    regime: RegimeFamily;
    conditions: ConditionDef[];
    logic: 'AND' | 'OR';
}

// Define proximity calculations for each regime based on REGIME_TRIGGERS
// Ordered by precedence (highest first)
const REGIME_PROXIMITY_DEFS: RegimeProximityDef[] = [
    {
        regime: 'Liquidity Shock',
        conditions: [
            { metric: 'Real M2', dataKey: 'realM2', threshold: 10, direction: 'gte', range: 8 },
        ],
        logic: 'AND',
    },
    {
        regime: 'Crisis',
        conditions: [
            { metric: 'Real 10Y', dataKey: 'real10Y', threshold: -1, direction: 'lte', range: 3 },
            { metric: 'Real M2', dataKey: 'realM2', threshold: 5, direction: 'lte', range: 6 },
        ],
        logic: 'AND',
    },
    {
        regime: 'Bond Stress',
        conditions: [
            { metric: 'Real 10Y', dataKey: 'real10Y', threshold: -0.5, direction: 'lte', range: 3 },
            { metric: 'Real 3M', dataKey: 'real3M', threshold: -1, direction: 'lte', range: 3 },
        ],
        logic: 'AND',
    },
    {
        regime: 'Overvaluation',
        conditions: [
            { metric: 'EYP', dataKey: 'eyp5yr', threshold: -2.5, direction: 'lte', range: 3 },
            { metric: 'REY', dataKey: 'rey5yr', threshold: -0.5, direction: 'lte', range: 3 },
        ],
        logic: 'OR',
    },
    {
        regime: 'Broad Growth',
        conditions: [
            { metric: 'REY', dataKey: 'rey5yr', threshold: 3, direction: 'gte', range: 4 },
        ],
        logic: 'AND',
    },
    {
        regime: 'Long Duration',
        conditions: [
            { metric: 'EYP', dataKey: 'eyp5yr', threshold: 0, direction: 'lte', range: 3 },
            { metric: 'Real 10Y', dataKey: 'real10Y', threshold: 1, direction: 'gte', range: 3 },
        ],
        logic: 'AND',
    },
];

/**
 * Calculate how close a single metric is to its threshold.
 * Returns 0-100 where 100 = threshold met/exceeded.
 */
function calcConditionProximity(value: number | null, condition: ConditionDef): number {
    if (value === null) return 0;

    const { threshold, direction, range } = condition;

    if (direction === 'lte') {
        // Triggers when value <= threshold
        if (value <= threshold) return 100;
        const distance = value - threshold;
        if (distance >= range) return 0;
        return Math.round(((range - distance) / range) * 100);
    } else {
        // Triggers when value >= threshold
        if (value >= threshold) return 100;
        const distance = threshold - value;
        if (distance >= range) return 0;
        return Math.round(((range - distance) / range) * 100);
    }
}

interface ConditionResult {
    metric: string;
    currentValue: number | null;
    threshold: number;
    direction: 'lte' | 'gte';
    proximity: number;
    met: boolean;
}

interface RegimeProximityResult {
    regime: RegimeFamily;
    overallProximity: number;
    allMet: boolean;
    conditions: ConditionResult[];
}

function calculateAllProximities(data: RegimeData): RegimeProximityResult[] {
    return REGIME_PROXIMITY_DEFS.map(def => {
        const conditions = def.conditions.map(cond => {
            const value = data[cond.dataKey].value;
            const proximity = calcConditionProximity(value, cond);
            const met = proximity === 100;
            return {
                metric: cond.metric,
                currentValue: value,
                threshold: cond.threshold,
                direction: cond.direction,
                proximity,
                met,
            };
        });

        // For AND logic: overall = minimum of all conditions (bottleneck)
        // For OR logic: overall = maximum of all conditions (any one suffices)
        const overallProximity = def.logic === 'OR'
            ? Math.max(...conditions.map(c => c.proximity))
            : Math.min(...conditions.map(c => c.proximity));
        const allMet = def.logic === 'OR'
            ? conditions.some(c => c.met)
            : conditions.every(c => c.met);

        return {
            regime: def.regime,
            overallProximity,
            allMet,
            conditions,
        };
    });
}

import { useState } from 'react';

function formatThreshold(threshold: number, direction: 'lte' | 'gte'): string {
    return `${direction === 'lte' ? '≤' : '≥'} ${threshold}%`;
}

export default function RegimeProximity({ data, currentRegime }: RegimeProximityProps) {
    const results = calculateAllProximities(data);
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className="space-y-1.5">
            {results.map(result => {
                const meta = REGIME_METADATA[result.regime];
                const isActive = currentRegime === result.regime;
                const isExpanded = expanded === result.regime;
                const hasMultiple = result.conditions.length > 1;

                return (
                    <div key={result.regime}>
                        {/* Single horizontal row per regime */}
                        <button
                            onClick={() => setExpanded(isExpanded ? null : result.regime)}
                            className="w-full flex items-center gap-2 h-8 group"
                        >
                            {/* Regime label */}
                            <div className="flex items-center gap-1.5 w-[130px] flex-shrink-0">
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: meta.color }}
                                />
                                <span className={`text-xs truncate ${isActive ? 'font-semibold' : 'text-muted-foreground group-hover:text-foreground transition-colors'}`}>
                                    {result.regime}
                                </span>
                            </div>

                            {/* Bar */}
                            <div className="flex-1 h-5 rounded overflow-hidden relative" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                                <div
                                    className="h-full rounded transition-all duration-500"
                                    style={{
                                        width: `${result.overallProximity}%`,
                                        backgroundColor: meta.color,
                                        opacity: result.allMet ? 0.9 : 0.5,
                                    }}
                                />
                                {/* Badges inside bar */}
                                {isActive && (
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white drop-shadow-sm">
                                        ACTIVE
                                    </span>
                                )}
                                {result.allMet && !isActive && (
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white drop-shadow-sm">
                                        TRIGGERED
                                    </span>
                                )}
                            </div>

                            {/* Percentage */}
                            <span className={`text-xs font-mono w-[36px] text-right flex-shrink-0 ${result.allMet ? 'font-semibold' : 'text-muted-foreground'
                                }`} style={result.allMet ? { color: meta.color } : undefined}>
                                {result.overallProximity}%
                            </span>

                            {/* Expand indicator for multi-condition */}
                            <svg
                                className={`w-3 h-3 flex-shrink-0 text-muted-foreground transition-transform ${hasMultiple ? '' : 'invisible'
                                    } ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Expanded trigger details */}
                        {isExpanded && (
                            <div className="ml-[138px] mr-[52px] py-1.5 space-y-1">
                                {result.conditions.map((cond, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[11px]">
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cond.met ? 'bg-green-500' : 'bg-muted-foreground/30'
                                            }`} />
                                        <span className="text-muted-foreground w-[160px] flex-shrink-0">
                                            {cond.metric} {formatThreshold(cond.threshold, cond.direction)}
                                        </span>
                                        <div className="flex-1 h-3 rounded overflow-hidden" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                                            <div
                                                className="h-full rounded transition-all duration-500"
                                                style={{
                                                    width: `${cond.proximity}%`,
                                                    backgroundColor: meta.color,
                                                    opacity: cond.met ? 0.9 : 0.4,
                                                }}
                                            />
                                        </div>
                                        <span className="font-mono text-muted-foreground w-[44px] text-right flex-shrink-0">
                                            {cond.currentValue !== null ? `${cond.currentValue.toFixed(1)}%` : '—'}
                                        </span>
                                        <span className="font-mono text-muted-foreground/60 w-[28px] text-right flex-shrink-0">
                                            {cond.proximity}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
