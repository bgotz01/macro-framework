'use client';

import { useState, useEffect } from 'react';
import { calculateFlowTrendState } from '@/lib/regime-config/flow-trend-config';
import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';
import CustomRegimeModal, { DEFAULT_THRESHOLDS, type CustomThresholds } from './custom-regime-modal';
import RegimeModal from './regime-modal';
import RegimeFlagsModal from './regime-flags-modal';
import TimelineSlider from './regime-timeline-slider';
import RegimeTimelineBarChart from '@/components/charts/regime-timeline-bar-chart';
import RegimeStateDisplay from './regime-state-display';
import RegimeFlagsBar from './regime-flags-bar';
import RegimeInputVariables from './regime-input-variables';
import RegimeClassification from './regime-classification';
import RegimeProximity from './regime-proximity';
import RegimePercentileChanges from './regime-percentile-changes';
import { emptyMetric } from './regime-parameters-utils';
import type { RegimeData } from './regime-parameters-types';
import {
    calculateLiquidityRegime,
    calculateValuationRegime
} from '@/lib/regime-config';

function buildTriggerDescriptions(regime: RegimeFamily, t: CustomThresholds): { entryDescription: string; exitDescription: string } {
    const map: Record<string, { entryDescription: string; exitDescription: string }> = {
        'Broad Growth': { entryDescription: `Entry: REY ≥ ${t.broadGrowth.entry}%`, exitDescription: `Exit: REY < ${t.broadGrowth.exit}%` },
        'Long Duration': { entryDescription: `Entry: EYP ≤ ${t.longDuration.entryEyp}% AND Real 10Y ≥ ${t.longDuration.entryReal10Y}% AND REY ≥ ${t.longDuration.entryRey}%`, exitDescription: `Exit: EYP ≥ ${t.longDuration.exitEypHigh}% OR EYP ≤ ${t.longDuration.exitEypLow}% OR REY < ${t.longDuration.exitRey}%` },
        'Overvaluation': { entryDescription: `Entry: EYP ≤ ${t.overvaluation.entryEyp}% OR REY ≤ ${t.overvaluation.entryRey}%`, exitDescription: `Exit: EYP ≥ ${t.overvaluation.exitEyp}% AND REY ≥ ${t.overvaluation.exitRey}%` },
        'Crisis': { entryDescription: `Entry: Real 10Y ≤ ${t.crisis.entryReal10Y}% AND Real M2 ≤ ${t.crisis.entryRealM2}%`, exitDescription: `Exit: Real 10Y ≥ ${t.crisis.exitReal10Y}% OR Real M2 ≥ ${t.crisis.exitRealM2}%` },
        'Bond Stress': { entryDescription: `Entry: Real 10Y ≤ ${t.bondStress.entryReal10Y}% AND Real 3M ≤ ${t.bondStress.entryReal3M}%`, exitDescription: `Exit: Real 10Y ≥ ${t.bondStress.exitReal10Y}%` },
        'Liquidity Shock': { entryDescription: `Entry: Real M2 ≥ ${t.liquidityShock.entry}%`, exitDescription: `Exit: Real M2 ≤ ${t.liquidityShock.exit}%` },
        'None': { entryDescription: 'Default state when no outlier triggers are active', exitDescription: '' },
    };
    return map[regime] || map['None'];
}

