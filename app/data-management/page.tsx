'use client';

import { useState, useEffect } from 'react';
import { DataManager } from '../../lib/data-manager';

interface DataQualityReport {
    filename: string;
    info?: any;
    validation: any;
    suggestions?: any;
    error?: string;
}

const ASSET_CLASSES = ['bonds', 'fx', 'equities', 'macro', 'moneysupply'];

export default function DataManagementPage() {
    const [selectedCategory, setSelectedCategory] = useState('bonds');
    const [reports, setReports] = useState<DataQualityReport[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReports();
    }, [selectedCategory]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const categoryReports = await DataManager.generateDataQualityReport(selectedCategory);
            setReports(categoryReports);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (validation: any) => {
        if (!validation.isValid) return 'text-red-600 bg-red-50';
        if (validation.warnings.length > 0) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const getStatusText = (validation: any) => {
        if (!validation.isValid) return 'Error';
        if (validation.warnings.length > 0) return 'Warning';
        return 'Good';
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Data Management
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Data Quality
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Monitor, validate, and optimize your macro economic datasets for better chart performance.
                </p>
            </div>

            {/* Category Selector */}
            <div className="mb-8">
                <div className="p-6 rounded-2xl border border-border/50 bg-card">
                    <h3 className="text-lg font-semibold text-card-foreground mb-4">Asset Class</h3>
                    <div className="flex flex-wrap gap-2">
                        {ASSET_CLASSES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${selectedCategory === category
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Quality Reports */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {reports.map((report, index) => (
                        <div key={index} className="p-6 rounded-2xl border border-border/50 bg-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-semibold text-card-foreground">
                                        {report.filename}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.validation)}`}>
                                        {getStatusText(report.validation)}
                                    </span>
                                </div>
                                {report.info && (
                                    <div className="text-sm text-muted-foreground">
                                        {report.info.rowCount} rows • {report.info.columns.length} columns
                                    </div>
                                )}
                            </div>

                            {report.error ? (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-red-600 font-medium">Error loading dataset</p>
                                    <p className="text-red-500 text-sm mt-1">{report.error}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Dataset Info */}
                                    {report.info && (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <div className="text-sm text-muted-foreground">Rows</div>
                                                <div className="text-lg font-semibold">{report.info.rowCount.toLocaleString()}</div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <div className="text-sm text-muted-foreground">Columns</div>
                                                <div className="text-lg font-semibold">{report.info.columns.length}</div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <div className="text-sm text-muted-foreground">Date Range</div>
                                                <div className="text-sm font-medium">
                                                    {report.info.dateRange.start && report.info.dateRange.end
                                                        ? `${report.info.dateRange.start} to ${report.info.dateRange.end}`
                                                        : 'No dates'
                                                    }
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <div className="text-sm text-muted-foreground">Columns</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {report.info.columns.slice(0, 3).join(', ')}
                                                    {report.info.columns.length > 3 && '...'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Validation Results */}
                                    {(report.validation.errors.length > 0 || report.validation.warnings.length > 0) && (
                                        <div className="space-y-3">
                                            {report.validation.errors.length > 0 && (
                                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                                    <h4 className="text-red-600 font-medium mb-2">Errors</h4>
                                                    <ul className="text-red-500 text-sm space-y-1">
                                                        {report.validation.errors.map((error: string, i: number) => (
                                                            <li key={i}>• {error}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {report.validation.warnings.length > 0 && (
                                                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                                    <h4 className="text-yellow-600 font-medium mb-2">Warnings</h4>
                                                    <ul className="text-yellow-600 text-sm space-y-1">
                                                        {report.validation.warnings.map((warning: string, i: number) => (
                                                            <li key={i}>• {warning}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    {report.validation.suggestions.length > 0 && (
                                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                            <h4 className="text-blue-600 font-medium mb-2">Suggestions</h4>
                                            <ul className="text-blue-600 text-sm space-y-1">
                                                {report.validation.suggestions.map((suggestion: string, i: number) => (
                                                    <li key={i}>• {suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Chart Suggestions */}
                                    {report.suggestions && (
                                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                            <h4 className="text-green-600 font-medium mb-2">Recommended Chart Configuration</h4>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-green-600 font-medium">X-Axis: </span>
                                                    <span className="text-green-700">{report.suggestions.xAxis}</span>
                                                </div>
                                                <div>
                                                    <span className="text-green-600 font-medium">Y-Axes: </span>
                                                    <span className="text-green-700">{report.suggestions.yAxes.join(', ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {reports.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No datasets found for {selectedCategory}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Best Practices */}
            <div className="mt-12 p-8 rounded-3xl gradient-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6">Data Management Best Practices</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3">File Organization</h4>
                            <ul className="space-y-2 text-sm text-primary-foreground/90">
                                <li>• Use consistent naming conventions (lowercase, hyphens)</li>
                                <li>• Group by asset class in separate folders</li>
                                <li>• Include country/region in filename when relevant</li>
                                <li>• Use descriptive names (us-yields.csv vs data.csv)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Data Format</h4>
                            <ul className="space-y-2 text-sm text-primary-foreground/90">
                                <li>• Use YYYY-MM-DD date format consistently</li>
                                <li>• Include Date as the first column</li>
                                <li>• Use clear column headers (10Y, EUR/USD, SP500)</li>
                                <li>• Handle missing values consistently (empty or null)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}