/**
 * Market Regime State Machine
 * 
 * Implements a persistent regime system where regimes change only on outlier triggers,
 * not on every monthly metric update. This creates stable, meaningful regime transitions.
 * 
 * Uses two primary dimensions:
 * 1. Equity Economic Regimes (REY - Real Earnings Yield)
 * 2. Valuation/Speculation Regimes (EYP - Earnings Yield Premium)
 */

// ============================================================================
// REGIME TRIGGER CONFIGURATION
// ============================================================================
// Edit these values to change when regimes activate and deactivate

export const REGIME_TRIGGERS = {
    'Deep Value': {
        entry: (c: CurrentConditions) => c.rey !== null && c.rey >= 6,
        exit: (c: CurrentConditions) => c.rey !== null && c.rey < 4,
        reason: (c: CurrentConditions) => `Deep Value: Real Earnings Yield ${c.rey?.toFixed(2)}%`,
        entryDescription: 'Entry: REY ≥ 6%',
        exitDescription: 'Exit: REY ≤ 4%'
    },
    'Broad Growth': {
        entry: (c: CurrentConditions) => c.rey !== null && c.rey >= 3,
        exit: (c: CurrentConditions) => c.rey !== null && c.rey < 1,
        reason: (c: CurrentConditions) => `Broad Growth: Real Earnings Yield ${c.rey?.toFixed(2)}%`,
        entryDescription: 'Entry: REY ≥ 3%',
        exitDescription: 'Exit: REY ≤ 1%'
    },
    'Fragile': {
        entry: (c: CurrentConditions) =>
            c.rey !== null && c.real10Y !== null && c.realM2 !== null &&
            c.rey <= 0 && c.real10Y <= 0 && c.realM2 < 10,
        exit: (c: CurrentConditions) =>
            c.real10Y !== null && c.real10Y >= 1,
        reason: (c: CurrentConditions) => `Fragile: Real earnings negative (REY ${c.rey?.toFixed(2)}%), financial repression (Real 10Y ${c.real10Y?.toFixed(2)}%), slowing liquidity (Real M2 ${c.realM2?.toFixed(1)}%)`,
        entryDescription: 'Entry: REY ≤ 0% AND Real 10Y ≤ 0% AND Real M2 ≤ 10%',
        exitDescription: 'Exit: Real 10Y ≥ 1%'
    },
    'Contraction': {
        entry: (c: CurrentConditions) =>
            c.rey !== null && c.eyp !== null && c.real10Y !== null &&
            c.rey <= 0 && c.eyp <= 0 && c.real10Y <= 0,
        exit: (c: CurrentConditions) => c.rey !== null && c.rey >= 2,
        reason: (c: CurrentConditions) => `Contraction: REY ${c.rey?.toFixed(2)}%, EYP ${c.eyp?.toFixed(2)}%, Real 10Y ${c.real10Y?.toFixed(2)}%`,
        entryDescription: 'Entry: REY ≤ 0% AND EYP ≤ 0% AND Real 10Y ≤ 0%',
        exitDescription: 'Exit: REY ≥ 2%'
    },
    'Long Duration': {
        entry: (c: CurrentConditions) => c.eyp !== null && c.real10Y !== null && c.eyp <= 0 && c.real10Y >= 1,
        exit: (c: CurrentConditions) => c.eyp !== null && (c.eyp >= 0 || c.eyp <= -2.5),
        reason: (c: CurrentConditions) => `Long Duration: EYP ${c.eyp?.toFixed(2)}%, Real 10Y ${c.real10Y?.toFixed(2)}%`,
        entryDescription: 'Entry: EYP ≤ 0% AND Real 10Y ≥ 1%',
        exitDescription: 'Exit: EYP ≥ 0% OR EYP ≤ -2.5%'
    },
    'Overvaluation': {
        entry: (c: CurrentConditions) => c.eyp !== null && c.eyp <= -2.5,
        exit: (c: CurrentConditions) => c.eyp !== null && c.eyp >= 0,
        reason: (c: CurrentConditions) => `Overvaluation: Extreme equity unattractiveness (EYP ${c.eyp?.toFixed(2)}%)`,
        entryDescription: 'Entry: EYP ≤ -2.5%',
        exitDescription: 'Exit: EYP ≥ 0%'
    },
    'Crisis': {
        entry: (c: CurrentConditions) =>
            c.real10Y !== null && c.realM2 !== null &&
            c.real10Y <= -1 && c.realM2 <= 5,
        exit: (c: CurrentConditions) =>
            c.real10Y !== null && c.realM2 !== null && (c.real10Y >= 0.5 || c.realM2 >= 7),
        reason: (c: CurrentConditions) => `Crisis: Real 10Y ${c.real10Y?.toFixed(2)}%, Real M2 ${c.realM2?.toFixed(1)}%`,
        entryDescription: 'Entry: Real 10Y ≤ -1% AND Real M2 ≤ 5%',
        exitDescription: 'Exit: Real 10Y ≥ 0.5% OR Real M2 ≥ 7%'
    },
    'Bond Stress': {
        entry: (c: CurrentConditions) =>
            c.real10Y !== null && c.real3M !== null && c.real10Y <= -0.5 && c.real3M <= -1,
        exit: (c: CurrentConditions) =>
            c.real10Y !== null && c.real10Y >= 0.25,
        reason: (c: CurrentConditions) => `Bond Stress: Real 10Y ${c.real10Y?.toFixed(2)}%, Real 3M ${c.real3M?.toFixed(2)}%`,
        entryDescription: 'Entry: Real 10Y ≤ -0.5% AND Real 3M ≤ -1%',
        exitDescription: 'Exit: Real 10Y ≥ 0.25%'
    },
    'Liquidity Shock': {
        entry: (c: CurrentConditions) =>
            c.realM2 !== null && c.realM2 >= 10,
        exit: (c: CurrentConditions) =>
            c.realM2 !== null && c.realM2 <= 8,
        reason: (c: CurrentConditions) => `Liquidity Shock: Real M2 ${c.realM2?.toFixed(1)}%`,
        entryDescription: 'Entry: Real M2 ≥ 10%',
        exitDescription: 'Exit: Real M2 ≤ 8%'
    },
    'Normal': {
        // Normal has no entry/exit triggers - it's the default state
        entry: () => false,
        exit: () => false,
        reason: () => 'Balanced conditions - no extreme triggers',
        entryDescription: 'Default state when no outlier triggers are active',
        exitDescription: ''
    }
} as const;

