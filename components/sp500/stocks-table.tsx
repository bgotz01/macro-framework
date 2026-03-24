'use client';

import { useState } from 'react';

export interface Stock {
    symbol: string;
    company: string;
    sector: string;
    sub_industry: string;
    weight: string | null;
    latest_price: number;
    market_cap: number;
    latest_date: string;
    price_1y_ago: number;
    performance_1y: number;
    performance_2y: number;
    performance_5y: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

type SortColumn = 'market_cap' | 'performance_1y' | 'performance_2y' | 'performance_5y';

interface StocksTableProps {
    stocks: Stock[];
    pagination: Pagination;
    loading: boolean;
    searchTicker: string;
    selectedSector: string;
    selectedSubIndustry: string;
    sectors: string[];
    sectorSubIndustryMap: Record<string, string[]>;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onPageChange: (page: number) => void;
    onSearchChange: (value: string) => void;
    onSectorChange: (sector: string) => void;
    onSubIndustryChange: (subIndustry: string) => void;
    onClearFilters: () => void;
    onSortChange: (column: string, order: 'asc' | 'desc') => void;
}

export default function StocksTable({
    stocks,
    pagination,
    loading,
    searchTicker,
    selectedSector,
    selectedSubIndustry,
    sectors,
    sectorSubIndustryMap,
    sortBy,
    sortOrder,
    onPageChange,
    onSearchChange,
    onSectorChange,
    onSubIndustryChange,
    onClearFilters,
    onSortChange,
}: StocksTableProps) {
    const [show2y, setShow2y] = useState(false);
    const [show5y, setShow5y] = useState(false);

    const availableSubIndustries = selectedSector
        ? (sectorSubIndustryMap[selectedSector] || [])
        : Object.values(sectorSubIndustryMap).flat().filter((v, i, a) => a.indexOf(v) === i).sort();

    const handleSort = (column: SortColumn) => {
        if (sortBy === column) {
            onSortChange(column, sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            onSortChange(column, 'desc');
        }
    };

    // Stocks are already sorted by the API
    const sortedStocks = stocks || [];

    const formatMarketCap = (marketCap: number) => {
        if (!marketCap) return 'N/A';
        const trillion = marketCap / 1_000_000_000_000;
        const billion = marketCap / 1_000_000_000;
        if (trillion >= 1) return `${trillion.toFixed(2)}T`;
        return `${billion.toFixed(2)}B`;
    };

    const formatPerformance = (performance: number) => {
        if (performance === null || performance === undefined) return 'N/A';
        const sign = performance >= 0 ? '+' : '';
        return `${sign}${performance.toFixed(0)}%`;
    };

    const getPerformanceColor = (performance: number) => {
        if (performance === null || performance === undefined) return 'text-muted-foreground';
        return performance >= 0
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400';
    };

    const SortIndicator = ({ column }: { column: SortColumn }) => (
        sortBy === column ? (
            <span className="text-blue-600 dark:text-blue-400">
                {sortOrder === 'asc' ? '↑' : '↓'}
            </span>
        ) : null
    );

    return (
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm">
            <div className="p-6 border-b border-border space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Stock Listings</h2>
                    {pagination?.total > 0 && (
                        <div className="text-sm text-muted-foreground">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-3 items-center flex-wrap">
                    <input
                        type="text"
                        placeholder="Search ticker or company..."
                        value={searchTicker}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg bg-background text-foreground w-64"
                    />
                    <select
                        value={selectedSector}
                        onChange={(e) => onSectorChange(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg bg-background text-foreground w-[200px]"
                    >
                        <option value="">All Sectors</option>
                        {sectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                        ))}
                    </select>
                    <select
                        value={selectedSubIndustry}
                        onChange={(e) => onSubIndustryChange(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg bg-background text-foreground w-[250px]"
                        disabled={!selectedSector && availableSubIndustries.length === 0}
                    >
                        <option value="">
                            {selectedSector ? 'All Sub-Industries' : 'Select Sector First'}
                        </option>
                        {availableSubIndustries.map(subIndustry => (
                            <option key={subIndustry} value={subIndustry}>{subIndustry}</option>
                        ))}
                    </select>
                    {(searchTicker || selectedSector || selectedSubIndustry) && (
                        <button
                            onClick={onClearFilters}
                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors whitespace-nowrap"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {/* Return toggles */}
                <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Show:</span>
                    <button
                        onClick={() => setShow2y(!show2y)}
                        className={`px-3 py-1 text-sm rounded-lg border transition-colors ${show2y ? 'bg-blue-600 text-white border-blue-600' : 'border-border hover:bg-muted'}`}
                    >
                        2Y Return
                    </button>
                    <button
                        onClick={() => setShow5y(!show5y)}
                        className={`px-3 py-1 text-sm rounded-lg border transition-colors ${show5y ? 'bg-blue-600 text-white border-blue-600' : 'border-border hover:bg-muted'}`}
                    >
                        5Y Return
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-24">Symbol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-64">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-40">Sector</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-48">Sub-Industry</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase w-20">Weight</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase w-24">Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted/50 transition-colors w-32" onClick={() => handleSort('market_cap')}>
                                <div className="flex items-center justify-end gap-1">Market Cap <SortIndicator column="market_cap" /></div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted/50 transition-colors w-28" onClick={() => handleSort('performance_1y')}>
                                <div className="flex items-center justify-end gap-1">1Y Return <SortIndicator column="performance_1y" /></div>
                            </th>
                            {show2y && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted/50 transition-colors w-28" onClick={() => handleSort('performance_2y')}>
                                    <div className="flex items-center justify-end gap-1">2Y Return <SortIndicator column="performance_2y" /></div>
                                </th>
                            )}
                            {show5y && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted/50 transition-colors w-28" onClick={() => handleSort('performance_5y')}>
                                    <div className="flex items-center justify-end gap-1">5Y Return <SortIndicator column="performance_5y" /></div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedStocks.map((stock) => (
                            <tr key={stock.symbol} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{stock.symbol}</span>
                                </td>
                                <td className="px-6 py-4"><div className="font-medium">{stock.company}</div></td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{stock.sector || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{stock.sub_industry || 'N/A'}</td>
                                <td className="px-6 py-4 text-right font-medium">{stock.weight || '-'}</td>
                                <td className="px-6 py-4 text-right font-medium">{stock.latest_price ? `${stock.latest_price.toFixed(2)}` : 'N/A'}</td>
                                <td className="px-6 py-4 text-right font-medium">{formatMarketCap(stock.market_cap)}</td>
                                <td className={`px-6 py-4 text-right font-bold ${getPerformanceColor(stock.performance_1y)}`}>{formatPerformance(stock.performance_1y)}</td>
                                {show2y && (
                                    <td className={`px-6 py-4 text-right font-bold ${getPerformanceColor(stock.performance_2y)}`}>{formatPerformance(stock.performance_2y)}</td>
                                )}
                                {show5y && (
                                    <td className={`px-6 py-4 text-right font-bold ${getPerformanceColor(stock.performance_5y)}`}>{formatPerformance(stock.performance_5y)}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
                <div className="p-6 border-t border-border flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1 || loading}
                            className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages || loading}
                            className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
