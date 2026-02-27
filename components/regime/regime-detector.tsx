import { useState } from 'react';
import RegimeModelModal from './regime-model-modal';
import type { MetricValue } from './types';

interface RegimeDetectorProps {
    metricValues: {
        real10Y?: MetricValue;
        rey5yr?: MetricValue;
        eyp5yr?: MetricValue;
        yieldCurve?: MetricValue;
    };
}

export default function RegimeDetector({ metricValues }: RegimeDetectorProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const real10Y = metricValues.real10Y?.value ?? null;
    const realEY = metricValues.rey5yr?.value ?? null;
    const eyp = metricValues.eyp5yr?.value ?? null;
    const yieldCurve = metricValues.yieldCurve?.value ?? null;

    // Determine the regime
    const getRegime = () => {
        // 1️⃣ System Stress Regime (highest priority)
        if (real10Y !== null && real10Y < -0.5) {
            return {
                mapping: {
                    emoji: '🔻',
                    name: 'System Stress',
                    category: 'Bonds',
                    trigger: 'Real 10Y < -0.5%',
                    colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                    details: [
                        'Long-term risk-free rate fails in real terms',
                        'Financial assets lose stable valuation anchor',
                        'Bonds no longer preserve purchasing power',
                        'Capital seeks protection in real assets'
                    ]
                },
                rotation: {
                    emoji: '',
                    name: 'Gold / Real Assets',
                    description: 'Commodities, real estate, inflation hedges',
                    colorClass: 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400',
                    details: [
                        'Financial assets lack credible anchor',
                        'Real assets preserve purchasing power',
                        'Gold acts as monetary alternative',
                        'Commodities benefit from inflation'
                    ],
                    secondary: {
                        emoji: '',
                        name: 'Sell Equities',
                        description: 'If expecting rate hikes or deflation'
                    }
                }
            };
        }

        // 2️⃣ Equities Adverse Regime
        if (realEY !== null && realEY < 0) {
            // Determine rotation based on bond yield
            if (real10Y !== null && real10Y > 0) {
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
                        emoji: '',
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
                        emoji: '',
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

        // 3️⃣ Growth vs Equity Danger Fork (only if no System Stress and Equities not Adverse)
        // This requires: Real 10Y ≥ 0 AND Real EY ≥ 0
        if (real10Y !== null && real10Y >= 0 && realEY !== null && realEY >= 0) {
            // Check if EYP < -1%
            if (eyp !== null && eyp < -1) {
                // 3a) Equity Danger Regime: EYP < -1% AND Yield Curve < 0%
                if (yieldCurve !== null && yieldCurve < 0) {
                    // Determine rotation based on bond yield
                    if (real10Y > 0) {
                        return {
                            mapping: {
                                emoji: '🔻',
                                name: 'Equity Danger',
                                category: 'Market Spreads',
                                trigger: 'EYP < -1% AND Yield Curve < 0%',
                                colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                                details: [
                                    'Equity carry inferior to bonds',
                                    'Liquidity transmission is broken',
                                    'Growth cannot be financed',
                                    'Equity risk is poorly compensated'
                                ]
                            },
                            rotation: {
                                emoji: '',
                                name: 'Bonds',
                                description: 'Fixed income provides real return',
                                colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
                                details: [
                                    'Bonds offer positive real yield',
                                    'Lower risk than equities',
                                    'Inverted curve signals stress',
                                    '2000 / 2006 / 2022 setup'
                                ]
                            }
                        };
                    } else {
                        return {
                            mapping: {
                                emoji: '🔻',
                                name: 'Equity Danger',
                                category: 'Market Spreads',
                                trigger: 'EYP < -1% AND Yield Curve < 0%',
                                colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                                details: [
                                    'Equity carry inferior to bonds',
                                    'Liquidity transmission is broken',
                                    'Growth cannot be financed',
                                    'Equity risk is poorly compensated'
                                ]
                            },
                            rotation: {
                                emoji: '',
                                name: 'Gold / Real Assets',
                                description: 'Commodities, real estate, inflation hedges',
                                colorClass: 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400',
                                details: [
                                    'Both equities and bonds under stress',
                                    'Real assets preserve purchasing power',
                                    'Gold acts as monetary alternative',
                                    '2000 / 2006 / 2022 setup'
                                ]
                            }
                        };
                    }
                }

                // 3b) Growth Regime: EYP < -1% AND Yield Curve > 0%
                if (yieldCurve !== null && yieldCurve > 0) {
                    return {
                        mapping: {
                            emoji: '',
                            name: 'Growth Regime',
                            category: 'Market Spreads',
                            trigger: 'EYP < -1% AND Yield Curve > 0%',
                            colorClass: 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-400',
                            details: [
                                'Equity cash-flow carry inferior to bonds',
                                'But liquidity transmission is healthy',
                                'Duration can be financed and carried',
                                'Growth compensates for weak near-term earnings'
                            ]
                        },
                        rotation: {
                            emoji: '',
                            name: 'Growth Equities',
                            description: 'High-growth / long-duration equities',
                            colorClass: 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-400',
                            details: [
                                'Positive yield curve enables financing',
                                'Duration assets can be carried',
                                'Growth premium compensates for weak carry',
                                '1994-1999 type environment'
                            ]
                        }
                    };
                }
            }

            // 4️⃣ Equity Value Window
            // Check Extreme Value first (≥5.0%)
            if (realEY >= 5.0) {
                return {
                    mapping: {
                        emoji: '',
                        name: 'Equity Value Window',
                        category: 'Extreme Value',
                        trigger: 'Real EY ≥ +5.0%',
                        colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                        details: [
                            'Equity valuations severely compressed',
                            'Pessimism elevated; risk premia unusually wide',
                            'Long-term real returns historically exceptional',
                            'Liquidity and narrative matter far less than valuation'
                        ]
                    },
                    rotation: {
                        emoji: '',
                        name: 'STRONG BUY Equities',
                        description: 'Aggressive accumulation',
                        colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                        details: [
                            'Rare, crisis-level opportunity',
                            'Post-crash environments',
                            'Forced selling / regime resets',
                            'Maximum conviction allocation'
                        ]
                    }
                };
            }

            // Good Value (≥3.0%)
            if (realEY >= 3.0) {
                return {
                    mapping: {
                        emoji: '',
                        name: 'Equity Value Window',
                        category: 'Good Value',
                        trigger: 'Real EY ≥ +3.0%',
                        colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                        details: [
                            'Equities offer strong real earnings cushion',
                            'Valuations attractive, but not distressed',
                            'Long-term real returns are favorable',
                            'Broad participation likely over time'
                        ]
                    },
                    rotation: {
                        emoji: '',
                        name: 'BUY Equities',
                        description: 'Broad equity exposure',
                        colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                        details: [
                            'Standard high-conviction BUY regime',
                            'Favor broad equity exposure',
                            'Accumulate rather than trade',
                            'Greater tolerance for volatility'
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
                emoji: '',
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
    const isExtremeValue = regime.mapping.category === 'Extreme Value';

    return (
        <>
            <RegimeModelModal isOpen={showModal} onClose={() => setShowModal(false)} />

            <div className={`p-4 rounded-lg bg-muted/30 border border-border/50 transition-all duration-300 ${isExtremeValue ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20' : ''}`}>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Regime Detector</h3>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-xs font-semibold px-3 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                        📖 Guide
                    </button>
                </div>

                {/* Extreme Value Alert Banner */}
                {isExtremeValue && (
                    <div className="mb-3 p-3 rounded-lg bg-green-500/20 border-2 border-green-500 animate-pulse">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl">🎯</span>
                            <div className="text-center">
                                <div className="text-sm font-bold text-green-700 dark:text-green-400">
                                    EXTREME VALUE DETECTED
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                                    Rare crisis-level opportunity
                                </div>
                            </div>
                            <span className="text-2xl">🎯</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* Mapping Box */}
                    <div className={`p-4 rounded-lg border transition-all duration-300 ${regime.mapping.colorClass}`}>
                        <div className="space-y-3">
                            <div className="text-center">
                                <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">Mapping</div>
                                <div className="text-xl font-bold leading-tight">{regime.mapping.name}</div>
                            </div>

                            {/* Triggered Metric */}
                            <div className="px-3 py-2.5 rounded-md bg-background/60 backdrop-blur-sm border border-current/10">
                                <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 text-center">Trigger</div>
                                <div className="text-xs font-semibold text-center opacity-70 mb-0.5">{regime.mapping.category}</div>
                                <div className="text-sm font-bold text-center leading-snug">{regime.mapping.trigger}</div>
                            </div>
                        </div>
                    </div>

                    {/* Rotation Box */}
                    <div className={`p-4 rounded-lg border transition-all duration-300 ${regime.rotation.colorClass} ${isExtremeValue ? 'ring-2 ring-green-500 shadow-md' : ''}`}>
                        <div className="space-y-3">
                            <div className="text-center">
                                <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">Rotation</div>
                                <div className={`text-xl font-bold leading-tight ${isExtremeValue ? 'text-2xl' : ''}`}>
                                    {isExtremeValue && <span className="mr-2">⭐</span>}
                                    {regime.rotation.name}
                                    {isExtremeValue && <span className="ml-2">⭐</span>}
                                </div>
                            </div>

                            <div className={`px-3 py-2 rounded-md bg-background/60 backdrop-blur-sm border ${isExtremeValue ? 'border-green-500/50' : 'border-current/10'}`}>
                                <div className={`text-xs text-center leading-relaxed ${isExtremeValue ? 'font-bold' : 'opacity-80'}`}>
                                    {regime.rotation.description}
                                </div>
                            </div>

                            {/* Secondary Option */}
                            {regime.rotation.secondary && (
                                <div className="pt-2 border-t border-current/10">
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Alternative</div>
                                        <div className="text-sm font-bold leading-tight">{regime.rotation.secondary.name}</div>
                                        <div className="text-xs opacity-70 mt-1.5 leading-snug">{regime.rotation.secondary.description}</div>
                                    </div>
                                </div>
                            )}
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
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50">
                        {/* Mapping Details */}
                        <div className="p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Why This Matters</div>
                            <div className="space-y-1.5">
                                {regime.mapping.details.map((detail, index) => (
                                    <div key={index} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                                        <span className="opacity-40 mt-0.5">•</span>
                                        <span>{detail}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rotation Details */}
                        <div className="p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Action Plan</div>
                            <div className="space-y-1.5">
                                {regime.rotation.details.map((detail, index) => (
                                    <div key={index} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                                        <span className="opacity-40 mt-0.5">•</span>
                                        <span>{detail}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
