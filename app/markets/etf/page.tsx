'use client';

import { useState, useEffect } from 'react';

interface ETF {
    symbol: string;
    name: string;
    aum: string;
    avgDailyVolume: string;
    aumNumeric: number;
    volumeNumeric: number;
}

export default function ETFPage() {
    const [etfs, setEtfs] = useState<ETF[]>([]);
    const [filteredEtfs, setFilteredEtfs] = useState<ETF[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'symbol' | 'name' | 'aum' | 'volume'>('aum');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<'all' | 'equity'>('all');
    const itemsPerPage = 10;

    useEffect(() => {
        fetchETFData();
    }, []);

    useEffect(() => {
        filterAndSortETFs();
    }, [etfs, searchTerm, sortBy, sortOrder, activeTab]);

    const parseNumber = (str: string): number => {
        // Remove $ and commas, convert to number
        return parseFloat(str.replace(/[$,]/g, ''));
    };

    const fetchETFData = async () => {
        try {
            const response = await fetch('/data/ETFAUM.csv');
            const text = await response.text();
            const lines = text.trim().split('\n');

            // Skip header row
            const data = lines.slice(1).map(line => {
                const [symbol, name, aum, volume] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
                return {
                    symbol,
                    name,
                    aum,
                    avgDailyVolume: volume,
                    aumNumeric: parseNumber(aum),
                    volumeNumeric: parseNumber(volume)
                };
            });

            setEtfs(data);
        } catch (error) {
            console.error('Error fetching ETF data:', error);
        } finally {
            setLoading(false);
        }
    };

    const isEquityETF = (etf: ETF): boolean => {
        const name = etf.name.toLowerCase();
        const symbol = etf.symbol.toLowerCase();

        // Exclude bond, treasury, gold, silver, commodity ETFs
        const excludeKeywords = ['bond', 'treasury', 'gold', 'silver', 'mbs', 'clo', 'muni'];
        if (excludeKeywords.some(keyword => name.includes(keyword))) {
            return false;
        }

        // Exclude specific symbols
        const excludeSymbols = ['gld', 'iau', 'slv', 'bnd', 'agg', 'bndx', 'sgov', 'vcit',
            'bil', 'mub', 'vteb', 'vcsh', 'vgit', 'mbb', 'jpst', 'iusb',
            'govt', 'gldm', 'lqd', 'biv', 'vgsh', 'jaaa', 'ushy', 'bsv', 'gdx'];
        if (excludeSymbols.includes(symbol)) {
            return false;
        }

        return true;
    };

    const filterAndSortETFs = () => {
        let result = [...etfs];

        // Filter by tab
        if (activeTab === 'equity') {
            result = result.filter(isEquityETF);
        }

        // Filter by search term
        if (searchTerm) {
            result = result.filter(etf =>
                etf.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                etf.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'symbol':
                    comparison = a.symbol.localeCompare(b.symbol);
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'aum':
                    comparison = a.aumNumeric - b.aumNumeric;
                    break;
                case 'volume':
                    comparison = a.volumeNumeric - b.volumeNumeric;
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredEtfs(result);
        setCurrentPage(1);
    };

    const handleSort = (column: 'symbol' | 'name' | 'aum' | 'volume') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder(column === 'aum' || column === 'volume' ? 'desc' : 'asc');
        }
    };

    const formatCurrency = (value: number): string => {
        if (value >= 1e9) {
            return `$${(value / 1e9).toFixed(2)}B`;
        } else if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(2)}M`;
        }
        return `$${value.toLocaleString()}`;
    };

    const formatVolume = (value: number): string => {
        if (value >= 1e6) {
            return `${(value / 1e6).toFixed(2)}M`;
        } else if (value >= 1e3) {
            return `${(value / 1e3).toFixed(2)}K`;
        }
        return value.toLocaleString();
    };

    // Calculate stats based on active tab
    const displayEtfs = activeTab === 'equity' ? etfs.filter(isEquityETF) : etfs;
    const totalAUM = displayEtfs.reduce((sum, etf) => sum + etf.aumNumeric, 0);
    const avgAUM = displayEtfs.length > 0 ? totalAUM / displayEtfs.length : 0;
    const totalVolume = displayEtfs.reduce((sum, etf) => sum + etf.volumeNumeric, 0);
    const avgVolume = displayEtfs.length > 0 ? totalVolume / displayEtfs.length : 0;

    // Pagination
    const totalPages = Math.ceil(filteredEtfs.length / itemsPerPage);
    const paginatedEtfs = filteredEtfs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return <div className="p-8 text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ETF Assets Under Management
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Top ETFs by assets under management and trading volume
                </p>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-border">
                    <button
                        onClick={() => {
                            setActiveTab('all');
                            setCurrentPage(1);
                        }}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'all'
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        All ETFs
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('equity');
                            setCurrentPage(1);
                        }}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'equity'
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Equity ETFs
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{displayEtfs.length}</div>
                        <div className="text-sm text-muted-foreground">{activeTab === 'equity' ? 'Equity ETFs' : 'Total ETFs'}</div>
                    </div>
                    <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(totalAUM)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total AUM</div>
                    </div>
                    <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(avgAUM)}
                        </div>
                        <div className="text-sm text-muted-foreground">Average AUM</div>
                    </div>
                    <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {formatVolume(avgVolume)}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Daily Volume</div>
                    </div>
                </div>

                {/* ETF Table */}
                <div className="bg-card border border-border/50 rounded-2xl shadow-sm">
                    <div className="p-6 border-b border-border space-y-4">
                        <div className="flex gap-4 items-center flex-wrap justify-between">
                            <div className="flex gap-2 items-center flex-1">
                                <label className="font-medium text-sm">Search:</label>
                                <input
                                    type="text"
                                    placeholder="Symbol or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-4 py-2 border border-border rounded-lg flex-1 max-w-md bg-background text-foreground"
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Showing {filteredEtfs.length} of {displayEtfs.length} ETFs
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted"
                                        onClick={() => handleSort('symbol')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Symbol
                                            {sortBy === 'symbol' && (
                                                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Name
                                            {sortBy === 'name' && (
                                                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted"
                                        onClick={() => handleSort('aum')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Assets Under Management
                                            {sortBy === 'aum' && (
                                                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted"
                                        onClick={() => handleSort('volume')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Avg Daily Volume (3mo)
                                            {sortBy === 'volume' && (
                                                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginatedEtfs.map((etf) => (
                                    <tr key={etf.symbol} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-blue-600 dark:text-blue-400">
                                            {etf.symbol}
                                        </td>
                                        <td className="px-6 py-4">{etf.name}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">
                                            {formatCurrency(etf.aumNumeric)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">
                                            {formatVolume(etf.volumeNumeric)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-border flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
