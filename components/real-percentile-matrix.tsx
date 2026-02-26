'use client';

import { useState, useEffect } from 'react';

interface PercentileValues {
    cpi: number | null;
    fedFunds: number | null;
    tnx: number | null;
    irx: number | null;
    pe5yr: number | null;
    ey5yr: number | null;
    realYield: number | null;
    realYield3m: number | null;
    rey5yr: number | null;
    eyp5yr: number | null;
}

interface MetricValue {
    value: number | null;
    yoy: number | null;
}

interface MetricValues {
    cpi: MetricValue;
    fedFunds: MetricValue;
    tnx: MetricValue;
    irx: MetricValue;
    pe5yr: MetricValue;
    ey5yr: MetricValue;
    realYield: MetricValue;
    realYield3m: MetricValue;
    rey5yr: MetricValue;
    eyp5yr: MetricValue;
}

interface RealPercentileMatrixProps {
    initialValues: PercentileValues;
    initialMetricValues: MetricValues;
    sliderValue: number;
    onSliderChange: (value: number) => void;
}

export default function RealPercentileMatrix({ initialValues, initialMetricValues, sliderValue, onSliderChange }: RealPercentileMatrixProps) {
    const startYear = 1960;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const totalMonths = (currentYear - startYear) * 12 + currentMonth;

    const [debouncedSliderValue, setDebouncedSliderValue] = useState(sliderValue);
    const [values, setValues] = useState<PercentileValues>(initialValues);
    const [metricValues, setMetricValues] = useState<MetricValues>(initialMetricValues);
    const [loading, setLoading] = useState(false);
    const [showEquityTooltip, setShowEquityTooltip] = useState(false);
    const [showBondsTooltip, setShowBondsTooltip] = useState(false);
    const [showCashTooltip, setShowCashTooltip] = useState(false);

    const getDateFromSlider = (value: number) => {
        const year = startYear + Math.floor(value / 12);
        const month = value % 12;
        return { year, month };
    };

    const { year: selectedYear, month: selectedMonth } = getDateFromSlider(sliderValue);
    const { year: debouncedYear, month: debouncedMonth } = getDateFromSlider(debouncedSliderValue);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSliderValue(sliderValue), 300);
        return () => clearTimeout(timer);
    }, [sliderValue]);

    useEffect(() => {
        if (debouncedSliderValue === totalMonths) {
            setValues(initialValues);
            setMetricValues(initialMetricValues);
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                const response = await fetch(`/api/percentile-year?year=${debouncedYear}&month=${String(debouncedMonth + 1).padStart(2, '0')}`);
                const result = await response.json();

                setValues({
                    cpi: result.cpi?.percentileRank ?? null,
                    fedFunds: result.fedFunds?.percentileRank ?? null,
                    tnx: result.tnx?.percentileRank ?? null,
                    irx: result.irx?.percentileRank ?? null,
                    pe5yr: result.pe5yr?.percentileRank ?? null,
                    ey5yr: result.ey5yr?.percentileRank ?? null,
                    realYield: result.realYield?.percentileRank ?? null,
                    realYield3m: result.realYield3m?.percentileRank ?? null,
                    rey5yr: result.rey5yr?.percentileRank ?? null,
                    eyp5yr: result.eyp5yr?.percentileRank ?? null,
                });

                setMetricValues({
                    cpi: {
                        value: result.cpi?.value ?? null,
                        yoy: result.cpi?.yoyPercentileChange ?? null
                    },
                    fedFunds: {
                        value: result.fedFunds?.value ?? null,
                        yoy: result.fedFunds?.yoyPercentileChange ?? null
                    },
                    tnx: {
                        value: result.tnx?.value ?? null,
                        yoy: result.tnx?.yoyPercentileChange ?? null
                    },
                    irx: {
                        value: result.irx?.value ?? null,
                        yoy: result.irx?.yoyPercentileChange ?? null
                    },
                    pe5yr: {
                        value: result.pe5yr?.value ?? null,
                        yoy: result.pe5yr?.yoyPercentileChange ?? null
                    },
                    ey5yr: {
                        value: result.ey5yr?.value ?? null,
                        yoy: result.ey5yr?.yoyPercentileChange ?? null
                    },
                    realYield: {
                        value: result.realYield?.value ?? null,
                        yoy: result.realYield?.yoyPercentileChange ?? null
                    },
                    realYield3m: {
                        value: result.realYield3m?.value ?? null,
                        yoy: result.realYield3m?.yoyPercentileChange ?? null
                    },
                    rey5yr: {
                        value: result.rey5yr?.value ?? null,
                        yoy: result.rey5yr?.yoyPercentileChange ?? null
                    },
                    eyp5yr: {
                        value: result.eyp5yr?.value ?? null,
                        yoy: result.eyp5yr?.yoyPercentileChange ?? null
                    },
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [debouncedSliderValue, totalMonths, debouncedYear, debouncedMonth, initialValues, initialMetricValues]);

    const getBarColor = (percentile: number | null, isReversed: boolean = false): string => {
        if (percentile === null) return 'bg-gray-300';
        if (isReversed) {
            if (percentile < 33) return 'bg-red-500';
            if (percentile < 67) return 'bg-yellow-500';
            return 'bg-green-500';
        }
        if (percentile < 33) return 'bg-green-500';
        if (percentile < 67) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getTextColor = (percentile: number | null, isReversed: boolean = false): string => {
        if (percentile === null) return 'text-gray-500';
        if (isReversed) {
            if (percentile < 33) return 'text-red-600 dark:text-red-400';
            if (percentile < 67) return 'text-yellow-600 dark:text-yellow-400';
            return 'text-green-600 dark:text-green-400';
        }
        if (percentile < 33) return 'text-green-600 dark:text-green-400';
        if (percentile < 67) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const formatValue = (value: number | null, format: 'percentage' | 'number' = 'percentage'): string => {
        if (value === null) return 'N/A';
        if (format === 'number') return value.toFixed(2);
        return `${value.toFixed(2)}%`;
    };

    const formatYoY = (yoy: number | null): string => {
        if (yoy === null) return 'N/A';
        return `${yoy > 0 ? '+' : ''}${yoy.toFixed(1)}`;
    };

    const getYoYColor = (yoy: number | null): string => {
        if (yoy === null) return 'text-gray-500';
        if (yoy > 0) return 'text-green-600 dark:text-green-400';
        if (yoy < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-500';
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const displayDate = `${monthNames[selectedMonth]} ${selectedYear}`;

    const marketMetrics = [
        { key: 'cpi' as keyof PercentileValues, label: 'CPI', reversed: false, format: 'percentage' as const },
        { key: 'fedFunds' as keyof PercentileValues, label: 'Fed Funds', reversed: false, format: 'percentage' as const },
        { key: 'tnx' as keyof PercentileValues, label: '10Y', reversed: false, format: 'percentage' as const },
        { key: 'irx' as keyof PercentileValues, label: '3M', reversed: false, format: 'percentage' as const },
        { key: 'pe5yr' as keyof PercentileValues, label: 'P/E 5yr', reversed: false, format: 'number' as const },
        { key: 'ey5yr' as keyof PercentileValues, label: 'EY 5yr', reversed: true, format: 'percentage' as const },
    ];

    const realMetrics = [
        { key: 'realYield' as keyof PercentileValues, label: 'Real 10Y (10Y-CPI)', reversed: true, format: 'percentage' as const },
        { key: 'realYield3m' as keyof PercentileValues, label: 'Real 3M (3M-CPI)', reversed: true, format: 'percentage' as const },
        { key: 'rey5yr' as keyof PercentileValues, label: 'Real EY (EY5yr-CPI)', reversed: true, format: 'percentage' as const },
        { key: 'eyp5yr' as keyof PercentileValues, label: 'EYP (EY5yr-3M)', reversed: true, format: 'percentage' as const },
    ];

    return (
        <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Percentile Matrix</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onSliderChange(Math.max(0, sliderValue - 1))}
                        className="px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors text-sm font-bold"
                        disabled={sliderValue === 0}
                    >
                        −
                    </button>
                    <div className="text-sm font-semibold text-primary min-w-[100px] text-center">{displayDate}</div>
                    <button
                        onClick={() => onSliderChange(Math.min(totalMonths, sliderValue + 1))}
                        className="px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors text-sm font-bold"
                        disabled={sliderValue === totalMonths}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Timeline Slider */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute -top-2 left-0 right-0 h-2 pointer-events-none">
                        {[1960, 1970, 1980, 1990, 2000, 2010, 2020, currentYear].map(year => {
                            const monthsFromStart = (year - startYear) * 12;
                            const position = (monthsFromStart / totalMonths) * 100;
                            const isActive = Math.abs(sliderValue - monthsFromStart) < 6;
                            return (
                                <div key={year} className={`absolute w-0.5 h-3 transition-colors ${isActive ? 'bg-primary' : 'bg-muted-foreground/40'}`} style={{ left: `${position}%` }} />
                            );
                        })}
                    </div>
                    <div className="relative">
                        <div className="absolute top-0 left-0 h-[8px] bg-primary rounded-l-full pointer-events-none z-0" style={{ width: `${(sliderValue / totalMonths) * 100}%` }} />
                        {/* Vertical line indicator at the end of progress bar */}
                        <div
                            className="absolute -top-3 w-[2px] h-[32px] bg-primary pointer-events-none z-20 transition-all duration-100 shadow-md"
                            style={{
                                left: `${(sliderValue / totalMonths) * 100}%`,
                                transform: 'translateX(-50%)'
                            }}
                        />
                        <input type="range" min={0} max={totalMonths} value={sliderValue} onChange={(e) => onSliderChange(Number(e.target.value))} className="w-full range-slider relative z-10" />
                    </div>
                    <div className="relative mt-1 h-4">
                        {[1960, 1970, 1980, 1990, 2000, 2010, 2020, currentYear].map((year) => {
                            const monthsFromStart = (year - startYear) * 12;
                            const position = (monthsFromStart / totalMonths) * 100;
                            const isActive = Math.abs(sliderValue - monthsFromStart) < 6;
                            return (
                                <button key={year} onClick={() => onSliderChange(monthsFromStart)} className={`absolute cursor-pointer hover:text-primary transition-colors text-[10px] font-medium -translate-x-1/2 ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`} style={{ left: `${position}%` }}>
                                    {year}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Market Regime Trackers */}
            <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Market Regime Indicators</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onMouseEnter={() => setShowCashTooltip(true)}
                                onMouseLeave={() => setShowCashTooltip(false)}
                                className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors cursor-help"
                            >
                                💵 Cash
                            </button>
                            {showCashTooltip && (
                                <div className="absolute z-50 right-0 top-full mt-2 w-96 p-4 bg-card border border-border rounded-lg shadow-xl">
                                    <div className="text-sm font-bold mb-2">Real 3M = Capital Pressure</div>
                                    <div className="space-y-3 text-xs">
                                        <div className="border-l-4 border-green-500 pl-3">
                                            <div className="font-bold text-green-700 dark:text-green-400 mb-1">🟢 Normal</div>
                                            <div className="text-muted-foreground space-y-0.5">
                                                <div>• Real 3M &gt; +1%</div>
                                                <div>• Cash clearly rewarded</div>
                                                <div>• Waiting has value</div>
                                                <div>• Policy not distorting behavior</div>
                                                <div className="italic mt-1">This is systemically calm.</div>
                                            </div>
                                        </div>
                                        <div className="border-l-4 border-orange-500 pl-3">
                                            <div className="font-bold text-orange-700 dark:text-orange-400 mb-1">🟠 Constrained</div>
                                            <div className="text-muted-foreground space-y-0.5">
                                                <div>• Real 3M between 0% and +1%</div>
                                                <div>• Cash barely compensates for inflation</div>
                                                <div>• Margin of safety shrinking</div>
                                                <div>• Policy nearing constraint</div>
                                                <div>• System sensitive to small shocks</div>
                                                <div className="italic mt-1">Warning band, but not a red alert.</div>
                                            </div>
                                        </div>
                                        <div className="border-l-4 border-red-500 pl-3">
                                            <div className="font-bold text-red-700 dark:text-red-400 mb-1">🔴 Push</div>
                                            <div className="text-muted-foreground space-y-0.5">
                                                <div>• Real 3M &lt; 0%</div>
                                                <div>• Cash penalized</div>
                                                <div>• Capital forced out of safety</div>
                                                <div>• Risk-taking becomes structural</div>
                                                <div className="italic mt-1">This is where behavior changes.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onMouseEnter={() => setShowBondsTooltip(true)}
                                onMouseLeave={() => setShowBondsTooltip(false)}
                                className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors cursor-help"
                            >
                                💰 Bonds
                            </button>
                            {showBondsTooltip && (
                                <div className="absolute z-50 right-0 top-full mt-2 w-96 p-4 bg-card border border-border rounded-lg shadow-xl">
                                    <div className="space-y-3 text-xs">
                                        <div className="border-l-4 border-green-500 pl-3">
                                            <div className="font-bold text-green-700 dark:text-green-400 mb-1">
                                                🟢 Anchored
                                            </div>
                                            <div className="text-muted-foreground space-y-0.5">
                                                <div>• Real 10Y &gt; 2.5%</div>
                                                <div>• Long-term capital compounds in real terms</div>
                                                <div>• Time and patience are rewarded</div>
                                                <div>• Discount rates are credible and binding</div>
                                                <div>• Asset prices governed by fundamentals</div>
                                                <div className="italic mt-1">
                                                    The system provides a credible real return to safety.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-l-4 border-blue-500 pl-3">
                                            <div className="font-bold text-blue-700 dark:text-blue-400 mb-1">🔵 Supportive</div>
                                            <div className="text-muted-foreground space-y-0.5">
                                                <div>• Real 10Y between 0% and 2.5%</div>
                                                <div>• Real return exists, but modest</div>
                                                <div>• System functions normally</div>
                                                <div>• Financial assets still viable</div>
                                                <div>• Valuation tolerance increases</div>
                                                <div>• Fragility can build over time</div>
                                                <div className="italic mt-1">This is the default modern state.</div>
                                            </div>
                                        </div>
                                        <div className="border-l-4 border-red-500 pl-3">
                                            <div className="font-bold text-red-700 dark:text-red-400 mb-1">🔴 System Stress</div>
                                            <div className="text-muted-foreground space-y-0.5">
                                                <div>• Real 10Y &lt; 0%</div>
                                                <div>• No real risk-free rate</div>
                                                <div>• Capital preservation fails</div>
                                                <div>• Forced risk-taking dominates</div>
                                                <div>• Real assets gain relative appeal</div>
                                                <div>• System fragility elevated</div>
                                                <div className="italic mt-1 text-xs">Warning condition, not a crash call.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onMouseEnter={() => setShowEquityTooltip(true)}
                                onMouseLeave={() => setShowEquityTooltip(false)}
                                className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-help"
                            >
                                📈 Equities
                            </button>
                            {showEquityTooltip && (
                                <div className="absolute z-50 right-0 top-full mt-2 w-96 p-4 bg-card border border-border rounded-lg shadow-xl">
                                    <div className="space-y-3 text-xs">
                                        <div className="border-l-4 border-green-500 pl-3">
                                            <div className="font-bold text-green-700 dark:text-green-400 mb-1">🟢 Compelling</div>
                                            <div className="text-muted-foreground space-y-0.5">
                                                <div>• Real EY &gt; 3%</div>
                                                <div>• Strong real economic tailwind</div>
                                                <div>• Valuations forgiven</div>
                                                <div>• Broad participation likely</div>
                                                <div className="italic mt-1">"Equities are clearly working for you"</div>
                                            </div>
                                        </div>
                                        <div className="border-l-4 border-blue-500 pl-3">
                                            <div className="font-bold text-blue-700 dark:text-blue-400 mb-1">🔵 Supportive</div>
                                            <div className="text-muted-foreground space-y-0.5">
                                                <div>• Real EY 1–3%</div>
                                                <div>• Equities clear inflation</div>
                                                <div>• Economics are intact</div>
                                                <div>• Big gains are possible</div>
                                            </div>
                                        </div>
                                        <div className="border-l-4 border-red-500 pl-3">
                                            <div className="font-bold text-red-700 dark:text-red-400 mb-1">🔴 Adverse</div>
                                            <div className="text-muted-foreground space-y-0.5">
                                                <div>• Real EY &lt; 1%</div>
                                                <div>• Equity economics impaired</div>
                                                <div>• Returns rely on reflexivity</div>
                                                <div>• High risk of asymmetric drawdowns</div>
                                                <div className="italic mt-1 text-xs">Warning state, not a timing call</div>
                                                <div className="italic text-xs">Returns are conditional, not automatic</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {/* Cash Tracker */}
                    <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0 text-xs font-semibold">Cash</div>
                        <div className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${metricValues.realYield3m.value !== null && metricValues.realYield3m.value > 1
                            ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                            : metricValues.realYield3m.value !== null && metricValues.realYield3m.value >= 0
                                ? 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400'
                                : metricValues.realYield3m.value !== null
                                    ? 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
                                    : 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold mb-1">
                                        {metricValues.realYield3m.value !== null && metricValues.realYield3m.value > 1
                                            ? '🟢 Normal'
                                            : metricValues.realYield3m.value !== null && metricValues.realYield3m.value >= 0
                                                ? '🟠 Constrained'
                                                : metricValues.realYield3m.value !== null
                                                    ? '🔴 Push'
                                                    : 'N/A'}
                                    </div>
                                    <div className="text-xs opacity-80">
                                        {metricValues.realYield3m.value !== null && metricValues.realYield3m.value > 1
                                            ? 'Real 3M > 1% • Systemically calm'
                                            : metricValues.realYield3m.value !== null && metricValues.realYield3m.value >= 0
                                                ? 'Real 3M 0–1% • Warning band'
                                                : metricValues.realYield3m.value !== null
                                                    ? 'Real 3M < 0% • Behavior changes'
                                                    : 'Data not available'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">Real 3M</div>
                                    <div className="text-sm font-bold">
                                        {metricValues.realYield3m.value !== null ? `${metricValues.realYield3m.value.toFixed(2)}%` : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bonds Tracker */}
                    <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0 text-xs font-semibold">Bonds</div>
                        <div className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${metricValues.realYield.value !== null && metricValues.realYield.value > 2.5
                            ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                            : metricValues.realYield.value !== null && metricValues.realYield.value >= 0
                                ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
                                : metricValues.realYield.value !== null
                                    ? 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
                                    : 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold mb-1">
                                        {metricValues.realYield.value !== null && metricValues.realYield.value > 2.5
                                            ? '🟢 Anchored'
                                            : metricValues.realYield.value !== null && metricValues.realYield.value >= 0
                                                ? '🔵 Supportive'
                                                : metricValues.realYield.value !== null
                                                    ? '🔴 System Stress'
                                                    : 'N/A'}
                                    </div>
                                    <div className="text-xs opacity-80">
                                        {metricValues.realYield.value !== null && metricValues.realYield.value > 2.5
                                            ? 'Real 10Y > 2.5% • Financial capital compounds in real terms'
                                            : metricValues.realYield.value !== null && metricValues.realYield.value >= 0
                                                ? 'Real 10Y 0–2.5% • System functions normally'
                                                : metricValues.realYield.value !== null
                                                    ? 'Real 10Y < 0% • No real risk-free rate'
                                                    : 'Data not available'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">Real 10Y</div>
                                    <div className="text-sm font-bold">
                                        {metricValues.realYield.value !== null ? `${metricValues.realYield.value.toFixed(2)}%` : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Equities Tracker */}
                    <div className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0 text-xs font-semibold">Equities</div>
                        <div className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${metricValues.rey5yr.value !== null && metricValues.rey5yr.value > 3
                            ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                            : metricValues.rey5yr.value !== null && metricValues.rey5yr.value >= 1
                                ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
                                : metricValues.rey5yr.value !== null
                                    ? 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
                                    : 'bg-gray-500/10 border-gray-500 text-gray-700 dark:text-gray-400'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold mb-1">
                                        {metricValues.rey5yr.value !== null && metricValues.rey5yr.value > 3
                                            ? '🟢 Compelling'
                                            : metricValues.rey5yr.value !== null && metricValues.rey5yr.value >= 1
                                                ? '🔵 Supportive'
                                                : metricValues.rey5yr.value !== null
                                                    ? '🔴 Adverse'
                                                    : 'N/A'}
                                    </div>
                                    <div className="text-xs opacity-80">
                                        {metricValues.rey5yr.value !== null && metricValues.rey5yr.value > 3
                                            ? 'Real EY > 3% • Strong real economic tailwind'
                                            : metricValues.rey5yr.value !== null && metricValues.rey5yr.value >= 1
                                                ? 'Real EY 1–3% • Equities clear inflation'
                                                : metricValues.rey5yr.value !== null
                                                    ? 'Real EY < 1% • Equity economics impaired'
                                                    : 'Data not available'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">Real EY</div>
                                    <div className="text-sm font-bold">
                                        {metricValues.rey5yr.value !== null ? `${metricValues.rey5yr.value.toFixed(2)}%` : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`space-y-4 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {/* Market Metrics */}
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Market Metrics</h3>
                    {/* Column Headers */}
                    <div className="flex items-center gap-3 mb-1 pb-1 border-b border-border/50">
                        <div className="w-32 flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase">Metric</div>
                        <div className="w-20 flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase text-right">Value</div>
                        <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 text-[10px] font-semibold text-muted-foreground uppercase text-center">Percentile</div>
                            <div className="w-14 text-[10px] font-semibold text-muted-foreground uppercase text-right">%ile</div>
                        </div>
                        <div className="w-16 text-[10px] font-semibold text-muted-foreground uppercase text-right">Δ%ile</div>
                    </div>
                    <div className="space-y-2">
                        {marketMetrics.map(metric => {
                            const percentile = values[metric.key];
                            const metricData = metricValues[metric.key];
                            return (
                                <div key={metric.key} className="flex items-center gap-3">
                                    <div className="w-32 flex-shrink-0 text-xs font-medium">{metric.label}</div>
                                    <div className="w-20 flex-shrink-0 text-xs font-semibold text-right">
                                        {formatValue(metricData.value, metric.format)}
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                                            <div className={`h-full ${getBarColor(percentile, metric.reversed)} transition-all duration-500`} style={{ width: `${percentile || 0}%` }} />
                                        </div>
                                        <div className="w-14 text-right">
                                            <span className={`text-xs font-semibold ${getTextColor(percentile, metric.reversed)}`}>
                                                {percentile !== null ? `${percentile.toFixed(1)}%` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-16 text-right">
                                        <span className={`text-xs font-semibold ${getYoYColor(metricData.yoy)}`}>
                                            {formatYoY(metricData.yoy)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Real Metrics */}
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Real Metrics</h3>
                    {/* Column Headers */}
                    <div className="flex items-center gap-3 mb-1 pb-1 border-b border-border/50">
                        <div className="w-32 flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase">Metric</div>
                        <div className="w-20 flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase text-right">Value</div>
                        <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 text-[10px] font-semibold text-muted-foreground uppercase text-center">Percentile</div>
                            <div className="w-14 text-[10px] font-semibold text-muted-foreground uppercase text-right">%ile</div>
                        </div>
                        <div className="w-16 text-[10px] font-semibold text-muted-foreground uppercase text-right">Δ%ile</div>
                    </div>
                    <div className="space-y-2">
                        {realMetrics.map(metric => {
                            const percentile = values[metric.key];
                            const metricData = metricValues[metric.key];
                            return (
                                <div key={metric.key} className="flex items-center gap-3">
                                    <div className="w-32 flex-shrink-0 text-xs font-medium">{metric.label}</div>
                                    <div className="w-20 flex-shrink-0 text-xs font-semibold text-right">
                                        {formatValue(metricData.value, metric.format)}
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                                            <div className={`h-full ${getBarColor(percentile, metric.reversed)} transition-all duration-500`} style={{ width: `${percentile || 0}%` }} />
                                        </div>
                                        <div className="w-14 text-right">
                                            <span className={`text-xs font-semibold ${getTextColor(percentile, metric.reversed)}`}>
                                                {percentile !== null ? `${percentile.toFixed(1)}%` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-16 text-right">
                                        <span className={`text-xs font-semibold ${getYoYColor(metricData.yoy)}`}>
                                            {formatYoY(metricData.yoy)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded"></div><span>Low (0-33rd)</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-500 rounded"></div><span>Mid (33-67th)</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded"></div><span>High (67-100th)</span></div>
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground">* Real metrics and EY 5yr use reversed colors (higher is better)</div>
            </div>

            <style jsx>{`
                .range-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: hsl(var(--muted));
                    outline: none;
                    cursor: pointer;
                    position: relative;
                }
                .range-slider::-webkit-slider-track { 
                    -webkit-appearance: none; 
                    width: 100%; 
                    height: 8px; 
                    border-radius: 4px; 
                    background: transparent; 
                }
                .range-slider::-webkit-slider-thumb { 
                    -webkit-appearance: none; 
                    width: 3px; 
                    height: 32px; 
                    border-radius: 2px; 
                    background: hsl(var(--primary)); 
                    cursor: grab; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3); 
                    transition: all 0.2s;
                    position: relative;
                    z-index: 10;
                }
                .range-slider::-webkit-slider-thumb:hover { 
                    width: 4px;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4); 
                }
                .range-slider::-webkit-slider-thumb:active { 
                    cursor: grabbing; 
                    width: 4px;
                }
                .range-slider::-moz-range-track { width: 100%; height: 8px; border-radius: 4px; background: hsl(var(--muted)); }
                .range-slider::-moz-range-progress { height: 8px; border-radius: 4px; background: hsl(var(--primary)); }
                .range-slider::-moz-range-thumb { 
                    width: 3px; 
                    height: 32px; 
                    border-radius: 2px; 
                    background: hsl(var(--primary)); 
                    cursor: grab; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3); 
                    transition: all 0.2s;
                    border: none;
                }
                .range-slider::-moz-range-thumb:hover { 
                    width: 4px;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4); 
                }
                .range-slider::-moz-range-thumb:active { 
                    cursor: grabbing; 
                    width: 4px;
                }
            `}</style>
        </div>
    );
}