export default function CustomRegimeParameters() {
    const startYear = 1960;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const totalMonths = (currentYear - startYear) * 12 + currentMonth;

    const [sliderValue, setSliderValue] = useState<number>(totalMonths);
    const [debouncedSliderValue, setDebouncedSliderValue] = useState<number>(totalMonths);
    const [data, setData] = useState<RegimeData | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInputVariables, setShowInputVariables] = useState(false);
    const [showPercentileChanges, setShowPercentileChanges] = useState(false);
    const [showClassification, setShowClassification] = useState(false);
    const [showProximity, setShowProximity] = useState(true);
    const [thresholds, setThresholds] = useState<CustomThresholds>({ ...DEFAULT_THRESHOLDS });
    const [yieldCurveInversion, setYieldCurveInversion] = useState<any>(null);
    const [showApplied, setShowApplied] = useState(false);
    const [regimeState, setRegimeState] = useState<any>(null);
    const [percentileChanges, setPercentileChanges] = useState<Record<string, { label: string; delta: number | null }>>({});

    // Load saved thresholds on mount — deep merge with defaults to handle schema additions
    useEffect(() => {
        fetch('/api/custom-thresholds')
            .then(r => r.json())
            .then(saved => {
                if (saved) {
                    const merged: CustomThresholds = Object.fromEntries(
                        Object.entries(DEFAULT_THRESHOLDS).map(([key, defaultVal]) => [
                            key,
                            { ...defaultVal, ...(saved[key] ?? {}) }
                        ])
                    ) as CustomThresholds;
                    setThresholds(merged);
                }
            })
            .catch(() => { });
    }, []);

    // Save + apply thresholds
    const handleApplyThresholds = (t: CustomThresholds) => {
        setThresholds(t);
        fetch('/api/custom-thresholds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(t),
        }).catch(() => { });
        setShowApplied(true);
        setTimeout(() => setShowApplied(false), 3000);
    };

    // Debounce slider
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSliderValue(sliderValue), 150);
        return () => clearTimeout(timer);
    }, [sliderValue]);

    const getDateFromSlider = (value: number) => {
        const year = startYear + Math.floor(value / 12);
        const month = value % 12;
        return { year, month };
    };

    const { year: selectedYear, month: selectedMonth } = getDateFromSlider(sliderValue);
    const displayDate = sliderValue === totalMonths
        ? 'Latest'
        : `${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (data) { setIsUpdating(true); } else { setInitialLoading(true); }
                setError(null);

                const { year, month } = getDateFromSlider(debouncedSliderValue);
                const dateParam = debouncedSliderValue === totalMonths
                    ? 'latest'
                    : `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

                const [regimeDataResponse, yieldCurveInversionResponse, customRegimeResponse, percentileChangesResponse] = await Promise.all([
                    fetch(`/api/regime-data?date=${dateParam}`),
                    fetch(`/api/yield-curve-inversion?date=${dateParam}`),
                    fetch('/api/custom-regime-state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ thresholds, targetDate: dateParam }),
                    }),
                    fetch(`/api/percentile-changes?date=${dateParam}`),
                ]);

                if (!regimeDataResponse.ok) throw new Error('Failed to fetch regime data');

                const result = await regimeDataResponse.json();
                const regimeData: RegimeData = {
                    fedFunds: result.fedFunds || emptyMetric(),
                    irx: result.irx || emptyMetric(),
                    tnx: result.tnx || emptyMetric(),
                    cpi: result.cpi || emptyMetric(),
                    eyp5yr: result.eyp5yr || emptyMetric(),
                    rey5yr: result.rey5yr || emptyMetric(),
                    real10Y: result.real10Y || emptyMetric(),
                    real3M: result.real3M || emptyMetric(),
                    realM2: result.realM2 || emptyMetric(),
                    yieldCurve: result.yieldCurve || emptyMetric(),
                    pe5yr: result.pe5yr || emptyMetric(),
                    ey5yr: result.ey5yr || emptyMetric(),
                    slope200MA: result.slope200MA || emptyMetric(),
                    slope500MA: result.slope500MA || emptyMetric(),
                    divergence200MA: result.divergence200MA || emptyMetric(),
                    daysAbove200MA: result.daysAbove200MA || emptyMetric(),
                    slopeStreak200MA: result.slopeStreak200MA || emptyMetric()
                };
                setData(regimeData);

                if (customRegimeResponse.ok) {
                    setRegimeState(await customRegimeResponse.json());
                }

                if (yieldCurveInversionResponse.ok) {
                    setYieldCurveInversion(await yieldCurveInversionResponse.json());
                }

                if (percentileChangesResponse.ok) {
                    setPercentileChanges(await percentileChangesResponse.json());
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setInitialLoading(false);
                setIsUpdating(false);
            }
        };
        fetchData();
    }, [debouncedSliderValue, totalMonths, thresholds]);

    // Check if thresholds differ from defaults
    const isCustom = JSON.stringify(thresholds) !== JSON.stringify(DEFAULT_THRESHOLDS);

    // Loading / error states
    if (initialLoading || error || !data) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-light tracking-wider mb-2"
                        style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}>
                        CUSTOM REGIME ENGINE
                    </h2>
                    <p className="text-sm font-light text-muted-foreground tracking-widest uppercase mb-4"
                        style={{ letterSpacing: '0.2em' }}>
                        User-Defined Thresholds
                    </p>
                </div>
                <TimelineSlider
                    sliderValue={sliderValue} totalMonths={totalMonths}
                    startYear={startYear} currentYear={currentYear}
                    displayDate={displayDate} onSliderChange={setSliderValue}
                />
                {initialLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-red-500 font-medium mb-2">Error loading data</p>
                        <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
                    </div>
                )}
            </div>
        );
    }

    // Run custom engine
    const flowTrendState = calculateFlowTrendState(
        data.slope200MA.value,
        data.divergence200MA.value,
        data.slopeStreak200MA.value
    );

    const conditions = {
        real3M: data.real3M.value,
        realM2: data.realM2.value,
        rey: data.rey5yr.value,
        eyp: data.eyp5yr.value,
        real10Y: data.real10Y.value,
        liquidityScore: 0,
        stage: flowTrendState.stage.label,
        pressure: flowTrendState.pressure.label,
        risk: flowTrendState.risk.label,
        direction: flowTrendState.direction.label,
        trendAge: data.slopeStreak200MA.value,
        slope200MA: data.slope200MA.value
    };

    // Use server-side regime state (walks full timeline with custom thresholds)
    const customRegimeState = regimeState
        ? { regime: regimeState.regime as RegimeFamily, entryDate: regimeState.entryDate, triggerReason: regimeState.triggerReason }
        : { regime: 'None' as RegimeFamily, entryDate: displayDate, triggerReason: 'Loading...' };

    const regimeMetadata = REGIME_METADATA[customRegimeState.regime as RegimeFamily];

    // Build trigger descriptions from custom thresholds for the active regime
    const triggerDescriptions = buildTriggerDescriptions(customRegimeState.regime as RegimeFamily, thresholds);

    const displayRegimeState = {
        regime: customRegimeState.regime,
        entryDate: customRegimeState.entryDate,
        currentDate: displayDate,
        daysInRegime: regimeState?.daysInRegime ?? 0,
        triggerReason: customRegimeState.triggerReason,
        conditions: {
            real3M: data.real3M.value,
            realM2: data.realM2.value,
            rey: data.rey5yr.value,
            eyp: data.eyp5yr.value,
            real10Y: data.real10Y.value,
            stage: flowTrendState.stage.label,
            pressure: flowTrendState.pressure.label,
            risk: flowTrendState.risk.label,
            direction: flowTrendState.direction.label,
            yieldCurve: data.yieldCurve.value,
            slope500MAPercentile: data.slope500MA.percentile,
            slope200MA: data.slope200MA.value
        }
    };

    // Build structural signals for the flags bar
    interface Signal {
        type: 'warning' | 'extreme';
        short: string;
        message: string;
    }

    const signals: Signal[] = [];

    if (yieldCurveInversion?.isInverted) {
        signals.push({
            type: 'warning',
            short: 'YC INV',
            message: `Yield Curve Inverted (${displayRegimeState.conditions.yieldCurve?.toFixed(2)}%) — historically a leading recession indicator.`
        });
    } else if (yieldCurveInversion?.monthsSinceUninversion != null && yieldCurveInversion.monthsSinceUninversion <= 18) {
        const mo = 18 - yieldCurveInversion.monthsSinceUninversion;
        signals.push({
            type: 'warning',
            short: `YC -${mo}mo`,
            message: `Yield Curve Recently Uninverted — ${mo} months remaining in the 18-month recession watch window.`
        });
    }

    if (displayRegimeState.conditions.eyp != null && displayRegimeState.conditions.eyp < -2) {
        signals.push({
            type: 'warning',
            short: `EYP ${displayRegimeState.conditions.eyp.toFixed(1)}%`,
            message: `Earnings Yield Premium is ${displayRegimeState.conditions.eyp.toFixed(2)}% — equities are significantly below the risk-free rate.`
        });
    }

    if (displayRegimeState.conditions.slope500MAPercentile != null && displayRegimeState.conditions.slope500MAPercentile > 85) {
        signals.push({
            type: 'warning',
            short: 'Overvalued',
            message: `500-Day MA slope is at the ${displayRegimeState.conditions.slope500MAPercentile.toFixed(0)}th percentile — trend pressure is historically elevated.`
        });
    }

    if (displayRegimeState.conditions.slope200MA != null && displayRegimeState.conditions.slope200MA < -0.02) {
        signals.push({
            type: 'extreme',
            short: '200MA ↓',
            message: `200-Day MA slope is negative (${displayRegimeState.conditions.slope200MA.toFixed(3)}) — the long-term trend is declining.`
        });
    }

    const percentileFlagsForBar = Object.values(percentileChanges)
        .filter(item => item.delta !== null && Math.abs(item.delta) > 10)
        .map(item => ({ label: item.label, delta: item.delta as number }));

    const liquidityRegime = calculateLiquidityRegime(
        data.real3M.value, data.real10Y.value,
        data.yieldCurve.value, data.realM2.value
    );
    const valuationRegime = calculateValuationRegime(
        data.eyp5yr.value, data.rey5yr.value
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-light tracking-wider mb-2"
                    style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}>
                    CUSTOM REGIME ENGINE
                </h2>
                <p className="text-sm font-light text-muted-foreground tracking-widest uppercase mb-4"
                    style={{ letterSpacing: '0.2em' }}>
                    User-Defined Thresholds
                </p>
                <div className="flex gap-2">
                    <CustomRegimeModal thresholds={thresholds} onApply={handleApplyThresholds} />
                    <RegimeModal />
                    <RegimeFlagsModal />
                </div>
                {isCustom && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Custom thresholds active
                    </div>
                )}
                {showApplied && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium animate-fade-in">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Engine recalculated with new thresholds
                    </div>
                )}
            </div>

            {/* Active Regime State — above timeline */}
            {regimeMetadata && (
                <div className="mb-6">
                    <RegimeStateDisplay
                        regime={displayRegimeState.regime}
                        entryDate={displayRegimeState.entryDate}
                        currentDate={displayRegimeState.currentDate}
                        daysInRegime={displayRegimeState.daysInRegime}
                        triggerReason={displayRegimeState.triggerReason}
                        description={regimeMetadata.description}
                        guidance={regimeMetadata.guidance}
                        color={regimeMetadata.color}
                        conditions={displayRegimeState.conditions}
                        triggerDescriptions={triggerDescriptions}
                    />
                    <RegimeFlagsBar
                        signals={signals}
                        percentileFlags={percentileFlagsForBar}
                    />
                </div>
            )}

            <TimelineSlider
                sliderValue={sliderValue} totalMonths={totalMonths}
                startYear={startYear} currentYear={currentYear}
                displayDate={displayDate} onSliderChange={setSliderValue}
            />

            <RegimeTimelineBarChart compact />

            {/* Regime Proximity — below active regime */}
            <div className="mt-6">
                <div className="flex items-center justify-center gap-2 pb-2 mb-3 border-b border-border">
                    <button
                        onClick={() => setShowProximity(!showProximity)}
                        className="text-base font-medium hover:text-primary transition-colors flex items-center gap-2"
                    >
                        <span>Regime Proximity</span>
                        <svg className={`w-4 h-4 transition-transform ${showProximity ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div className="relative group">
                        <svg className="w-4 h-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-lg bg-popover border border-border shadow-lg text-xs text-muted-foreground leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            <p className="font-semibold text-foreground mb-1.5">How proximity is calculated</p>
                            <p className="mb-1.5">Each regime has entry conditions (e.g. REY ≥ 3%). For each condition, proximity measures how close the current metric value is to its trigger threshold, scaled 0–100% within a defined approach range.</p>
                            <p className="mb-1.5">When a regime has multiple conditions:</p>
                            <ul className="space-y-0.5 mb-1.5">
                                <li><span className="text-foreground font-medium">AND logic</span> — overall = minimum across conditions (the bottleneck)</li>
                                <li><span className="text-foreground font-medium">OR logic</span> — overall = maximum across conditions (any one suffices)</li>
                            </ul>
                            <p>100% means the threshold is met or exceeded. Click a regime row to see per-condition breakdowns.</p>
                        </div>
                    </div>
                </div>
                {showProximity && (
                    <RegimeProximity
                        data={data}
                        currentRegime={displayRegimeState?.regime}
                    />
                )}
            </div>

            {/* Input Variables + Classification */}
            <div className="space-y-6 mt-6">
                <div>
                    <button
                        onClick={() => setShowInputVariables(!showInputVariables)}
                        className="w-full text-base font-medium text-center pb-2 mb-3 border-b border-border hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Input Variables</span>
                        <svg className={`w-4 h-4 transition-transform ${showInputVariables ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showInputVariables && (
                        <RegimeInputVariables data={data} isUpdating={isUpdating} />
                    )}
                </div>

                <div>
                    <button
                        onClick={() => setShowPercentileChanges(!showPercentileChanges)}
                        className="w-full text-base font-medium text-center pb-2 mb-3 border-b border-border hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Percentile Changes</span>
                        <svg className={`w-4 h-4 transition-transform ${showPercentileChanges ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showPercentileChanges && (
                        <RegimePercentileChanges date={
                            debouncedSliderValue === totalMonths
                                ? 'latest'
                                : (() => {
                                    const { year, month } = getDateFromSlider(debouncedSliderValue);
                                    return `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
                                })()
                        } />
                    )}
                </div>

                <div>
                    <button
                        onClick={() => setShowClassification(!showClassification)}
                        className="w-full text-base font-medium text-center pb-2 mb-3 border-b border-border hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Regime Classification</span>
                        <svg className={`w-4 h-4 transition-transform ${showClassification ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showClassification && (
                        <RegimeClassification
                            data={data}
                            liquidityRegime={liquidityRegime}
                            valuationRegime={valuationRegime}
                            flowTrendState={flowTrendState}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
