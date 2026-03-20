'use client';

import {
    getReal3MLabel,
    getReal10YLabel,
    getYieldCurveLabel,
    getEYPLabel,
    getRealEYLabel,
    getRealM2Label
} from '@/lib/regime-config';
import {
    SmallMetricCard,
    ClassificationCard,
    FlowTrendCard
} from './regime-parameters-cards';
import { formatValue, formatDate, formatDateFull } from './regime-parameters-utils';
import type { RegimeData } from './regime-parameters-types';

interface RegimeClassificationProps {
    data: RegimeData;
    liquidityRegime: any;
    valuationRegime: any;
    flowTrendState: any;
}

function getTrendPressurePercentileColor(percentile: number | null | undefined): string {
    if (percentile === null || percentile === undefined) return '#3b82f6';
    if (percentile > 90) return '#ef4444';       // red
    if (percentile > 75) return '#eab308';       // yellow
    if (percentile < 10) return '#15803d';       // dark green
    if (percentile < 25) return '#22c55e';       // light green
    return '#3b82f6';                            // blue
}

export default function RegimeClassification({
    data,
    liquidityRegime,
    valuationRegime,
    flowTrendState
}: RegimeClassificationProps) {
    return (
        <div>
            <div className="flex items-center justify-center pb-2 mb-4 border-b border-border">
                <h3 className="text-base font-medium">
                    Regime Classification
                </h3>
            </div>

            {/* Column Headers */}
            <div className="flex gap-4 mb-3">
                <div className="w-[180px] flex items-center justify-center">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</h4>
                </div>
                <div className="w-[240px] flex items-center justify-center">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classification</h4>
                </div>
                <div className="border-l-2 border-border mx-2" />
                <div className="flex-1 min-w-0 flex items-center justify-center">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metrics</h4>
                </div>
            </div>

            {/* Liquidity Row */}
            <div className="flex gap-4 mb-4">
                <div className="flex items-center justify-center w-[180px]">
                    <a href="/chart/percentile" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold hover:text-primary hover:underline transition-colors">Liquidity</a>
                </div>
                <div className="w-[240px]">
                    <ClassificationCard
                        regime={liquidityRegime.regime}
                    />
                </div>
                <div className="border-l-2 border-border mx-2" />
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-4 gap-2">
                        <SmallMetricCard
                            label="Real 3M"
                            concept="Policy Pressure"
                            value={formatValue(data.real3M.value)}
                            percentile={data.real3M.percentile}
                            date={formatDate(data.real3M.date)}
                            interpretation={getReal3MLabel(data.real3M.value)}
                            useValueForColor
                            rawValue={data.real3M.value}
                        />
                        <SmallMetricCard
                            label="Real 10Y"
                            concept="Capital Cost"
                            value={formatValue(data.real10Y.value)}
                            percentile={data.real10Y.percentile}
                            date={formatDate(data.real10Y.date)}
                            interpretation={getReal10YLabel(data.real10Y.value)}
                            useValueForColor
                            rawValue={data.real10Y.value}
                        />
                        <SmallMetricCard
                            label="Yield Curve"
                            concept="Credit Transmission"
                            value={formatValue(data.yieldCurve.value)}
                            percentile={data.yieldCurve.percentile}
                            date={formatDate(data.yieldCurve.date)}
                            interpretation={getYieldCurveLabel(data.yieldCurve.value)}
                            useValueForColor
                            rawValue={data.yieldCurve.value}
                        />
                        <SmallMetricCard
                            label="Real M2"
                            concept="Money Supply"
                            value={formatValue(data.realM2.value)}
                            percentile={data.realM2.percentile}
                            date={formatDate(data.realM2.date)}
                            interpretation={getRealM2Label(data.realM2.value)}
                            useValueForColor
                            rawValue={data.realM2.value}
                        />
                    </div>
                </div>
            </div>

            {/* Valuation Row */}
            <div className="flex gap-4 mb-4">
                <div className="flex items-center justify-center w-[180px]">
                    <a href="/chart/percentile" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold hover:text-primary hover:underline transition-colors">Valuation</a>
                </div>
                <div className="w-[240px]">
                    <ClassificationCard
                        regime={valuationRegime.regime}
                    />
                </div>
                <div className="border-l-2 border-border mx-2" />
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-3 gap-2">
                        <SmallMetricCard
                            label="EYP 5yr"
                            concept="Equity Yield Premium"
                            value={formatValue(data.eyp5yr.value)}
                            percentile={data.eyp5yr.percentile}
                            date={formatDate(data.eyp5yr.date)}
                            interpretation={getEYPLabel(data.eyp5yr.value)}
                            useValueForColor
                            rawValue={data.eyp5yr.value}
                        />
                        <SmallMetricCard
                            label="Real EY (5yr)"
                            concept="Real Earnings Yield"
                            value={formatValue(data.rey5yr.value)}
                            percentile={data.rey5yr.percentile}
                            date={formatDate(data.rey5yr.date)}
                            interpretation={getRealEYLabel(data.rey5yr.value)}
                            useValueForColor
                            rawValue={data.rey5yr.value}
                        />
                    </div>
                </div>
            </div>

            {/* Trend Pressure Row */}
            <div className="flex gap-4">
                <div className="flex items-center justify-center w-[180px]">
                    <a href="/chart?chart=divergence" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold hover:text-primary hover:underline transition-colors">Trend Pressure</a>
                </div>
                <div className="w-[240px]">
                    <FlowTrendCard flowTrendState={flowTrendState} />
                </div>
                <div className="border-l-2 border-border mx-2" />
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-4 gap-2">
                        <SmallMetricCard
                            label="Direction"
                            concept="200MA Slope"
                            value={formatValue(data.slope200MA.value, 2)}
                            percentile={data.slope200MA.percentile}
                            date={formatDateFull(data.slope200MA.date)}
                            interpretation={flowTrendState.direction.label}
                            customColor={getTrendPressurePercentileColor(data.slope200MA.percentile)}
                        />
                        <SmallMetricCard
                            label="Stage"
                            concept="Trend Age"
                            value={data.slopeStreak200MA.value !== null ? `${data.slopeStreak200MA.value.toFixed(0)} days` : 'N/A'}
                            percentile={data.slopeStreak200MA.percentile}
                            date={formatDateFull(data.slopeStreak200MA.date)}
                            interpretation={flowTrendState.stage.label}
                            customColor={getTrendPressurePercentileColor(data.slopeStreak200MA.percentile)}
                        />
                        <SmallMetricCard
                            label="Pressure"
                            concept="Distance from 200MA"
                            value={formatValue(data.divergence200MA.value)}
                            percentile={data.divergence200MA.percentile}
                            date={formatDateFull(data.divergence200MA.date)}
                            interpretation={flowTrendState.pressure.label}
                            customColor={getTrendPressurePercentileColor(data.divergence200MA.percentile)}
                        />
                        <SmallMetricCard
                            label="Days Above"
                            concept="Price vs 200MA"
                            value={data.daysAbove200MA.value !== null ? `${data.daysAbove200MA.value.toFixed(0)} days` : 'N/A'}
                            percentile={data.daysAbove200MA.percentile}
                            date={formatDateFull(data.daysAbove200MA.date)}
                            interpretation={data.daysAbove200MA.value !== null ? (data.daysAbove200MA.value > 0 ? 'Above' : 'Below') : 'N/A'}
                            customColor={getTrendPressurePercentileColor(data.daysAbove200MA.percentile)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
