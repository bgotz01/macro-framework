import { useState } from 'react';

interface MetricValue {
    value: number | null;
    yoy: number | null;
}

interface RegimeDetectorProps {
    metricValues: {
        realYield?: MetricValue;
        rey5yr?: MetricValue;
    };
}

export default function RegimeDetector({ metricValues }: RegimeDetectorProps) {
    const [showDetails, setShowDetails] = useState(false);

    const realYield = metricValues.realYield?.value ?? null;
    const realEY = metricValues.rey5yr?.value ?? null;

    // Determine the regime
    const getRegime = () => {
        // 1️⃣ System Stress Regime (highest priority)
        if (realYield !== null && realYield < 0) {
            return {
                mapping: {
                    emoji: '⚠️',
                    name: 'System Stress',
                    category: 'Bonds',
                    trigger: 'Real 10Y < 0%',
                    colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                    details: [
                        'Long-term risk-free rate fails in real terms',
                        'Financial assets lose stable valuation anchor',
                        'Bonds no longer preserve purchasing power',
                        'Capital seeks protection in real assets'
                    ]
                },
                rotation: {
                    emoji: '🏆',
                    name: 'Gold / Real Assets',
                    description: 'Commodities, real estate, inflation hedges',
                    colorClass: 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400',
                    details: [
                        'Financial assets lack credible anchor',
                        'Real assets preserve purchasing power',
                        'Gold acts as monetary alternative',
                        'Commodities benefit from inflation'
                    ]
                }
            };
        }

        // 2️⃣ Equities Adverse Regime
        if (realEY !== null && realEY < 0) {
            // Determine rotation based on bond yield
            if (realYield !== null && realYield > 0) {
                return {
                    mapping: {
                        emoji: '🔻',
                        name: 'Equities Adverse',
                        category: 'Equities',
                        trigger: 'Real EY < 0%',
                        colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                        details: [
                            'Equities fail to clear inflation',
                            'Equity risk is underpaid',
                            'Long-term equity returns structurally weak',
                            'Capital should prefer defensive assets'
                        ]
                    },
                    rotation: {
                        emoji: '💰',
                        name: 'Bonds',
                        description: 'Fixed income provides real return',
                        colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
                        details: [
                            'Bonds offer positive real yield',
                            'Lower risk than equities',
                            'Preserve capital in real terms',
                            'Duration provides stability'
                        ]
                    }
                };
            } else {
                return {
                    mapping: {
                        emoji: '🔻',
                        name: 'Equities Adverse',
                        category: 'Equities',
                        trigger: 'Real EY < 0%',
                        colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                        details: [
                            'Equities fail to clear inflation',
                            'Equity risk is underpaid',
                            'Long-term equity returns structurally weak',
                            'Capital should prefer defensive assets'
                        ]
                    },
                    rotation: {
                        emoji: '🏆',
                        name: 'Gold / Real Assets',
                        description: 'Commodities, real estate, inflation hedges',
                        colorClass: 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400',
                        details: [
                            'Both equities and bonds fail in real terms',
                            'Real assets preserve purchasing power',
                            'Gold acts as monetary alternative',
                            'Commodities benefit from inflation'
                        ]
                    }
                };
            }
        }

        // Normal regime (no stress detected)
        return {
            mapping: {
                emoji: '✅',
                name: 'Normal',
                category: 'System',
                trigger: 'All metrics healthy',
                colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                details: [
                    'Financial system functioning normally',
                    'Risk-free rate provides real return',
                    'Equities compensate for inflation',
                    'Standard asset allocation applies'
                ]
            },
            rotation: {
                emoji: '📊',
                name: 'Balanced',
                description: 'Standard asset allocation',
                colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                details: [
                    'Diversified portfolio appropriate',
                    'Risk assets can be held',
                    'Normal risk/return tradeoffs apply',
                    'No forced rotation required'
                ]
            }
        };
    };

    const regime = getRegime();

    return (
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Regime Detector</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Mapping Box */}
                <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${regime.mapping.colorClass}`}>
                    <div className="space-y-2">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">{regime.mapping.emoji}</span>
                            <div className="text-center">
                                <div className="text-sm font-bold">Mapping</div>
                                <div className="text-lg font-bold">{regime.mapping.name}</div>
                            </div>
                        </div>

                        {/* Triggered Metric */}
                        <div className="px-3 py-2 rounded bg-background/50 border border-current/20 text-center">
                            <div className="text-[10px] font-semibold uppercase tracking-wide opacity-60 mb-1">Trigger</div>
                            <div className="text-sm font-bold">{regime.mapping.category}</div>
                            <div className="text-base font-bold">{regime.mapping.trigger}</div>
                        </div>
                    </div>
                </div>

                {/* Rotation Box */}
                <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${regime.rotation.colorClass}`}>
                    <div className="space-y-2">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">{regime.rotation.emoji}</span>
                            <div className="text-center">
                                <div className="text-sm font-bold">Rotation</div>
                                <div className="text-lg font-bold">{regime.rotation.name}</div>
                            </div>
                        </div>
                        <div className="text-xs opacity-80 text-center">{regime.rotation.description}</div>
                    </div>
                </div>
            </div>

            {/* Details Toggle Button */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-xs font-semibold opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center gap-1 py-2"
            >
                {showDetails ? '▼' : '▶'} Details
            </button>

            {/* Details Section */}
            {showDetails && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                    {/* Mapping Details */}
                    <div className={`p-3 rounded-lg border ${regime.mapping.colorClass}`}>
                        <div className="space-y-1">
                            {regime.mapping.details.map((detail, index) => (
                                <div key={index} className="text-xs opacity-80 flex items-start gap-2">
                                    <span className="opacity-50">•</span>
                                    <span>{detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rotation Details */}
                    <div className={`p-3 rounded-lg border ${regime.rotation.colorClass}`}>
                        <div className="space-y-1">
                            {regime.rotation.details.map((detail, index) => (
                                <div key={index} className="text-xs opacity-80 flex items-start gap-2">
                                    <span className="opacity-50">•</span>
                                    <span>{detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
