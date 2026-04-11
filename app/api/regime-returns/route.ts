import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RegimeRow { date: string; regime: string; entry_date: string; }
interface PriceRow { date: string; value: number; }

interface RegimePeriod {
    regime: string; startDate: string; endDate: string; months: number; isCurrent: boolean;
}

interface PeriodDetail {
    startDate: string; endDate: string; months: number; isCurrent: boolean;
    duringReturn: number | null; forward1Y: number | null; forward3Y: number | null; forward5Y: number | null;
    entryPrice: number | null; exitPrice: number | null;
}

interface RegimeReturnStats {
    regime: string; occurrences: number;
    avgDurationMonths: number; medianDurationMonths: number;
    avgDuringReturn: number | null; medianDuringReturn: number | null;
    minDuringReturn: number | null; maxDuringReturn: number | null;
    avg1Y: number | null; avg3Y: number | null; avg5Y: number | null;
    median1Y: number | null; median3Y: number | null; median5Y: number | null;
    periods: PeriodDetail[];
}

function median(arr: number[]): number | null {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function avg(arr: number[]): number | null {
    if (arr.length === 0) return null;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function findClosestPrice(
    prices: Map<string, number>,
    targetDate: string,
    direction: 'before' | 'after' = 'before',
): { date: string; price: number } | null {
    if (prices.has(targetDate)) return { date: targetDate, price: prices.get(targetDate)! };
    const target = new Date(targetDate).getTime();
    let bestDate: string | null = null;
    let bestDiff = Infinity;
    for (const [date] of prices) {
        const d = new Date(date).getTime();
        const diff = direction === 'before' ? target - d : d - target;
        if (diff >= 0 && diff < bestDiff && diff < 10 * 86400000) { bestDiff = diff; bestDate = date; }
    }
    if (!bestDate) {
        for (const [date] of prices) {
            const d = new Date(date).getTime();
            const diff = Math.abs(target - d);
            if (diff < bestDiff && diff < 10 * 86400000) { bestDiff = diff; bestDate = date; }
        }
    }
    return bestDate ? { date: bestDate, price: prices.get(bestDate)! } : null;
}

function findForwardPrice(prices: Map<string, number>, startDate: string, years: number): number | null {
    const target = new Date(startDate);
    target.setFullYear(target.getFullYear() + years);
    return findClosestPrice(prices, target.toISOString().split('T')[0], 'after')?.price ?? null;
}

const ASSET_CONFIG: Record<string, { assetClass: string; seriesName: string; label: string }> = {
    sp500: { assetClass: 'equities', seriesName: 'US/GSPC', label: 'S&P 500' },
    nasdaq: { assetClass: 'equities', seriesName: 'NDX', label: 'Nasdaq 100' },
    gold: { assetClass: 'commodities', seriesName: 'GC=F', label: 'Gold' },
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const assetKey = searchParams.get('asset') ?? 'sp500';
    const assetConfig = ASSET_CONFIG[assetKey] ?? ASSET_CONFIG.sp500;

    try {
        const [regimeRows, priceRows] = await Promise.all([
            prisma.$queryRaw<RegimeRow[]>`
                SELECT date, regime, entry_date
                FROM macro_regime_timeline
                ORDER BY date ASC
            `,
            prisma.$queryRaw<PriceRow[]>`
                SELECT date::text as date, value
                FROM macro_time_series
                WHERE asset_class = ${assetConfig.assetClass}
                  AND series_name = ${assetConfig.seriesName}
                  AND column_name = 'Value'
                ORDER BY date ASC
            `,
        ]);

        const prices = new Map<string, number>();
        for (const row of priceRows) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(row.date)) prices.set(row.date, row.value);
        }

        // Build regime periods
        const periods: RegimePeriod[] = [];
        let currentPeriod: RegimePeriod | null = null;
        for (const row of regimeRows) {
            if (!currentPeriod || currentPeriod.regime !== row.regime) {
                if (currentPeriod) periods.push(currentPeriod);
                currentPeriod = { regime: row.regime, startDate: row.date, endDate: row.date, months: 1, isCurrent: false };
            } else {
                currentPeriod.endDate = row.date;
                currentPeriod.months++;
            }
        }
        if (currentPeriod) {
            currentPeriod.isCurrent = (Date.now() - new Date(currentPeriod.endDate).getTime()) / 86400000 < 60;
            periods.push(currentPeriod);
        }

        const round = (v: number | null) => v !== null ? Math.round(v * 100) / 100 : null;
        const r = (entry: number | null, exit: number | null) =>
            entry && exit ? round(((exit - entry) / entry) * 100) : null;

        const regimeStats = new Map<string, RegimeReturnStats>();

        for (const period of periods) {
            const entryPrice = findClosestPrice(prices, period.startDate, 'before')?.price ?? null;
            const exitPrice = findClosestPrice(prices, period.endDate, 'before')?.price ?? null;
            const duringReturn = entryPrice && exitPrice ? round(((exitPrice - entryPrice) / entryPrice) * 100) : null;

            const detail: PeriodDetail = {
                startDate: period.startDate,
                endDate: period.isCurrent ? 'Current' : period.endDate,
                months: period.months,
                isCurrent: period.isCurrent,
                duringReturn,
                forward1Y: r(entryPrice, findForwardPrice(prices, period.startDate, 1)),
                forward3Y: r(entryPrice, findForwardPrice(prices, period.startDate, 3)),
                forward5Y: r(entryPrice, findForwardPrice(prices, period.startDate, 5)),
                entryPrice: round(entryPrice),
                exitPrice: round(exitPrice),
            };

            if (!regimeStats.has(period.regime)) {
                regimeStats.set(period.regime, {
                    regime: period.regime, occurrences: 0,
                    avgDurationMonths: 0, medianDurationMonths: 0,
                    avgDuringReturn: null, medianDuringReturn: null, minDuringReturn: null, maxDuringReturn: null,
                    avg1Y: null, avg3Y: null, avg5Y: null,
                    median1Y: null, median3Y: null, median5Y: null,
                    periods: [],
                });
            }
            const s = regimeStats.get(period.regime)!;
            s.periods.push(detail);
            s.occurrences++;
        }

        const results: RegimeReturnStats[] = [];
        for (const [, stats] of regimeStats) {
            const durations = stats.periods.map(p => p.months);
            const duringReturns = stats.periods.map(p => p.duringReturn).filter((v): v is number => v !== null);
            const fwd1Ys = stats.periods.map(p => p.forward1Y).filter((v): v is number => v !== null);
            const fwd3Ys = stats.periods.map(p => p.forward3Y).filter((v): v is number => v !== null);
            const fwd5Ys = stats.periods.map(p => p.forward5Y).filter((v): v is number => v !== null);

            stats.avgDurationMonths = Math.round((avg(durations) ?? 0) * 10) / 10;
            stats.medianDurationMonths = median(durations) ?? 0;
            stats.avgDuringReturn = round(avg(duringReturns));
            stats.medianDuringReturn = round(median(duringReturns));
            stats.minDuringReturn = duringReturns.length ? round(Math.min(...duringReturns)) : null;
            stats.maxDuringReturn = duringReturns.length ? round(Math.max(...duringReturns)) : null;
            stats.avg1Y = round(avg(fwd1Ys));
            stats.avg3Y = round(avg(fwd3Ys));
            stats.avg5Y = round(avg(fwd5Ys));
            stats.median1Y = round(median(fwd1Ys));
            stats.median3Y = round(median(fwd3Ys));
            stats.median5Y = round(median(fwd5Ys));

            stats.periods.sort((a, b) => b.startDate.localeCompare(a.startDate));
            results.push(stats);
        }

        results.sort((a, b) => b.occurrences - a.occurrences);

        return NextResponse.json({ regimeReturns: results, asset: assetKey, assetLabel: assetConfig.label });
    } catch (error) {
        console.error('Error calculating regime returns:', error);
        return NextResponse.json({ error: 'Failed to calculate regime returns' }, { status: 500 });
    }
}
