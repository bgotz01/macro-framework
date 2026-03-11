//components/regime/regime-parameters.tsx
import Database from 'better-sqlite3';
import path from 'path';
import {
    calculateLiquidityRegime,
    calculateValuationRegime,
    getRegimeColor,
    getReal3MLabel,
    getReal10YLabel,
    getYieldCurveLabel,
    getEYPLabel,
    getRealEYLabel,
    type LiquidityRegime
} from '@/lib/regime-config';
import {
    calculateFlowTrendState,
    type FlowTrendState
} from '@/lib/regime-config/flow-trend-config';
import MethodologyModal from './methodology-modal';

interface MetricData {
    value: number | null;
    percentile: number | null;
    date: string | null;
}

interface RegimeData {
    // Input Variables
    fedFunds: MetricData;
    irx: MetricData;
    tnx: MetricData;
    cpi: MetricData;
    eyp5yr: MetricData;
    rey5yr: MetricData;

    // Liquidity
    real10Y: MetricData;
    real3M: MetricData;
    yieldCurve: MetricData;

    // Valuation
    pe5yr: MetricData;
    ey5yr: MetricData;

    // Flow/Trend (200MA metrics)
    slope200MA: MetricData;
    divergence200MA: MetricData;
    daysAbove200MA: MetricData;
}

type RegimeDataKey =
    | 'fedFunds'
    | 'irx'
    | 'tnx'
    | 'cpi'
    | 'eyp5yr'
    | 'rey5yr'
    | 'real10Y'
    | 'real3M'
    | 'yieldCurve'
    | 'pe5yr'
    | 'ey5yr'
    | 'slope200MA'
    | 'divergence200MA'
    | 'daysAbove200MA';

interface SeriesConfig {
    asset_class: string;
    series_name: string;
    key: RegimeDataKey;
}

function emptyMetric(): MetricData {
    return { value: null, percentile: null, date: null };
}

function formatValue(value: number | null, decimals: number = 2): string {
    if (value === null) return 'N/A';
    return `${value.toFixed(decimals)}%`;
}

function formatPlainNumber(value: number | null, decimals: number = 2): string {
    if (value === null) return 'N/A';
    return value.toFixed(decimals);
}

function formatDate(date: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    });
}

function formatPercentile(p: number | null): string {
    if (p === null) return 'N/A';
    return `${p.toFixed(0)}%`;
}

/**
 * 5-band colors matching the scoring system
 * No semantic meaning beyond percentile position.
 *
 * invertQuartiles:
 * false => 0-20% bright green, 20-40% green, 40-60% blue, 60-80% yellow, 80-100% red
 * true  => reversed
 */
function getQuartileStyles(
    percentile: number | null,
    invertQuartiles: boolean = false
): { border: string; text: string } {
    if (percentile === null) {
        return {
            border: 'border-gray-300 dark:border-gray-700',
            text: 'text-gray-500 dark:text-gray-400'
        };
    }

    const normal = [
        {
            border: 'border-lime-500 dark:border-lime-400',
            text: 'text-lime-600 dark:text-lime-400'
        },
        {
            border: 'border-green-500 dark:border-green-400',
            text: 'text-green-600 dark:text-green-400'
        },
        {
            border: 'border-blue-500 dark:border-blue-400',
            text: 'text-blue-600 dark:text-blue-400'
        },
        {
            border: 'border-yellow-500 dark:border-yellow-400',
            text: 'text-yellow-600 dark:text-yellow-400'
        },
        {
            border: 'border-red-500 dark:border-red-400',
            text: 'text-red-600 dark:text-red-400'
        }
    ];

    const inverted = [
        {
            border: 'border-red-500 dark:border-red-400',
            text: 'text-red-600 dark:text-red-400'
        },
        {
            border: 'border-yellow-500 dark:border-yellow-400',
            text: 'text-yellow-600 dark:text-yellow-400'
        },
        {
            border: 'border-blue-500 dark:border-blue-400',
            text: 'text-blue-600 dark:text-blue-400'
        },
        {
            border: 'border-green-500 dark:border-green-400',
            text: 'text-green-600 dark:text-green-400'
        },
        {
            border: 'border-lime-500 dark:border-lime-400',
            text: 'text-lime-600 dark:text-lime-400'
        }
    ];

    const palette = invertQuartiles ? inverted : normal;

    if (percentile < 20) return palette[0];
    if (percentile < 40) return palette[1];
    if (percentile < 60) return palette[2];
    if (percentile < 80) return palette[3];
    return palette[4];
}

