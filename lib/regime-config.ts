// /lib/regime-config.ts
// Liquidity Classification System
// Based on three key liquidity variables: Real 3M, Real 10Y, Yield Curve

export interface LiquidityScore {
    real3M: number;
    real10Y: number;
    yieldCurve: number;
    total: number;
}

export interface LiquidityRegime {
    name: string;
    description: string;
    marketBehavior: string[];
    examples?: string;
}

/**
 * 5-band centered scoring
 *
 * +2 = Highly Expansionary
 * +1 = Expansionary
 *  0 = Neutral
 * -1 = Contractive
 * -2 = Highly Contractive
 */

/**
 * Real 3M
 * Uses actual value
 */
export function scoreReal3M(value: number | null): number {
    if (value === null) return 0;
    if (value < -1.0) return 2;
    if (value < 0.0) return 1;
    if (value <= 1.5) return 0;
    if (value <= 3.0) return -1;
    return -2;
}

/**
 * Real 10Y
 * Uses actual value
 */
export function scoreReal10Y(value: number | null): number {
    if (value === null) return 0;
    if (value < 0.0) return 2;
    if (value < 1.0) return 1;
    if (value <= 2.5) return 0;
    if (value <= 4.0) return -1;
    return -2;
}

/**
 * Yield Curve (10Y - 3M)
 * Uses actual value
 */
export function scoreYieldCurve(value: number | null): number {
    if (value === null) return 0;
    if (value > 1.75) return 2;
    if (value > 0.75) return 1;
    if (value >= 0.25) return 0;
    if (value >= -0.25) return -1;
    return -2;
}

/**
 * CPI (YoY)
 * Uses actual value
 */
export function scoreCPI(value: number | null): number {
    if (value === null) return 0;
    if (value < 0.0) return 2;
    if (value < 2.0) return 1;
    if (value <= 3.0) return 0;
    if (value <= 5.0) return -1;
    return -2;
}

/**
 * Earnings Yield Premium (EYP)
 * Uses actual value
 */
export function scoreEYP(value: number | null): number {
    if (value === null) return 0;
    if (value > 4.0) return 2;      // Extremely Attractive
    if (value > 2.0) return 1;      // Attractive
    if (value >= 0.0) return 0;     // Normal
    if (value >= -2.0) return -1;   // Overvalued
    return -2;                       // Extremely Overvalued
}

/**
 * Real Earnings Yield
 * Uses actual value
 */
export function scoreRealEY(value: number | null): number {
    if (value === null) return 0;
    if (value > 6.0) return 2;      // Extremely Cheap
    if (value > 4.0) return 1;      // Attractive
    if (value > 2.0) return 0;      // Fair
    if (value >= 0.0) return -1;    // Expensive
    return -2;                       // Very Expensive
}

/**
 * Calculate price environment regime based on CPI
 */
export function calculatePriceRegime(
    cpiValue: number | null
): { score: number; regime: LiquidityRegime } {
    const score = scoreCPI(cpiValue);
    const regime = getPriceRegime(score);
    return { score, regime };
}

/**
 * Calculate valuation regime based on EYP and Real EY
 */
export function calculateValuationRegime(
    eypValue: number | null,
    realEYValue: number | null
): { score: number; regime: LiquidityRegime } {
    const eypScore = scoreEYP(eypValue);
    const realEYScore = scoreRealEY(realEYValue);
    const totalScore = eypScore + realEYScore;

    const regime = getValuationRegime(totalScore);
    return { score: totalScore, regime };
}

/**
 * Map CPI score to price regime
 */
