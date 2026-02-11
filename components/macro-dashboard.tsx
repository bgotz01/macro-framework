'use client';

import { useState } from 'react';
import MacroChart, { AssetClass } from './charts/macro-chart';
import { TimePeriod } from './charts/chart';

interface MacroDashboardProps {
    className?: string;
}

const ASSET_CLASSES: { key: AssetClass; title: string; description: string; icon: string }[] = [
    {
        key: 'bonds',
        title: 'Bond Yields',
        description: 'Government bond yields across countries and maturities',
        icon: '📈'
    },
    {
        key: 'fx',
        title: 'Foreign Exchange',
        description: 'Major currency pairs and cross rates',
        icon: '💱'
    },
    {
        key: 'equities',
        title: 'Equity Indexes',
        description: 'Stock market indices and sector performance',
        icon: '📊'
    },
    {
        key: 'macro',
        title: 'Macro Indicators',
        description: 'Inflation, employment, and economic growth data',
        icon: '🏛️'
    },
    {
        key: 'moneysupply',
        title: 'Money Supply',
        description: 'Central bank money supply across major economies',
        icon: '💰'
    }
];

const TIME_PERIODS: { key: TimePeriod; label: string }[] = [
    { key: '2yr', label: '2 Years' },
    { key: '5yr', label: '5 Years' },
    { key: '10yr', label: '10 Years' },
    { key: '20yr', label: '20 Years' },
    { key: 'all', label: 'All Time' }
];

export default function MacroDashboard({ className = '' }: MacroDashboardProps) {
    const [selectedAssetClass, setSelectedAssetClass] = useState<AssetClass>('bonds');
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('5yr');
    const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Controls */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Asset Class Selector */}
                    <div>
                        <h3 className="text-sm font-medium text-card-foreground mb-3">Asset Class</h3>
                        <div className="flex flex-wrap gap-2">
                            {ASSET_CLASSES.map((assetClass) => (
                                <button
                                    key={assetClass.key}
                                    onClick={() => setSelectedAssetClass(assetClass.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${selectedAssetClass === assetClass.key
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    <span>{assetClass.icon}</span>
                                    {assetClass.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Period & View Mode */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Time Period Selector */}
                        <div>
                            <h4 className="text-sm font-medium text-card-foreground mb-2">Time Period</h4>
                            <select
                                value={timePeriod}
                                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                {TIME_PERIODS.map((period) => (
                                    <option key={period.key} value={period.key}>
                                        {period.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View Mode Toggle */}
                        <div>
                            <h4 className="text-sm font-medium text-card-foreground mb-2">View</h4>
                            <div className="flex rounded-lg border border-border overflow-hidden">
                                <button
                                    onClick={() => setViewMode('single')}
                                    className={`px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'single'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-foreground hover:bg-muted'
                                        }`}
                                >
                                    Single
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'grid'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-foreground hover:bg-muted'
                                        }`}
                                >
                                    Grid
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Asset Class Description */}
                <div className="mt-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">
                            {ASSET_CLASSES.find(ac => ac.key === selectedAssetClass)?.icon}
                        </span>
                        <div>
                            <h4 className="font-medium text-card-foreground">
                                {ASSET_CLASSES.find(ac => ac.key === selectedAssetClass)?.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {ASSET_CLASSES.find(ac => ac.key === selectedAssetClass)?.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            {viewMode === 'single' ? (
                <MacroChart
                    assetClass={selectedAssetClass}
                    timePeriod={timePeriod}
                    height={500}
                    allowMultiSelect={true}
                />
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {ASSET_CLASSES.map((assetClass) => (
                        <MacroChart
                            key={assetClass.key}
                            assetClass={assetClass.key}
                            timePeriod={timePeriod}
                            height={350}
                            allowMultiSelect={false}
                            className="min-h-[400px]"
                        />
                    ))}
                </div>
            )}

            {/* Data Quality Indicators */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Data Quality & Coverage</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { metric: 'Data Sources', value: '15+', description: 'Central banks and agencies' },
                        { metric: 'Update Frequency', value: 'Daily', description: 'Market data refreshed daily' },
                        { metric: 'Historical Coverage', value: '60+ years', description: 'Long-term trend analysis' }
                    ].map((item, index) => (
                        <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                            <div className="text-2xl font-bold text-primary mb-1">{item.value}</div>
                            <div className="text-sm font-medium text-card-foreground mb-1">{item.metric}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}