// ============================================================================
// ALLOWED REGIME TRANSITIONS
// ============================================================================
// Defines which prior regimes can transition to each regime
// This prevents illogical transitions (e.g., Normal -> Recovery)

/*
const ALLOWED_TRANSITIONS: Partial<Record<RegimeFamily, RegimeFamily[]>> = {
    'Bond Stress': ['Crisis', 'Contraction', 'Deep Value', 'Fragile', 'Liquidity Shock', 'Normal'],  // Bond Stress from damaged or stressed states
    'Deep Value': ['Crisis', 'Contraction', 'Normal'],  // Deep Value after severe damage or from baseline
    'Broad Growth': ['Normal', 'Deep Value', 'Bond Stress', 'Long Duration', 'Overvaluation'],  // Growth from baseline, recovery, or after valuation regimes unwind
    'Long Duration': ['Broad Growth', 'Normal', 'Bond Stress'],  // Duration from healthy states
    'Overvaluation': ['Broad Growth', 'Normal', 'Long Duration', 'Liquidity Shock', 'Bond Stress'],  // Rotation from various states
    'Fragile': ['Normal', 'Broad Growth', 'Long Duration', 'Liquidity Shock', 'Overvaluation'],  // Fragile from healthy states or after liquidity shock ends
    'Contraction': ['Normal', 'Broad Growth', 'Long Duration', 'Bond Stress', 'Fragile', 'Overvaluation'],  // Contraction from non-crisis states
    'Crisis': ['Normal', 'Broad Growth', 'Long Duration', 'Contraction', 'Liquidity Shock', 'Fragile', 'Overvaluation', 'Bond Stress'],  // Crisis can follow many states
    'Liquidity Shock': ['Normal', 'Broad Growth', 'Long Duration', 'Crisis', 'Overvaluation', 'Contraction', 'Fragile', 'Bond Stress', 'Deep Value'],  // Liquidity shock can override any regime - massive M2 surge is a macro override
    'Normal': ['Broad Growth', 'Long Duration', 'Contraction', 'Bond Stress', 'Liquidity Shock', 'Crisis', 'Fragile', 'Overvaluation']  // Normal as fallback
};
*/

