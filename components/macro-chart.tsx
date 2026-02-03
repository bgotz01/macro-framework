'use client';

import { useState, useEffect } from 'react';
import Chart, { TimePeriod } from './chart';
import { DataService, ChartData } from '../lib/data-service';

export type AssetClass = 'bonds' | 'fx' | 'equities' | 'macro' | 'moneysupply';

interface MacroChartProps {
    assetClass: AssetClass;
    height?: number;
    className?: string;
    timePeriod?: TimePeriod;
    allowMultiSelect?: boolean;
    defaultFiles?: string[];
}

interface FileSelection {
    filename: string;
    selected: boolean;
    color: string;
}

const CHART_COLORS = [
    '#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea',
    '#0891b2', '#c2410c', '#059669', '#7c2d12', '#7c3aed'
];

export default function MacroChart({
    assetClass,
    height = 400,
    className = '',
    timePeriod = '5yr',
    allowMultiSelect = true,
    defaultFiles = []
}: MacroChartProps) {
    const [availableFiles, setAvailableFiles] = useState<FileSelection[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [combinedData, setCombinedData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load available files for the asset class
    useEffect(() => {
        const loadAvailableFiles = async () => {
            try {
                const files = await DataService.getDatasetsByAssetClass(assetClass);
                const fileSelections: FileSelection[] = files.map((filename, index) => ({
                    filename,
                    selected: defaultFiles.length > 0
                        ? defaultFiles.includes(filename)
                        : index === 0, // Select first file by default
                    color: CHART_COLORS[index % CHART_COLORS.length]
                }));

                setAvailableFiles(fileSelections);
                setSelectedFiles(
                    fileSelections
                        .filter(f => f.selected)
                        .map(f => f.filename)
                );
            } catch (err) {
                setError('Failed to load available files');
            }
        };

        loadAvailableFiles();
    }, [assetClass, defaultFiles]);

    // Load and combine selected datasets
    useEffect(() => {
        const loadData = async () => {
            if (selectedFiles.length === 0) {
                setCombinedData(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const filePaths = selectedFiles.map(filename => `${assetClass}/${filename}`);
                const datasets = await DataService.loadMultipleCSVs(filePaths);

                if (datasets.length === 1) {
                    setCombinedData(datasets[0]);
                } else {
                    const combined = DataService.combineDatasets(datasets);
                    setCombinedData(combined);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedFiles, assetClass]);

    const handleFileToggle = (filename: string) => {
        if (!allowMultiSelect) {
            setSelectedFiles([filename]);
            setAvailableFiles(prev => prev.map(f => ({
                ...f,
                selected: f.filename === filename
            })));
            return;
        }

        const isCurrentlySelected = selectedFiles.includes(filename);

        if (isCurrentlySelected && selectedFiles.length === 1) {
            // Don't allow deselecting the last file
            return;
        }

        setAvailableFiles(prev => prev.map(f =>
            f.filename === filename
                ? { ...f, selected: !f.selected }
                : f
        ));

        setSelectedFiles(prev =>
            isCurrentlySelected
                ? prev.filter(f => f !== filename)
                : [...prev, filename]
        );
    };

    const getAssetClassTitle = (assetClass: AssetClass): string => {
        const titles = {
            bonds: 'Bond Yields',
            fx: 'Foreign Exchange',
            equities: 'Equity Indexes',
            macro: 'Macro Indicators',
            moneysupply: 'Money Supply'
        };
        return titles[assetClass];
    };

    if (loading) {
        return (
            <div className={`p-6 rounded-2xl border border-border/50 bg-card ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-6 rounded-2xl border border-border/50 bg-card ${className}`}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-500 font-medium mb-2">Error loading data</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* File Selector */}
            {availableFiles.length > 1 && (
                <div className="p-4 rounded-xl border border-border/50 bg-card">
                    <h4 className="text-sm font-medium text-card-foreground mb-3">
                        {getAssetClassTitle(assetClass)} - Select Datasets
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {availableFiles.map((file) => (
                            <button
                                key={file.filename}
                                onClick={() => handleFileToggle(file.filename)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${file.selected
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                style={file.selected ? { backgroundColor: file.color } : {}}
                            >
                                {file.filename.replace('.csv', '').replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                    {allowMultiSelect && (
                        <p className="text-xs text-muted-foreground mt-2">
                            {selectedFiles.length > 1 ? 'Multiple datasets selected' : 'Select multiple datasets to compare'}
                        </p>
                    )}
                </div>
            )}

            {/* Chart */}
            {combinedData ? (
                <div className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-card-foreground mb-1">
                            {getAssetClassTitle(assetClass)}
                        </h3>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {selectedFiles.length} dataset{selectedFiles.length > 1 ? 's' : ''} selected
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {combinedData.data.length} data points • {timePeriod === 'all' ? 'All time' : timePeriod.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div style={{ height }}>
                        <Chart
                            filePath={`${assetClass}/${selectedFiles[0]}`}
                            height={height}
                            timePeriod={timePeriod}
                            colors={availableFiles.filter(f => f.selected).map(f => f.color)}
                            showGrid={true}
                            showLegend={selectedFiles.length > 1}
                        />
                    </div>
                </div>
            ) : (
                <div className="p-6 rounded-2xl border border-border/50 bg-card">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">No data selected</p>
                    </div>
                </div>
            )}
        </div>
    );
}