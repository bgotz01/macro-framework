'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/data-table';
import { Card } from '@/components/ui/card';

interface SeriesInfo {
    asset_class: string;
    series_name: string;
    display_name: string;
}

export default function DataPage() {
    const [assetClasses, setAssetClasses] = useState<string[]>([]);
    const [allSeries, setAllSeries] = useState<SeriesInfo[]>([]);
    const [filteredSeries, setFilteredSeries] = useState<SeriesInfo[]>([]);

    const [selectedAssetClass, setSelectedAssetClass] = useState<string>('');
    const [selectedSeries, setSelectedSeries] = useState<string>('');
    const [selectedColumn, setSelectedColumn] = useState<string>('Value');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        fetchSeriesList();
    }, []);

    useEffect(() => {
        if (selectedAssetClass) {
            const filtered = allSeries.filter(s => s.asset_class === selectedAssetClass);
            setFilteredSeries(filtered);
            setSelectedSeries('');
        } else {
            setFilteredSeries(allSeries);
        }
    }, [selectedAssetClass, allSeries]);

    const fetchSeriesList = async () => {
        try {
            const response = await fetch('/api/series-list');
            if (!response.ok) throw new Error('Failed to fetch series list');

            const data = await response.json();
            setAssetClasses(data.assetClasses);
            setAllSeries(data.series);
            setFilteredSeries(data.series);
        } catch (err) {
            console.error('Error fetching series list:', err);
        }
    };

    const handleReset = () => {
        setSelectedAssetClass('');
        setSelectedSeries('');
        setSelectedColumn('Value');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        Data Explorer
                    </h1>
                    <p className="text-muted-foreground">
                        Browse and filter macroeconomic data from the database
                    </p>
                </div>

                {/* Filters */}
                <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Asset Class
                            </label>
                            <select
                                value={selectedAssetClass}
                                onChange={(e) => setSelectedAssetClass(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">All Asset Classes</option>
                                {assetClasses.map(ac => (
                                    <option key={ac} value={ac}>
                                        {ac.charAt(0).toUpperCase() + ac.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Series
                            </label>
                            <select
                                value={selectedSeries}
                                onChange={(e) => setSelectedSeries(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={!selectedAssetClass}
                            >
                                <option value="">All Series</option>
                                {filteredSeries.map(s => (
                                    <option key={`${s.asset_class}-${s.series_name}`} value={s.series_name}>
                                        {s.display_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Column
                            </label>
                            <select
                                value={selectedColumn}
                                onChange={(e) => setSelectedColumn(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="Value">Value</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                        >
                            Reset Filters
                        </button>
                        {(selectedAssetClass || selectedSeries || selectedColumn !== 'Value' || startDate || endDate) && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <span>Active filters applied</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Data Table */}
                <DataTable
                    assetClass={selectedAssetClass || undefined}
                    seriesName={selectedSeries || undefined}
                    columnName={selectedColumn || undefined}
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                />
            </div>
        </div>
    );
}
