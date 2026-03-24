'use client';

import { useState, useEffect } from 'react';
import StocksTable, { Stock, Pagination } from '@/components/sp500/stocks-table';
import ReturnDistribution from '@/components/sp500/return-distribution';

export default function SP500StocksPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTicker, setSearchTicker] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedSubIndustry, setSelectedSubIndustry] = useState('');
    const [sectors, setSectors] = useState<string[]>([]);
    const [sectorSubIndustryMap, setSectorSubIndustryMap] = useState<Record<string, string[]>>({});
    const [stats, setStats] = useState<any>(null);
    const [sortBy, setSortBy] = useState<string>('market_cap');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        fetchStocks(pagination.page, searchTicker, selectedSector, selectedSubIndustry, sortBy, sortOrder);
    }, []);

    const fetchStocks = async (page: number, search = '', sector = '', subIndustry = '', sort = sortBy, order = sortOrder) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '10' });
            if (search) params.append('search', search);
            if (sector) params.append('sector', sector);
            if (subIndustry) params.append('subIndustry', subIndustry);
            params.append('sortBy', sort);
            params.append('sortOrder', order);

            const res = await fetch(`/api/sp500-stocks?${params}`);
            const data = await res.json();
            setStocks(data.stocks);
            setPagination(data.pagination);
            if (data.filters) {
                setSectors(data.filters.sectors);
                setSectorSubIndustryMap(data.filters.sectorSubIndustryMap);
            }
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stocks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        fetchStocks(newPage, searchTicker, selectedSector, selectedSubIndustry, sortBy, sortOrder);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearchChange = (value: string) => {
        setSearchTicker(value);
        fetchStocks(1, value, selectedSector, selectedSubIndustry, sortBy, sortOrder);
    };

    const handleSectorChange = (sector: string) => {
        setSelectedSector(sector);
        setSelectedSubIndustry('');
        fetchStocks(1, searchTicker, sector, '', sortBy, sortOrder);
    };

    const handleSubIndustryChange = (subIndustry: string) => {
        setSelectedSubIndustry(subIndustry);
        fetchStocks(1, searchTicker, selectedSector, subIndustry, sortBy, sortOrder);
    };

    const handleClearFilters = () => {
        setSearchTicker('');
        setSelectedSector('');
        setSelectedSubIndustry('');
        fetchStocks(1, '', '', '', sortBy, sortOrder);
    };

    const handleSortChange = (column: string, order: 'asc' | 'desc') => {
        setSortBy(column);
        setSortOrder(order);
        fetchStocks(1, searchTicker, selectedSector, selectedSubIndustry, column, order);
    };

    const formatMarketCap = (marketCap: number) => {
        if (!marketCap) return 'N/A';
        const trillion = marketCap / 1_000_000_000_000;
        const billion = marketCap / 1_000_000_000;
        if (trillion >= 1) return `${trillion.toFixed(2)}T`;
        return `${billion.toFixed(2)}B`;
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
                    {stocks?.length > 0 && stocks.find(s => s.symbol === 'AAPL')?.latest_date && (
                        <span className="ml-2 text-sm">
                            · Updated {new Date(stocks.find(s => s.symbol === 'AAPL')!.latest_date).toLocaleDateString()}
                        </span>
                    )}
                </p>

                {/* Stats Summary */}
                {pagination?.total > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pagination.total}</div>
                            <div className="text-sm text-muted-foreground">Total Stocks</div>
                        </div>
                        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm text-center">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {stats ? formatMarketCap(stats.totalMarketCap) : 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Market Cap</div>
                        </div>
                        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm text-center">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.['1y']?.concentration?.stocksFor50Pct ?? '—'}</div>
                            <div className="text-sm text-muted-foreground">stocks drive 50% of gains</div>
                        </div>
                        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm text-center">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.['1y']?.concentration?.stocksFor80Pct ?? '—'}</div>
                            <div className="text-sm text-muted-foreground">stocks drive 80% of gains</div>
                        </div>
                    </div>
                )}

                {stats?.['1y'] && (
                    <ReturnDistribution
                        stats1y={stats['1y']}
                        stats2y={stats['2y']}
                        stats2025={stats['2025']}
                        stats2026={stats['2026']}
                    />
                )}

                {stocks?.length > 0 && (
                    <StocksTable
                        stocks={stocks}
                        pagination={pagination}
                        loading={loading}
                        searchTicker={searchTicker}
                        selectedSector={selectedSector}
                        selectedSubIndustry={selectedSubIndustry}
                        sectors={sectors}
                        sectorSubIndustryMap={sectorSubIndustryMap}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onPageChange={handlePageChange}
                        onSearchChange={handleSearchChange}
                        onSectorChange={handleSectorChange}
                        onSubIndustryChange={handleSubIndustryChange}
                        onClearFilters={handleClearFilters}
                        onSortChange={handleSortChange}
                    />
                )}
            </div>
        </div>
    );
}
