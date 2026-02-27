'use client';

import { useState, useEffect } from 'react';
import DataTable from './data-table';
import { Card } from './ui/card';

interface FilterableDataTableProps {
    assetClass?: string;
    seriesName?: string;
    columnName?: string;
    startDate?: string;
    endDate?: string;
}

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

interface ApiResponse {
    data: DataRow[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

export default function FilterableDataTable({
    assetClass,
    seriesName,
    columnName = 'Value',
    startDate,
    endDate,
}: FilterableDataTableProps) {
    const [data, setData] = useState<DataRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        setPage(1);
    }, [assetClass, seriesName, columnName, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [assetClass, seriesName, columnName, startDate, endDate, page]);

    const fetchData = async () => {
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

            const response = await fetch(`/api/data-table?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch data');

            const result: ApiResponse = await response.json();
            setData(result.data);
            setPagination(result.pagination);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'date', label: 'Date', align: 'left' as const },
        { key: 'displayName', label: 'Series', align: 'left' as const },
        { key: 'assetClass', label: 'Asset Class', align: 'left' as const },
        {
            key: 'value',
            label: 'Value',
            align: 'right' as const,
            render: (value: number) => value?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        },
        { key: 'units', label: 'Units', align: 'left' as const },
        { key: 'geography', label: 'Geography', align: 'left' as const },
    ];

    if (error) {
        return (
            <Card className="p-8 text-center">
                <p className="text-destructive">Error: {error}</p>
            </Card>
        );
    }

    if (!loading && data.length === 0) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">No data found. Try adjusting your filters.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                )}
                <DataTable columns={columns} data={data} />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                    {pagination.total} results
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages || loading}
                        className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
