import { useState, useEffect } from 'react';
import SignalModelModal from './signal-model-modal';
import type { MetricValue } from './types';

interface RegimeDetectorProps {
    metricValues: {
        real10Y?: MetricValue;
        rey5yr?: MetricValue;
        eyp5yr?: MetricValue;
        yieldCurve?: MetricValue;
    };
    selectedDate: string; // Format: YYYY-MM-DD
}

export default function SignalDetector({ metricValues, selectedDate }: RegimeDetectorProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [yieldCurveInversionDate, setYieldCurveInversionDate] = useState<string | null>(null);
    const [loadingInversion, setLoadingInversion] = useState(false);

    // Fetch yield curve inversion data
    useEffect(() => {
        setLoadingInversion(true);

        async function fetchInversionData() {
            try {
                const response = await fetch(`/api/yield-curve-inversion?date=${selectedDate}`);
                const data = await response.json();
                setYieldCurveInversionDate(data.inversionDate);
            } catch (error) {
                console.error('Error fetching inversion data:', error);
                setYieldCurveInversionDate(null);
            } finally {
                setLoadingInversion(false);
            }
        }

        fetchInversionData();
    }, [selectedDate]);

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

        // 2️⃣ Equity Value Breakdown (most severe equity warning)
        if (realEY !== null && realEY < -2) {
            // Determine rotation based on bond yield
            if (real10Y !== null && real10Y > 0) {
                return {
                    mapping: {
                        emoji: '🔴',
                        name: 'Equity Value Breakdown',
                        category: 'Equities',
                        trigger: 'Real EY < -2%',
                        colorClass: 'bg-red-600/20 border-red-600 text-red-800 dark:text-red-300',
                        details: [
                            'Equity earnings materially lag inflation',
                            'Equity valuations are fundamentally unsound',
                            'Markets depend entirely on liquidity or speculation',
                            'High probability of regime reset'
                        ]
                    },
                    rotation: {
                        emoji: '',
                        name: 'EXIT Equities',
                        description: 'Aggressive exit from equity exposure',
                        colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
                        details: [
                            'Major red-flag environment',
                            'Bonds offer positive real yield',
                            'Preserve capital aggressively',
                            'Wait for regime reset'
                        ]
                    }
                };
            } else {
                return {
                    mapping: {
                        emoji: '🔴',
                        name: 'Equity Value Breakdown',
                        category: 'Equities',
                        trigger: 'Real EY < -2%',
                        colorClass: 'bg-red-600/20 border-red-600 text-red-800 dark:text-red-300',
                        details: [
                            'Equity earnings materially lag inflation',
                            'Equity valuations are fundamentally unsound',
                            'Markets depend entirely on liquidity or speculation',
                            'High probability of regime reset'
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
                            'Major red-flag environment'
                        ]
                    }
                };
            }
        }

        // 3️⃣ Equity Sell Zone
        if (realEY !== null && realEY < -1) {
            // Determine rotation based on bond yield
            if (real10Y !== null && real10Y > 0) {
                return {
                    mapping: {
                        emoji: '🔴',
                        name: 'Equity Sell Zone',
                        category: 'Equities',
                        trigger: 'Real EY < -1%',
                        colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                        details: [
                            'Equity earnings fail to beat inflation',
                            'Equity ownership relies on multiple expansion',
                            'Long-term real returns structurally weak',
                            'Drawdown risk elevated'
                        ]
                    },
                    rotation: {
                        emoji: '',
                        name: 'SELL / Underweight Equities',
                        description: 'Rotate to bonds',
                        colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
                        details: [
                            'Hard economic break, not timing call',
                            'Bonds offer positive real yield',
                            'Lower risk than equities',
                            'Preserve capital in real terms'
                        ]
                    }
                };
            } else {
                return {
                    mapping: {
                        emoji: '🔴',
                        name: 'Equity Sell Zone',
                        category: 'Equities',
                        trigger: 'Real EY < -1%',
                        colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                        details: [
                            'Equity earnings fail to beat inflation',
                            'Equity ownership relies on multiple expansion',
                            'Long-term real returns structurally weak',
                            'Drawdown risk elevated'
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
                            'Hard economic break, not timing call'
                        ]
                    }
                };
            }
        }

        // 4️⃣ Equity Risk Warning
        if (realEY !== null && realEY < 0.5) {
            return {
                mapping: {
                    emoji: '🟠',
                    name: 'Equity Risk Warning',
                    category: 'Equities',
                    trigger: 'Real EY < +0.5%',
                    colorClass: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400',
                    details: [
                        'Equity earnings barely clear inflation',
                        'Valuation cushion is thin',
                        'Equities sensitive to liquidity, rates, narrative',
                        'Forward returns increasingly path-dependent'
                    ]
                },
                rotation: {
                    emoji: '',
                    name: 'Reduce Equity Aggressiveness',
                    description: 'Tighten risk / early warning',
                    colorClass: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400',
                    details: [
                        'Not a sell — early warning signal',
                        'Reduce position sizes',
                        'Tighten stop losses',
                        'Monitor for deterioration'
                    ]
                }
            };
        }

        // 5️⃣ Growth vs Equity Danger Fork (only if no System Stress and Equities not Adverse)

        // This requires: Real 10Y ≥ 0 AND Real EY ≥ 0
        if (real10Y !== null && real10Y >= 0 && realEY !== null && realEY >= 0) {
            // Check if EYP < -1%
            if (eyp !== null && eyp < -1) {
                // 5a) Equity Danger Regime: EYP < -1% AND Yield Curve < 0%
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

                // 5b) Growth Regime: EYP < -1% AND Yield Curve > 0%
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

            // 6️⃣ Equity Value Window
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
                colorClass: 'bg-blue-500/10 border-blue-400 text-blue-700 dark:text-blue-400',
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
                colorClass: 'bg-blue-500/10 border-blue-400 text-blue-700 dark:text-blue-400',
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

    // Determine bond and equity signals
    const getBondSignal = () => {
        if (real10Y !== null && real10Y < -0.5) {
            return {
                name: 'System Stress',
                trigger: 'Real 10Y < -0.5%',
                colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                details: [
                    'Long-term risk-free rate fails in real terms',
                    'Financial assets lose stable valuation anchor',
                    'Bonds no longer preserve purchasing power'
                ]
            };
        }
        if (real10Y !== null && real10Y >= 0) {
            return {
                name: 'Positive Real Yield',
                trigger: 'Real 10Y ≥ 0%',
                colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
                details: [
                    'Bonds preserve purchasing power',
                    'Risk-free rate provides real return',
                    'Safe haven available'
                ]
            };
        }
        return {
            name: 'Negative Real Yield',
            trigger: 'Real 10Y < 0%',
            colorClass: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400',
            details: [
                'Bonds lose purchasing power',
                'Risk-free rate fails in real terms',
                'Seek alternative stores of value'
            ]
        };
    };

    const getEquitySignal = () => {
        if (realEY !== null && realEY < -2) {
            return {
                name: 'Equity Value Breakdown',
                trigger: 'Real EY < -2%',
                colorClass: 'bg-red-600/20 border-red-600 text-red-800 dark:text-red-300',
                details: [
                    'Equity earnings materially lag inflation',
                    'Valuations fundamentally unsound',
                    'High probability of regime reset'
                ]
            };
        }
        if (realEY !== null && realEY < -1) {
            return {
                name: 'Equity Sell Zone',
                trigger: 'Real EY < -1%',
                colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
                details: [
                    'Equity earnings fail to beat inflation',
                    'Long-term real returns structurally weak',
                    'Drawdown risk elevated'
                ]
            };
        }
        if (realEY !== null && realEY < 0.5) {
            return {
                name: 'Equity Risk Warning',
                trigger: 'Real EY < +0.5%',
                colorClass: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400',
                details: [
                    'Equity earnings barely clear inflation',
                    'Valuation cushion is thin',
                    'Forward returns path-dependent'
                ]
            };
        }
        if (realEY !== null && realEY >= 5.0) {
            return {
                name: 'Extreme Value',
                trigger: 'Real EY ≥ +5.0%',
                colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                details: [
                    'Equity valuations severely compressed',
                    'Long-term real returns historically exceptional',
                    'Rare crisis-level opportunity'
                ]
            };
        }
        if (realEY !== null && realEY >= 3.0) {
            return {
                name: 'Good Value',
                trigger: 'Real EY ≥ +3.0%',
                colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
                details: [
                    'Equities offer strong real earnings cushion',
                    'Valuations attractive',
                    'Long-term real returns favorable'
                ]
            };
        }
        return {
            name: 'Normal',
            trigger: 'Real EY healthy',
            colorClass: 'bg-blue-500/10 border-blue-400 text-blue-700 dark:text-blue-400',
            details: [
                'Equities compensate for inflation',
                'Standard risk/return tradeoffs apply',
                'Normal valuation environment'
            ]
        };
    };

    const bondSignal = getBondSignal();
    const equitySignal = getEquitySignal();

    // Check for Growth Equities Regime
    const isGrowthRegime =
        eyp !== null &&
        yieldCurve !== null &&
        eyp < 0 &&
        yieldCurve > 0;

    // Calculate equity warning flag
    const getEquityWarning = () => {
        if (!yieldCurveInversionDate) return null;

        const inversionDate = new Date(yieldCurveInversionDate);
        const current = new Date(selectedDate);
        const monthsSinceInversion = (current.getFullYear() - inversionDate.getFullYear()) * 12 +
            (current.getMonth() - inversionDate.getMonth());

        if (monthsSinceInversion >= 0 && monthsSinceInversion <= 24) {
            const monthsRemaining = 24 - monthsSinceInversion;
            return {
                monthsRemaining,
                inversionDate: yieldCurveInversionDate
            };
        }
        return null;
    };

    const equityWarning = getEquityWarning();

    return (
        <>
            <SignalModelModal isOpen={showModal} onClose={() => setShowModal(false)} />

            <div className={`p-4 rounded-lg bg-muted/30 border border-border/50 transition-all duration-300 ${isExtremeValue ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/20' : ''}`}>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Signal Detector</h3>
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

                <div className="grid grid-cols-3 gap-3 mb-3">
                    {/* Bond Mapping Box */}
                    <div className={`p-4 rounded-lg border transition-all duration-300 ${bondSignal.colorClass} flex flex-col min-h-[200px]`}>
                        <div className="space-y-3 flex-1">
                            <div className="text-center">
                                <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">Bond Mapping</div>
                                <div className="text-lg font-bold leading-tight">{bondSignal.name}</div>
                            </div>

                            <div className="px-3 py-2.5 rounded-md bg-background/60 backdrop-blur-sm border border-current/10">
                                <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 text-center">Trigger</div>
                                <div className="text-sm font-bold text-center leading-snug">{bondSignal.trigger}</div>
                            </div>
                        </div>
                    </div>

                    {/* Equity Mapping Box */}
                    <div className={`p-4 rounded-lg border transition-all duration-300 ${equitySignal.colorClass} flex flex-col min-h-[200px]`}>
                        <div className="space-y-3 flex-1">
                            <div className="text-center">
                                <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">Equity Mapping</div>
                                <div className="text-lg font-bold leading-tight">{equitySignal.name}</div>
                            </div>

                            <div className="px-3 py-2.5 rounded-md bg-background/60 backdrop-blur-sm border border-current/10">
                                <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 text-center">Trigger</div>
                                <div className="text-sm font-bold text-center leading-snug">{equitySignal.trigger}</div>
                            </div>
                        </div>

                        {/* Inverted Yield Curve - positioned at bottom */}
                        <div className="pt-3 mt-3 border-t border-current/10">
                            {equityWarning ? (
                                <div className="p-2 rounded-md bg-amber-500/20 border border-amber-500/50">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-base">⚠️</span>
                                        <div className="text-center flex-1">
                                            <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                                🚩 Inverted Yield Curve
                                            </div>
                                            <div className="text-[10px] text-amber-600 dark:text-amber-300 opacity-80 mt-0.5">
                                                {equityWarning.monthsRemaining} months remaining
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[52px]" />
                            )}
                        </div>
                    </div>

                    {/* Rotation Box */}
                    <div className={`p-4 rounded-lg border transition-all duration-300 ${regime.rotation.colorClass} ${isExtremeValue ? 'ring-2 ring-green-500 shadow-md' : ''} flex flex-col min-h-[200px]`}>
                        <div className="space-y-3 flex-1">
                            <div className="text-center">
                                <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">Rotation</div>
                                <div className={`text-lg font-bold leading-tight ${isExtremeValue ? 'text-xl' : ''}`}>
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
                        </div>

                        {/* Growth Equities Regime Indicator - positioned at bottom */}
                        <div className="pt-3 mt-3 border-t border-current/10">
                            {isGrowthRegime ? (
                                <div className="p-2 rounded-md bg-purple-500/20 border border-purple-500/50">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-base">🚀</span>
                                        <div className="text-center">
                                            <div className="text-xs font-bold text-purple-700 dark:text-purple-400">
                                                Growth Equities Regime
                                            </div>
                                            <div className="text-[10px] text-purple-600 dark:text-purple-300 opacity-80 mt-0.5">
                                                Negative EYP + Positive Curve
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[52px]" />
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
                    <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
                        {/* Bond Details */}
                        <div className="p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Bond Context</div>
                            <div className="space-y-1.5">
                                {bondSignal.details.map((detail, index) => (
                                    <div key={index} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                                        <span className="opacity-40 mt-0.5">•</span>
                                        <span>{detail}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Equity Details */}
                        <div className="p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Equity Context</div>
                            <div className="space-y-1.5">
                                {equitySignal.details.map((detail, index) => (
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