/**
 * Check if transition from one regime to another is allowed
 */
function canTransition(
    from: RegimeFamily | null,
    to: RegimeFamily
): boolean {
    // Transitions unrestricted - any regime can move to any other regime
    return true;
}

// ============================================================================
// REGIME TYPES
// ============================================================================

export type RegimeFamily =
    | 'Deep Value'
    | 'Broad Growth'
    | 'Contraction'
    | 'Long Duration'
    | 'Overvaluation'
    | 'Fragile'
    | 'Crisis'
    | 'Bond Stress'
    | 'Liquidity Shock'
    | 'Normal';

export interface RegimeState {
    regime: RegimeFamily;
    entryDate: string;
    triggerReason: string;
    description: string;
    guidance: string;
    color: string;
}

export interface CurrentConditions {
    // Primary metrics
    rey: number | null;      // Real Earnings Yield (5yr)
    eyp: number | null;      // Earnings Yield Premium (5yr)
    real10Y: number | null;  // Real 10Y yield
    real3M: number | null;   // Real 3M yield
    realM2: number | null;   // Real M2 YoY growth

    // Context metrics
    liquidityScore: number;
    stage: string;
    pressure: string;
    risk: string;
    direction: string;
    trendAge: number | null; // Slope streak in days (positive or negative)
    slope200MA?: number | null; // 200-day MA slope
}

export interface RegimeTransition {
    date: string;
    fromRegime: RegimeFamily | null;
    toRegime: RegimeFamily;
    trigger: string;
    conditions: string; // JSON snapshot of conditions
}

// ============================================================================
// REGIME METADATA
// ============================================================================

export const REGIME_METADATA: Record<RegimeFamily, { description: string; guidance: string; color: string }> = {
    'Deep Value': {
        description: 'Deep value - extreme pessimism, post-crash accumulation',
        guidance: 'Equities extremely cheap - long-term bull markets often start here',
        color: '#15803d' // dark green
    },
    'Broad Growth': {
        description: 'Strong real earnings environment - healthy equity expansion',
        guidance: 'Earnings growing faster than inflation - lean into quality growth',
        color: '#22c55e' // green
    },
    'Fragile': {
        description: 'Macro deterioration - real earnings negative under financial repression with slowing liquidity',
        guidance: 'Conditions are deteriorating - watch for transition into contraction or crisis',
        color: '#f97316' // orange
    },
    'Contraction': {
        description: 'Real earnings and valuations collapsing with financial repression',
        guidance: 'Severe deterioration - preserve capital, favor quality defensives',
        color: '#dc2626' // dark red
    },
    'Long Duration': {
        description: 'Equities overvalued relative to bonds - duration growth',
        guidance: 'Negative equity risk premium - investors buying duration/growth',
        color: '#3b82f6' // blue
    },
    'Overvaluation': {
        description: 'Extreme equity unattractiveness - equities far below risk-free rate',
        guidance: 'Rotate away from equities: favor bonds if Real 10Y > 0%, favor gold if Real 10Y < 0%',
        color: '#eab308' // yellow
    },
    'Crisis': {
        description: 'Financial repression with low money growth - crisis conditions',
        guidance: 'Real rates negative but money tight - defensive positioning critical',
        color: '#991b1b' // dark red
    },
    'Bond Stress': {
        description: 'Real rates deeply negative across the curve - bond market stress',
        guidance: 'Severe financial repression - rotate to gold as bonds are unattractive',
        color: '#ea580c' // orange-red
    },
    'Liquidity Shock': {
        description: 'Financial repression with high money growth - liquidity shock',
        guidance: 'Massive liquidity injection - speculative assets thrive',
        color: '#fbbf24' // yellow/gold
    },
    'Normal': {
        description: 'Balanced conditions - no extreme triggers active',
        guidance: 'Standard market environment - maintain diversified positioning',
        color: '#6b7280' // gray
    }
};

