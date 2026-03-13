/**
 * Flow/Trend Configuration
 * 
 * This system analyzes market trend using a three-layer classification:
 * 1. Direction: 200MA slope (descriptive backdrop, not scored)
 * 2. Stage: Age/lifecycle of the trend (from streak duration)
 * 3. Pressure: Distance from equilibrium (from divergence magnitude)
 * 4. Side: Direction of divergence (upside/downside/neutral)
 * 5. Risk: Behavioral implication from Stage + Pressure + Side
 */

// ============================================================================
// TREND DIRECTION (200MA Slope) - Descriptive Only
// ============================================================================

export type TrendDirection =
    | 'Strong Uptrend'
    | 'Uptrend'
    | 'Neutral'
    | 'Downtrend'
    | 'Strong Downtrend';

export interface TrendDirectionBand {
    min: number;
    max: number;
    label: TrendDirection;
    color: string;
}

export const TREND_DIRECTION_BANDS: TrendDirectionBand[] = [
    { min: 0.1, max: Infinity, label: 'Strong Uptrend', color: '#22c55e' },
    { min: 0.03, max: 0.1, label: 'Uptrend', color: '#84cc16' },
    { min: -0.02, max: 0.03, label: 'Neutral', color: '#3b82f6' },
    { min: -0.1, max: -0.02, label: 'Downtrend', color: '#eab308' },
    { min: -Infinity, max: -0.1, label: 'Strong Downtrend', color: '#ef4444' }
];

export function getTrendDirectionLabel(slope: number | null): TrendDirection {
    if (slope === null) return 'Neutral';

    for (const band of TREND_DIRECTION_BANDS) {
        if (slope >= band.min && slope < band.max) {
            return band.label;
        }
    }
    return 'Neutral';
}

export function getTrendDirectionColor(slope: number | null): string {
    if (slope === null) return '#3b82f6';

    for (const band of TREND_DIRECTION_BANDS) {
        if (slope >= band.min && slope < band.max) {
            return band.color;
        }
    }
    return '#3b82f6';
}

// ============================================================================
// TREND STAGE (Streak Duration) - Age/Lifecycle of Move
// ============================================================================

export type TrendStage =
    | 'Early'
    | 'Established'
    | 'Mature'
    | 'Late';

export interface TrendStageBand {
    min: number;
    max: number;
    label: TrendStage;
    color: string;
}

export const TREND_STAGE_BANDS: TrendStageBand[] = [
    { min: 0, max: 50, label: 'Early', color: '#3b82f6' },        // blue
    { min: 50, max: 150, label: 'Established', color: '#06b6d4' }, // cyan
    { min: 150, max: 250, label: 'Mature', color: '#eab308' },     // yellow
    { min: 250, max: Infinity, label: 'Late', color: '#f97316' }   // orange
];

export function getTrendStageLabel(days: number | null): TrendStage {
    if (days === null) return 'Early';

    const absDays = Math.abs(days);

    for (const band of TREND_STAGE_BANDS) {
        if (absDays >= band.min && absDays < band.max) {
            return band.label;
        }
    }
    return 'Late';
}

export function getTrendStageColor(days: number | null): string {
    if (days === null) return '#3b82f6'; // Early (blue)

    const absDays = Math.abs(days);

    for (const band of TREND_STAGE_BANDS) {
        if (absDays >= band.min && absDays < band.max) {
            return band.color;
        }
    }
    return '#f97316'; // Late (orange)
}

// ============================================================================
// TREND PRESSURE (Divergence Magnitude) - Distance from Equilibrium
// ============================================================================
// Note: "Pressure" here refers to extension magnitude (stretch intensity),
// not final vulnerability. The actual risk assessment comes from the 
// Stage + Pressure + Side matrix below.

export type TrendPressure =
    | 'Low'
    | 'Mid'
    | 'High'
    | 'Extreme';

export interface TrendPressureBand {
    min: number;
    max: number;
    label: TrendPressure;
    color: string;
}

export const TREND_PRESSURE_BANDS: TrendPressureBand[] = [
    { min: 0, max: 5, label: 'Low', color: '#3b82f6' },
    { min: 5, max: 10, label: 'Mid', color: '#84cc16' },
    { min: 10, max: 20, label: 'High', color: '#eab308' },
    { min: 20, max: Infinity, label: 'Extreme', color: '#ef4444' }
];

export function getTrendPressureLabel(divergence: number | null): TrendPressure {
    if (divergence === null) return 'Low';

    const absDivergence = Math.abs(divergence);

    for (const band of TREND_PRESSURE_BANDS) {
        if (absDivergence >= band.min && absDivergence < band.max) {
            return band.label;
        }
    }
    return 'Extreme';
}