async function getRegimeData(): Promise<RegimeData> {
    const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
    const db = new Database(dbPath, { readonly: true, timeout: 10000 });

    const series: SeriesConfig[] = [
        // Input Variables
        { asset_class: 'economic', series_name: 'US/FEDFUNDS', key: 'fedFunds' },
        { asset_class: 'bonds', series_name: 'US/IRX-Monthly', key: 'irx' },
        { asset_class: 'bonds', series_name: 'US/TNX-Monthly', key: 'tnx' },
        { asset_class: 'economic', series_name: 'CPI', key: 'cpi' },
        { asset_class: 'derived', series_name: 'Earnings-Yield-Premium-5yr', key: 'eyp5yr' },
        { asset_class: 'derived', series_name: 'Real-Earnings-Yield-5yr', key: 'rey5yr' },

        // Liquidity
        { asset_class: 'derived', series_name: 'Real-10Y', key: 'real10Y' },
        { asset_class: 'derived', series_name: 'Real-3M', key: 'real3M' },
        { asset_class: 'derived', series_name: 'Yield-Curve-10Y-3M', key: 'yieldCurve' },

        // Valuation
        { asset_class: 'valuations', series_name: 'PE-5yr', key: 'pe5yr' },
        { asset_class: 'valuations', series_name: 'Earnings-Yield-5yr', key: 'ey5yr' },

        // Flow/Trend
        { asset_class: 'derived', series_name: 'SP500-200MA-Slope', key: 'slope200MA' },
        { asset_class: 'derived', series_name: 'SP500-200MA-Div', key: 'divergence200MA' },
        { asset_class: 'derived', series_name: 'SP500-200MA-PriceAboveStreak', key: 'daysAbove200MA' }
    ];

    const result = {
        fedFunds: emptyMetric(),
        irx: emptyMetric(),
        tnx: emptyMetric(),
        cpi: emptyMetric(),
        eyp5yr: emptyMetric(),
        rey5yr: emptyMetric(),
        real10Y: emptyMetric(),
        real3M: emptyMetric(),
        yieldCurve: emptyMetric(),
        pe5yr: emptyMetric(),
        ey5yr: emptyMetric(),
        slope200MA: emptyMetric(),
        divergence200MA: emptyMetric(),
        daysAbove200MA: emptyMetric()
    } satisfies RegimeData;

    for (const s of series) {
        // All metrics now have percentiles
        const query = `
            SELECT date, value, percentile_rank
            FROM percentile_analysis
            WHERE asset_class = ? AND series_name = ?
            ORDER BY date DESC
            LIMIT 1
        `;

        const row = db.prepare(query).get(s.asset_class, s.series_name) as
            | { date: string; value: number; percentile_rank: number | null }
            | undefined;

        result[s.key] = row
            ? {
                value: row.value,
                percentile: row.percentile_rank,
                date: new Date(row.date).toISOString().split('T')[0]
            }
            : emptyMetric();
    }

    db.close();
    return result;
}

