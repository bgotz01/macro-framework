'use client';

import { useState, useEffect } from 'react';
import StocksTable, { Stock, Pagination } from '@/components/sp500/stocks-table';
import ReturnDistribution from '@/components/sp500/return-distribution';

import Link from 'next/link';

export default function SP500StocksPage() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [searchTicker, setSearchTicker] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedSubIndustry, setSelectedSubIndustry] = useState('');
    const [sectors, setSectors] = useState<string[]>([]);
    const [sectorSubIndustryMap, setSectorSubIndustryMap] = useState<Record<string, string[]>>({});
    const [stats, setStats] = useState<any>(null);
    const [sortBy, setSortBy] = useState<string>('market_cap');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [latestDate, setLatestDate] = useState<string | null>(null);

    // Phase 1: fetch stats on mount
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const params = new URLSearchParams({ page: '1', limit: '1', sortBy: 'market_cap', sortOrder: 'desc' });
            const res = await fetch(`/api/sp500-stocks?${params}`);
            const data = await res.json();
            if (data.stats) setStats(data.stats);
            if (data.pagination) setPagination(prev => ({ ...prev, total: data.pagination.total }));
            if (data.filters) {
                setSectors(data.filters.sectors);
                setSectorSubIndustryMap(data.filters.sectorSubIndustryMap);
            }
            if (data.stocks?.[0]?.latest_date) setLatestDate(data.stocks[0].latest_date);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setStatsLoading(false);
            // Phase 2: fetch full table after stats are loaded
            fetchStocks(1, '', '', '', 'market_cap', 'desc');
        }
    };

    const fetchStocks = async (page: number, search = '', sector = '', subIndustry = '', sort = sortBy, order = sortOrder) => {
        setTableLoading(true);
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
            if (data.stats) setStats(data.stats);
        } catch (error) {
            console.error('Error fetching stocks:', error);
        } finally {
            setTableLoading(false);
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

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    S&P 500 Stocks
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Live market data for all S&P 500 constituents
                    {latestDate && (
                        <span className="ml-2 text-sm">
                            · Updated {new Date(latestDate).toLocaleDateString()}
                        </span>
                    )}
                </p>

                {/* Stats Summary */}
                {statsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {pagination?.total > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm text-center relative">
                                    <Link href="/sp500/constituents" target="_blank" title="View constituents" className="absolute top-3 right-3 text-muted-foreground hover:text-blue-500 transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </Link>
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
                    </>
                )}

                {/* Stocks Table */}
                {tableLoading && stocks.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : stocks.length > 0 ? (
                    <StocksTable
                        stocks={stocks}
                        pagination={pagination}
                        loading={tableLoading}
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
                ) : null}
            </div>
        </div>
    );
}
