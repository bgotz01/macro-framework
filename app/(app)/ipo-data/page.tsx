import { readFileSync } from 'fs';
import { join } from 'path';
import IPOChart from '@/components/charts/ipo-chart';

export interface IPORow {
    year: number;
    ipos: number;
    firstDayEW: number;
    firstDayPW: number;
    firstDayMedian: number;
    leftOnTable: number;
    proceeds: number;
}

function parsePercent(val: string): number {
    return parseFloat(val.replace('%', '').trim()) || 0;
}

function parseDollar(val: string): number {
    return parseFloat(val.replace(/[$\s]/g, '').trim()) || 0;
}

function loadIPOData(): IPORow[] {
    const csvPath = join(process.cwd(), 'data', 'ipo', 'IPO-data.csv');
    const text = readFileSync(csvPath, 'utf-8');
    const lines = text.trim().split('\n');

    const rows: IPORow[] = [];
    const seenYears = new Set<number>();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by comma, but handle multi-word column header that has a newline in CSV
        const parts = line.split(',');
        const year = parseInt(parts[0]);

        if (isNaN(year) || seenYears.has(year)) continue;
        seenYears.add(year);

        rows.push({
            year,
            ipos: parseInt(parts[1]) || 0,
            firstDayEW: parsePercent(parts[2]),
            firstDayPW: parsePercent(parts[3]),
            firstDayMedian: parsePercent(parts[4]),
            leftOnTable: parseDollar(parts[5]),
            proceeds: parseDollar(parts[6]),
        });
    }

    return rows;
}

export default function IPODataPage() {
    const data = loadIPOData();
    return <IPOChart data={data} />;
}