// ============================================================================
// TRIGGER DETECTION WITH ENTRY/EXIT LOGIC
// ============================================================================

/**
 * Generic trigger checker that uses the REGIME_TRIGGERS configuration
 */
function checkRegimeTrigger(
    regime: RegimeFamily,
    conditions: CurrentConditions,
    currentRegime: RegimeFamily | null
): { triggered: boolean; reason: string; shouldExit: boolean } {
    const config = REGIME_TRIGGERS[regime];

    // Check exit condition if currently in this regime
    if (currentRegime === regime && config.exit(conditions)) {
        return { triggered: false, reason: '', shouldExit: true };
    }

    // Check entry condition
    if (config.entry(conditions)) {
        return {
            triggered: true,
            reason: config.reason(conditions),
            shouldExit: false
        };
    }

    return { triggered: false, reason: '', shouldExit: false };
}

// ============================================================================
// STATE MACHINE LOGIC
// ============================================================================

/**
 * Determine next regime using entry/exit trigger logic
 * 
 * Priority order:
 * 1. Check if current regime should exit
 * 2. Check new regime triggers in precedence order (defined in regimePrecedence array)
 * 3. If no trigger and no exit, maintain current regime
 * 4. Default to Normal if no regime active
 */
export function determineNextRegime(
    currentState: RegimeState | null,
    conditions: CurrentConditions,
    currentDate: string
): RegimeState {
    // Check new regime triggers in precedence order
    // Higher priority regimes can always override lower priority ones
    const regimePrecedence: RegimeFamily[] = [
        'Liquidity Shock',
        'Crisis',
        'Bond Stress',
        'Contraction',
        'Overvaluation',
        'Fragile',
        'Deep Value',
        'Broad Growth',
        'Long Duration'
    ];

    const currentRegime = currentState?.regime || null;

    // Check all regimes in precedence order
    for (const regime of regimePrecedence) {
        const trigger = checkRegimeTrigger(regime, conditions, currentRegime);

        // If a higher-priority regime triggers and it's not the current one, switch to it
        if (trigger.triggered && regime !== currentRegime && canTransition(currentRegime, regime)) {
            return createRegimeState(regime, currentDate, trigger.reason);
        }

        // If this is the current regime and it hasn't exited, persist it
        if (regime === currentRegime && !trigger.shouldExit) {
            return currentState!;
        }
    }

    // If no higher priority regime triggered and we have a current state, check if it should persist
    if (currentState && currentState.regime !== 'Normal') {
        const exitCheck = checkRegimeTrigger(currentState.regime, conditions, currentState.regime);

        // If no exit trigger, maintain current regime
        if (!exitCheck.shouldExit) {
            return currentState;
        }
    }

    // Default to Normal if no trigger fires and no current regime
    return createRegimeState('Normal', currentDate, 'Balanced conditions - no extreme triggers');
}

/**
 * Helper to create regime state with metadata
 */
function createRegimeState(
    regime: RegimeFamily,
    entryDate: string,
    triggerReason: string
): RegimeState {
    const metadata = REGIME_METADATA[regime];

    return {
        regime,
        entryDate,
        triggerReason,
        description: metadata.description,
        guidance: metadata.guidance,
        color: metadata.color
    };
}

// ============================================================================
// REGIME TRANSITION DETECTION
// ============================================================================

/**
 * Check if regime should transition
 * Returns new regime if transition should occur, null if regime should persist
 */
export function checkRegimeTransition(
    currentState: RegimeState | null,
    conditions: CurrentConditions,
    currentDate: string
): RegimeState | null {
    const nextRegime = determineNextRegime(currentState, conditions, currentDate);

    // If regime changed, return new regime state
    if (nextRegime.regime !== currentState?.regime) {
        return nextRegime;
    }

    // No transition
    return null;
}

/**
 * Calculate regime state for a specific date
 * This is used when building historical regime timeline
 */
export function calculateRegimeForDate(
    priorState: RegimeState | null,
    conditions: CurrentConditions,
    date: string
): RegimeState {
    return determineNextRegime(priorState, conditions, date);
}
