'use client';

import { useState } from 'react';
import SignalTrackerSection from './signal-tracker-section';
import SignalDetector from './signal-detector';
import PercentileMetricsSection from './percentile-metrics-section';
import TimelineSlider from './regime-timeline-slider';
import RealMetricsSidebar from './real-metrics-sidebar';
import EditableMetrics from './editable-metrics';
import { usePercentileData } from './use-percentile-data';
import { useDebouncedValue } from './use-debounced-value';
import { getDateFromSlider, formatDisplayDate, formatDateString } from './date-utils';
import type { PercentileValues, MetricValues } from './types';

interface RealRegimeMatrixProps {
    initialValues: PercentileValues;
    initialMetricValues: MetricValues;
    sliderValue: number;
    onSliderChange: (value: number) => void;
}

export default function RealRegimeMatrix({ initialValues, initialMetricValues, sliderValue, onSliderChange }: RealRegimeMatrixProps) {
    const [editableMetrics, setEditableMetrics] = useState<{
        tnx: number | null;
        irx: number | null;
        cpi: number | null;
        ey5yr: number | null;
        real10Y: number | null;
        real3M: number | null;
        rey5yr: number | null;
        eyp5yr: number | null;
        yieldCurve: number | null;
    } | null>(null);

    const startYear = 1960;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const totalMonths = (currentYear - startYear) * 12 + currentMonth;
    const totalMonthsWithLatest = totalMonths + 1; // Add one extra position for "Latest"

    const debouncedSliderValue = useDebouncedValue(sliderValue);

    // Check if we're on the "Latest" position
    const isLatestPosition = sliderValue > totalMonths;

    const { year: selectedYear, month: selectedMonth } = isLatestPosition
        ? { year: currentYear, month: currentMonth }
        : getDateFromSlider(sliderValue, startYear);
    const { year: debouncedYear, month: debouncedMonth } = getDateFromSlider(debouncedSliderValue, startYear);

    const { values, metricValues, loading } = usePercentileData({
        debouncedSliderValue,
        totalMonths,
        debouncedYear,
        debouncedMonth,
        initialValues,
        initialMetricValues,
    });

    // Use editable metrics if on "Latest" position and metrics are set
    const displayMetricValues = isLatestPosition && editableMetrics ? {
        ...metricValues,
        real10Y: { value: editableMetrics.real10Y, yoy: null },
        real3M: { value: editableMetrics.real3M, yoy: null },
        rey5yr: { value: editableMetrics.rey5yr, yoy: null },
        eyp5yr: { value: editableMetrics.eyp5yr, yoy: null },
        tnx: { value: editableMetrics.tnx, yoy: null },
        irx: { value: editableMetrics.irx, yoy: null },
    } : metricValues;

    const displayDate = isLatestPosition ? 'Latest' : formatDisplayDate(selectedYear, selectedMonth);
    const debouncedDateString = formatDateString(debouncedYear, debouncedMonth);

    return (
        <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
                {/* Timeline Slider */}
                <TimelineSlider
                    sliderValue={sliderValue}
                    totalMonths={totalMonthsWithLatest}
                    startYear={startYear}
                    currentYear={currentYear}
                    displayDate={displayDate}
                    onSliderChange={onSliderChange}
                />

                {/* Editable Metrics - only show when on "Latest" position */}
                {isLatestPosition && (
                    <EditableMetrics onMetricsChange={setEditableMetrics} />
                )}

                {/* Regime Detector */}
                <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg">
                    <SignalDetector
                        metricValues={displayMetricValues}
                        selectedDate={debouncedDateString}
                    />
                </div>

                {/* Signal Trackers */}
                <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg space-y-4">
                    <SignalTrackerSection
                        title="Real Metrics"
                        metricValues={displayMetricValues}
                        type="real-metrics"
                    />
                    <SignalTrackerSection
                        title="Market Spreads"
                        metricValues={displayMetricValues}
                        type="market-spreads"
                    />
                </div>

                {/* Percentile Metrics Section */}
                <PercentileMetricsSection
                    values={values}
                    metricValues={displayMetricValues}
                    loading={loading}
                />
            </div>

            {/* Right Sidebar */}
            <div className="w-48 flex-shrink-0">
                <RealMetricsSidebar metricValues={displayMetricValues} />
            </div>
        </div>
    );
}
