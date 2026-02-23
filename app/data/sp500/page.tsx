'use client';

import { useState, useEffect } from 'react';

interface Constituent {
    symbol: string;
    security: string;
    gics_sector: string;
    gics_sub_industry: string;
    headquarters_location: string;
    date_added: string;
    founded: string;
}

interface Change {
    date: string;
    added_ticker: string;
    added_company: string;
    removed_ticker: string;
    removed_company: string;
    reason: string;
}

interface Analytics {
    stats: {
        total_constituents: number;
        total_sectors: number;
        total_sub_industries: number;
        total_changes: number;
        original_1957_members: number;
    };
    sectorBreakdown: Array<{
        gics_sector: string;
        count: number;
        percentage: number;
    }>;
    topSubIndustries: Array<{
        gics_sub_industry: string;
        count: number;
    }>;
    removalReasons: Array<{
        reason_category: string;
        count: number;
    }>;
}

export default function SP500Page() {
    const [activeTab, setActiveTab] = useState<'overview' | 'constituents' | 'changes'>('overview');
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [constituents, setConstituents] = useState<Constituent[]>([]);
    const [changes, setChanges] = useState<Change[]>([]);
    const [selectedSector, setSelectedSector] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('current');
    const [constituentCount, setConstituentCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [searchTicker, setSearchTicker] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<'symbol' | 'company' | 'date_added'>('symbol');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const itemsPerPage = 50;

    useEffect(() => {
        fetchAnalytics();
        fetchConstituents();
        fetchChanges();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/sp500/analytics');
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const fetchConstituents = async (sector?: string, asOfDate?: string) => {
        try {
            let url = '/api/sp500/constituents';
            const params = new URLSearchParams();

            if (sector) params.append('sector', sector);
            if (asOfDate && asOfDate !== 'current') params.append('asOfDate', asOfDate);

            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url);
            const data = await res.json();
            setConstituents(data.constituents);
            setConstituentCount(data.count || data.constituents.length);
        } catch (error) {
            console.error('Error fetching constituents:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChanges = async () => {
        try {
            const res = await fetch('/api/sp500/changes?limit=100');
            const data = await res.json();
            setChanges(data.changes);
        } catch (error) {
            console.error('Error fetching changes:', error);
        }
    };

    const handleSectorFilter = (sector: string) => {
        setSelectedSector(sector);
        setCurrentPage(1);
        fetchConstituents(sector || undefined, selectedDate !== 'current' ? selectedDate : undefined);
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setCurrentPage(1);
        fetchConstituents(selectedSector || undefined, date !== 'current' ? date : undefined);
    };

    // Filter constituents by search
    const filteredConstituents = constituents.filter(c =>
        c.symbol.toLowerCase().includes(searchTicker.toLowerCase()) ||
        c.security.toLowerCase().includes(searchTicker.toLowerCase())
    );

    // Sort constituents
    const sortedConstituents = [...filteredConstituents].sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'symbol') {
            comparison = a.symbol.localeCompare(b.symbol);
        } else if (sortBy === 'company') {
            comparison = a.security.localeCompare(b.security);
        } else if (sortBy === 'date_added') {
            comparison = new Date(a.date_added).getTime() - new Date(b.date_added).getTime();
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const totalPages = Math.ceil(sortedConstituents.length / itemsPerPage);
    const paginatedConstituents = sortedConstituents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (column: 'symbol' | 'company' | 'date_added') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    if (loading || !analytics) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="page-title text-4xl font-bold mb-2">S&P 500 Index</h1>
                <p className="text-gray-600 mb-8">Constituents, historical changes, and analytics</p>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl font-bold text-blue-600">{analytics.stats.total_constituents}</div>
                        <div className="text-sm text-gray-600">Total Companies</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl font-bold text-green-600">{analytics.stats.total_sectors}</div>
                        <div className="text-sm text-gray-600">Sectors</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl font-bold text-purple-600">{analytics.stats.total_sub_industries}</div>
                        <div className="text-sm text-gray-600">Sub-Industries</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl font-bold text-orange-600">{analytics.stats.total_changes}</div>
                        <div className="text-sm text-gray-600">Historical Changes</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl font-bold text-red-600">{analytics.stats.original_1957_members}</div>
                        <div className="text-sm text-gray-600">Since 1957</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-medium ${activeTab === 'overview'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('constituents')}
                        className={`px-6 py-3 font-medium ${activeTab === 'constituents'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Constituents
                    </button>
                    <button
                        onClick={() => setActiveTab('changes')}
                        className={`px-6 py-3 font-medium ${activeTab === 'changes'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Historical Changes
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Sector Breakdown */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-2xl font-bold mb-4">Sector Breakdown</h2>
                            <div className="space-y-3">
                                {analytics.sectorBreakdown.map((sector) => (
                                    <div key={sector.gics_sector}>
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">{sector.gics_sector}</span>
                                            <span className="text-gray-600">
                                                {sector.count} ({sector.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${sector.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Top Sub-Industries */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-2xl font-bold mb-4">Top 10 Sub-Industries</h2>
                                <div className="space-y-2">
                                    {analytics.topSubIndustries.map((industry, idx) => (
                                        <div key={industry.gics_sub_industry} className="flex justify-between">
                                            <span className="text-sm">
                                                {idx + 1}. {industry.gics_sub_industry}
                                            </span>
                                            <span className="font-medium">{industry.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Removal Reasons */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h2 className="text-2xl font-bold mb-4">Removal Reasons</h2>
                                <div className="space-y-3">
                                    {analytics.removalReasons.map((reason) => (
                                        <div key={reason.reason_category}>
                                            <div className="flex justify-between mb-1">
                                                <span className="font-medium">{reason.reason_category}</span>
                                                <span className="text-gray-600">{reason.count}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${(reason.count / analytics.removalReasons[0].count) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Constituents Tab */}
                {activeTab === 'constituents' && (
                    <div className="bg-white rounded-lg shadow">
                        {selectedDate !== 'current' && (
                            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 m-6 mb-0">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            Viewing historical data as of <span className="font-bold">{selectedDate}</span>.
                                            This shows the {constituentCount} companies that were in the S&P 500 at that date.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="p-6 border-b space-y-4">
                            <div className="flex gap-4 items-center flex-wrap">
                                <div className="flex gap-2 items-center">
                                    <label className="font-medium">As of Date:</label>
                                    <select
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="px-4 py-2 border rounded-lg"
                                    >
                                        <option value="current">Current (2026)</option>
                                        <option value="2025-12-31">Dec 31, 2025</option>
                                        <option value="2024-12-31">Dec 31, 2024</option>
                                        <option value="2023-12-31">Dec 31, 2023</option>
                                        <option value="2022-12-31">Dec 31, 2022</option>
                                        <option value="2021-12-31">Dec 31, 2021</option>
                                        <option value="2020-12-31">Dec 31, 2020</option>
                                        <option value="2019-12-31">Dec 31, 2019</option>
                                        <option value="2018-12-31">Dec 31, 2018</option>
                                        <option value="2017-12-31">Dec 31, 2017</option>
                                        <option value="2016-12-31">Dec 31, 2016</option>
                                        <option value="2015-12-31">Dec 31, 2015</option>
                                        <option value="2014-12-31">Dec 31, 2014</option>
                                        <option value="2013-12-31">Dec 31, 2013</option>
                                        <option value="2012-12-31">Dec 31, 2012</option>
                                        <option value="2011-12-31">Dec 31, 2011</option>
                                        <option value="2010-12-31">Dec 31, 2010</option>
                                        <option value="2009-12-31">Dec 31, 2009</option>
                                        <option value="2008-12-31">Dec 31, 2008</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label className="font-medium">Filter by Sector:</label>
                                    <select
                                        value={selectedSector}
                                        onChange={(e) => handleSectorFilter(e.target.value)}
                                        className="px-4 py-2 border rounded-lg"
                                    >
                                        <option value="">All Sectors</option>
                                        {analytics.sectorBreakdown.map((sector) => (
                                            <option key={sector.gics_sector} value={sector.gics_sector}>
                                                {sector.gics_sector}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2 items-center flex-1">
                                    <label className="font-medium">Search:</label>
                                    <input
                                        type="text"
                                        placeholder="Ticker or company name..."
                                        value={searchTicker}
                                        onChange={(e) => {
                                            setSearchTicker(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2 border rounded-lg flex-1 max-w-md"
                                    />
                                </div>
                                <div className="text-sm text-gray-600">
                                    Showing {sortedConstituents.length} of {constituentCount} companies
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
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
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('company')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Company
                                                {sortBy === 'company' && (
                                                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Sector
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Sub-Industry
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('date_added')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Date Added
                                                {sortBy === 'date_added' && (
                                                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedConstituents.map((company) => (
                                        <tr key={company.symbol} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-blue-600">
                                                {company.symbol}
                                            </td>
                                            <td className="px-6 py-4">{company.security}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{company.gics_sector}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {company.gics_sub_industry}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{company.date_added}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="p-6 border-t flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Changes Tab */}
                {activeTab === 'changes' && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Recent Changes</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Removed</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {changes.map((change, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm whitespace-nowrap font-medium">{change.date}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    {change.added_ticker ? (
                                                        <div>
                                                            <span className="font-mono font-bold text-green-600">{change.added_ticker}</span>
                                                            <div className="text-xs text-gray-600">{change.added_company}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {change.removed_ticker ? (
                                                        <div>
                                                            <span className="font-mono font-bold text-red-600">{change.removed_ticker}</span>
                                                            <div className="text-xs text-gray-600">{change.removed_company}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600">{change.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
