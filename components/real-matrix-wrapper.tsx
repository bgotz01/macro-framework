'use client';

import { useState } from 'react';
import RealPercentileMatrix from './real-percentile-matrix';

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

interface MetricValues {
    cpi: { value: number | null; yoy: number | null };
    fedFunds: { value: number | null; yoy: number | null };
    tnx: { value: number | null; yoy: number | null };
    irx: { value: number | null; yoy: number | null };
    pe5yr: { value: number | null; yoy: number | null };
    ey5yr: { value: number | null; yoy: number | null };
    realYield: { value: number | null; yoy: number | null };
    realYield3m: { value: number | null; yoy: number | null };
    rey5yr: { value: number | null; yoy: number | null };
    eyp5yr: { value: number | null; yoy: number | null };
}

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
            <RealPercentileMatrix
                initialValues={initialPercentiles}
                initialMetricValues={initialValues}
                sliderValue={sliderValue}
                onSliderChange={setSliderValue}
            />
        </div>
    );
}
