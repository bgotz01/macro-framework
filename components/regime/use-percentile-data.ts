import { useState, useEffect } from 'react';
import type { PercentileValues, MetricValues } from './types';

interface UsePercentileDataProps {
    debouncedSliderValue: number;
    totalMonths: number;
    debouncedYear: number;
    debouncedMonth: number;
    initialValues: PercentileValues;
    initialMetricValues: MetricValues;
}

export function usePercentileData({
    debouncedSliderValue,
    totalMonths,
    debouncedYear,
    debouncedMonth,
    initialValues,
    initialMetricValues,
}: UsePercentileDataProps) {
    const [values, setValues] = useState<PercentileValues>(initialValues);
    const [metricValues, setMetricValues] = useState<MetricValues>(initialMetricValues);
    const [loading, setLoading] = useState(false);

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
                    real10Y: result.realYield?.percentileRank ?? null,
                    real3M: result.realYield3m?.percentileRank ?? null,
                    rey5yr: result.rey5yr?.percentileRank ?? null,
                    eyp5yr: result.eyp5yr?.percentileRank ?? null,
                    yieldCurve: result.yieldCurve3M?.percentileRank ?? null,
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
                    real10Y: {
                        value: result.realYield?.value ?? null,
                        yoy: result.realYield?.yoyPercentileChange ?? null
                    },
                    real3M: {
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
                    yieldCurve: {
                        value: result.yieldCurve3M?.value ?? null,
                        yoy: result.yieldCurve3M?.yoyPercentileChange ?? null
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

    return { values, metricValues, loading };
}
