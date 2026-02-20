'use client';

import { useState, useEffect } from 'react';

interface PercentileDataRow {
    date: number;
    dateStr: string;
    value: number;
    percentileRank: number;
    yoyPercentileChange: number | null;
}

interface PaginationInfo {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

interface PercentileDataTableProps {
    assetClass?: string;
    seriesName?: string;
    displayName?: string;
}

const SERIES_OPTIONS = [
    { assetClass: 'economic', seriesName: 'CPI', displayName: 'CPI Inflation', format: (v: number) => `${v.toFixed(2)}%` },
    { assetClass: 'economic', seriesName: 'US/FEDFUNDS', displayName: 'Fed Funds Rate', format: (v: number) => `${v.toFixed(2)}%` },
    { assetClass: 'bonds', seriesName: 'US/TNX-Monthly', displayName: '10Y Treasury', format: (v: number) => `${v.toFixed(2)}%` },
    { assetClass: 'bonds', seriesName: 'US/US-2yr-Monthly', displayName: '2Y Treasury', format: (v: number) => `${v.toFixed(2)}%` },
    { assetClass: 'bonds', seriesName: 'US/IRX-Monthly', displayName: '3M Treasury', format: (v: number) => `${v.toFixed(2)}%` },
    { assetClass: 'valuations', seriesName: 'Shiller-PE', displayName: 'Shiller P/E (CAPE)', format: (v: number) => `${v.toFixed(1)}x` },
    { assetClass: 'valuations', seriesName: 'PE-5yr', displayName: 'P/E-5yr', format: (v: number) => `${v.toFixed(1)}x` },
    { assetClass: 'derived', seriesName: 'Real-Yield', displayName: 'Real Yield (10Y-CPI)', format: (v: number) => `${v.toFixed(2)}%` },
    { assetClass: 'derived', seriesName: 'Yield-Curve', displayName: 'Yield Curve (10Y-2Y)', format: (v: number) => `${v.toFixed(2)}%` },
    { assetClass: 'derived', seriesName: 'Yield-Curve-10Y-3M', displayName: 'Yield Curve (10Y-3M)', format: (v: number) => `${v.toFixed(2)}%` },
    { assetClass: 'derived', seriesName: 'Earnings-Yield-Premium', displayName: 'EY-3M', format: (v: number) => `${v.toFixed(2)}%` },
    { assetClass: 'derived', seriesName: 'Real-Earnings-Yield', displayName: 'EY-CPI', format: (v: number) => `${v.toFixed(2)}%` },
];

export default function PercentileDataTable({
    assetClass = 'economic',
    seriesName = 'CPI',
    displayName = 'CPI Inflation'
}: PercentileDataTableProps) {
    const [data, setData] = useState<PercentileDataRow[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(false);
    const [selectedSeries, setSelectedSeries] = useState({ assetClass, seriesName, displayName });
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    const currentSeriesConfig = SERIES_OPTIONS.find(
        s => s.assetClass === selectedSeries.assetClass && s.seriesName === selectedSeries.seriesName
    ) || SERIES_OPTIONS[0];

    useEffect(() => {
        if (isExpanded) {
            fetchData(pagination.page);
        }
    }, [selectedSeries, isExpanded, selectedYear]);

    const fetchData = async (page: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/percentile-table?page=${page}&pageSize=${pagination.pageSize}&assetClass=${selectedSeries.assetClass}&seriesName=${selectedSeries.seriesName}&year=${selectedYear}`
            );
            const result = await response.json();
            setData(result.data);
            setPagination(result.pagination);
            if (result.availableYears) {
                setAvailableYears(result.availableYears);
            }
        } catch (error) {
            console.error('Error fetching percentile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchData(newPage);
        }
    };

    const handleSeriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [assetClass, seriesName] = e.target.value.split('|');
        const series = SERIES_OPTIONS.find(s => s.assetClass === assetClass && s.seriesName === seriesName);
        if (series) {
            setSelectedSeries({
                assetClass: series.assetClass,
                seriesName: series.seriesName,
                displayName: series.displayName
            });
            setPagination(prev => ({ ...prev, page: 1 }));
            setSelectedYear('all'); // Reset year filter when changing series
        }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    };

    function getPercentileColor(percentile: number): string {
        if (percentile < 25) return 'text-green-600 dark:text-green-400';
        if (percentile < 50) return 'text-blue-600 dark:text-blue-400';
        if (percentile < 75) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    }

    function getPercentileBg(percentile: number): string {
        if (percentile < 25) return 'bg-green-50 dark:bg-green-950';
        if (percentile < 50) return 'bg-blue-50 dark:bg-blue-950';
        if (percentile < 75) return 'bg-yellow-50 dark:bg-yellow-950';
        return 'bg-red-50 dark:bg-red-950';
    }

    const startRecord = (pagination.page - 1) * pagination.pageSize + 1;
    const endRecord = Math.min(pagination.page * pagination.pageSize, pagination.totalRecords);

    return (
        <div className="rounded-xl border bg-card p-4">
            {/* Expand/Collapse Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
                {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'} Historical Percentile Data
            </button>

            {isExpanded && (
                <>
                    {/* Header with Series Selector */}
                    <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h2 className="text-xl font-bold">Historical Percentile Data</h2>
                            <p className="text-sm text-muted-foreground">
                                {selectedSeries.displayName} - {pagination.totalRecords.toLocaleString()} records
                                {selectedYear !== 'all' && ` (${selectedYear})`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <label htmlFor="year-select" className="text-sm font-medium">
                                    Year:
                                </label>
                                <select
                                    id="year-select"
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    className="px-3 py-1.5 rounded-lg border-2 bg-background text-foreground font-medium text-sm cursor-pointer hover:border-primary transition-colors"
                                    disabled={loading}
                                >
                                    <option value="all">All Years</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="series-select" className="text-sm font-medium">
                                    Series:
                                </label>
                                <select
                                    id="series-select"
                                    value={`${selectedSeries.assetClass}|${selectedSeries.seriesName}`}
                                    onChange={handleSeriesChange}
                                    className="px-3 py-1.5 rounded-lg border-2 bg-background text-foreground font-medium text-sm cursor-pointer hover:border-primary transition-colors"
                                    disabled={loading}
                                >
                                    {SERIES_OPTIONS.map(series => (
                                        <option key={`${series.assetClass}|${series.seriesName}`} value={`${series.assetClass}|${series.seriesName}`}>
                                            {series.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table with Loading Overlay */}
                    <div className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div className="rounded-lg border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm table-fixed">
                                    <colgroup>
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '15%' }} />
                                        <col style={{ width: '20%' }} />
                                        <col style={{ width: '35%' }} />
                                    </colgroup>
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-3 font-semibold">Date</th>
                                            <th className="text-right p-3 font-semibold">Value</th>
                                            <th className="text-right p-3 font-semibold">Percentile</th>
                                            <th className="text-right p-3 font-semibold">YoY Change</th>
                                            <th className="text-center p-3 font-semibold">Interpretation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, index) => {
                                            const percentile = row.percentileRank;
                                            let interpretation = '';
                                            if (percentile < 25) interpretation = 'Low (Bottom Quartile)';
                                            else if (percentile < 50) interpretation = 'Below Average';
                                            else if (percentile < 75) interpretation = 'Above Average';
                                            else interpretation = 'High (Top Quartile)';

                                            return (
                                                <tr key={`${row.date}-${index}`} className="border-t hover:bg-muted/20 transition-colors">
                                                    <td className="p-3 font-medium">{row.dateStr}</td>
                                                    <td className="p-3 text-right font-mono">
                                                        {currentSeriesConfig.format(row.value)}
                                                    </td>
                                                    <td className={`p-3 text-right font-bold ${getPercentileColor(percentile)}`}>
                                                        {percentile.toFixed(1)}%
                                                    </td>
                                                    <td className="p-3 text-right font-mono">
                                                        {row.yoyPercentileChange !== null ? (
                                                            <span className={row.yoyPercentileChange > 0 ? 'text-red-600 dark:text-red-400' : row.yoyPercentileChange < 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                                                                {row.yoyPercentileChange > 0 ? '+' : ''}{row.yoyPercentileChange.toFixed(1)} pts
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">—</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPercentileBg(percentile)} ${getPercentileColor(percentile)}`}>
                                                            {interpretation}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                            <div className="text-sm text-muted-foreground">
                                Showing {startRecord.toLocaleString()} to {endRecord.toLocaleString()} of {pagination.totalRecords.toLocaleString()} records
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.page === 1 || loading}
                                    className="px-3 py-1.5 rounded-lg border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1 || loading}
                                    className="px-3 py-1.5 rounded-lg border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1.5 text-sm font-medium">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages || loading}
                                    className="px-3 py-1.5 rounded-lg border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    disabled={pagination.page === pagination.totalPages || loading}
                                    className="px-3 py-1.5 rounded-lg border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