export function getTrendPressureColor(divergence: number | null): string {
    if (divergence === null) return '#3b82f6';

    const absDivergence = Math.abs(divergence);

    for (const band of TREND_PRESSURE_BANDS) {
        if (absDivergence >= band.min && absDivergence < band.max) {
            return band.color;
        }
    }
    return '#ef4444';
}

// ============================================================================
// TREND SIDE (Divergence Direction)
// ============================================================================

export type TrendSide = 'Upside' | 'Downside' | 'Neutral';

export function getTrendSide(divergence: number | null): TrendSide {
    if (divergence === null) return 'Neutral';
    if (divergence > 5) return 'Upside';   // Aligns with Low->Mid pressure transition
    if (divergence < -5) return 'Downside';
    return 'Neutral';
}

// ============================================================================
// TREND RISK (Stage + Pressure + Side Matrix)
// ============================================================================

export type TrendRisk =
    | 'Continuation'
    | 'Pullback'
    | 'Distribution'
    | 'Rollover'
    | 'Breakdown'
    | 'Mania'
    | 'Capitulation';

interface RiskMatrixEntry {
    stage: TrendStage;
    pressure: TrendPressure;
    side: TrendSide;
    risk: TrendRisk;
    color: string;
}

// Risk matrix: Stage x Pressure x Side -> Risk
const RISK_MATRIX: RiskMatrixEntry[] = [
    // UPSIDE RISKS
    { stage: 'Early', pressure: 'Low', side: 'Upside', risk: 'Continuation', color: '#22c55e' },
    { stage: 'Early', pressure: 'Mid', side: 'Upside', risk: 'Continuation', color: '#22c55e' },
    { stage: 'Early', pressure: 'High', side: 'Upside', risk: 'Pullback', color: '#eab308' },
    { stage: 'Early', pressure: 'Extreme', side: 'Upside', risk: 'Pullback', color: '#ef4444' },

    { stage: 'Established', pressure: 'Low', side: 'Upside', risk: 'Continuation', color: '#22c55e' },
    { stage: 'Established', pressure: 'Mid', side: 'Upside', risk: 'Pullback', color: '#eab308' },
    { stage: 'Established', pressure: 'High', side: 'Upside', risk: 'Pullback', color: '#eab308' },
    { stage: 'Established', pressure: 'Extreme', side: 'Upside', risk: 'Mania', color: '#ef4444' },

    { stage: 'Mature', pressure: 'Low', side: 'Upside', risk: 'Distribution', color: '#eab308' },
    { stage: 'Mature', pressure: 'Mid', side: 'Upside', risk: 'Distribution', color: '#eab308' },
    { stage: 'Mature', pressure: 'High', side: 'Upside', risk: 'Mania', color: '#ef4444' },
    { stage: 'Mature', pressure: 'Extreme', side: 'Upside', risk: 'Mania', color: '#ef4444' },

    { stage: 'Late', pressure: 'Low', side: 'Upside', risk: 'Distribution', color: '#eab308' },
    { stage: 'Late', pressure: 'Mid', side: 'Upside', risk: 'Distribution', color: '#eab308' },
    { stage: 'Late', pressure: 'High', side: 'Upside', risk: 'Mania', color: '#ef4444' },
    { stage: 'Late', pressure: 'Extreme', side: 'Upside', risk: 'Mania', color: '#ef4444' },

    // DOWNSIDE RISKS
    { stage: 'Early', pressure: 'Low', side: 'Downside', risk: 'Pullback', color: '#eab308' },
    { stage: 'Early', pressure: 'Mid', side: 'Downside', risk: 'Pullback', color: '#eab308' },
    { stage: 'Early', pressure: 'High', side: 'Downside', risk: 'Capitulation', color: '#ef4444' },
    { stage: 'Early', pressure: 'Extreme', side: 'Downside', risk: 'Capitulation', color: '#ef4444' },

    { stage: 'Established', pressure: 'Low', side: 'Downside', risk: 'Pullback', color: '#eab308' },
    { stage: 'Established', pressure: 'Mid', side: 'Downside', risk: 'Breakdown', color: '#ef4444' },
    { stage: 'Established', pressure: 'High', side: 'Downside', risk: 'Breakdown', color: '#ef4444' },
    { stage: 'Established', pressure: 'Extreme', side: 'Downside', risk: 'Capitulation', color: '#ef4444' },

    { stage: 'Mature', pressure: 'Low', side: 'Downside', risk: 'Distribution', color: '#eab308' },
    { stage: 'Mature', pressure: 'Mid', side: 'Downside', risk: 'Breakdown', color: '#ef4444' },
    { stage: 'Mature', pressure: 'High', side: 'Downside', risk: 'Breakdown', color: '#ef4444' },
    { stage: 'Mature', pressure: 'Extreme', side: 'Downside', risk: 'Capitulation', color: '#ef4444' },

    { stage: 'Late', pressure: 'Low', side: 'Downside', risk: 'Breakdown', color: '#ef4444' },
    { stage: 'Late', pressure: 'Mid', side: 'Downside', risk: 'Breakdown', color: '#ef4444' },
    { stage: 'Late', pressure: 'High', side: 'Downside', risk: 'Breakdown', color: '#ef4444' },
    { stage: 'Late', pressure: 'Extreme', side: 'Downside', risk: 'Capitulation', color: '#ef4444' },

    // NEUTRAL RISKS
    { stage: 'Early', pressure: 'Low', side: 'Neutral', risk: 'Continuation', color: '#22c55e' },
    { stage: 'Early', pressure: 'Mid', side: 'Neutral', risk: 'Continuation', color: '#22c55e' },
    { stage: 'Early', pressure: 'High', side: 'Neutral', risk: 'Pullback', color: '#eab308' },
    { stage: 'Early', pressure: 'Extreme', side: 'Neutral', risk: 'Pullback', color: '#eab308' },

    { stage: 'Established', pressure: 'Low', side: 'Neutral', risk: 'Continuation', color: '#22c55e' },
    { stage: 'Established', pressure: 'Mid', side: 'Neutral', risk: 'Continuation', color: '#22c55e' },
    { stage: 'Established', pressure: 'High', side: 'Neutral', risk: 'Pullback', color: '#eab308' },
    { stage: 'Established', pressure: 'Extreme', side: 'Neutral', risk: 'Pullback', color: '#eab308' },

    { stage: 'Mature', pressure: 'Low', side: 'Neutral', risk: 'Distribution', color: '#eab308' },
    { stage: 'Mature', pressure: 'Mid', side: 'Neutral', risk: 'Distribution', color: '#eab308' },
    { stage: 'Mature', pressure: 'High', side: 'Neutral', risk: 'Distribution', color: '#eab308' },
    { stage: 'Mature', pressure: 'Extreme', side: 'Neutral', risk: 'Distribution', color: '#eab308' },

    { stage: 'Late', pressure: 'Low', side: 'Neutral', risk: 'Rollover', color: '#f97316' },
    { stage: 'Late', pressure: 'Mid', side: 'Neutral', risk: 'Rollover', color: '#f97316' },
    { stage: 'Late', pressure: 'High', side: 'Neutral', risk: 'Breakdown', color: '#ef4444' },
    { stage: 'Late', pressure: 'Extreme', side: 'Neutral', risk: 'Breakdown', color: '#ef4444' }
];

