'use client';

import { useState, useEffect } from 'react';
import ReturnsTable from '../../../components/returns-table';
import LunarReturnsTable from '../../../components/lunar-returns-table';

// Available equity indices
const EQUITY_INDICES = [
    { value: 'US/GSPC', label: 'S&P 500', fallbacks: ['US/SPX', 'GSPC', 'SPX'] },
    { value: 'US/IXIC', label: 'NASDAQ Composite', fallbacks: ['IXIC'] },
    { value: 'DJI', label: 'Dow Jones', fallbacks: ['US/DJI'] },
    { value: 'FTSE', label: 'FTSE 100', fallbacks: [] },
    { value: 'GDAXI', label: 'DAX', fallbacks: [] },
    { value: 'N225', label: 'Nikkei 225', fallbacks: [] },
    { value: 'HSI', label: 'Hang Seng', fallbacks: [] },
];

export default function ReturnsPage() {
    const [selectedIndex, setSelectedIndex] = useState('US/GSPC');
    const [data, setData] = useState<Array<{ date: string; value: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [selectedIndex]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Find the selected index config
            const indexConfig = EQUITY_INDICES.find(idx => idx.value === selectedIndex);
            if (!indexConfig) {
                throw new Error('Invalid index selected');
            }

            // Try to load data from the selected series and its fallbacks
            const seriesToTry = [indexConfig.value, ...indexConfig.fallbacks];
            let rawData: any[] = [];

            for (const series of seriesToTry) {
                try {
                    const response = await fetch(`/api/data/equities?series=${encodeURIComponent(series)}`);
                    if (response.ok) {
                        const result = await response.json();
                        if (result.data && result.data.length > 0) {
                            rawData = result.data;
                            break;
                        }
                    }
                } catch (e) {
                    // Try next series
                    continue;
                }
            }

            if (rawData.length === 0) {
                throw new Error(`${indexConfig.label} data not found. Please ensure data is imported.`);
            }

            // Convert data to sorted array with dates
            const sortedData = rawData
                .map((point: any) => ({
                    date: new Date(point.date).toISOString().split('T')[0],
                    value: point.Value || point.Close || point.value
                }))
                .sort((a, b) => a.date.localeCompare(b.date));

            setData(sortedData);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const selectedIndexLabel = EQUITY_INDICES.find(idx => idx.value === selectedIndex)?.label || 'S&P 500';

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Analysis • Annual Returns
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    {selectedIndexLabel} Annual Returns
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Calendar year vs Chinese lunar year performance since 1990
                </p>
            </div>

            {/* Index Selector */}
            <div className="flex justify-center mb-12">
                <div className="inline-flex flex-col gap-2">
                    <label className="text-sm font-medium text-muted-foreground text-center">
                        Select Index
                    </label>
                    <select
                        value={selectedIndex}
                        onChange={(e) => setSelectedIndex(e.target.value)}
                        className="px-6 py-3 rounded-lg bg-card text-card-foreground border-2 border-border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 font-medium text-base cursor-pointer"
                        disabled={loading}
                    >
                        {EQUITY_INDICES.map(index => (
                            <option key={index.value} value={index.value}>
                                {index.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="p-6 rounded-2xl border-2 border-red-500/30 bg-red-50 dark:bg-red-950">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
            )}

            {/* Summary Stats */}
            {!loading && !error && data.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6 mb-12" key={selectedIndex}>
                    <ReturnsTable data={data} indexName={selectedIndexLabel} />
                    <LunarReturnsTable data={data} indexName={selectedIndexLabel} />
                </div>
            )}
        </div>
    );
}
