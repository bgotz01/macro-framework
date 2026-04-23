/**
 * Custom Regime Engine
 * Runs the regime state machine with user-defined thresholds
 */

import type { CustomThresholds, CustomRegimeDef } from '@/components/regime/custom-regime-modal';
import type { CurrentConditions, RegimeFamily, RegimeState } from './regime-state-machine';
import { REGIME_METADATA } from './regime-state-machine';

type TriggerConfig = {
    entry: (c: CurrentConditions) => boolean;
    exit: (c: CurrentConditions) => boolean;
    reason: (c: CurrentConditions) => string;
};

export function buildCustomTriggers(t: CustomThresholds): Record<string, TriggerConfig> {
    return {
        'Liquidity Shock': {
            entry: (c) => c.realM2 !== null && c.realM2 >= t.liquidityShock.entry,
            exit: (c) => c.realM2 !== null && c.realM2 <= t.liquidityShock.exit,
            reason: (c) => `Liquidity Shock: Real M2 ${c.realM2?.toFixed(1)}%`,
        },
        'Crisis': {
            entry: (c) => c.real10Y !== null && c.realM2 !== null && c.real10Y <= t.crisis.entryReal10Y && c.realM2 <= t.crisis.entryRealM2,
            exit: (c) => c.real10Y !== null && c.realM2 !== null && (c.real10Y >= t.crisis.exitReal10Y || c.realM2 >= t.crisis.exitRealM2),
            reason: (c) => `Crisis: Real 10Y ${c.real10Y?.toFixed(2)}%, Real M2 ${c.realM2?.toFixed(1)}%`,
        },
        'Bond Stress': {
            entry: (c) => c.real10Y !== null && c.real3M !== null && c.real10Y <= t.bondStress.entryReal10Y && c.real3M <= t.bondStress.entryReal3M,
            exit: (c) => c.real10Y !== null && c.real10Y >= t.bondStress.exitReal10Y,
            reason: (c) => `Bond Stress: Real 10Y ${c.real10Y?.toFixed(2)}%, Real 3M ${c.real3M?.toFixed(2)}%`,
        },
        'Overvaluation': {
            entry: (c) => c.eyp !== null && c.rey !== null && (c.eyp <= t.overvaluation.entryEyp || c.rey <= t.overvaluation.entryRey),
            exit: (c) => c.eyp !== null && c.rey !== null && c.eyp >= t.overvaluation.exitEyp && c.rey >= t.overvaluation.exitRey,
            reason: (c) => `Overvaluation: EYP ${c.eyp?.toFixed(2)}%, REY ${c.rey?.toFixed(2)}%`,
        },
        'Broad Growth': {
            entry: (c) => c.rey !== null && c.rey >= t.broadGrowth.entry,
            exit: (c) => c.rey !== null && c.rey < t.broadGrowth.exit,
            reason: (c) => `Broad Growth: REY ${c.rey?.toFixed(2)}%`,
        },
        'Long Duration': {
            entry: (c) => c.eyp !== null && c.real10Y !== null && c.eyp <= t.longDuration.entryEyp && c.real10Y >= t.longDuration.entryReal10Y,
            exit: (c) => c.eyp !== null && (c.eyp >= t.longDuration.exitEypHigh || c.eyp <= t.longDuration.exitEypLow),
            reason: (c) => `Long Duration: EYP ${c.eyp?.toFixed(2)}%, Real 10Y ${c.real10Y?.toFixed(2)}%`,
        },
        'None': {
            entry: () => false,
            exit: () => false,
            reason: () => 'Balanced conditions - no extreme triggers',
        },
    };
}

function buildCustomRegimeTrigger(cr: CustomRegimeDef): TriggerConfig {
    const evalSide = (side: CustomRegimeDef['entry'], logic: 'AND' | 'OR', c: CurrentConditions): boolean => {
        const METRIC_MAP: Record<keyof CustomRegimeDef['entry'], number | null> = {
            rey: c.rey, eyp: c.eyp, real10Y: c.real10Y, real3M: c.real3M, realM2: c.realM2,
        };
        const results = (Object.keys(side) as Array<keyof typeof side>)
            .filter(k => side[k].enabled)
            .map(k => {
                const val = METRIC_MAP[k];
                if (val === null) return false;
                return side[k].op === 'lte' ? val <= side[k].value : val >= side[k].value;
            });
        if (results.length === 0) return false;
        return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
    };
    return {
        entry: (c) => evalSide(cr.entry, cr.entryLogic, c),
        exit: (c) => evalSide(cr.exit, cr.exitLogic, c),
        reason: () => `${cr.name}: custom regime triggered`,
    };
}

const PRECEDENCE: RegimeFamily[] = [
    'Liquidity Shock', 'Crisis', 'Bond Stress',
    'Overvaluation', 'Broad Growth', 'Long Duration',
];

export function determineCustomRegime(
    currentState: RegimeState | null,
    conditions: CurrentConditions,
    currentDate: string,
    triggers: Record<string, TriggerConfig>,
    customRegimeDef?: CustomRegimeDef
): RegimeState {
    const currentRegime = currentState?.regime || null;

    // Build precedence with custom regime injected at the right position
    const base = [...PRECEDENCE];
    const customName = customRegimeDef?.name ?? '__custom__';
    if (customRegimeDef) {
        const pos = Math.max(0, Math.min(customRegimeDef.precedence - 1, base.length));
        base.splice(pos, 0, customName as RegimeFamily);
        triggers[customName] = buildCustomRegimeTrigger(customRegimeDef);
    }

    for (const regime of base) {
        const config = triggers[regime];
        if (!config) continue;

        const isCurrentRegime = regime === currentRegime;
        const shouldExit = isCurrentRegime && config.exit(conditions);
        const triggered = config.entry(conditions);

        if (triggered && regime !== currentRegime) {
            const metadata = REGIME_METADATA[regime as RegimeFamily] ?? {
                description: customRegimeDef?.name ?? regime,
                guidance: 'User-defined regime',
                color: customRegimeDef?.color ?? '#a855f7',
            };
            return {
                regime: regime as RegimeFamily,
                entryDate: currentDate,
                triggerReason: config.reason(conditions),
                description: metadata.description,
                guidance: metadata.guidance,
                color: metadata.color,
            };
        }

        if (isCurrentRegime && !shouldExit) {
            return currentState!;
        }
    }

    if (currentState && currentState.regime !== 'None') {
        const config = triggers[currentState.regime];
        if (config && !config.exit(conditions)) {
            return currentState;
        }
    }

    const normalMeta = REGIME_METADATA['None'];
    return {
        regime: 'None',
        entryDate: currentDate,
        triggerReason: 'Balanced conditions - no extreme triggers',
        description: normalMeta.description,
        guidance: normalMeta.guidance,
        color: normalMeta.color,
    };
}
