'use client';

import { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/ui/data-table';

interface GoldReserveRow {
    year: number;
    troyOunces: string;
    metricTons: string;
    goldPrice: string;
    nominalValue: string;
    realValue: string;
}

function parseGoldCsv(text: string): GoldReserveRow[] {
    try {
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            console.error('CSV file appears to be empty or malformed');
            return [];
        }

        const dataLines = lines.slice(1).filter(Boolean);
        console.log(`Parsing ${dataLines.length} data rows from CSV`);

        return dataLines.map((line, index) => {
            // Split by comma but handle quoted values
            const cols = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));

            if (cols.length < 6) {
                console.warn(`Row ${index + 1} has insufficient columns:`, cols);
            }

            return {
                year: parseInt(cols[0]) || 0,
                troyOunces: cols[1] || '',
                metricTons: cols[2] || '',
                goldPrice: cols[3] || '',
                nominalValue: cols[4] || '',
                realValue: cols[5] || '',
            };
        });
    } catch (error) {
        console.error('Error parsing CSV:', error);
        return [];
    }
}

function valueColor(val: string | number): string {
    const s = String(val);
    if (s.includes('trillion')) return 'text-amber-500 dark:text-amber-400 font-semibold';
    return '';
}

const columns: Column<GoldReserveRow>[] = [
    { key: 'year', header: 'Year', align: 'left', render: (v) => <span className="font-medium">{String(v)}</span> },
    { key: 'troyOunces', header: 'Troy Oz (M)', align: 'right' },
    { key: 'metricTons', header: 'Metric Tons', align: 'right' },
    { key: 'goldPrice', header: 'Gold Price', align: 'right' },
    { key: 'nominalValue', header: 'Nominal Value', align: 'right' },
    { key: 'realValue', header: 'Value (2026 $)', align: 'right', className: (v) => valueColor(v) },
];

export default function GoldReservesTable() {
    const [data, setData] = useState<GoldReserveRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/gold-reserves')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.text();
            })
            .then((text) => {
                console.log('CSV data loaded, length:', text.length);
                const parsedData = parseGoldCsv(text);
                console.log('Parsed data rows:', parsedData.length);
                setData(parsedData);
                setError(null);
            })
            .catch((err) => {
                console.error('Failed to load gold reserves:', err);
                setError(err.message);
                setData([]); // Set empty array on error
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p className="text-center text-muted-foreground py-8">Loading gold reserves data…</p>;
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-2">Failed to load gold reserves data</p>
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        );
    }

    if (data.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No gold reserves data available</p>;
    }

    return (
        <DataTable
            columns={columns}
            data={data}
            keyField="year"
            caption="U.S. Gold Reserves — Historical Holdings and Market Value"
        />
    );
}
