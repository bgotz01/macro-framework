'use client';

import { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/ui/data-table';

interface JapanRow {
    year: number;
    nikkei: string;
    earnings: string;
    pe: string;
    ey: string;
    cpi: string;
    realEY: string;
    jgb10y: string;
    eyp: string;
    real10y: string;
}

function realEYColor(val: string): string {
    const n = parseFloat(val);
    if (isNaN(n)) return '';
    if (n < 0) return 'text-red-600 dark:text-red-400 font-medium';
    if (n < 1) return 'text-yellow-600 dark:text-yellow-400 font-medium';
    return 'text-green-600 dark:text-green-400 font-medium';
}

function pctColor(val: string): string {
    const n = parseFloat(val);
    if (isNaN(n)) return '';
    if (n < 0) return 'text-red-600 dark:text-red-400 font-medium';
    if (n > 2) return 'text-green-600 dark:text-green-400 font-medium';
    return 'text-orange-600 dark:text-orange-400 font-medium';
}

function parseCsvSection(lines: string[], startIdx: number): JapanRow[] {
    const rows: JapanRow[] = [];
    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith(',')) break;
        // Match: Year,"Nikkei",Earnings,P/E,EY,CPI,RealEY,10Y,EYP,Real10Y
        const match = line.match(
            /^(\d{4}),"?([\d,]+)"?,([.\d]+),([.\d]+),([-.\d]+%),([-.\d]+%),([-.\d]+%),([-.\d]+%),([-.\d]+%),([-.\d]+%)$/
        );
        if (!match) continue;
        rows.push({
            year: parseInt(match[1]),
            nikkei: match[2],
            earnings: match[3],
            pe: match[4],
            ey: match[5],
            cpi: match[6],
            realEY: match[7],
            jgb10y: match[8],
            eyp: match[9],
            real10y: match[10],
        });
    }
    return rows;
}

const columns: Column<JapanRow>[] = [
    { key: 'year', header: 'Year', align: 'left', render: (v) => <span className="font-medium">{String(v)}</span> },
    { key: 'nikkei', header: 'Nikkei', align: 'right' },
    { key: 'earnings', header: 'Earnings', align: 'right' },
    { key: 'pe', header: 'P/E', align: 'right' },
    { key: 'ey', header: 'EY', align: 'right' },
    { key: 'cpi', header: 'CPI Inflation', align: 'right' },
    { key: 'realEY', header: 'Real EY', align: 'right', className: (v) => realEYColor(String(v)) },
    { key: 'jgb10y', header: '10Y JGB', align: 'right' },
    { key: 'eyp', header: 'EYP', align: 'right', className: (v) => pctColor(String(v)) },
    { key: 'real10y', header: 'Real 10Y', align: 'right', className: (v) => pctColor(String(v)) },
];

const rollingColumns: Column<JapanRow>[] = [
    { key: 'year', header: 'Year', align: 'left', render: (v) => <span className="font-medium">{String(v)}</span> },
    { key: 'nikkei', header: 'Nikkei', align: 'right' },
    { key: 'earnings', header: '5yr EPS', align: 'right' },
    { key: 'pe', header: 'P/E 5yr', align: 'right' },
    { key: 'ey', header: 'EY', align: 'right' },
    { key: 'cpi', header: 'CPI', align: 'right' },
    { key: 'realEY', header: 'Real EY', align: 'right', className: (v) => realEYColor(String(v)) },
    { key: 'jgb10y', header: '10Y JGB', align: 'right' },
    { key: 'eyp', header: 'EYP', align: 'right', className: (v) => pctColor(String(v)) },
    { key: 'real10y', header: 'Real 10Y', align: 'right', className: (v) => pctColor(String(v)) },
];

export default function JapanComparisonPage() {
    const [annual, setAnnual] = useState<JapanRow[]>([]);
    const [rolling, setRolling] = useState<JapanRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'annual' | 'rolling'>('annual');

    useEffect(() => {
        fetch('/api/japan-data')
            .then((res) => res.text())
            .then((text) => {
                const lines = text.split('\n');
                // Find section starts
                const annualStart = lines.findIndex((l) => l.startsWith('Year,Nikkei'));
                const rollingStart = lines.findIndex((l) => l.startsWith('5YR Rolling'));

                if (annualStart >= 0) setAnnual(parseCsvSection(lines, annualStart + 1));
                if (rollingStart >= 0) setRolling(parseCsvSection(lines, rollingStart + 1));
            })
            .catch((err) => console.error('Failed to load Japan data:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <p className="text-center text-muted-foreground">Loading Japan 1980s data…</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Japan 1980s — Macro Valuation</h1>
                <p className="text-muted-foreground mt-1">
                    Nikkei earnings, valuation, and real yield metrics through the Japanese bubble era.
                </p>
            </div>

            {/* Tab toggle */}
            <div className="flex gap-2">
                {(['annual', 'rolling'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${activeTab === tab
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-card border-border hover:bg-muted'
                            }`}
                    >
                        {tab === 'annual' ? 'Annual' : '5YR Rolling'}
                    </button>
                ))}
            </div>

            {activeTab === 'annual' ? (
                <DataTable
                    columns={columns}
                    data={annual}
                    keyField="year"
                    caption="Japan 1980s Annual Macro Valuation"
                />
            ) : (
                <DataTable
                    columns={rollingColumns}
                    data={rolling}
                    keyField="year"
                    caption="Japan 1980s 5-Year Rolling Valuation"
                />
            )}
        </div>
    );
}
