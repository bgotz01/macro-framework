'use client';

import { useState } from 'react';
import RealRegimeMatrix from './real-regime-matrix';
import type { PercentileValues, MetricValues } from './types';

interface RealMatrixWrapperProps {
    initialPercentiles: PercentileValues;
    initialValues: MetricValues;
    latestDataDate?: string; // Format: YYYY-MM-DD
}

export default function RealMatrixWrapper({ initialPercentiles, initialValues, latestDataDate }: RealMatrixWrapperProps) {
    const startYear = 1960;

    // Use the latest data date if provided, otherwise fall back to current date
    let currentYear: number;
    let currentMonth: number;

    if (latestDataDate) {
        const latestDate = new Date(latestDataDate);
        currentYear = latestDate.getFullYear();
        currentMonth = latestDate.getMonth();
    } else {
        const currentDate = new Date();
        currentYear = currentDate.getFullYear();
        currentMonth = currentDate.getMonth();
    }

    const totalMonths = (currentYear - startYear) * 12 + currentMonth;

    const [sliderValue, setSliderValue] = useState(totalMonths);

    return (
        <div className="space-y-6">
            <RealRegimeMatrix
                initialValues={initialPercentiles}
                initialMetricValues={initialValues}
                sliderValue={sliderValue}
                onSliderChange={setSliderValue}
            />
        </div>
    );
}
