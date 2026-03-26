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
    const lines = text.trim().split('\n');
    return lines.slice(1).filter(Boolean).map((line) => {
        const cols = line.match(/(".*?"|[^,]+)/g) ?? [];
        const clean = (s?: string) => s?.replace(/^"|"$/g, '').trim() ?? '';
        return {
            year: parseInt(clean(cols[0])),
            troyOunces: clean(cols[1]),
            metricTons: clean(cols[2]),
            goldPrice: clean(cols[3]),
            nominalValue: clean(cols[4]),
            realValue: clean(cols[5]),
        };
    });
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

    useEffect(() => {
        fetch('/data/case-study/gold-reserves.csv')
            .then((res) => res.text())
            .then((text) => setData(parseGoldCsv(text)))
            .catch((err) => console.error('Failed to load gold reserves:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p className="text-center text-muted-foreground py-8">Loading gold reserves data…</p>;
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
