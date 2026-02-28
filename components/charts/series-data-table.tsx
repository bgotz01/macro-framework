'use client';

import { useState } from 'react';

interface SeriesDataTableProps {
    data: Array<{
        date: string;
        dateTimestamp: number;
        [key: string]: number | string | null | undefined;
    }>;
    selectedSeries: string[];
    seriesLabels: Record<string, string>;
    seriesColors: Record<string, string>;
    metric: 'percentile' | 'value' | 'yoy';
}

export default function SeriesDataTable({
    data,
    selectedSeries,
    seriesLabels,
    seriesColors,
    metric
}: SeriesDataTableProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    // Sort data by date descending (most recent first)
    const sortedData = [...data].sort((a, b) => b.dateTimestamp - a.dateTimestamp);

    // Calculate pagination
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${day}, ${year}`;
    };

    const formatValue = (value: number | null | undefined, seriesValue: string) => {
        if (value === null || value === undefined) return '-';

        if (metric === 'percentile') {
            return `${value.toFixed(1)}th`;
        } else if (metric === 'value') {
            return `${value.toFixed(2)}${seriesValue.includes('pe') ? 'x' : '%'}`;
        } else {
            return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
        }
    };

    const getValueClass = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '';
        if (metric === 'yoy') {
            return value > 0 ? 'text-red-600 dark:text-red-400' : value < 0 ? 'text-green-600 dark:text-green-400' : '';
        }
        return '';
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <div className="mt-6 p-6 rounded-xl border bg-card">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left mb-4 hover:bg-muted/50 transition-colors rounded-lg p-2"
            >
                <h3 className="text-xl font-bold">Series Data Table</h3>
                <div className="flex items-center gap-2">
                    {!isExpanded && (
                        <span className="text-sm text-muted-foreground">
                            {sortedData.length} rows
                        </span>
                    )}
                    <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isExpanded && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-muted-foreground">
                            Displaying {selectedSeries.length} series
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="rows-per-page" className="text-sm font-medium">
                                Rows per page:
                            </label>
                            <select
                                id="rows-per-page"
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 rounded border bg-background text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                                    {selectedSeries.map(seriesValue => (
                                        <th
                                            key={seriesValue}
                                            className="text-right py-3 px-4 font-semibold"
                                            style={{ color: seriesColors[seriesValue] }}
                                        >
                                            {seriesLabels[seriesValue]}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((row, index) => (
                                    <tr
                                        key={row.date}
                                        className={`border-b hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-muted/20' : ''
                                            }`}
                                    >
                                        <td className="py-2 px-4 font-medium">{formatDate(row.date)}</td>
                                        {selectedSeries.map(seriesValue => {
                                            const dataKey = metric === 'percentile'
                                                ? `${seriesValue}_percentile`
                                                : metric === 'value'
                                                    ? `${seriesValue}_value`
                                                    : `${seriesValue}_yoy`;
                                            const value = row[dataKey] as number | undefined;

                                            return (
                                                <td
                                                    key={seriesValue}
                                                    className={`text-right py-2 px-4 ${getValueClass(value)}`}
                                                >
                                                    {formatValue(value, seriesValue)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                First
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Previous
                            </button>
                            <span className="text-sm font-medium px-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
