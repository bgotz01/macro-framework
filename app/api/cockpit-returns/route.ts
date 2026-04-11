import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const COMMODITIES = [
    { series: 'GC=F', label: 'Gold', region: 'Metals' },
    { series: 'SI=F', label: 'Silver', region: 'Metals' },
    { series: 'CL=F', label: 'Crude Oil (WTI)', region: 'Energy' },
];

const FX = [
    { series: 'EURUSD', label: 'EUR/USD', region: 'Major' },
    { series: 'GBPUSD', label: 'GBP/USD', region: 'Major' },
    { series: 'USDJPY', label: 'USD/JPY', region: 'Major' },
    { series: 'USDCAD', label: 'USD/CAD', region: 'Major' },
    { series: 'USDARS', label: 'USD/ARS', region: 'EM' },
    { series: 'USDTRY', label: 'USD/TRY', region: 'EM' },
];

const INDICES = [
    { series: 'US/GSPC', label: 'S&P 500', region: 'North America' },
    { series: 'US/IXIC', label: 'NASDAQ Composite', region: 'North America' },
    { series: 'NDX', label: 'NASDAQ 100', region: 'North America' },
    { series: 'US/DJI', label: 'Dow Jones', region: 'North America' },
    { series: 'US/RUT', label: 'Russell 2000', region: 'North America' },
    { series: 'GSPTSE', label: 'S&P/TSX', region: 'North America' },
    { series: 'N225', label: 'Nikkei 225', region: 'Asia' },
    { series: 'HSI', label: 'Hang Seng', region: 'Asia' },
    { series: 'FTSE', label: 'FTSE 100', region: 'Europe' },
    { series: 'GDAXI', label: 'DAX', region: 'Europe' },
];

function calcReturn(prices: { date: string; value: number }[], yearsBack: number): number | null {
    if (prices.length === 0) return null;
    const latest = prices[prices.length - 1];
    const targetDate = new Date(latest.date);
    targetDate.setFullYear(targetDate.getFullYear() - yearsBack);
    const targetStr = targetDate.toISOString().split('T')[0];

    let past: { date: string; value: number } | null = null;
    for (let i = prices.length - 1; i >= 0; i--) {
        if (prices[i].date <= targetStr) {
            past = prices[i];
            break;
        }
    }
    if (!past || past.value === 0) return null;
    return ((latest.value - past.value) / past.value) * 100;
}

async function fetchRows(assetClass: string, series: string) {
    return prisma.$queryRaw<{ date: string; value: number }[]>`
        SELECT date::text as date, value
        FROM macro_time_series
        WHERE asset_class = ${assetClass}
          AND series_name = ${series}
          AND column_name = 'Value'
          AND date::text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        ORDER BY date ASC
    `;
}

async function toRow(assetClass: string, { series, label, region }: { series: string; label: string; region: string }) {
    const rows = await fetchRows(assetClass, series);
    if (rows.length === 0) return { series, label, region, latest: null, latestDate: null, r1y: null, r5y: null, r10y: null };
    const latest = rows[rows.length - 1];
    return {
        series, label, region,
        latest: latest.value,
        latestDate: latest.date,
        r1y: calcReturn(rows, 1),
        r5y: calcReturn(rows, 5),
        r10y: calcReturn(rows, 10),
    };
}

export async function GET() {
    const [equities, fx, commodities] = await Promise.all([
        Promise.all(INDICES.map(i => toRow('equities', i))),
        Promise.all(FX.map(i => toRow('fx', i))),
        Promise.all(COMMODITIES.map(i => toRow('commodities', i))),
    ]);

    return NextResponse.json({ equities, fx, commodities });
}
