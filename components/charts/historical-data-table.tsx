'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar, Search } from 'lucide-react';

interface DataPoint {
    date: string;
    [key: string]: any;
}

interface Column {
    key: string;
    label: string;
    format?: (value: any) => string;
    align?: 'left' | 'right' | 'center';
}

interface HistoricalDataTableProps {
    data: DataPoint[];
    seriesName: string;
    units?: string;
    columns?: Column[];
    defaultPageSize?: number;
}

export default function HistoricalDataTable({
    data,
    seriesName,
    units,
    columns,
    defaultPageSize = 50
}: HistoricalDataTableProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const formatValue = (value: number) => {
        if (value === null || value === undefined) return 'N/A';
        if (units === 'percent' || units === 'percentage') {
            return `${value.toFixed(2)}%`;
        }
        if (units === 'usd' || units === 'USD') {
            return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (units === 'ratio') {
            return value.toFixed(4);
        }
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Default columns if not provided
    const tableColumns: Column[] = columns || [
        {
            key: 'date',
            label: 'Date',
            align: 'left',
            format: (value: string) => formatDate(value)
        },
        {
            key: 'Value',
            label: 'Value',
            align: 'right',
            format: (value: number) => formatValue(value)
        }
    ];

    // Filter and sort data
    const filteredAndSortedData = useMemo(() => {
        let filtered = [...data];

        // Apply date filters
        if (filterStartDate) {
            filtered = filtered.filter(d => d.date >= filterStartDate);
        }
        if (filterEndDate) {
            filtered = filtered.filter(d => d.date <= filterEndDate);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(row => {
                return Object.values(row).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        // Sort by date
        filtered.sort((a, b) => {
            return sortOrder === 'desc'
                ? b.date.localeCompare(a.date)
                : a.date.localeCompare(b.date);
        });

        return filtered;
    }, [data, filterStartDate, filterEndDate, searchTerm, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedData, currentPage, pageSize]);

    // Reset to page 1 when filters change
    const handleFilterChange = () => {
        setCurrentPage(1);
    };

    const downloadCSV = () => {
        const headers = tableColumns.map(col => col.label);
        const rows = filteredAndSortedData.map(row =>
            tableColumns.map(col => row[col.key])
        );
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${seriesName.replace(/\//g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <div className="mt-6 rounded-lg border border-border/50 bg-card overflow-hidden">
            {/* Header */}
            <div className="w-full px-4 py-3 flex items-center justify-between bg-muted/30">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <span className="text-sm font-semibold text-card-foreground">
                        Historical Data
                    </span>
                    <span className="text-xs text-muted-foreground">
                        ({filteredAndSortedData.length} records)
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                </button>
                {isExpanded && (
                    <button
                        onClick={downloadCSV}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title="Download CSV"
                    >
                        <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4">
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    handleFilterChange();
                                }}
                                className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Start Date Filter */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="date"
                                placeholder="Start Date"
                                value={filterStartDate}
                                onChange={(e) => {
                                    setFilterStartDate(e.target.value);
                                    handleFilterChange();
                                }}
                                className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* End Date Filter */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="date"
                                placeholder="End Date"
                                value={filterEndDate}
                                onChange={(e) => {
                                    setFilterEndDate(e.target.value);
                                    handleFilterChange();
                                }}
                                className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-card-foreground border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(filterStartDate || filterEndDate || searchTerm) && (
                        <button
                            onClick={() => {
                                setFilterStartDate('');
                                setFilterEndDate('');
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                            className="text-xs text-primary hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}

                    {/* Table */}
                    <div className="border border-border rounded-lg overflow-hidden">
                        <div className="max-h-96 overflow-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-muted/50 border-b border-border">
                                    <tr>
                                        {tableColumns.map((col, index) => (
                                            <th
                                                key={col.key}
                                                className={`px-4 py-3 text-xs font-semibold text-card-foreground ${index === 0 ? 'cursor-pointer hover:bg-muted/70 transition-colors' : ''
                                                    } text-${col.align || 'left'}`}
                                                onClick={index === 0 ? () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') : undefined}
                                            >
                                                <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                                                    {col.label}
                                                    {index === 0 && (
                                                        sortOrder === 'desc' ? (
                                                            <ChevronDown className="w-3 h-3" />
                                                        ) : (
                                                            <ChevronUp className="w-3 h-3" />
                                                        )
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((row, rowIndex) => (
                                            <tr
                                                key={row.date + rowIndex}
                                                className="hover:bg-muted/20 transition-colors"
                                            >
                                                {tableColumns.map((col) => (
                                                    <td
                                                        key={col.key}
                                                        className={`px-4 py-2.5 text-sm text-card-foreground text-${col.align || 'left'} ${col.align === 'right' ? 'font-mono' : ''
                                                            }`}
                                                    >
                                                        {col.format ? col.format(row[col.key]) : row[col.key]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={tableColumns.length}
                                                className="px-4 py-8 text-center text-sm text-muted-foreground"
                                            >
                                                No data found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {filteredAndSortedData.length > 0 && (
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Rows per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-2 py-1 rounded bg-muted text-card-foreground border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={250}>250</option>
                                </select>
                                <span className="text-xs text-muted-foreground ml-4">
                                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => goToPage(1)}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="First page"
                                >
                                    <ChevronsLeft className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Previous page"
                                >
                                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                                </button>

                                <div className="flex items-center gap-1 mx-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => goToPage(pageNum)}
                                                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${currentPage === pageNum
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'hover:bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Next page"
                                >
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button
                                    onClick={() => goToPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Last page"
                                >
                                    <ChevronsRight className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
