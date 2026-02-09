import RegimeMatrix from '../../components/regime-matrix';
import CompactRegimeMatrix from '../../components/compact-regime-matrix';
import { DataServiceNew } from '@/lib/data-service-new';

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
    vix: {
        low: { max: 15, label: '< 15' },
        mid: { min: 15, max: 25, label: '15 – 25' },
        high: { min: 25, label: '> 25' }
    },
    fedFunds: {
        low: { max: 2, label: '< 2%', description: 'Accommodative' },
        mid: { min: 2, max: 4, label: '2% – 4%', description: 'Neutral' },
        high: { min: 4, label: '> 4%', description: 'Restrictive' }
    }
};

async function getLatestValue(assetClass: string, seriesName: string): Promise<{ value: number | null; date: string | null; timestamp: number | null }> {
    try {
        const data = await DataServiceNew.loadCSV(`${assetClass}/${seriesName}`);
        if (data.data && data.data.length > 0) {
            const latest = data.data[data.data.length - 1];
            const columns = Object.keys(latest).filter(k => k !== 'date');
            const value = columns.length > 0 ? latest[columns[0]] : null;
            const dateStr = latest.date as string;
            const timestamp = new Date(dateStr).getTime();
            return {
                value: typeof value === 'number' ? value : null,
                date: dateStr,
                timestamp: timestamp
            };
        }
        return { value: null, date: null, timestamp: null };
    } catch (error) {
        console.error(`Error fetching ${assetClass}/${seriesName}:`, error);
        return { value: null, date: null, timestamp: null };
    }
}

async function getLatestMA12(assetClass: string, seriesName: string): Promise<{ value: number | null; date: string | null }> {
    try {
        const Database = (await import('better-sqlite3')).default;
        const path = await import('path');
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        // Try MA12 first (monthly data), then MA252 (daily data)
        const query = `
            SELECT value, date, column_name
            FROM time_series
            WHERE asset_class = ? AND series_name = ? AND (column_name = 'Value_MA12' OR column_name = 'Value_MA252')
            ORDER BY date DESC
            LIMIT 1
        `;

        const result = db.prepare(query).get(assetClass, seriesName) as { value: number; date: number; column_name: string } | undefined;
        db.close();

        if (result) {
            const dateStr = new Date(result.date).toISOString().split('T')[0];
            return { value: result.value, date: dateStr };
        }
        return { value: null, date: null };
    } catch (error) {
        console.error(`Error fetching MA for ${assetClass}/${seriesName}:`, error);
        return { value: null, date: null };
    }
}

