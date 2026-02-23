interface Column {
    key: string;
    label: string;
    align?: 'left' | 'right';
    render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    summaryRows?: any[];
}

export default function DataTable({ columns, data, summaryRows = [] }: DataTableProps) {
    return (
        <div className="overflow-x-auto rounded-2xl border-2 border-border">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-4 py-3 text-sm font-semibold ${column.align === 'right' ? 'text-right' : 'text-left'
                                    }`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-card">
                    {data.map((row, index) => (
                        <tr
                            key={index}
                            className="border-t border-border hover:bg-muted/50 transition-colors"
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={`px-4 py-3 ${column.align === 'right' ? 'text-right' : 'text-left'
                                        }`}
                                >
                                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {summaryRows.map((row, index) => (
                        <tr
                            key={`summary-${index}`}
                            className="border-t-2 border-border bg-muted/70"
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={`px-4 py-3 font-semibold ${column.align === 'right' ? 'text-right' : 'text-left'
                                        }`}
                                >
                                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
