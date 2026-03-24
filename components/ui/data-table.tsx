'use client';

export interface Column<T> {
    key: keyof T;
    header: string;
    align?: 'left' | 'right' | 'center';
    render?: (value: T[keyof T], row: T) => React.ReactNode;
    className?: (value: T[keyof T], row: T) => string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    caption?: string;
    keyField: keyof T;
    stickyHeader?: boolean;
}

export default function DataTable<T>({
    columns,
    data,
    caption,
    keyField,
    stickyHeader = false,
}: DataTableProps<T>) {
    const alignClass = (align?: string) => {
        if (align === 'right') return 'text-right';
        if (align === 'center') return 'text-center';
        return 'text-left';
    };

    return (
        <div className="overflow-x-auto rounded-2xl border-2 border-border">
            <table className="w-full" role="table">
                {caption && (
                    <caption className="sr-only">{caption}</caption>
                )}
                <thead className={`bg-muted ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                scope="col"
                                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${alignClass(col.align)}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-card">
                    {data.map((row) => (
                        <tr
                            key={String(row[keyField])}
                            className="border-t border-border hover:bg-muted/50 transition-colors"
                        >
                            {columns.map((col) => {
                                const val = row[col.key];
                                const extra = col.className ? col.className(val, row) : '';
                                return (
                                    <td
                                        key={String(col.key)}
                                        className={`px-4 py-3 tabular-nums ${alignClass(col.align)} ${extra}`}
                                    >
                                        {col.render ? col.render(val, row) : String(val ?? '—')}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
