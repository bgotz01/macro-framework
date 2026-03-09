'use client';

import { useState, useEffect } from 'react';

interface Stock {
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
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function SP500StocksPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTicker, setSearchTicker] = useState<string>('');
    const [selectedSector, setSelectedSector] = useState<string>('');
    const [selectedSubIndustry, setSelectedSubIndustry] = useState<string>('');
    const [sectors, setSectors] = useState<string[]>([]);
    const [sectorSubIndustryMap, setSectorSubIndustryMap] = useState<Record<string, string[]>>({});
    const [sortBy, setSortBy] = useState<'market_cap' | 'performance_1y' | null>('market_cap');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        fetchStocks(pagination.page, searchTicker, selectedSector, selectedSubIndustry);
    }, []);

    const fetchStocks = async (page: number, search: string = '', sector: string = '', subIndustry: string = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50'
            });

            if (search) params.append('search', search);
            if (sector) params.append('sector', sector);
            if (subIndustry) params.append('subIndustry', subIndustry);

            const res = await fetch(`/api/sp500-stocks?${params}`);
            const data = await res.json();
            setStocks(data.stocks);
            setPagination(data.pagination);

            if (data.filters) {
                setSectors(data.filters.sectors);
                setSectorSubIndustryMap(data.filters.sectorSubIndustryMap);
            }
        } catch (error) {
            console.error('Error fetching stocks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        fetchStocks(newPage, searchTicker, selectedSector, selectedSubIndustry);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearchChange = (value: string) => {
        setSearchTicker(value);
        fetchStocks(1, value, selectedSector, selectedSubIndustry);
    };

    const handleSectorChange = (sector: string) => {
        setSelectedSector(sector);
        setSelectedSubIndustry(''); // Reset sub-industry when sector changes
        fetchStocks(1, searchTicker, sector, '');
    };

    const handleSubIndustryChange = (subIndustry: string) => {
        setSelectedSubIndustry(subIndustry);
        fetchStocks(1, searchTicker, selectedSector, subIndustry);
    };

    const handleClearFilters = () => {
        setSearchTicker('');
        setSelectedSector('');
        setSelectedSubIndustry('');
        fetchStocks(1, '', '', '');
    };

    // Get available sub-industries based on selected sector
    const availableSubIndustries = selectedSector
        ? (sectorSubIndustryMap[selectedSector] || [])
        : Object.values(sectorSubIndustryMap).flat().filter((v, i, a) => a.indexOf(v) === i).sort();

    const handleSort = (column: 'market_cap' | 'performance_1y') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc'); // Default to descending for new column
        }
    };

    // Sort stocks on the client side
    const sortedStocks = [...(stocks || [])].sort((a, b) => {
        if (!sortBy) return 0;

        const aVal = a[sortBy];
        const bVal = b[sortBy];

        // Handle null values
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;

        const comparison = aVal - bVal;
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const formatMarketCap = (marketCap: number) => {
        if (!marketCap) return 'N/A';
        const trillion = marketCap / 1_000_000_000_000;
        const billion = marketCap / 1_000_000_000;

        if (trillion >= 1) {
            return `$${trillion.toFixed(2)}T`;
        }
        return `$${billion.toFixed(2)}B`;
    };

    const formatPerformance = (performance: number) => {
        if (performance === null || performance === undefined) return 'N/A';
        const sign = performance >= 0 ? '+' : '';
        return `${sign}${performance.toFixed(2)}%`;
    };

    const getPerformanceColor = (performance: number) => {
        if (performance === null || performance === undefined) return 'text-muted-foreground';
        return performance >= 0
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400';
    };

    if (loading && stocks.length === 0) {
        return (
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-7xl mx-auto">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    S&P 500 Stocks
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Live market data for all S&P 500 constituents
                </p>

                {/* Stats Summary */}
                {pagination?.total > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {pagination.total}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Stocks</div>
                        </div>
                        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {stocks?.filter(s => s.performance_1y > 0).length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Positive 1Y Return</div>
                        </div>
                        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {stocks?.length > 0 ? formatMarketCap(stocks[0]?.market_cap) : 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">Largest Market Cap</div>
                        </div>
                    </div>
                )}

                {/* Stocks Table */}
                {stocks?.length > 0 && (
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
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground w-64"
                                />

                                <select
                                    value={selectedSector}
                                    onChange={(e) => handleSectorChange(e.target.value)}
                                    className="px-4 py-2 border border-border rounded-lg bg-background text-foreground w-[200px]"
                                >
                                    <option value="">All Sectors</option>
                                    {sectors.map(sector => (
                                        <option key={sector} value={sector}>{sector}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedSubIndustry}
                                    onChange={(e) => handleSubIndustryChange(e.target.value)}
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
                                        onClick={handleClearFilters}
                                        className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors whitespace-nowrap"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-24">
                                            Symbol
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-64">
                                            Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-40">
                                            Sector
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-48">
                                            Sub-Industry
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase w-20">
                                            Weight
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase w-24">
                                            Price
                                        </th>
                                        <th
                                            className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted/50 transition-colors w-32"
                                            onClick={() => handleSort('market_cap')}
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                Market Cap
                                                {sortBy === 'market_cap' && (
                                                    <span className="text-blue-600 dark:text-blue-400">
                                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted/50 transition-colors w-28"
                                            onClick={() => handleSort('performance_1y')}
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                1Y Return
                                                {sortBy === 'performance_1y' && (
                                                    <span className="text-blue-600 dark:text-blue-400">
                                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {sortedStocks.map((stock) => (
                                        <tr key={stock.symbol} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                    {stock.symbol}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{stock.company}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {stock.sector || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {stock.sub_industry || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {stock.weight || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {stock.latest_price ? `$${stock.latest_price.toFixed(2)}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {formatMarketCap(stock.market_cap)}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${getPerformanceColor(stock.performance_1y)}`}>
                                                {formatPerformance(stock.performance_1y)}
                                            </td>
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
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1 || loading}
                                        className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages || loading}
                                        className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