export default async function RegimeParameters() {
    const data = await getRegimeData();

    const liquidityRegime = calculateLiquidityRegime(
        data.real3M.value,
        data.real10Y.value,
        data.yieldCurve.value
    );

    const valuationRegime = calculateValuationRegime(
        data.eyp5yr.value,
        data.rey5yr.value
    );

    const flowTrendState = calculateFlowTrendState(
        data.slope200MA.value,
        data.divergence200MA.value,
        data.daysAbove200MA.value
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h2
                    className="text-2xl font-light tracking-wider mb-2"
                    style={{
                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                        letterSpacing: '0.15em'
                    }}
                >
                    REGIME PARAMETERS
                </h2>
                <p
                    className="text-sm font-light text-muted-foreground tracking-widest uppercase mb-4"
                    style={{ letterSpacing: '0.2em' }}
                >
                    Current Market Conditions
                </p>
                <MethodologyModal />
            </div>

            <div className="space-y-6">
                {/* Input Variables Row */}
                <div>
                    <h3 className="text-base font-medium text-center pb-2 mb-3 border-b border-border">
                        Input Variables
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        <MetricCard
                            label="Fed Rate"
                            value={formatValue(data.fedFunds.value)}
                            percentile={data.fedFunds.percentile}
                            date={formatDate(data.fedFunds.date)}
                        />
                        <MetricCard
                            label="3M Yield"
                            value={formatValue(data.irx.value)}
                            percentile={data.irx.percentile}
                            date={formatDate(data.irx.date)}
                        />
                        <MetricCard
                            label="10Y Yield"
                            value={formatValue(data.tnx.value)}
                            percentile={data.tnx.percentile}
                            date={formatDate(data.tnx.date)}
                        />
                        <MetricCard
                            label="CPI"
                            value={formatValue(data.cpi.value)}
                            percentile={data.cpi.percentile}
                            date={formatDate(data.cpi.date)}
                        />

                        <MetricCard
                            label="PE 5yr"
                            value={formatPlainNumber(data.pe5yr.value)}
                            percentile={data.pe5yr.percentile}
                            date={formatDate(data.pe5yr.date)}
                        />
                        <MetricCard
                            label="EY 5yr"
                            value={formatValue(data.ey5yr.value)}
                            percentile={data.ey5yr.percentile}
                            date={formatDate(data.ey5yr.date)}
                            invertQuartiles
                        />
                        <MetricCard
                            label="EYP 5yr"
                            value={formatValue(data.eyp5yr.value)}
                            percentile={data.eyp5yr.percentile}
                            date={formatDate(data.eyp5yr.date)}
                            invertQuartiles
                        />
                        <MetricCard
                            label="Real EY (5yr)"
                            value={formatValue(data.rey5yr.value)}
                            percentile={data.rey5yr.percentile}
                            date={formatDate(data.rey5yr.date)}
                            invertQuartiles
                        />
                    </div>
                </div>

                {/* Regime Classification Section */}
                <div>
                    <h3 className="text-base font-medium text-center pb-2 mb-4 border-b border-border">
                        Regime Classification
                    </h3>

                    {/* Column Headers */}
                    <div className="flex gap-4 mb-3">
                        <div className="w-[180px] flex items-center justify-center">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</h4>
                        </div>
                        <div className="w-[240px] flex items-center justify-center">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classification</h4>
                        </div>
                        <div className="border-l-2 border-border mx-2" />
                        <div className="flex-1 min-w-0 flex items-center justify-center">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metrics</h4>
                        </div>
                    </div>

                    {/* Liquidity Row */}
                    <div className="flex gap-4 mb-4">
                        <div className="flex items-center justify-center w-[180px]">
                            <h4 className="text-lg font-semibold">Liquidity</h4>
                        </div>
                        <div className="w-[240px]">
                            <ClassificationCard
                                regime={liquidityRegime.regime}
                            />
                        </div>
                        <div className="border-l-2 border-border mx-2" />
                        <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-3 gap-2">
                                <SmallMetricCard
                                    label="Real 3M"
                                    concept="Policy Pressure"
                                    value={formatValue(data.real3M.value)}
                                    percentile={data.real3M.percentile}
                                    date={formatDate(data.real3M.date)}
                                    interpretation={getReal3MLabel(data.real3M.value)}
                                    useValueForColor
                                    rawValue={data.real3M.value}
                                />
                                <SmallMetricCard
                                    label="Real 10Y"
                                    concept="Capital Cost"
                                    value={formatValue(data.real10Y.value)}
                                    percentile={data.real10Y.percentile}
                                    date={formatDate(data.real10Y.date)}
                                    interpretation={getReal10YLabel(data.real10Y.value)}
                                    useValueForColor
                                    rawValue={data.real10Y.value}
                                />
                                <SmallMetricCard
                                    label="Yield Curve"
                                    concept="Credit Transmission"
                                    value={formatValue(data.yieldCurve.value)}
                                    percentile={data.yieldCurve.percentile}
                                    date={formatDate(data.yieldCurve.date)}
                                    interpretation={getYieldCurveLabel(data.yieldCurve.value)}
                                    useValueForColor
                                    rawValue={data.yieldCurve.value}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Valuation Row */}
                    <div className="flex gap-4 mb-4">
                        <div className="flex items-center justify-center w-[180px]">
                            <h4 className="text-lg font-semibold">Valuation</h4>
                        </div>
                        <div className="w-[240px]">
                            <ClassificationCard
                                regime={valuationRegime.regime}
                            />
                        </div>
                        <div className="border-l-2 border-border mx-2" />
                        <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-3 gap-2">
                                <SmallMetricCard
                                    label="EYP 5yr"
                                    concept="Equity Risk Premium"
                                    value={formatValue(data.eyp5yr.value)}
                                    percentile={data.eyp5yr.percentile}
                                    date={formatDate(data.eyp5yr.date)}
                                    interpretation={getEYPLabel(data.eyp5yr.value)}
                                    useValueForColor
                                    rawValue={data.eyp5yr.value}
                                />
                                <SmallMetricCard
                                    label="Real EY (5yr)"
                                    concept="Real Earnings Yield"
                                    value={formatValue(data.rey5yr.value)}
                                    percentile={data.rey5yr.percentile}
                                    date={formatDate(data.rey5yr.date)}
                                    interpretation={getRealEYLabel(data.rey5yr.value)}
                                    useValueForColor
                                    rawValue={data.rey5yr.value}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Trend Pressure Row */}
                    <div className="flex gap-4">
                        <div className="flex items-center justify-center w-[180px]">
                            <h4 className="text-lg font-semibold">Trend Pressure</h4>
                        </div>
                        <div className="w-[240px]">
                            <FlowTrendCard flowTrendState={flowTrendState} />
                        </div>
                        <div className="border-l-2 border-border mx-2" />
                        <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-3 gap-2">
                                <SmallMetricCard
                                    label="Direction"
                                    concept="200MA Slope"
                                    value={formatValue(data.slope200MA.value, 2)}
                                    percentile={data.slope200MA.percentile}
                                    date={formatDate(data.slope200MA.date)}
                                    interpretation={flowTrendState.direction.label}
                                    customColor={flowTrendState.direction.color}
                                />
                                <SmallMetricCard
                                    label="Stage"
                                    concept="Trend Duration"
                                    value={data.daysAbove200MA.value !== null ? `${Math.abs(data.daysAbove200MA.value).toFixed(0)} days` : 'N/A'}
                                    percentile={data.daysAbove200MA.percentile}
                                    date={formatDate(data.daysAbove200MA.date)}
                                    interpretation={flowTrendState.stage.label}
                                    customColor={flowTrendState.stage.color}
                                />
                                <SmallMetricCard
                                    label="Pressure"
                                    concept="Distance from 200MA"
                                    value={formatValue(data.divergence200MA.value)}
                                    percentile={data.divergence200MA.percentile}
                                    date={formatDate(data.divergence200MA.date)}
                                    interpretation={flowTrendState.pressure.label}
                                    customColor={flowTrendState.pressure.color}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    label,
    value,
    percentile,
    date,
    invertQuartiles = false
}: {
    label: string;
    value: string;
    percentile: number | null;
    date: string;
    invertQuartiles?: boolean;
}) {
    const styles = getQuartileStyles(percentile, invertQuartiles);

    return (
        <div className={`p-4 rounded-lg border-2 bg-card ${styles.border} text-center`}>
            <div className="text-sm text-muted-foreground mb-2">{label}</div>
            <div className="text-2xl font-semibold mb-2">{value}</div>
            <div className="text-xs text-muted-foreground mb-1">{date}</div>
            <div className={`text-xs font-medium ${styles.text}`}>
                Percentile: {formatPercentile(percentile)}
            </div>
        </div>
    );
}