export function getTrendRisk(
    stage: TrendStage,
    pressure: TrendPressure,
    side: TrendSide
): { risk: TrendRisk; color: string } {
    const entry = RISK_MATRIX.find(
        e => e.stage === stage && e.pressure === pressure && e.side === side
    );

    return entry
        ? { risk: entry.risk, color: entry.color }
        : { risk: 'Continuation', color: '#22c55e' };
}

// ============================================================================
// COMBINED FLOW/TREND STATE
// ============================================================================

export interface FlowTrendState {
    direction: {
        value: number | null;
        label: TrendDirection;
        color: string;
    };
    stage: {
        value: number | null;
        label: TrendStage;
        color: string;
    };
    pressure: {
        value: number | null;
        label: TrendPressure;
        color: string;
    };
    side: {
        label: TrendSide;
    };
    risk: {
        label: TrendRisk;
        color: string;
    };
}

export function calculateFlowTrendState(
    slope200MA: number | null,
    divergence200MA: number | null,
    slopeStreak200MA: number | null
): FlowTrendState {
    // Use slopeStreak for stage calculation (more reliable trend indicator)
    const stageLabel = getTrendStageLabel(slopeStreak200MA);
    const pressureLabel = getTrendPressureLabel(divergence200MA);
    const sideLabel = getTrendSide(divergence200MA);
    const { risk: riskLabel, color: riskColor } = getTrendRisk(stageLabel, pressureLabel, sideLabel);

    return {
        direction: {
            value: slope200MA,
            label: getTrendDirectionLabel(slope200MA),
            color: getTrendDirectionColor(slope200MA)
        },
        stage: {
            value: slopeStreak200MA,
            label: stageLabel,
            color: getTrendStageColor(slopeStreak200MA)
        },
        pressure: {
            value: divergence200MA,
            label: pressureLabel,
            color: getTrendPressureColor(divergence200MA)
        },
        side: {
            label: sideLabel
        },
        risk: {
            label: riskLabel,
            color: riskColor
        }
    };
}
