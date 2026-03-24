/**
 * Custom Regime Engine
 * Runs the regime state machine with user-defined thresholds
 */

import type { CustomThresholds } from '@/components/regime/custom-regime-modal';
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
        'Contraction': {
            entry: (c) => c.rey !== null && c.eyp !== null && c.real10Y !== null && c.rey <= t.contraction.entryRey && c.eyp <= t.contraction.entryEyp && c.real10Y <= t.contraction.entryReal10Y,
            exit: (c) => c.rey !== null && c.rey >= t.contraction.exitRey,
            reason: (c) => `Contraction: REY ${c.rey?.toFixed(2)}%, EYP ${c.eyp?.toFixed(2)}%`,
        },
        'Overvaluation': {
            entry: (c) => c.eyp !== null && c.eyp <= t.overvaluation.entry,
            exit: (c) => c.eyp !== null && c.eyp >= t.overvaluation.exit,
            reason: (c) => `Overvaluation: EYP ${c.eyp?.toFixed(2)}%`,
        },
        'Fragile': {
            entry: (c) => c.rey !== null && c.real10Y !== null && c.realM2 !== null && c.rey <= t.fragile.entryRey && c.real10Y <= t.fragile.entryReal10Y && c.realM2 < t.fragile.entryRealM2,
            exit: (c) => c.real10Y !== null && c.real10Y >= t.fragile.exitReal10Y,
            reason: (c) => `Fragile: REY ${c.rey?.toFixed(2)}%, Real 10Y ${c.real10Y?.toFixed(2)}%`,
        },
        'Deep Value': {
            entry: (c) => c.rey !== null && c.rey >= t.deepValue.entry,
            exit: (c) => c.rey !== null && c.rey < t.deepValue.exit,
            reason: (c) => `Deep Value: REY ${c.rey?.toFixed(2)}%`,
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
        'Normal': {
            entry: () => false,
            exit: () => false,
            reason: () => 'Balanced conditions - no extreme triggers',
        },
    };
}

const PRECEDENCE: RegimeFamily[] = [
    'Liquidity Shock', 'Crisis', 'Bond Stress', 'Contraction',
    'Overvaluation', 'Fragile', 'Deep Value', 'Broad Growth', 'Long Duration',
];

export function determineCustomRegime(
    currentState: RegimeState | null,
    conditions: CurrentConditions,
    currentDate: string,
    triggers: Record<string, TriggerConfig>
): RegimeState {
    const currentRegime = currentState?.regime || null;

    for (const regime of PRECEDENCE) {
        const config = triggers[regime];
        if (!config) continue;

        const isCurrentRegime = regime === currentRegime;
        const shouldExit = isCurrentRegime && config.exit(conditions);
        const triggered = config.entry(conditions);

        if (triggered && regime !== currentRegime) {
            const metadata = REGIME_METADATA[regime];
            return {
                regime,
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

    if (currentState && currentState.regime !== 'Normal') {
        const config = triggers[currentState.regime];
        if (config && !config.exit(conditions)) {
            return currentState;
        }
    }

    const normalMeta = REGIME_METADATA['Normal'];
    return {
        regime: 'Normal',
        entryDate: currentDate,
        triggerReason: 'Balanced conditions - no extreme triggers',
        description: normalMeta.description,
        guidance: normalMeta.guidance,
        color: normalMeta.color,
    };
}
