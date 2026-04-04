'use client';

import { useRef, useState } from 'react';
import DataTable from '@/components/data-table';

const columns = [
    { key: 'country', label: 'Country', align: 'left' as const },
    { key: 'volume', label: 'Mb/d', align: 'right' as const },
    { key: 'share', label: 'World Share', align: 'right' as const },
    { key: 'perCapita', label: 'Gal/Capita/Year', align: 'right' as const },
];

const allData = [
    { country: 'United States', volume: '20.46', share: '19.95%', perCapita: '908.2' },
    { country: 'China', volume: '16.37', share: '15.96%', perCapita: '176.8' },
    { country: 'India', volume: '5.60', share: '5.46%', perCapita: '59.2' },
    { country: 'Russia', volume: '3.79', share: '3.70%', perCapita: '401.3' },
    { country: 'Saudi Arabia', volume: '3.63', share: '3.54%', perCapita: '1,638.8' },
    { country: 'Brazil', volume: '3.27', share: '3.19%', perCapita: '236.4' },
    { country: 'Japan', volume: '3.14', share: '3.06%', perCapita: '389.8' },
    { country: 'South Korea', volume: '2.51', share: '2.45%', perCapita: '745.4' },
    { country: 'Canada', volume: '2.37', share: '2.31%', perCapita: '914.1' },
    { country: 'Germany', volume: '2.06', share: '2.01%', perCapita: '372.9' },
    { country: 'Iran', volume: '1.97', share: '1.92%', perCapita: '329.9' },
    { country: 'Mexico', volume: '1.85', share: '1.80%', perCapita: '216.8' },
    { country: 'Indonesia', volume: '1.63', share: '1.59%', perCapita: '88.0' },
    { country: 'France', volume: '1.51', share: '1.48%', perCapita: '348.9' },
    { country: 'Singapore', volume: '1.48', share: '1.45%', perCapita: '3,895.8' },
    { country: 'United Kingdom', volume: '1.40', share: '1.36%', perCapita: '309.4' },
    { country: 'Thailand', volume: '1.37', share: '1.34%', perCapita: '293.6' },
    { country: 'Spain', volume: '1.32', share: '1.29%', perCapita: '423.2' },
    { country: 'Italy', volume: '1.24', share: '1.21%', perCapita: '320.5' },
    { country: 'Australia', volume: '1.15', share: '1.12%', perCapita: '657.3' },
    { country: 'Turkey', volume: '1.11', share: '1.08%', perCapita: '194.0' },
    { country: 'Iraq', volume: '1.06', share: '1.03%', perCapita: '353.2' },
    { country: 'Egypt', volume: '0.95', share: '0.93%', perCapita: '125.4' },
    { country: 'UAE', volume: '0.88', share: '0.86%', perCapita: '1,220.6' },
    { country: 'Taiwan', volume: '0.87', share: '0.85%', perCapita: '575.5' },
    { country: 'Netherlands', volume: '0.82', share: '0.80%', perCapita: '687.8' },
    { country: 'Malaysia', volume: '0.75', share: '0.73%', perCapita: '322.1' },
    { country: 'Poland', volume: '0.74', share: '0.72%', perCapita: '293.6' },
    { country: 'Argentina', volume: '0.73', share: '0.72%', perCapita: '246.4' },
    { country: 'South Africa', volume: '0.61', share: '0.60%', perCapita: '146.6' },
    { country: 'Belgium', volume: '0.60', share: '0.59%', perCapita: '787.3' },
    { country: 'Vietnam', volume: '0.56', share: '0.54%', perCapita: '84.3' },
    { country: 'Nigeria', volume: '0.49', share: '0.48%', perCapita: '32.5' },
    { country: 'Pakistan', volume: '0.48', share: '0.47%', perCapita: '29.2' },
    { country: 'Philippines', volume: '0.47', share: '0.46%', perCapita: '62.7' },
    { country: 'Algeria', volume: '0.46', share: '0.45%', perCapita: '149.8' },
    { country: 'Kuwait', volume: '0.42', share: '0.41%', perCapita: '1,302.1' },
    { country: 'Kazakhstan', volume: '0.41', share: '0.40%', perCapita: '306.8' },
    { country: 'Chile', volume: '0.39', share: '0.38%', perCapita: '299.3' },
    { country: 'Colombia', volume: '0.37', share: '0.36%', perCapita: '107.0' },
    { country: 'Morocco', volume: '0.32', share: '0.31%', perCapita: '128.6' },
    { country: 'Greece', volume: '0.31', share: '0.30%', perCapita: '472.5' },
    { country: 'Ecuador', volume: '0.29', share: '0.28%', perCapita: '243.4' },
    { country: 'Bangladesh', volume: '0.29', share: '0.28%', perCapita: '25.4' },
    { country: 'Hong Kong', volume: '0.28', share: '0.27%', perCapita: '575.9' },
    { country: 'Qatar', volume: '0.28', share: '0.27%', perCapita: '1,389.4' },
    { country: 'Sweden', volume: '0.27', share: '0.26%', perCapita: '383.7' },
    { country: 'Peru', volume: '0.26', share: '0.26%', perCapita: '118.4' },
    { country: 'Austria', volume: '0.24', share: '0.24%', perCapita: '406.9' },
    { country: 'Venezuela', volume: '0.23', share: '0.23%', perCapita: '126.5' },
];

const summary = [
    { country: 'World total', volume: '102.50', share: '—', perCapita: '—' },
];

const TOP_N = 10;

export default function OilConsumption() {
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