function getPriceRegime(score: number): LiquidityRegime {
    if (score >= 2) {
        return {
            name: 'Deflation',
            description: 'Prices are falling',
            marketBehavior: [
                'Deflationary pressure',
                'Real debt burden rising',
                'Potential demand weakness'
            ]
        };
    }

    if (score >= 1) {
        return {
            name: 'Low Inflation',
            description: 'Inflation is low and stable',
            marketBehavior: [
                'Supportive for real returns',
                'Central bank flexibility',
                'Stable purchasing power'
            ]
        };
    }

    if (score >= 0) {
        return {
            name: 'Target Inflation',
            description: 'Inflation is near target levels',
            marketBehavior: [
                'Balanced price environment',
                'Normal monetary policy',
                'Stable expectations'
            ]
        };
    }

    if (score >= -1) {
        return {
            name: 'Elevated Inflation',
            description: 'Inflation is elevated above target',
            marketBehavior: [
                'Eroding real returns',
                'Pressure for policy tightening',
                'Rising input costs'
            ]
        };
    }

    return {
        name: 'High Inflation',
        description: 'Inflation is significantly elevated',
        marketBehavior: [
            'Severe erosion of purchasing power',
            'Aggressive policy response likely',
            'Economic distortions'
        ]
    };
}

/**
 * Map valuation score to regime
 * Total score range: -4 to +4
 */
function getValuationRegime(totalScore: number): LiquidityRegime {
    if (totalScore >= 3) {
        return {
            name: 'Deep Value',
            description: 'Equities are extremely cheap',
            marketBehavior: [
                'Exceptional risk/reward',
                'High margin of safety',
                'Strong long-term opportunity'
            ]
        };
    }

    if (totalScore >= 1) {
        return {
            name: 'Attractive',
            description: 'Equities offer good value',
            marketBehavior: [
                'Favorable entry point',
                'Reasonable risk/reward',
                'Supportive for long positions'
            ]
        };
    }

    if (totalScore >= -1) {
        return {
            name: 'Fair',
            description: 'Equities are fairly valued',
            marketBehavior: [
                'Balanced risk/reward',
                'Neutral valuation signal',
                'Returns driven by fundamentals'
            ]
        };
    }

    if (totalScore >= -3) {
        return {
            name: 'Expensive',
            description: 'Equities are overvalued',
            marketBehavior: [
                'Limited upside potential',
                'Elevated risk',
                'Vulnerable to corrections'
            ]
        };
    }

    return {
        name: 'Extremely Expensive',
        description: 'Equities are in bubble territory',
        marketBehavior: [
            'Extreme overvaluation',
            'High crash risk',
            'Poor risk/reward'
        ]
    };
}

/**
 * Calculate total liquidity score and determine regime
 */
export function calculateLiquidityRegime(
    real3MValue: number | null,
    real10YValue: number | null,
    yieldCurveValue: number | null
): { score: LiquidityScore; regime: LiquidityRegime } {
    const score: LiquidityScore = {
        real3M: scoreReal3M(real3MValue),
        real10Y: scoreReal10Y(real10YValue),
        yieldCurve: scoreYieldCurve(yieldCurveValue),
        total: 0
    };

    score.total = score.real3M + score.real10Y + score.yieldCurve;

    const regime = getLiquidityRegime(score.total);

    return { score, regime };
}

/**
 * Map total score to 5-band liquidity regime
 *
 * Total score range: -6 to +6
 */
function getLiquidityRegime(totalScore: number): LiquidityRegime {
    if (totalScore >= 4) {
        return {
            name: 'Highly Expansionary Liquidity',
            description: 'Capital is abundant and credit transmission is highly supportive',
            marketBehavior: [
                'Strong risk appetite',
                'Broad speculation',
                'Growth and duration leadership'
            ],
            examples: '2020–2021'
        };
    }

    if (totalScore >= 2) {
        return {
            name: 'Expansionary Liquidity',
            description: 'Monetary and credit conditions are supportive',
            marketBehavior: [
                'Healthy credit creation',
                'Broad risk support',
                'Constructive asset backdrop'
            ],
            examples: '2013–2019'
        };
    }

    if (totalScore >= -1) {
        return {
            name: 'Neutral Liquidity',
            description: 'Liquidity conditions are balanced',
            marketBehavior: [
                'Mixed asset leadership',
                'Selective risk-taking',
                'Normal capital conditions'
            ]
        };
    }

    if (totalScore >= -3) {
        return {
            name: 'Contractive Liquidity',
            description: 'Capital conditions are becoming restrictive',
            marketBehavior: [
                'Pressure on speculative assets',
                'Rotation toward quality',
                'Tighter financial conditions'
            ]
        };
    }

    return {
        name: 'Highly Contractive Liquidity',
        description: 'Capital is constrained and credit transmission is weak',
        marketBehavior: [
            'Elevated recession risk',
            'Credit stress',
            'Broad pressure on risk assets'
        ],
        examples: '2000, 2007, 2023'
    };
}