function SmallMetricCard({
    label,
    concept,
    value,
    percentile,
    date,
    interpretation,
    invertQuartiles = false,
    useValueForColor = false,
    rawValue = null,
    customColor = null
}: {
    label: string;
    concept: string;
    value: string;
    percentile: number | null;
    date: string;
    interpretation?: string;
    invertQuartiles?: boolean;
    useValueForColor?: boolean;
    rawValue?: number | null;
    customColor?: string | null;
}) {
    let styles;

    if (customColor) {
        // Use custom color from flow-trend-config
        const borderStyle = { borderColor: customColor };
        const textStyle = { color: customColor };

        return (
            <div className="p-2 rounded-lg border-2 bg-card text-center" style={borderStyle}>
                <div className="text-xs font-medium mb-0.5">{label}</div>
                <div className="text-[9px] text-muted-foreground italic mb-1">{concept}</div>
                <div className="text-base font-semibold mb-1">{value}</div>
                {interpretation && (
                    <div className="text-[9px] text-muted-foreground mb-1 italic">
                        {interpretation}
                    </div>
                )}
                {percentile !== null && (
                    <div className="text-[9px] font-medium mb-0.5" style={textStyle}>
                        Percentile: {formatPercentile(percentile)}
                    </div>
                )}
                <div className="text-[9px] text-muted-foreground">{date}</div>
            </div>
        );
    }

    if (useValueForColor && rawValue !== null) {
        // Value-based coloring for liquidity metrics
        if (label === 'Real 3M') {
            if (rawValue < -1.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue < 0.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue <= 1.5) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue <= 3.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'Real 10Y') {
            if (rawValue < 0.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue < 1.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue <= 2.5) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue <= 4.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'Yield Curve') {
            if (rawValue > 1.75) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue > 0.75) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue >= 0.25) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue >= -0.25) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'CPI') {
            if (rawValue < 0.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue < 2.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue <= 3.0) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue <= 5.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'EYP 5yr') {
            if (rawValue > 4.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue > 2.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue >= 0.0) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue >= -2.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else if (label === 'Real EY (5yr)') {
            if (rawValue > 6.0) {
                styles = { border: 'border-lime-500 dark:border-lime-400', text: 'text-lime-600 dark:text-lime-400' };
            } else if (rawValue > 4.0) {
                styles = { border: 'border-green-500 dark:border-green-400', text: 'text-green-600 dark:text-green-400' };
            } else if (rawValue > 2.0) {
                styles = { border: 'border-blue-500 dark:border-blue-400', text: 'text-blue-600 dark:text-blue-400' };
            } else if (rawValue >= 0.0) {
                styles = { border: 'border-yellow-500 dark:border-yellow-400', text: 'text-yellow-600 dark:text-yellow-400' };
            } else {
                styles = { border: 'border-red-500 dark:border-red-400', text: 'text-red-600 dark:text-red-400' };
            }
        } else {
            styles = getQuartileStyles(percentile, invertQuartiles);
        }
    } else {
        styles = getQuartileStyles(percentile, invertQuartiles);
    }

    return (
        <div className={`p-2 rounded-lg border-2 bg-card ${styles.border} text-center`}>
            <div className="text-xs font-medium mb-0.5">{label}</div>
            <div className="text-[9px] text-muted-foreground italic mb-1">{concept}</div>
            <div className="text-base font-semibold mb-1">{value}</div>
            {interpretation && (
                <div className="text-[9px] text-muted-foreground mb-1 italic">
                    {interpretation}
                </div>
            )}
            <div className={`text-[9px] font-medium mb-0.5 ${styles.text}`}>
                Percentile: {formatPercentile(percentile)}
            </div>
            <div className="text-[9px] text-muted-foreground">{date}</div>
        </div>
    );
}

