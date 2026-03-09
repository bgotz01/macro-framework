'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChartNavigation, { ChartType } from '@/components/charts/chart-navigation';
import YieldChart from '@/components/charts/yield-chart';
import EconomicsChart from '@/components/charts/economics-chart';
import EquitiesChart from '@/components/charts/equities-chart';
import ValuationsChart from '@/components/charts/valuations-chart';
import FXChart from '@/components/charts/fx-chart';
import DBChart from '@/components/charts/db-chart';
import ReturnsChart from '@/components/charts/returns-chart';
import VolatilityChart from '@/components/charts/volatility-chart';
import StockValuationChart from '@/components/charts/stock-valuation-chart';
import PercentileChart from '@/components/charts/percentile-chart';

function ChartPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const chartParam = searchParams.get('type') as ChartType | null;

    const [currentChart, setCurrentChart] = useState<ChartType>(
        chartParam && ['yields', 'economics', 'equities', 'valuations', 'fx', 'returns', 'volatility', 'stocks', 'percentile', 'all'].includes(chartParam)
            ? chartParam
            : 'yields'
    );

    // Update URL when chart changes
    const handleChartChange = (chartType: ChartType) => {
        setCurrentChart(chartType);
        router.push(`/chart?type=${chartType}`, { scroll: false });
    };

    // Sync state with URL changes (e.g., browser back/forward)
    useEffect(() => {
        if (chartParam && ['yields', 'economics', 'equities', 'valuations', 'fx', 'returns', 'volatility', 'stocks', 'percentile', 'all'].includes(chartParam)) {
            setCurrentChart(chartParam);
        }
    }, [chartParam]);

    const renderChart = () => {
        switch (currentChart) {
            case 'yields':
                return <YieldChart height={500} />;
            case 'economics':
                return <EconomicsChart height={500} />;
            case 'equities':
                return <EquitiesChart height={500} />;
            case 'valuations':
                return <ValuationsChart height={500} />;
            case 'fx':
                return <FXChart height={500} />;
            case 'returns':
                return <ReturnsChart />;
            case 'volatility':
                return <VolatilityChart />;
            case 'stocks':
                return <StockValuationChart height={500} />;
            case 'percentile':
                return <PercentileChart height={500} />;
            case 'all':
                return <DBChart height={500} />;
            default:
                return <YieldChart height={500} />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="page-title text-4xl font-bold text-foreground mb-2">
                            Macro Charts
                        </h1>
                        <p className="text-muted-foreground">
                            Explore macroeconomic data across different asset classes and time periods
                        </p>
                    </div>
                    <a
                        href="/chart/data"
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
                    >
                        View Data Table
                    </a>
                </div>

                <ChartNavigation
                    currentChart={currentChart}
                    onChartChange={handleChartChange}
                />

                {renderChart()}
            </div>
        </div>
    );
}

export default function ChartPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <ChartPageContent />
        </Suspense>
    );
}
