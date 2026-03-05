//components/regime-tracker-section.tsx
import RegimeTracker from '../regime-tracker';
import RegimeTooltipButton from '../regime-tooltip-button';
import type { MetricValue } from './types';

interface SignalTrackerSectionProps {
    title: string;
    metricValues: {
        real3M?: MetricValue;
        real10Y?: MetricValue;
        rey5yr?: MetricValue;
        tnx?: MetricValue;
        irx?: MetricValue;
        eyp5yr?: MetricValue;
    };
    type: 'real-metrics' | 'market-spreads';
}

export default function SignalTrackerSection({ title, metricValues, type }: SignalTrackerSectionProps) {
    // Status functions for each tracker
    const getCashStatus = (value: number | null) => {
        if (value === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
        };
        if (value > 1) return {
            emoji: '🟢',
            label: 'Normal',
            description: 'Real 3M > 1% • Systemically calm',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= 0) return {
            emoji: '🟠',
            label: 'Constrained',
            description: 'Real 3M 0–1% • Warning band',
            colorClass: 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400'
        };
        return {
            emoji: '🔴',
            label: 'Push',
            description: 'Real 3M < 0% • Forcing risk',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

    const getBondsStatus = (value: number | null) => {
        if (value === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
        };
        if (value > 2.5) return {
            emoji: '🟢',
            label: 'Anchored',
            description: 'Real 10Y > 2.5% • Capital compounds in real terms',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= 0) return {
            emoji: '🔵',
            label: 'Supportive',
            description: 'Real 10Y 0–2.5% • System functions normally',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
        };
        return {
            emoji: '🔴',
            label: 'System Stress',
            description: 'Real 10Y < 0% • No real risk-free rate',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

    const getEquitiesStatus = (value: number | null) => {
        if (value === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
        };
        if (value > 3) return {
            emoji: '🟢',
            label: 'Compelling',
            description: 'Real EY > 3% • Strong real economic tailwind',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= 1) return {
            emoji: '🔵',
            label: 'Supportive',
            description: 'Real EY 1–3% • Equities clear inflation',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
        };
        return {
            emoji: '🔴',
            label: 'Adverse',
            description: 'Real EY < 1% • Equity economics impaired',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

    const getYieldCurveStatus = (tnxValue: number | null, irxValue: number | null) => {
        if (tnxValue === null || irxValue === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400',
            value: null
        };
        const spread = tnxValue - irxValue;
        if (spread > 1) return {
            emoji: '🟢',
            label: 'Positive',
            description: '10Y−3M > 1% • Growth-supportive',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
            value: spread
        };
        if (spread >= 0) return {
            emoji: '🔵',
            label: 'Flat',
            description: '10Y−3M 0–1% • Late-cycle zone',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400',
            value: spread
        };
        return {
            emoji: '🔴',
            label: 'Inverted',
            description: '10Y−3M < 0% • Danger state',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
            value: spread
        };
    };

    const getEYPStatus = (value: number | null) => {
        if (value === null) return {
            emoji: '',
            label: 'N/A',
            description: 'Data not available',
            colorClass: 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
        };
        if (value > 1) return {
            emoji: '🟢',
            label: 'Equities Favored',
            description: 'EYP > 1% • Equities dominate bonds on carry',
            colorClass: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
        };
        if (value >= -1) return {
            emoji: '🔵',
            label: 'Balanced',
            description: 'EYP −1% to 1% • No clear asset-class advantage',
            colorClass: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
        };
        return {
            emoji: '🔴',
            label: 'Bonds Favored',
            description: 'EYP < −1% • Bonds/cash preferred over equities',
            colorClass: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
        };
    };

    // Tooltip data
    const cashTooltip = {
        icon: '💵',
        label: 'Cash',
        title: 'Real 3M = Capital Pressure',
        colorClass: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800',
        sections: [
            {
                emoji: '🟢',
                label: 'Normal',
                threshold: 'Real 3M > +1%',
                points: ['Cash clearly rewarded', 'Waiting has value', 'Policy not distorting behavior'],
                note: 'This is systemically calm.'
            },
            {
                emoji: '🟠',
                label: 'Constrained',
                threshold: 'Real 3M between 0% and +1%',
                points: ['Cash barely compensates for inflation', 'Margin of safety shrinking', 'Policy nearing constraint', 'System sensitive to small shocks'],
                note: 'Warning band, but not a red alert.'
            },
            {
                emoji: '🔴',
                label: 'Push',
                threshold: 'Real 3M < 0%',
                points: ['Cash penalized', 'Capital forced out of safety', 'Risk-taking becomes structural'],
                note: 'This is where behavior changes.'
            }
        ]
    };

    const bondsTooltip = {
        icon: '💰',
        label: 'Bonds',
        title: 'Real 10Y',
        colorClass: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800',
        sections: [
            {
                emoji: '🟢',
                label: 'Anchored',
                threshold: 'Real 10Y > 2.5%',
                points: ['Long-term capital compounds in real terms', 'Time and patience are rewarded', 'Discount rates are credible and binding', 'Asset prices governed by fundamentals'],
                note: 'The system provides a credible real return to safety.'
            },
            {
                emoji: '🔵',
                label: 'Supportive',
                threshold: 'Real 10Y between 0% and 2.5%',
                points: ['Real return exists, but modest', 'System functions normally', 'Financial assets still viable', 'Valuation tolerance increases', 'Fragility can build over time'],
                note: 'This is the default modern state.'
            },
            {
                emoji: '🔴',
                label: 'System Stress',
                threshold: 'Real 10Y < 0%',
                points: ['No real risk-free rate', 'Capital preservation fails', 'Forced risk-taking dominates', 'Real assets gain relative appeal', 'System fragility elevated'],
                note: 'Warning condition, not a crash call.'
            }
        ]
    };

    const equitiesTooltip = {
        icon: '📈',
        label: 'Equities',
        title: 'Real EY',
        colorClass: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800',
        sections: [
            {
                emoji: '🟢',
                label: 'Compelling',
                threshold: 'Real EY > 3%',
                points: ['Strong real economic tailwind', 'Valuations forgiven', 'Broad participation likely'],
                note: '"Equities are clearly working for you"'
            },
            {
                emoji: '🔵',
                label: 'Supportive',
                threshold: 'Real EY 1–3%',
                points: ['Equities clear inflation', 'Economics are intact', 'Big gains are possible']
            },
            {
                emoji: '🔴',
                label: 'Adverse',
                threshold: 'Real EY < 1%',
                points: ['Equity economics impaired', 'Returns rely on reflexivity', 'High risk of asymmetric drawdowns'],
                note: 'Warning state, not a timing call. Returns are conditional, not automatic'
            }
        ]
    };

    const yieldCurveTooltip = {
        icon: '📊',
        label: 'Curve',
        title: 'Yield Curve (10Y − 3M)',
        colorClass: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800',
        sections: [
            {
                emoji: '🟢',
                label: 'Positive',
                threshold: '10Y − 3M > +1.0%',
                points: ['Credit creation healthy', 'Banks incentivized to lend', 'Liquidity expanding', 'Duration carry viable', 'Growth can be financed'],
                note: 'Classic growth-supportive curve.'
            },
            {
                emoji: '🔵',
                label: 'Flat',
                threshold: '10Y − 3M between 0% and +1.0%',
                points: ['Credit transmission fragile', 'Little margin for banks', 'Liquidity no longer expanding meaningfully', 'System sensitive to shocks'],
                note: 'Late-cycle / transition zone, but not yet broken.'
            },
            {
                emoji: '🔴',
                label: 'Inverted',
                threshold: '10Y − 3M < 0%',
                points: ['Credit creation impaired', 'Policy restrictive', 'Liquidity contracting', 'Duration punished', 'Growth cannot be financed'],
                note: 'Danger state — especially when paired with negative EYP.'
            }
        ]
    };

    const eypTooltip = {
        icon: '💎',
        label: 'EYP',
        title: 'Earnings Yield Premium (EY − 3M)',
        colorClass: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800',
        sections: [
            {
                emoji: '🟢',
                label: 'Equities Favored',
                threshold: 'EYP > +1.0%',
                points: ['Equity earnings yield clearly exceeds cash/bonds', 'Investors compensated to take equity risk', 'Equities dominate bonds on carry', 'Equity ownership justified without relying on liquidity or multiple expansion'],
                note: 'Equities-over-bonds regime.'
            },
            {
                emoji: '🔵',
                label: 'Balanced',
                threshold: 'EYP between −1.0% and +1.0%',
                points: ['Equity and bond carry roughly equivalent', 'No clear asset-class advantage', 'Allocation depends on liquidity, policy, and growth', 'Other signals (yield curve, Real 3M, RealEY) become decisive'],
                note: 'Neutral asset-preference regime.'
            },
            {
                emoji: '🔴',
                label: 'Bonds Favored',
                threshold: 'EYP < −1.0%',
                points: ['Cash/bond yields exceed equity earnings yield', 'Not compensated for equity risk on carry', 'Equity ownership requires external support (liquidity, growth, valuation expansion)', 'Absent that support, capital should prefer bonds/cash'],
                note: 'Bonds-over-equities regime.'
            }
        ]
    };

    return (
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
                <div className="flex items-center gap-2">
                    {type === 'real-metrics' ? (
                        <>
                            <RegimeTooltipButton {...cashTooltip} />
                            <RegimeTooltipButton {...bondsTooltip} />
                            <RegimeTooltipButton {...equitiesTooltip} />
                        </>
                    ) : (
                        <>
                            <RegimeTooltipButton {...yieldCurveTooltip} />
                            <RegimeTooltipButton {...eypTooltip} />
                        </>
                    )}
                </div>
            </div>
            <div className="space-y-3">
                {type === 'real-metrics' ? (
                    <div className="grid grid-cols-3 gap-3">
                        <RegimeTracker
                            label="Cash: Capital Pressure"
                            value={metricValues.real3M?.value ?? null}
                            metricLabel="Real 3M"
                            centerLabel={true}
                            getStatus={getCashStatus}
                        />
                        <RegimeTracker
                            label="Bonds: System Anchor"
                            value={metricValues.real10Y?.value ?? null}
                            metricLabel="Real 10Y"
                            centerLabel={true}
                            getStatus={getBondsStatus}
                        />
                        <RegimeTracker
                            label="Equities: Real Earnings Yield"
                            value={metricValues.rey5yr?.value ?? null}
                            metricLabel="Real EY"
                            centerLabel={true}
                            getStatus={getEquitiesStatus}
                        />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <RegimeTracker
                                label="Yield Curve: Liquidity Transmission"
                                value={
                                    metricValues.tnx?.value !== null && metricValues.irx?.value !== null
                                        ? (metricValues.tnx?.value ?? 0) - (metricValues.irx?.value ?? 0)
                                        : null
                                }
                                metricLabel="10Y−3M"
                                centerLabel={true}
                                getStatus={(val) => getYieldCurveStatus(metricValues.tnx?.value ?? null, metricValues.irx?.value ?? null)}
                            />
                            <RegimeTracker
                                label="EYP: Asset Preference"
                                value={metricValues.eyp5yr?.value ?? null}
                                metricLabel="EY−3M"
                                centerLabel={true}
                                getStatus={getEYPStatus}
                            />
                        </div>
                        {/* Growth Equities Override Indicator */}
                        {metricValues.eyp5yr?.value !== null &&
                            metricValues.tnx?.value !== null &&
                            metricValues.irx?.value !== null &&
                            (metricValues.eyp5yr?.value ?? 0) < 0 &&
                            ((metricValues.tnx?.value ?? 0) - (metricValues.irx?.value ?? 0)) > 0 && (
                                <div className="mt-2 p-3 rounded-lg bg-purple-500/10 border-2 border-purple-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-lg">🚀</span>
                                        <div className="text-center">
                                            <div className="text-sm font-bold text-purple-700 dark:text-purple-400">
                                                Growth Equities Regime
                                            </div>
                                            <div className="text-xs text-purple-600 dark:text-purple-300 opacity-80">
                                                Negative EYP + Positive Curve • Duration & growth favored
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </>
                )}
            </div>
        </div>
    );
}