interface ClassificationRegime {
    name: string;
    description: string;
    examples?: string;
}

function ClassificationCard({
    regime
}: {
    regime: ClassificationRegime;
}) {
    const colorClass = getRegimeColor(regime.name);

    return (
        <div className={`p-3 rounded-lg border-2 ${colorClass} h-[140px] flex flex-col items-center justify-center text-center`}>
            <div className="text-base font-bold mb-1">{regime.name}</div>
            <div className="text-xs mb-2 opacity-80">{regime.description}</div>

            {regime.examples && (
                <div className="text-[10px] opacity-70 mt-1">
                    Examples: {regime.examples}
                </div>
            )}
        </div>
    );
}


function FlowTrendCard({
    flowTrendState
}: {
    flowTrendState: FlowTrendState;
}) {
    // Use color from risk assessment
    const borderStyle = { borderColor: flowTrendState.risk.color };
    const textStyle = { color: flowTrendState.risk.color };

    return (
        <div className="p-3 rounded-lg border-2 bg-card h-[140px] flex flex-col items-center justify-center text-center" style={borderStyle}>
            <div className="text-base font-bold mb-1" style={textStyle}>{flowTrendState.risk.label}</div>
            <div className="text-xs mb-2 opacity-80">
                Stage: {flowTrendState.stage.label} • Pressure: {flowTrendState.pressure.label}
            </div>
            <div className="text-[10px] opacity-70">
                {flowTrendState.side.label} • {flowTrendState.direction.label}
            </div>
        </div>
    );
}
