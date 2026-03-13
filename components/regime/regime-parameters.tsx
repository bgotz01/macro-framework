//components/regime/regime-parameters.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    calculateLiquidityRegime,
    calculateValuationRegime
} from '@/lib/regime-config';
import {
    calculateFlowTrendState
} from '@/lib/regime-config/flow-trend-config';
import { REGIME_METADATA, type RegimeFamily } from '@/lib/regime-state-machine';
import MethodologyModal from './methodology-modal';
import RegimeModal from './regime-modal';
import TimelineSlider from './regime-timeline-slider';
import RegimeStateDisplay from './regime-state-display';
import RegimeInputVariables from './regime-input-variables';
import RegimeClassification from './regime-classification';
import {
    emptyMetric,
    formatDate
} from './regime-parameters-utils';
import type { RegimeData } from './regime-parameters-types';

export default function RegimeParameters() {
    const startYear = 1960;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const totalMonths = (currentYear - startYear) * 12 + currentMonth;

    const [sliderValue, setSliderValue] = useState<number>(totalMonths);
    const [debouncedSliderValue, setDebouncedSliderValue] = useState<number>(totalMonths);
    const [data, setData] = useState<RegimeData | null>(null);
    const [regimeState, setRegimeState] = useState<any>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInputVariables, setShowInputVariables] = useState(true);

    // Debounce slider value to prevent excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSliderValue(sliderValue);
        }, 150);

        return () => clearTimeout(timer);
    }, [sliderValue]);

    // Calculate date from slider value
    const getDateFromSlider = (value: number) => {
        const year = startYear + Math.floor(value / 12);
        const month = value % 12;
        return { year, month };
    };

    const { year: selectedYear, month: selectedMonth } = getDateFromSlider(sliderValue);
    const displayDate = sliderValue === totalMonths
        ? 'Latest'
        : `${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Only show updating state if we already have data
                if (data) {
                    setIsUpdating(true);
                } else {
                    setInitialLoading(true);
                }
                setError(null);

                const { year, month } = getDateFromSlider(debouncedSliderValue);
                const dateParam = debouncedSliderValue === totalMonths
                    ? 'latest'
                    : `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

                // Fetch both regime data and regime state in parallel
                const [regimeDataResponse, regimeStateResponse] = await Promise.all([
                    fetch(`/api/regime-data?date=${dateParam}`),
                    fetch(`/api/regime-state?date=${dateParam}`)
                ]);

                if (!regimeDataResponse.ok) {
                    throw new Error('Failed to fetch regime data');
                }

                const result = await regimeDataResponse.json();

                // Transform API response to RegimeData format
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
                    divergence200MA: result.divergence200MA || emptyMetric(),
                    daysAbove200MA: result.daysAbove200MA || emptyMetric(),
                    slopeStreak200MA: result.slopeStreak200MA || emptyMetric()
                };

                setData(regimeData);

                // Set regime state if available
                if (regimeStateResponse.ok) {
                    const regimeStateData = await regimeStateResponse.json();
                    setRegimeState(regimeStateData);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setInitialLoading(false);
                setIsUpdating(false);
            }
        };

        fetchData();
    }, [debouncedSliderValue, totalMonths]);

    if (initialLoading) {
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
                </div>
                <TimelineSlider
                    sliderValue={sliderValue}
                    totalMonths={totalMonths}
                    startYear={startYear}
                    currentYear={currentYear}
                    displayDate={displayDate}
                    onSliderChange={setSliderValue}
                />
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error || !data) {
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
                </div>
                <TimelineSlider
                    sliderValue={sliderValue}
                    totalMonths={totalMonths}
                    startYear={startYear}
                    currentYear={currentYear}
                    displayDate={displayDate}
                    onSliderChange={setSliderValue}
                />
                <div className="text-center py-12">
                    <p className="text-red-500 font-medium mb-2">Error loading data</p>
                    <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
                </div>
            </div>
        );
    }

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
        data.slopeStreak200MA.value
    );

    // Calculate regime on-the-fly if not available from database
    let displayRegimeState = regimeState;

    if (!regimeState) {
        // Calculate regime from current conditions
        const conditions = {
            real3M: data.real3M.value,
            realM2: data.realM2.value,
            rey: data.rey5yr.value,
            eyp: data.eyp5yr.value,
            real10Y: data.real10Y.value,
            stage: flowTrendState.stage.label,
            pressure: flowTrendState.pressure.label,
            risk: flowTrendState.risk.label,
            direction: flowTrendState.direction.label,
            trendAge: data.slopeStreak200MA.value
        };

        // Import and use the state machine logic
        const { determineNextRegime } = require('@/lib/regime-state-machine');
        const calculatedRegime = determineNextRegime(null, conditions, displayDate);

        displayRegimeState = {
            regime: calculatedRegime.regime,
            entryDate: calculatedRegime.entryDate,
            currentDate: displayDate,
            daysInRegime: 0,
            triggerReason: calculatedRegime.triggerReason,
            conditions: {
                real3M: conditions.real3M,
                realM2: conditions.realM2,
                rey: conditions.rey,
                eyp: conditions.eyp,
                real10Y: conditions.real10Y,
                stage: conditions.stage,
                pressure: conditions.pressure,
                risk: conditions.risk,
                direction: conditions.direction
            }
        };
    } else {
        // Update conditions with current data (API only has regime info, not live conditions)
        displayRegimeState = {
            ...regimeState,
            conditions: {
                real3M: data.real3M.value,
                realM2: data.realM2.value,
                rey: data.rey5yr.value,
                eyp: data.eyp5yr.value,
                real10Y: data.real10Y.value,
                stage: flowTrendState.stage.label,
                pressure: flowTrendState.pressure.label,
                risk: flowTrendState.risk.label,
                direction: flowTrendState.direction.label
            }
        };
    }

    const regimeMetadata = displayRegimeState ? REGIME_METADATA[displayRegimeState.regime as RegimeFamily] : null;

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
                <div className="flex gap-2">
                    <MethodologyModal />
                    <RegimeModal />
                </div>
            </div>

            {/* Date Picker */}
            <div className="flex items-center justify-center gap-3 mb-4">
                <label className="text-xs font-medium text-muted-foreground">
                    Jump to date:
                </label>
                <input
                    type="date"
                    min={`${startYear}-01-01`}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                        if (e.target.value) {
                            const selectedDate = new Date(e.target.value);
                            const year = selectedDate.getFullYear();
                            const month = selectedDate.getMonth();
                            const monthsFromStart = (year - startYear) * 12 + month;
                            setSliderValue(Math.min(monthsFromStart, totalMonths));
                        }
                    }}
                    className="px-3 py-1.5 rounded-md bg-muted text-card-foreground border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Timeline Slider */}
            <TimelineSlider
                sliderValue={sliderValue}
                totalMonths={totalMonths}
                startYear={startYear}
                currentYear={currentYear}
                displayDate={displayDate}
                onSliderChange={setSliderValue}
            />

            {/* Market Regime State */}
            {displayRegimeState && regimeMetadata && (
                <div className="mt-6">
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
                    />
                </div>
            )}

            <div className="space-y-6 mt-6">
                {/* Input Variables Row - Collapsible */}
                <div>
                    <button
                        onClick={() => setShowInputVariables(!showInputVariables)}
                        className="w-full text-base font-medium text-center pb-2 mb-3 border-b border-border hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Input Variables</span>
                        <svg
                            className={`w-4 h-4 transition-transform ${showInputVariables ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {showInputVariables && (
                        <RegimeInputVariables data={data} isUpdating={isUpdating} />
                    )}
                </div>

                {/* Regime Classification Section */}
                <RegimeClassification
                    data={data}
                    liquidityRegime={liquidityRegime}
                    valuationRegime={valuationRegime}
                    flowTrendState={flowTrendState}
                />
            </div>
        </div>
    );
}

