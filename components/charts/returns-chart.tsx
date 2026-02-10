'use client';

import { useState, useEffect } from 'react';
import CyclicalReturns from '../cyclical-returns';

export type ReturnAssetClass = 'equities' | 'commodities' | 'crypto' | 'volatility';

const ASSET_CLASSES: { value: ReturnAssetClass; label: string }[] = [
    { value: 'equities', label: 'Equities' },
    { value: 'commodities', label: 'Commodities' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'volatility', label: 'Volatility' }
];

export default function ReturnsChart() {
    const [assetClass, setAssetClass] = useState<ReturnAssetClass>('equities');
    const [availableSeries, setAvailableSeries] = useState<Array<{ series_name: string; display_name: string }>>([]);
    const [selectedSeries, setSelectedSeries] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('1970-01-01');
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Load available series when asset class changes
    useEffect(() => {
        const loadSeries = async () => {
            try {
                const response = await fetch(`/api/data/${assetClass}`);
                if (!response.ok) {
                    throw new Error('Failed to load series list');
                }
                const result = await response.json();
                const seriesWithNames = result.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name
                }));
                setAvailableSeries(seriesWithNames);

                // Auto-select S&P 500 (US/GSPC) if available, otherwise first series
                if (seriesWithNames.length > 0) {
                    const sp500 = seriesWithNames.find((s: { series_name: string; display_name: string }) => s.series_name === 'US/GSPC');
                    setSelectedSeries(sp500 ? sp500.series_name : seriesWithNames[0].series_name);
                }
            } catch (err) {
                console.error('Error loading series:', err);
                setAvailableSeries([]);
            }
        };

        loadSeries();
    }, [assetClass]);

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                            Asset Class
                        </label>
                        <select
                            value={assetClass}
                            onChange={(e) => setAssetClass(e.target.value as ReturnAssetClass)}
                            className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {ASSET_CLASSES.map(ac => (
                                <option key={ac.value} value={ac.value}>
                                    {ac.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                            Time Series
                        </label>
                        <select
                            value={selectedSeries}
                            onChange={(e) => setSelectedSeries(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={availableSeries.length === 0}
                        >
                            {availableSeries.map(series => (
                                <option key={series.series_name} value={series.series_name}>
                                    {series.display_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-card-foreground mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Chart */}
            {selectedSeries && (
                <CyclicalReturns
                    assetClass={assetClass}
                    seriesName={selectedSeries}
                    startDate={startDate}
                    endDate={endDate}
                    height={500}
                />
            )}
        </div>
    );
}
