'use client';

import { useEffect, useState } from 'react';

interface StockRow {
    label: string;
    sublabel: string;
    values: string[];
}

interface StockDataTableProps {
    csvPath: string;
    title?: string;
}

function parseCsv(text: string): { years: string[]; rows: StockRow[] } {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return { years: [], rows: [] };

    const header = lines[0].split(',');
    // First two columns are Symbol/unit and Metric, rest are years
    const years = header.slice(2);

    let currentLabel = '';
    const rows: StockRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        // Handle quoted values with commas inside
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        for (const ch of lines[i]) {
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        values.push(current.trim());

        const col0 = values[0];
        const metric = values[1];
        const dataValues = values.slice(2);

        if (col0) currentLabel = col0;

        rows.push({
            label: currentLabel,
            sublabel: metric,
            values: dataValues,
        });
    }

    return { years, rows };
}

export default function StockDataTable({ csvPath, title }: StockDataTableProps) {
    const [years, setYears] = useState<string[]>([]);
    const [rows, setRows] = useState<StockRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(csvPath)
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load ${csvPath}`);
                return res.text();
            })
            .then((text) => {
                const parsed = parseCsv(text);
                setYears(parsed.years);
                setRows(parsed.rows);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [csvPath]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                Loading data…
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-400 text-sm py-4">{error}</div>
        );
    }

    return (
        <div className="space-y-4">
            {title && (
                <h2 className="text-lg font-medium tracking-wide">{title}</h2>
            )}
            <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Metric</th>
                            {years.map((year, idx) => (
                                <th key={idx} className="text-right px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                    {year}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => {
                            const isGrowth = row.sublabel.toLowerCase() === 'growth';
                            return (
                                <tr key={i} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${isGrowth ? 'bg-emerald-500/10' : ''}`} style={isGrowth ? { boxShadow: 'inset 0 0 0 1.5px rgb(16 185 129 / 0.5)' } : undefined}>
                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                        <span className={isGrowth ? 'text-emerald-400 font-medium' : 'text-foreground'}>{row.sublabel}</span>
                                        {rows[i - 1]?.label !== row.label && (
                                            <span className="ml-2 text-xs text-muted-foreground">({row.label})</span>
                                        )}
                                    </td>
                                    {row.values.map((val, j) => {
                                        const isNegative = isGrowth && val.startsWith('-');
                                        const growthColor = isNegative ? 'text-red-400' : 'text-emerald-400';
                                        return (
                                            <td key={j} className={`text-right px-4 py-2.5 whitespace-nowrap tabular-nums ${isGrowth ? `${growthColor} font-semibold` : 'text-muted-foreground'}`}>
                                                {val || '—'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
