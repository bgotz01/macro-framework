'use client';

import { useState } from 'react';
import ChartNavigation, { ChartType } from '@/components/chart-navigation';
import YieldChart from '@/components/yield-chart';
import EconomicsChart from '@/components/economics-chart';
import EquitiesChart from '@/components/equities-chart';
import DBChart from '@/components/db-chart';
import ReturnsChart from '@/components/returns-chart';

export default function ChartPage() {
    const [currentChart, setCurrentChart] = useState<ChartType>('yields');

    const renderChart = () => {
        switch (currentChart) {
            case 'yields':
                return <YieldChart height={500} />;
            case 'economics':
                return <EconomicsChart height={500} />;
            case 'equities':
                return <EquitiesChart height={500} />;
            case 'returns':
                return <ReturnsChart />;
            case 'all':
                return <DBChart height={500} />;
            default:
                return <YieldChart height={500} />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Macro Charts
                    </h1>
                    <p className="text-muted-foreground">
                        Explore macroeconomic data across different asset classes and time periods
                    </p>
                </div>

                <ChartNavigation
                    currentChart={currentChart}
                    onChartChange={setCurrentChart}
                />

                {renderChart()}
            </div>
        </div>
    );
}
