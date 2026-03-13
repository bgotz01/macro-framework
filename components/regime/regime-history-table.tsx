'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

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
        const normalized = regime.toLowerCase();

        // Green regimes: Broad Growth, Liquidity Shock, Long Duration
        if (normalized.includes('growth') ||
            normalized.includes('liquidity') ||
            normalized.includes('long duration')) {
            return 'border-l-green-500';
        }

        // Red regimes: Fragile, Crisis, Contraction
        if (normalized.includes('fragile') ||
            normalized.includes('crisis') ||
            normalized.includes('contraction')) {
            return 'border-l-red-500';
        }

        // Yellow for Overvaluation
        if (normalized.includes('overvaluation')) {
            return 'border-l-yellow-500';
        }

        // Blue for Normal, Deep Value, Bond Stress, and others
        return 'border-l-blue-500';
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Loading regime history...
            </div>
        );
    }

    // Calculate pagination
    const totalPages = Math.ceil(periods.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedPeriods = isExpanded ? periods.slice(startIndex, endIndex) : [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            setCurrentPage(1); // Reset to first page when expanding
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
                        {periods.length} regime periods from 1960 to present
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {isExpanded ? 'Click to collapse' : 'Click to expand'}
                </div>
            </button>

            {/* Table - Only visible when expanded */}
            {isExpanded && (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border/50">
                            <thead className="bg-muted/30">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Regime
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        End Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Duration (Months)
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
                                Showing {startIndex + 1} to {Math.min(endIndex, periods.length)} of {periods.length} periods
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