async function getValueMonthsAgo(assetClass: string, seriesName: string, monthsAgo: number): Promise<number | null> {
    try {
        const data = await DataServiceNew.loadCSV(`${assetClass}/${seriesName}`);
        if (data.data && data.data.length > 0) {
            // Calculate target date (monthsAgo months back from latest)
            const latestDate = new Date(data.data[data.data.length - 1].date as string);
            const targetDate = new Date(latestDate);
            targetDate.setMonth(targetDate.getMonth() - monthsAgo);
            const targetYearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

            // Find closest match
            const matchingPoints = data.data.filter((point: any) =>
                (point.date as string).startsWith(targetYearMonth)
            );

            if (matchingPoints.length > 0) {
                const point = matchingPoints[matchingPoints.length - 1];
                const columns = Object.keys(point).filter(k => k !== 'date');
                const value = columns.length > 0 ? point[columns[0]] : null;
                return typeof value === 'number' ? value : null;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ${assetClass}/${seriesName} ${monthsAgo}mo ago:`, error);
        return null;
    }
}

function calculateTrend(current: number | null, ma12: number | null, threshold: number): 'falling' | 'stable' | 'rising' {
    if (current === null || ma12 === null) return 'stable';

    const change = current - ma12;

    if (Math.abs(change) < threshold) return 'stable';
    return change > 0 ? 'rising' : 'falling';
}


export default async function MatrixPage() {
    // Fetch all data server-side
    const [cpi, tenYear, twoYear, threeMonth, shillerPE, vix, fedFunds] = await Promise.all([
        getLatestValue('economic', 'CPI'),
        getLatestValue('bonds', 'US/TNX'),
        getLatestValue('bonds', 'US/US-2yr'),
        getLatestValue('bonds', 'US/IRX'),
        getLatestValue('economic', 'Shiller-PE'),
        getLatestValue('volatility', 'VIX'),
        getLatestValue('economic', 'US/FEDFUNDS'),
    ]);

    // Fetch 1-year moving averages (MA12)
    const [cpiMA12, tenYearMA12, twoYearMA12, threeMonthMA12, peMA12, vixMA12, fedFundsMA12] = await Promise.all([
        getLatestMA12('economic', 'CPI'),
        getLatestMA12('bonds', 'US/TNX'),
        getLatestMA12('bonds', 'US/US-2yr'),
        getLatestMA12('bonds', 'US/IRX'),
        getLatestMA12('economic', 'Shiller-PE'),
        getLatestMA12('volatility', 'VIX'),
        getLatestMA12('economic', 'US/FEDFUNDS'),
    ]);

    const currentValues = {
        inflation: {
            value: cpi.value,
            date: cpi.date,
            ma12: cpiMA12.value,
            ma12Date: cpiMA12.date
        },
        bondYieldNominal: {
            value: tenYear.value,
            date: tenYear.date,
            ma12: tenYearMA12.value,
            ma12Date: tenYearMA12.date
        },
        bondYieldReal: {
            value: tenYear.value !== null && cpi.value !== null ? tenYear.value - cpi.value : null,
            date: tenYear.date,
            ma12: tenYearMA12.value !== null && cpiMA12.value !== null ? tenYearMA12.value - cpiMA12.value : null,
            ma12Date: tenYearMA12.date // Use 10Y date as reference
        },
        yieldCurve: {
            value: tenYear.value !== null && twoYear.value !== null ? tenYear.value - twoYear.value : null,
            date: tenYear.date,
            ma12: tenYearMA12.value !== null && twoYearMA12.value !== null ? tenYearMA12.value - twoYearMA12.value : null,
            ma12Date: tenYearMA12.date // Use 10Y date as reference
        },
        equityPE: {
            value: shillerPE.value,
            date: shillerPE.date,
            ma12: peMA12.value,
            ma12Date: peMA12.date
        },
        vix: {
            value: vix.value,
            date: vix.date,
            ma12: vixMA12.value,
            ma12Date: vixMA12.date
        },
        fedFunds: {
            value: fedFunds.value,
            date: fedFunds.date,
            ma12: fedFundsMA12.value,
            ma12Date: fedFundsMA12.date
        },
        earningsYieldPremium: {
            value: shillerPE.value !== null && shillerPE.value > 0 && threeMonth.value !== null
                ? (100 / shillerPE.value) - threeMonth.value
                : null,
            date: shillerPE.date,
            ma12: peMA12.value !== null && peMA12.value > 0 && threeMonthMA12.value !== null
                ? (100 / peMA12.value) - threeMonthMA12.value
                : null,
            ma12Date: peMA12.date
        },
        realEarningsYield: {
            value: shillerPE.value !== null && shillerPE.value > 0 && cpi.value !== null
                ? (100 / shillerPE.value) - cpi.value
                : null,
            date: shillerPE.date,
            ma12: peMA12.value !== null && peMA12.value > 0 && cpiMA12.value !== null
                ? (100 / peMA12.value) - cpiMA12.value
                : null,
            ma12Date: peMA12.date
        },
    };

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

                {/* Quick Links */}
                <div className="mt-8 flex justify-center gap-4">
                    <a
                        href="/matrix/chart"
                        className="px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all duration-200 border border-primary/20"
                    >
                        📊 Interactive Charts
                    </a>
                    <a
                        href="/matrix/decades"
                        className="px-6 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-medium transition-all duration-200 border border-purple-500/20"
                    >
                        📅 Decade-End Levels
                    </a>
                </div>
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

            {/* INFLATION SECTION */}
            <div className="mb-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Inflation</h2>
                    <p className="text-sm text-muted-foreground">Purchasing power and monetary constraint</p>
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
                    currentValue={currentValues.inflation.value ?? undefined}
                    currentDate={currentValues.inflation.date ?? undefined}
                    ma12={currentValues.inflation.ma12 ?? undefined}
                    ma12Date={currentValues.inflation.ma12Date ?? undefined}
                    currentTrend={calculateTrend(currentValues.inflation.value, currentValues.inflation.ma12, 0.2)}
                    levelThresholds={{ low: 3, mid: 6 }}
                />
            </div>

            {/* RATES (BONDS) SECTION */}
            <div className="mb-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Rates (Bonds)</h2>
                    <p className="text-sm text-muted-foreground">Interest rates, yields, and fixed income valuation</p>
                </div>

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
                    currentValue={currentValues.bondYieldNominal.value ?? undefined}
                    currentDate={currentValues.bondYieldNominal.date ?? undefined}
                    ma12={currentValues.bondYieldNominal.ma12 ?? undefined}
                    ma12Date={currentValues.bondYieldNominal.ma12Date ?? undefined}
                    currentTrend={calculateTrend(currentValues.bondYieldNominal.value, currentValues.bondYieldNominal.ma12, 0.2)}
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
                    currentValue={currentValues.bondYieldReal.value ?? undefined}
                    currentDate={currentValues.bondYieldReal.date ?? undefined}
                    ma12={currentValues.bondYieldReal.ma12 ?? undefined}
                    ma12Date={currentValues.bondYieldReal.ma12Date ?? undefined}
                    currentTrend={calculateTrend(currentValues.bondYieldReal.value, currentValues.bondYieldReal.ma12, 0.2)}
                    levelThresholds={{ low: 0, mid: 2 }}
                />

                <RegimeMatrix
                    title="4. Fed Funds Rate Matrix"
                    subtitle="Federal Funds Rate — Policy stance and overnight rate"
                    levels={[
                        { label: 'LOW', value: LEVELS.fedFunds.low.label, description: LEVELS.fedFunds.low.description, color: 'green' },
                        { label: 'MID', value: LEVELS.fedFunds.mid.label, description: LEVELS.fedFunds.mid.description, color: 'yellow' },
                        { label: 'HIGH', value: LEVELS.fedFunds.high.label, description: LEVELS.fedFunds.high.description, color: 'red' },
                    ]}
                    cells={{
                        falling: [
                            { label: 'Easing cycle' },
                            { label: 'Dovish pivot' },
                            { label: 'Emergency cuts' },
                        ],
                        stable: [
                            { label: 'Accommodative hold' },
                            { label: 'Neutral stance' },
                            { label: 'Higher for longer' },
                        ],
                        rising: [
                            { label: 'Liftoff' },
                            { label: 'Tightening cycle' },
                            { label: 'Inflation fight' },
                        ],
                    }}
                    insight="Fed Funds below 2% = accommodative. Above 4% = restrictive. Direction signals policy intent."
                    currentValue={currentValues.fedFunds.value ?? undefined}
                    currentDate={currentValues.fedFunds.date ?? undefined}
                    ma12={currentValues.fedFunds.ma12 ?? undefined}
                    ma12Date={currentValues.fedFunds.ma12Date ?? undefined}
                    currentTrend={calculateTrend(currentValues.fedFunds.value, currentValues.fedFunds.ma12, 0.2)}
                    levelThresholds={{ low: 2, mid: 4 }}
                />

                <RegimeMatrix
                    title="5. Yield Curve Matrix"
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
                    currentValue={currentValues.yieldCurve.value ?? undefined}
                    currentDate={currentValues.yieldCurve.date ?? undefined}
                    ma12={currentValues.yieldCurve.ma12 ?? undefined}
                    ma12Date={currentValues.yieldCurve.ma12Date ?? undefined}
                    currentTrend={calculateTrend(currentValues.yieldCurve.value, currentValues.yieldCurve.ma12, 0.1)}
                    levelThresholds={{ low: -0.5, mid: 0.5 }}
                />
            </div>

            {/* EQUITIES SECTION */}
            <div className="mb-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Equities</h2>
                    <p className="text-sm text-muted-foreground">Equity valuation and risk premium measures</p>
                </div>

                <RegimeMatrix
                    title="6. Equity Valuation Matrix"
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
                    currentValue={currentValues.equityPE.value ?? undefined}
                    currentDate={currentValues.equityPE.date ?? undefined}
                    ma12={currentValues.equityPE.ma12 ?? undefined}
                    ma12Date={currentValues.equityPE.ma12Date ?? undefined}
                    currentTrend={calculateTrend(currentValues.equityPE.value, currentValues.equityPE.ma12, 1.0)}
                    levelThresholds={{ low: 15, mid: 20 }}
                    valueFormat="number"
                />

                <RegimeMatrix
                    title="7. Earnings Yield Premium Matrix"
                    subtitle="Earnings Yield (E/P) − 3M Treasury — Equity risk premium vs cash"
                    levels={[
                        { label: 'NEGATIVE', value: LEVELS.earningsYieldPremium.negative.label, description: LEVELS.earningsYieldPremium.negative.description, color: 'red' },
                        { label: 'NEUTRAL', value: LEVELS.earningsYieldPremium.neutral.label, description: LEVELS.earningsYieldPremium.neutral.description, color: 'yellow' },
                        { label: 'POSITIVE', value: LEVELS.earningsYieldPremium.positive.label, description: LEVELS.earningsYieldPremium.positive.description, color: 'green' },
                    ]}
                    cells={{
                        falling: [
                            { label: 'Valuation compression' },
                            { label: 'Premium erosion' },
                            { label: 'Normalization' },
                        ],
                        stable: [
                            { label: 'Bonds dominate' },
                            { label: 'Balanced' },
                            { label: 'Equity advantage' },
                        ],
                        rising: [
                            { label: 'Equity selloff' },
                            { label: 'Premium expansion' },
                            { label: 'Deep value' },
                        ],
                    }}
                    insight="Negative premium = equities expensive vs cash. Positive premium > 2% = equities attractive vs risk-free rate."
                    currentValue={currentValues.earningsYieldPremium.value ?? undefined}
                    currentDate={currentValues.earningsYieldPremium.date ?? undefined}
                    ma12={currentValues.earningsYieldPremium.ma12 ?? undefined}
                    ma12Date={currentValues.earningsYieldPremium.ma12Date ?? undefined}
                    currentTrend={calculateTrend(currentValues.earningsYieldPremium.value, currentValues.earningsYieldPremium.ma12, 0.3)}
                    levelThresholds={{ low: 0, mid: 2 }}
                />

                <RegimeMatrix
                    title="8. Real Earnings Yield Matrix"
                    subtitle="Earnings Yield (E/P) − CPI — Real equity return potential"
                    levels={[
                        { label: 'NEGATIVE', value: LEVELS.realEarningsYield.negative.label, description: LEVELS.realEarningsYield.negative.description, color: 'red' },
                        { label: 'LOW', value: LEVELS.realEarningsYield.low.label, description: LEVELS.realEarningsYield.low.description, color: 'yellow' },
                        { label: 'POSITIVE', value: LEVELS.realEarningsYield.positive.label, description: LEVELS.realEarningsYield.positive.description, color: 'green' },
                    ]}
                    cells={{
                        falling: [
                            { label: 'Inflation surge' },
                            { label: 'Real erosion' },
                            { label: 'Disinflation boost' },
                        ],
                        stable: [
                            { label: 'Real loss' },
                            { label: 'Modest real return' },
                            { label: 'Strong real return' },
                        ],
                        rising: [
                            { label: 'Multiple compression' },
                            { label: 'Real improvement' },
                            { label: 'Value expansion' },
                        ],
                    }}
                    insight="Real earnings yield shows inflation-adjusted return potential. Negative = equities losing to inflation."
                    currentValue={currentValues.realEarningsYield.value ?? undefined}
                    currentDate={currentValues.realEarningsYield.date ?? undefined}
                    ma12={currentValues.realEarningsYield.ma12 ?? undefined}
                    ma12Date={currentValues.realEarningsYield.ma12Date ?? undefined}
                    currentTrend={calculateTrend(currentValues.realEarningsYield.value, currentValues.realEarningsYield.ma12, 0.3)}
                    levelThresholds={{ low: 0, mid: 3 }}
                />

                <RegimeMatrix
                    title="9. VIX Matrix"
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
                    currentValue={currentValues.vix.value ?? undefined}
                    currentDate={currentValues.vix.date ?? undefined}
                    ma12={currentValues.vix.ma12 ?? undefined}
                    ma12Date={currentValues.vix.ma12Date ?? undefined}
                    currentTrend={calculateTrend(currentValues.vix.value, currentValues.vix.ma12, 2.0)}
                    levelThresholds={{ low: 15, mid: 25 }}
                    valueFormat="number"
                />
            </div>

            {/* Compact Matrix Test */}
            <div className="mt-16 pt-16 border-t border-border">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Compact View (Test)</h2>
                    <p className="text-sm text-muted-foreground">
                        A condensed view with historical date selection
                    </p>
                </div>
                <CompactRegimeMatrix
                    initialValues={{
                        inflation: currentValues.inflation.value,
                        bondYieldNominal: currentValues.bondYieldNominal.value,
                        bondYieldReal: currentValues.bondYieldReal.value,
                        yieldCurve: currentValues.yieldCurve.value,
                        equityPE: currentValues.equityPE.value,
                        vix: currentValues.vix.value,
                    }}
                />
            </div>
        </div>
    );
}