/**
 * Metric labels
 */
export function getReal3MLabel(value: number | null): string {
    if (value === null) return 'N/A';
    if (value < -1.0) return 'Highly Expansionary';
    if (value < 0.0) return 'Expansionary';
    if (value <= 1.5) return 'Neutral';
    if (value <= 3.0) return 'Contractive';
    return 'Highly Contractive';
}

export function getReal10YLabel(value: number | null): string {
    if (value === null) return 'N/A';
    if (value < 0.0) return 'Highly Expansionary';
    if (value < 1.0) return 'Expansionary';
    if (value <= 2.5) return 'Neutral';
    if (value <= 4.0) return 'Contractive';
    return 'Highly Contractive';
}

export function getYieldCurveLabel(value: number | null): string {
    if (value === null) return 'N/A';
    if (value > 1.75) return 'Highly Expansionary';
    if (value > 0.75) return 'Expansionary';
    if (value >= 0.25) return 'Neutral';
    if (value >= -0.25) return 'Contractive';
    return 'Highly Contractive';
}

export function getCPILabel(value: number | null): string {
    if (value === null) return 'N/A';
    if (value < 0.0) return 'Deflation';
    if (value < 2.0) return 'Low';
    if (value <= 3.0) return 'Target';
    if (value <= 5.0) return 'Elevated';
    return 'High';
}

export function getEYPLabel(value: number | null): string {
    if (value === null) return 'N/A';
    if (value > 4.0) return 'Extremely Attractive';
    if (value > 2.0) return 'Attractive';
    if (value >= 0.0) return 'Fair';
    if (value >= -2.0) return 'Expensive';
    return 'Extremely Expensive';
}

export function getRealEYLabel(value: number | null): string {
    if (value === null) return 'N/A';
    if (value > 6.0) return 'Extremely Attractive';
    if (value > 4.0) return 'Attractive';
    if (value > 2.0) return 'Fair';
    if (value >= 0.0) return 'Expensive';
    return 'Extremely Expensive';
}

/**
 * Get color for regime display
 */
export function getRegimeColor(regimeName: string): string {
    switch (regimeName) {
        // Liquidity regimes
        case 'Highly Expansionary Liquidity':
            return 'bg-lime-500/10 border-lime-500 text-lime-700 dark:text-lime-400';
        case 'Expansionary Liquidity':
            return 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400';
        case 'Neutral Liquidity':
            return 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400';
        case 'Contractive Liquidity':
            return 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-400';
        case 'Highly Contractive Liquidity':
            return 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400';

        // Price regimes
        case 'Deflation':
            return 'bg-lime-500/10 border-lime-500 text-lime-700 dark:text-lime-400';
        case 'Low Inflation':
            return 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400';
        case 'Target Inflation':
            return 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400';
        case 'Elevated Inflation':
            return 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-400';
        case 'High Inflation':
            return 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400';

        // Valuation regimes
        case 'Deep Value':
            return 'bg-lime-500/10 border-lime-500 text-lime-700 dark:text-lime-400';
        case 'Attractive':
            return 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400';
        case 'Fair':
            return 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400';
        case 'Expensive':
            return 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-400';
        case 'Extremely Expensive':
            return 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400';

        default:
            return 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400';
    }
}