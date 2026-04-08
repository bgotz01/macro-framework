'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, ChevronUp } from 'lucide-react';

type SortKey = 'startDate' | 'endDate' | 'months';
type SortDir = 'asc' | 'desc';

interface RegimePeriod {
    regime: string;
    startDate: string;
    endDate: string;
    months: number;
}

export default function RegimeHistoryTable() {
    const [periods, setPeriods] = useState<RegimePeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRegime, setSelectedRegime] = useState<string>('all');
    const [sortKey, setSortKey] = useState<SortKey>('startDate');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const itemsPerPage = 20;

    useEffect(() => {
        async function loadRegimePeriods() {
            try {
                const response = await fetch('/api/regime-history');
                const data = await response.json();
                setPeriods(data.periods || []);
            } catch (error) {
                console.error('Failed to load regime history:', error);
            } finally {
                setLoading(false);
            }
        }

        loadRegimePeriods();
    }, []);

    const getRegimeColor = (regime: string): string => {
        const colors: Record<string, string> = {
            'broad growth': 'border-l-green-500',
            'long duration': 'border-l-blue-500',
            'overvaluation': 'border-l-yellow-500',
            'crisis': 'border-l-red-900',
            'bond stress': 'border-l-orange-600',
            'liquidity shock': 'border-l-purple-500',
            'liquidity contraction': 'border-l-orange-500',
            'normal': 'border-l-gray-500',
        };
        return colors[regime.toLowerCase()] ?? 'border-l-gray-400';
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Loading regime history...
            </div>
        );
    }

    // Calculate pagination
    const filteredPeriods = selectedRegime === 'all'
        ? periods
        : periods.filter(p => p.regime === selectedRegime);

    const uniqueRegimes = Array.from(new Set(periods.map(p => p.regime))).sort();

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRegimeFilter = (regime: string) => {
        setSelectedRegime(regime);
        setCurrentPage(1);
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
        setCurrentPage(1);
    };

    const sortedPeriods = [...filteredPeriods].sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'months') {
            cmp = a.months - b.months;
        } else {
            const aVal = sortKey === 'endDate' && a.endDate === 'Current' ? Date.now() : new Date(a[sortKey]).getTime();
            const bVal = sortKey === 'endDate' && b.endDate === 'Current' ? Date.now() : new Date(b[sortKey]).getTime();
            cmp = aVal - bVal;
        }
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedPeriods = isExpanded ? sortedPeriods.slice(startIndex, endIndex) : [];

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            setCurrentPage(1);
        }
    };

    return (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {/* Header - Always visible */}
            <button
                onClick={toggleExpanded}
                className="w-full px-6 py-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
            >
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                        Regime History
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {filteredPeriods.length} regime periods {selectedRegime !== 'all' ? `(filtered)` : 'from 1960 to present'}
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {isExpanded ? 'Click to collapse' : 'Click to expand'}
                </div>
            </button>

            {/* Table - Only visible when expanded */}
            {isExpanded && (
                <>
                    {/* Filter dropdown */}
                    <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
                        <label className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">Filter by Regime:</span>
                            <select
                                value={selectedRegime}
                                onChange={(e) => handleRegimeFilter(e.target.value)}
                                className="px-3 py-1.5 rounded-lg bg-background border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="all">All Regimes ({periods.length})</option>
                                {uniqueRegimes.map((regime) => {
                                    const count = periods.filter(p => p.regime === regime).length;
                                    return (
                                        <option key={regime} value={regime}>
                                            {regime} ({count})
                                        </option>
                                    );
                                })}
                            </select>
                        </label>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/50">
                            <thead className="bg-muted/30">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Regime
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                                        onClick={() => handleSort('startDate')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            Start Date
                                            {sortKey === 'startDate'
                                                ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                : <ChevronUp className="w-3 h-3 opacity-30" />}
                                        </span>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                                        onClick={() => handleSort('endDate')}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            End Date
                                            {sortKey === 'endDate'
                                                ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                : <ChevronUp className="w-3 h-3 opacity-30" />}
                                        </span>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                                        onClick={() => handleSort('months')}
                                    >
                                        <span className="inline-flex items-center justify-end gap-1 w-full">
                                            Duration (Months)
                                            {sortKey === 'months'
                                                ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                : <ChevronUp className="w-3 h-3 opacity-30" />}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-background divide-y divide-border/30">
                                {displayedPeriods.map((period, index) => (
                                    <tr
                                        key={index}
                                        className={`hover:bg-muted/20 transition-colors border-l-4 ${getRegimeColor(period.regime)}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                            {period.regime}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {new Date(period.startDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {period.endDate === 'Current'
                                                ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">Current</span>
                                                : new Date(period.endDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short'
                                                })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground text-right font-mono">
                                            {period.months}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-muted/30">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredPeriods.length)} of {filteredPeriods.length} periods
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-background hover:bg-muted/50 border border-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-background hover:bg-muted/50 border border-border/50 text-foreground'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return <span key={page} className="px-2 text-muted-foreground">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-background hover:bg-muted/50 border border-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
