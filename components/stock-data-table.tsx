'use client';

import { useState, useEffect } from 'react';

interface StockDataTableProps {
    className?: string;
}

interface StockData {
    date: string;
    Price?: number;
    'Market-Cap'?: number;
    EPS?: number;
    TTM?: number;
    'PE-Ratio'?: number;
    'PS-Ratio'?: number;
    Revenue?: number;
    Shares?: number;
}

interface StockInfo {
    series_name: string;
    display_name: string;
}

export default function StockDataTable({ className = '' }: StockDataTableProps) {
    const [availableStocks, setAvailableStocks] = useState<StockInfo[]>([]);
    const [selectedStock, setSelectedStock] = useState<string>('');
    const [data, setData] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<keyof StockData>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // Load available stocks
    useEffect(() => {
        const loadStocks = async () => {
            try {
                const response = await fetch('/api/data/stocks');
                if (!response.ok) {
                    throw new Error('Failed to load stocks list');
                }
                const result = await response.json();

                const stocks = result.seriesInfo.map((s: any) => ({
                    series_name: s.series_name,
                    display_name: s.display_name
                }));

                setAvailableStocks(stocks);

                // Auto-select first stock
                if (stocks.length > 0) {
                    setSelectedStock(stocks[0].series_name);
                }
            } catch (err) {
                console.error('Error loading stocks:', err);
                setAvailableStocks([]);
            }
        };

        loadStocks();
    }, []);

    // Load data when stock changes
    useEffect(() => {
        if (!selectedStock) {
            setData([]);
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/data/stocks?series=${selectedStock}`);

                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.statusText}`);
                }

                const result = await response.json();

                // Transform data to have all metrics in one row per date
                const dateMap = new Map<string, StockData>();

                result.data.forEach((point: any) => {
                    const dateKey = point.date;
                    if (!dateMap.has(dateKey)) {
                        dateMap.set(dateKey, { date: dateKey });
                    }
                    const row = dateMap.get(dateKey)!;

                    // Add all available metrics
                    if (point.Price !== undefined) row.Price = point.Price;
                    if (point['Market-Cap'] !== undefined) row['Market-Cap'] = point['Market-Cap'];
                    if (point.EPS !== undefined) row.EPS = point.EPS;
                    if (point.TTM !== undefined) row.TTM = point.TTM;
                    if (point['PE-Ratio'] !== undefined) row['PE-Ratio'] = point['PE-Ratio'];
                    if (point['PS-Ratio'] !== undefined) row['PS-Ratio'] = point['PS-Ratio'];
                    if (point.Revenue !== undefined) row.Revenue = point.Revenue;
                    if (point.Shares !== undefined) row.Shares = point.Shares;
                });

                const tableData = Array.from(dateMap.values()).sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                setData(tableData);
                setCurrentPage(1); // Reset to first page when stock changes
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedStock]);

    const handleSort = (column: keyof StockData) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    const sortedData = [...data].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === undefined || bVal === undefined) return 0;

        if (sortColumn === 'date') {
            const comparison = new Date(aVal as string).getTime() - new Date(bVal as string).getTime();
            return sortDirection === 'asc' ? comparison : -comparison;
        }

        const comparison = (aVal as number) - (bVal as number);
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const formatValue = (value: number | undefined, type: string) => {
        if (value === undefined) return '-';

        switch (type) {
            case 'currency':
                return `$${value.toFixed(2)}`;
            case 'millions':
                return `${(value / 1000).toFixed(2)}B`;
            case 'ratio':
                return value.toFixed(2);
            default:
                return value.toLocaleString();
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const SortIcon = ({ column }: { column: keyof StockData }) => {
        if (sortColumn !== column) {
            return <span className="text-muted-foreground/30">↕</span>;
        }
        return <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    if (loading) {
        return (
            <div className={`p-6 rounded-2xl border border-border/50 bg-card ${className}`}>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-6 rounded-2xl border border-border/50 bg-card ${className}`}>
                <div className="text-center py-12">
                    <p className="text-red-500 font-medium mb-2">Error loading data</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-6 rounded-2xl border border-border/50 bg-card ${className}`}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-1">
                        Stock Data Table
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Quarterly financial metrics
                    </p>
                </div>
                <select
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-muted text-card-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {availableStocks.map(stock => (
                        <option key={stock.series_name} value={stock.series_name}>
                            {stock.display_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th
                                className="text-left py-3 px-4 font-semibold text-sm text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('date')}
                            >
                                <div className="flex items-center gap-2">
                                    Date <SortIcon column="date" />
                                </div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-sm text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('Price')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Price <SortIcon column="Price" />
                                </div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-sm text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('Market-Cap')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Market Cap <SortIcon column="Market-Cap" />
                                </div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-sm text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('EPS')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    EPS <SortIcon column="EPS" />
                                </div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-sm text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('TTM')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    TTM EPS <SortIcon column="TTM" />
                                </div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-sm text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('PE-Ratio')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    P/E Ratio <SortIcon column="PE-Ratio" />
                                </div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-sm text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('PS-Ratio')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    P/S Ratio <SortIcon column="PS-Ratio" />
                                </div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-sm text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('Revenue')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Revenue <SortIcon column="Revenue" />
                                </div>
                            </th>
                            <th
                                className="text-right py-3 px-4 font-semibold text-sm text-card-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('Shares')}
                            >
                                <div className="flex items-center justify-end gap-2">
                                    Shares <SortIcon column="Shares" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr
                                key={row.date}
                                className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-muted/10' : ''
                                    }`}
                            >
                                <td className="py-3 px-4 text-sm font-medium text-card-foreground">
                                    {formatDate(row.date)}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                    {formatValue(row.Price, 'currency')}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                    {formatValue(row['Market-Cap'], 'millions')}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                    {formatValue(row.EPS, 'currency')}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                    {formatValue(row.TTM, 'currency')}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                    {formatValue(row['PE-Ratio'], 'ratio')}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                    {formatValue(row['PS-Ratio'], 'ratio')}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                    {formatValue(row.Revenue, 'millions')}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                    {formatValue(row.Shares, 'millions')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} records
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-muted text-card-foreground hover:bg-muted/80"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                // Show first page, last page, current page, and pages around current
                                const showPage =
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1);

                                const showEllipsis =
                                    (page === 2 && currentPage > 3) ||
                                    (page === totalPages - 1 && currentPage < totalPages - 2);

                                if (showEllipsis) {
                                    return <span key={page} className="px-2 text-muted-foreground">...</span>;
                                }

                                if (!showPage) return null;

                                return (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === page
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-card-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-muted text-card-foreground hover:bg-muted/80"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {sortedData.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No data available</p>
                </div>
            )}
        </div>
    );
}
