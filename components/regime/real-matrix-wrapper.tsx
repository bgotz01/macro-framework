'use client';

import { useState } from 'react';
import RealRegimeMatrix from './real-regime-matrix';
import type { PercentileValues, MetricValues } from './types';

interface RealMatrixWrapperProps {
    initialPercentiles: PercentileValues;
    initialValues: MetricValues;
}

export default function RealMatrixWrapper({ initialPercentiles, initialValues }: RealMatrixWrapperProps) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const startYear = 1960;
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
