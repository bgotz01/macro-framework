'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface DataRow {
    date: string;
    timestamp: number;
    assetClass: string;
    seriesName: string;
    displayName: string;
    columnName: string;
    value: number;
    units?: string;
    geography?: string;
}

interface PaginationInfo {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

interface DataTableProps {
    assetClass?: string;
    seriesName?: string;
    columnName?: string;
    startDate?: string;
    endDate?: string;
}

export default function DataTable({
    assetClass,
    seriesName,
    columnName = 'Value',
    startDate,
    endDate
}: DataTableProps) {
    const [data, setData] = useState<DataRow[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData(1);
    }, [assetClass, seriesName, columnName, startDate, endDate]);

    const fetchData = async (page: number) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: '20',
            });

            if (assetClass) params.append('assetClass', assetClass);
            if (seriesName) params.append('seriesName', seriesName);
            if (columnName) params.append('columnName', columnName);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`/api/data-table?${params}`);
            if (!response.ok) throw new Error('Failed to fetch data');

            const result = await response.json();
            setData(result.data);
            setPagination(result.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchData(newPage);
        }
    };

    const formatValue = (value: number, units?: string) => {
        if (units === 'percent') {
            return `${value.toFixed(2)}%`;
        } else if (units === 'billions') {
            return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}B`;
        } else if (units === 'millions') {
            return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
        } else if (units === 'index' || units === 'ratio') {
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
    };

    if (loading && data.length === 0) {
        return (
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">Loading data...</div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">No data found</div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            <Card className="overflow-hidden max-w-md">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                                    Value
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.map((row, idx) => (
                                <tr
                                    key={`${row.timestamp}-${row.seriesName}-${row.columnName}-${idx}`}
                                    className="hover:bg-muted/30 transition-colors"
                                >
                                    <td className="px-3 py-2 text-sm text-foreground whitespace-nowrap">
                                        {row.date}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-foreground text-right font-mono">
                                        {formatValue(row.value, row.units)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs max-w-md">
                <div className="text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                    {pagination.total.toLocaleString()} results
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1 || loading}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        First
                    </button>
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Prev
                    </button>
                    <span className="px-2 py-1 text-xs text-foreground">
                        {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || loading}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages || loading}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Last
                    </button>
                </div>
            </div>
        </div>
    );
}
