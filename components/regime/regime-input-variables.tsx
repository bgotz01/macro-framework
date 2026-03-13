'use client';

import { MetricCard } from './regime-parameters-cards';
import { formatValue, formatPlainNumber, formatDate } from './regime-parameters-utils';
import type { RegimeData } from './regime-parameters-types';

interface RegimeInputVariablesProps {
    data: RegimeData;
    isUpdating: boolean;
}

export default function RegimeInputVariables({ data, isUpdating }: RegimeInputVariablesProps) {
    return (
        <div className={`transition-opacity duration-200 ${isUpdating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
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
                    label="Real M2 YoY"
                    value={formatValue(data.realM2.value)}
                    percentile={data.realM2.percentile}
                    date={formatDate(data.realM2.date)}
                    invertQuartiles
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
    );
}
