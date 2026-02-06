import RegimeMatrix from '../../components/regime-matrix';

// Current market values (hardcoded for now)
const CURRENT_VALUES = {
    inflation: 2.9, // CPI YoY %
    bondYieldNominal: 4.5, // 10Y Treasury %
    bondYieldReal: 1.6, // 10Y - inflation
    yieldCurve: 0.3, // 10Y - 2Y spread
    equityPE: 21, // S&P 500 P/E
    vix: 16, // VIX level
};

// Configurable absolute levels for each matrix
const LEVELS = {
    inflation: {
        low: { max: 3, label: '< 3%' },
        mid: { min: 3, max: 6, label: '3% – 6%' },
        high: { min: 6, label: '> 6%' }
    },
    bondYieldsNominal: {
        low: { max: 2, label: '< 2%', description: 'ZIRP environment' },
        mid: { min: 2, max: 5, label: '2% – 5%', description: 'Normal range' },
        high: { min: 5, label: '> 5%', description: 'Elevated rates' }
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
    vix: {
        low: { max: 15, label: '< 15' },
        mid: { min: 15, max: 25, label: '15 – 25' },
        high: { min: 25, label: '> 25' }
    }
};

export default function MatrixPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Framework • Regime Analysis
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    The Two-Axis Regime Framework
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    A systematic approach to classifying market regimes through constraints and expectations
                </p>
            </div>

            {/* Conceptual Architecture */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-6">Conceptual Architecture</h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="p-6 rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3 text-sm">
                                IN
                            </div>
                            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">INPUT LAYER</h3>
                        </div>
                        <p className="text-sm mb-3 text-blue-700 dark:text-blue-300">
                            Valuation & constraint variables that define pressure
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-blue-900 dark:text-blue-100">
                                <span className="font-mono mr-2">•</span>
                                <span><strong>Inflation</strong> — purchasing power</span>
                            </div>
                            <div className="flex items-center text-blue-900 dark:text-blue-100">
                                <span className="font-mono mr-2">•</span>
                                <span><strong>Bond Yields</strong> — duration valuation</span>
                            </div>
                            <div className="flex items-center text-blue-900 dark:text-blue-100">
                                <span className="font-mono mr-2">•</span>
                                <span><strong>Equity Valuation</strong> — P/E, ERP, CAPE</span>
                            </div>
                            <div className="flex items-center text-blue-900 dark:text-blue-100">
                                <span className="font-mono mr-2">•</span>
                                <span><strong>VIX</strong> — price of optionality</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-3 text-sm">
                                OUT
                            </div>
                            <h3 className="text-xl font-bold text-green-900 dark:text-green-100">OUTPUT LAYER</h3>
                        </div>
                        <p className="text-sm mb-3 text-green-700 dark:text-green-300">
                            Actual prices that move in response to inputs
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-green-900 dark:text-green-100">
                                <span className="font-mono mr-2">•</span>
                                <span><strong>Equity Indexes</strong> — S&P 500, MSCI World</span>
                            </div>
                            <div className="flex items-center text-green-900 dark:text-green-100">
                                <span className="font-mono mr-2">•</span>
                                <span><strong>Bond Prices</strong> — UST total return</span>
                            </div>
                            <div className="flex items-center text-green-900 dark:text-green-100">
                                <span className="font-mono mr-2">•</span>
                                <span><strong>Credit ETFs</strong> — HYG, LQD</span>
                            </div>
                            <div className="flex items-center text-green-900 dark:text-green-100">
                                <span className="font-mono mr-2">•</span>
                                <span><strong>FX & Commodities</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500">
                    <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                        💡 Key distinction: Bond yields are to bonds what P/E is to equities. Bond prices are the actual asset.
                    </p>
                </div>
            </div>



            {/* Section Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-500 text-white text-base font-bold mb-3">
                    INPUT LAYER MATRICES
                </div>
                <p className="text-sm text-muted-foreground">Constraint and expectation variables that define market pressure</p>
            </div>

            <RegimeMatrix
                title="1. Inflation Matrix"
                subtitle="CPI / PCE — Valuation of money and purchasing power"
                levels={[
                    { label: 'LOW', value: LEVELS.inflation.low.label, color: 'green' },
                    { label: 'MID', value: LEVELS.inflation.mid.label, color: 'yellow' },
                    { label: 'HIGH', value: LEVELS.inflation.high.label, color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Disinflation tail' },
                        { label: 'Soft landing' },
                        { label: 'Policy victory' },
                    ],
                    stable: [
                        { label: 'Goldilocks' },
                        { label: 'Nominal stability' },
                        { label: 'Stagflation risk' },
                    ],
                    rising: [
                        { label: 'Early reflation' },
                        { label: 'Late-cycle pressure' },
                        { label: 'Inflation shock' },
                    ],
                }}
                currentValue={CURRENT_VALUES.inflation}
                currentTrend="stable"
                levelThresholds={{ low: 3, mid: 6 }}
            />

            <RegimeMatrix
                title="2. Bond Yield Matrix (Nominal)"
                subtitle="10Y Treasury — Nominal yield levels"
                levels={[
                    { label: 'LOW', value: LEVELS.bondYieldsNominal.low.label, description: LEVELS.bondYieldsNominal.low.description, color: 'green' },
                    { label: 'MID', value: LEVELS.bondYieldsNominal.mid.label, description: LEVELS.bondYieldsNominal.mid.description, color: 'yellow' },
                    { label: 'HIGH', value: LEVELS.bondYieldsNominal.high.label, description: LEVELS.bondYieldsNominal.high.description, color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Deflation scare' },
                        { label: 'Growth scare' },
                        { label: 'Crisis hedge' },
                    ],
                    stable: [
                        { label: 'ZIRP trap' },
                        { label: 'Neutral' },
                        { label: 'Restrictive hold' },
                    ],
                    rising: [
                        { label: 'Reflation signal' },
                        { label: 'Tightening phase' },
                        { label: 'Policy accident risk' },
                    ],
                }}
                currentValue={CURRENT_VALUES.bondYieldNominal}
                currentTrend="stable"
                levelThresholds={{ low: 2, mid: 5 }}
            />

            <RegimeMatrix
                title="3. Real Yield Matrix"
                subtitle="10Y nominal − inflation — Real return on duration"
                levels={[
                    { label: 'LOW', value: LEVELS.bondYieldsReal.low.label, description: LEVELS.bondYieldsReal.low.description, color: 'green' },
                    { label: 'MID', value: LEVELS.bondYieldsReal.mid.label, description: LEVELS.bondYieldsReal.mid.description, color: 'yellow' },
                    { label: 'HIGH', value: LEVELS.bondYieldsReal.high.label, description: LEVELS.bondYieldsReal.high.description, color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Inflation surge' },
                        { label: 'Real erosion' },
                        { label: 'Disinflation trade' },
                    ],
                    stable: [
                        { label: 'Negative carry' },
                        { label: 'Fair compensation' },
                        { label: 'Premium hold' },
                    ],
                    rising: [
                        { label: 'Breakeven tightening' },
                        { label: 'Real normalization' },
                        { label: 'Volcker moment' },
                    ],
                }}
                insight="Real yields below zero = financial repression. Above 2% = restrictive policy."
                currentValue={CURRENT_VALUES.bondYieldReal}
                currentTrend="stable"
                levelThresholds={{ low: 0, mid: 2 }}
            />

            <RegimeMatrix
                title="4. Yield Curve Matrix"
                subtitle="10Y − 2Y spread — Term premium and recession signal"
                levels={[
                    { label: 'INVERTED', value: LEVELS.yieldCurve.inverted.label, description: LEVELS.yieldCurve.inverted.description, color: 'red' },
                    { label: 'FLAT', value: LEVELS.yieldCurve.flat.label, description: LEVELS.yieldCurve.flat.description, color: 'yellow' },
                    { label: 'STEEP', value: LEVELS.yieldCurve.steep.label, description: LEVELS.yieldCurve.steep.description, color: 'green' },
                ]}
                cells={{
                    falling: [
                        { label: 'Bear flattening' },
                        { label: 'Policy tightening' },
                        { label: 'Bull steepening' },
                    ],
                    stable: [
                        { label: 'Recession signal' },
                        { label: 'Neutral stance' },
                        { label: 'Expansion mode' },
                    ],
                    rising: [
                        { label: 'Disinversion rally' },
                        { label: 'Normalization' },
                        { label: 'Reflation surge' },
                    ],
                }}
                insight="Inversion (negative spread) historically precedes recessions. Steepening after inversion signals recovery."
                currentValue={CURRENT_VALUES.yieldCurve}
                currentTrend="stable"
                levelThresholds={{ low: -0.5, mid: 0.5 }}
            />

            <RegimeMatrix
                title="5. Equity Valuation Matrix"
                subtitle="P/E, ERP, CAPE — Valuation metrics (not price)"
                levels={[
                    { label: 'CHEAP', value: LEVELS.equityPE.cheap.label, color: 'green' },
                    { label: 'FAIR', value: LEVELS.equityPE.fair.label, color: 'yellow' },
                    { label: 'EXPENSIVE', value: LEVELS.equityPE.expensive.label, color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Panic / capitulation' },
                        { label: 'Correction' },
                        { label: 'Distribution' },
                    ],
                    stable: [
                        { label: 'Base building' },
                        { label: 'Range-bound' },
                        { label: 'Narrow leadership' },
                    ],
                    rising: [
                        { label: 'Bear-market rally' },
                        { label: 'Healthy advance' },
                        { label: 'Melt-up' },
                    ],
                }}
                insight="High & rising ≠ healthy. High & stable is often the most dangerous state."
                currentValue={CURRENT_VALUES.equityPE}
                currentTrend="stable"
                levelThresholds={{ low: 15, mid: 20 }}
                valueFormat="number"
            />

            <RegimeMatrix
                title="6. VIX Matrix"
                subtitle="Volatility / Fear Premium — Price of optionality"
                levels={[
                    { label: 'LOW', value: LEVELS.vix.low.label, color: 'green' },
                    { label: 'MID', value: LEVELS.vix.mid.label, color: 'yellow' },
                    { label: 'HIGH', value: LEVELS.vix.high.label, color: 'red' },
                ]}
                cells={{
                    falling: [
                        { label: 'Complacent grind' },
                        { label: 'Volatility compression' },
                        { label: 'Post-panic' },
                    ],
                    stable: [
                        { label: 'Suppressed risk' },
                        { label: 'Normal risk' },
                        { label: 'Structural fear' },
                    ],
                    rising: [
                        { label: 'Fragile calm' },
                        { label: 'Early stress' },
                        { label: 'Crisis' },
                    ],
                }}
                currentValue={CURRENT_VALUES.vix}
                currentTrend="stable"
                levelThresholds={{ low: 15, mid: 25 }}
                valueFormat="number"
            />
        </div>
    );
}
