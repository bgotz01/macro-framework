'use client';

import { useRef, useState } from 'react';
import DataTable from '@/components/data-table';

const columns = [
    { key: 'country', label: 'Country', align: 'left' as const },
    { key: 'volume', label: 'Mb/d', align: 'right' as const },
    { key: 'share', label: 'Share of world total', align: 'right' as const },
    { key: 'reserves', label: 'Proven Reserves (Bn bbl)', align: 'right' as const },
];

// Reserves only available for top producers; others marked —
const allData = [
    { country: 'United States', volume: '22.84', share: '22.1%', reserves: '74–84' },
    { country: 'Saudi Arabia', volume: '10.87', share: '10.5%', reserves: '267' },
    { country: 'Russia', volume: '10.53', share: '10.2%', reserves: '80–107' },
    { country: 'Canada', volume: '6.00', share: '5.8%', reserves: '163' },
    { country: 'China', volume: '5.33', share: '5.2%', reserves: '28' },
    { country: 'Iran', volume: '4.63', share: '4.5%', reserves: '209' },
    { country: 'United Arab Emirates', volume: '4.51', share: '4.4%', reserves: '113' },
    { country: 'Iraq', volume: '4.51', share: '4.4%', reserves: '145' },
    { country: 'Brazil', volume: '4.28', share: '4.1%', reserves: '16' },
    { country: 'Kuwait', volume: '2.78', share: '2.7%', reserves: '102' },
    { country: 'Mexico', volume: '2.01', share: '1.9%', reserves: '—' },
    { country: 'Norway', volume: '2.01', share: '1.9%', reserves: '—' },
    { country: 'Kazakhstan', volume: '1.90', share: '1.8%', reserves: '30' },
    { country: 'Qatar', volume: '1.85', share: '1.8%', reserves: '25' },
    { country: 'Nigeria', volume: '1.56', share: '1.5%', reserves: '37' },
    { country: 'Algeria', volume: '1.38', share: '1.3%', reserves: '—' },
    { country: 'Libya', volume: '1.18', share: '1.1%', reserves: '48' },
    { country: 'Angola', volume: '1.16', share: '1.1%', reserves: '—' },
    { country: 'Oman', volume: '1.00', share: '1.0%', reserves: '—' },
    { country: 'India', volume: '0.95', share: '0.9%', reserves: '—' },
    { country: 'Venezuela', volume: '0.90', share: '0.9%', reserves: '303' },
    { country: 'Argentina', volume: '0.89', share: '0.9%', reserves: '—' },
    { country: 'Indonesia', volume: '0.84', share: '0.8%', reserves: '—' },
    { country: 'Colombia', volume: '0.80', share: '0.8%', reserves: '—' },
    { country: 'United Kingdom', volume: '0.74', share: '0.7%', reserves: '—' },
    { country: 'Egypt', volume: '0.64', share: '0.6%', reserves: '—' },
    { country: 'Guyana', volume: '0.62', share: '0.6%', reserves: '—' },
    { country: 'Azerbaijan', volume: '0.60', share: '0.6%', reserves: '—' },
    { country: 'Malaysia', volume: '0.57', share: '0.6%', reserves: '—' },
    { country: 'Ecuador', volume: '0.48', share: '0.5%', reserves: '—' },
    { country: 'Thailand', volume: '0.42', share: '0.4%', reserves: '—' },
    { country: 'Australia', volume: '0.40', share: '0.4%', reserves: '—' },
    { country: 'Turkmenistan', volume: '0.27', share: '0.3%', reserves: '—' },
    { country: 'Congo', volume: '0.25', share: '0.2%', reserves: '—' },
    { country: 'Gabon', volume: '0.21', share: '0.2%', reserves: '—' },
    { country: 'Ghana', volume: '0.21', share: '0.2%', reserves: '—' },
    { country: 'Vietnam', volume: '0.20', share: '0.2%', reserves: '—' },
    { country: 'Bahrain', volume: '0.19', share: '0.2%', reserves: '—' },
    { country: 'Germany', volume: '0.18', share: '0.2%', reserves: '—' },
    { country: 'Chad', volume: '0.13', share: '0.1%', reserves: '—' },
    { country: 'Peru', volume: '0.12', share: '0.1%', reserves: '—' },
    { country: 'Italy', volume: '0.12', share: '0.1%', reserves: '—' },
    { country: 'Turkey', volume: '0.12', share: '0.1%', reserves: '—' },
    { country: 'South Korea', volume: '0.11', share: '0.1%', reserves: '—' },
    { country: 'France', volume: '0.11', share: '0.1%', reserves: '—' },
    { country: 'Brunei', volume: '0.10', share: '0.1%', reserves: '—' },
    { country: 'Japan', volume: '0.10', share: '0.1%', reserves: '—' },
    { country: 'Equatorial Guinea', volume: '0.10', share: '0.1%', reserves: '—' },
    { country: 'South Africa', volume: '0.09', share: '0.1%', reserves: '—' },
    { country: 'Netherlands', volume: '0.08', share: '0.1%', reserves: '—' },
];

const summary = [
    { country: 'World total', volume: '103.30', share: '—', reserves: '~1,700' },
];

const TOP_N = 10;

export default function OilProduction() {
    const [expanded, setExpanded] = useState(false);
    const topRef = useRef<HTMLDivElement>(null);
    const visibleData = expanded ? allData : allData.slice(0, TOP_N);

    function toggle() {
        if (expanded) topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setExpanded(v => !v);
    }

    return (
        <div ref={topRef}>
            <DataTable columns={columns} data={visibleData} summaryRows={expanded ? summary : undefined} />
            <button
                onClick={toggle}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
                {expanded ? 'Show less' : `Show all ${allData.length} countries`}
            </button>
        </div>
    );
}
