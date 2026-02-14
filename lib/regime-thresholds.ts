// Centralized regime threshold configuration
// Used across matrix pages and cycle metrics components

export const REGIME_THRESHOLDS = {
    inflation: {
        low: { max: 3, label: '< 3%' },
        mid: { min: 3, max: 6, label: '3% – 6%' },
        high: { min: 6, label: '> 6%' }
    },
    bondYieldsNominal: {
        low: { max: 2, label: '< 2%', description: 'ZIRP environment' },
        mid: { min: 2, max: 6, label: '2% – 6%', description: 'Normal range' },
        high: { min: 6, label: '> 6%', description: 'Elevated rates' }
    },
    bondYieldsReal: {
        low: { max: 0, label: '< 0%', description: 'Financial repression' },
        mid: { min: 0, max: 2, label: '0% – 2%', description: 'Neutral' },
        high: { min: 2, label: '> 2%', description: 'Restrictive' }
    },
    yieldCurve: {
        inverted: { max: -0.5, label: '< -0.5%', description: 'Deeply inverted' },
        flat: { min: -0.5, max: 0.5, label: '-0.5% to +0.5%', description: 'Flat' },
        steep: { min: 0.5, label: '> +0.5%', description: 'Steep' }
    },
    equityPE: {
        cheap: { max: 15, label: '< 15x' },
        fair: { min: 15, max: 20, label: '15x – 20x' },
        expensive: { min: 20, label: '> 20x' }
    },
    earningsYieldPremium: {
        negative: { max: 0, label: '< 0%', description: 'Bonds more attractive' },
        neutral: { min: 0, max: 2, label: '0% – 2%', description: 'Fair compensation' },
        positive: { min: 2, label: '> 2%', description: 'Equities attractive' }
    },
    realEarningsYield: {
        negative: { max: 0, label: '< 0%', description: 'Negative real return' },
        low: { min: 0, max: 3, label: '0% – 3%', description: 'Low real return' },
        positive: { min: 3, label: '> 3%', description: 'Attractive real return' }
    },
    fedFunds: {
        low: { max: 2, label: '< 2%', description: 'Accommodative' },
        mid: { min: 2, max: 5, label: '2% – 5%', description: 'Neutral' },
        high: { min: 5, label: '> 5%', description: 'Restrictive' }
    }
};

// Helper function to get regime level for a given metric
export function getRegimeLevel(
    metric: keyof typeof REGIME_THRESHOLDS,
    value: number | null
): 'low' | 'mid' | 'high' | 'cheap' | 'fair' | 'expensive' | 'negative' | 'neutral' | 'positive' | 'inverted' | 'flat' | 'steep' | null {
    if (value === null) return null;

    const thresholds = REGIME_THRESHOLDS[metric];

    // Handle different naming conventions
    if ('cheap' in thresholds) {
        if (value < thresholds.cheap.max) return 'cheap';
        if (value < thresholds.fair.max) return 'fair';
        return 'expensive';
    }

    if ('inverted' in thresholds) {
        if (value < thresholds.inverted.max) return 'inverted';
        if (value < thresholds.flat.max) return 'flat';
        return 'steep';
    }

    if ('negative' in thresholds) {
        if (value < thresholds.negative.max) return 'negative';
        // Handle both 'neutral' and 'low' naming
        if ('neutral' in thresholds) {
            if (value < thresholds.neutral.max) return 'neutral';
        } else if ('low' in thresholds) {
            if (value < thresholds.low.max) return 'low';
        }
        return 'positive';
    }

    // Standard low/mid/high
    if ('low' in thresholds && 'mid' in thresholds && 'high' in thresholds) {
        if (value < thresholds.low.max) return 'low';
        if (value < thresholds.mid.max) return 'mid';
        return 'high';
    }

    return null;
}

// Helper to get color classes based on regime level
export function getRegimeColors(level: string | null): {
    border: string;
    text: string;
} {
    switch (level) {
        case 'low':
        case 'cheap':
        case 'steep':
        case 'positive':
            return {
                border: 'border-green-500 dark:border-green-400',
                text: 'text-green-600 dark:text-green-400'
            };
        case 'mid':
        case 'fair':
        case 'flat':
        case 'neutral':
            return {
                border: 'border-yellow-500 dark:border-yellow-400',
                text: 'text-yellow-600 dark:text-yellow-400'
            };
        case 'high':
        case 'expensive':
        case 'inverted':
        case 'negative':
            return {
                border: 'border-red-500 dark:border-red-400',
                text: 'text-red-600 dark:text-red-400'
            };
        default:
            return {
                border: 'border-gray-300 dark:border-gray-700',
                text: 'text-gray-500 dark:text-gray-400'
            };
    }
}

// Helper to get display label
export function getRegimeLabel(level: string | null): string {
    if (!level) return 'N/A';
    return level.charAt(0).toUpperCase() + level.slice(1);
}
