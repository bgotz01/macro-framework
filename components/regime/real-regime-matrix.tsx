'use client';

import RegimeTrackerSection from './regime-tracker-section';
import RegimeDetector from './regime-detector';
import RegimeFlags from './regime-flags';
import PercentileMetricsSection from './percentile-metrics-section';
import TimelineSlider from './regime-timeline-slider';
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
    const startYear = 1960;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const totalMonths = (currentYear - startYear) * 12 + currentMonth;

    const debouncedSliderValue = useDebouncedValue(sliderValue);

    const { year: selectedYear, month: selectedMonth } = getDateFromSlider(sliderValue, startYear);
    const { year: debouncedYear, month: debouncedMonth } = getDateFromSlider(debouncedSliderValue, startYear);

    const { values, metricValues, loading } = usePercentileData({
        debouncedSliderValue,
        totalMonths,
        debouncedYear,
        debouncedMonth,
        initialValues,
        initialMetricValues,
    });

    const displayDate = formatDisplayDate(selectedYear, selectedMonth);
    const debouncedDateString = formatDateString(debouncedYear, debouncedMonth);

    return (
        <div className="space-y-6">
            {/* Timeline Slider */}
            <TimelineSlider
                sliderValue={sliderValue}
                totalMonths={totalMonths}
                startYear={startYear}
                currentYear={currentYear}
                displayDate={displayDate}
                onSliderChange={onSliderChange}
            />

            {/* Regime Detector */}
            <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg">
                <RegimeDetector
                    metricValues={metricValues}
                />
            </div>

            {/* Regime Flags */}
            <RegimeFlags selectedDate={debouncedDateString} />

            {/* Market Regime Trackers */}
            <div className="p-4 rounded-lg border border-border/50 bg-card shadow-lg space-y-4">
                <RegimeTrackerSection
                    title="Real Metrics"
                    metricValues={metricValues}
                    type="real-metrics"
                />
                <RegimeTrackerSection
                    title="Market Spreads"
                    metricValues={metricValues}
                    type="market-spreads"
                />
            </div>

            {/* Percentile Metrics Section */}
            <PercentileMetricsSection
                values={values}
                metricValues={metricValues}
                loading={loading}
            />
        </div>
    );
}
