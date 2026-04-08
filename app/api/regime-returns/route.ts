import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

interface RegimeRow {
    date: string;
    regime: string;
    entry_date: string;
}

interface PriceRow {
    date: string;
    value: number;
}

interface RegimePeriod {
    regime: string;
    startDate: string;
    endDate: string;
    months: number;
    isCurrent: boolean;
}

interface RegimeReturnStats {
    regime: string;
    occurrences: number;
    avgDurationMonths: number;
    medianDurationMonths: number;
    // During-regime return
    avgDuringReturn: number | null;
    medianDuringReturn: number | null;
    minDuringReturn: number | null;
    maxDuringReturn: number | null;
    // Forward returns
    avg1Y: number | null;
    avg3Y: number | null;
    avg5Y: number | null;
    median1Y: number | null;
    median3Y: number | null;
    median5Y: number | null;
    // Individual periods for the detail table
    periods: PeriodDetail[];
}

interface PeriodDetail {
    startDate: string;
    endDate: string;
    months: number;
    isCurrent: boolean;
    duringReturn: number | null;
    forward1Y: number | null;
    forward3Y: number | null;
    forward5Y: number | null;
    entryPrice: number | null;
    exitPrice: number | null;
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


/**
 * Find the closest S&P 500 price to a given date.
 * Looks within a 10-day window (month-end dates may not be trading days).
 */
function findClosestPrice(prices: Map<string, number>, targetDate: string, direction: 'before' | 'after' = 'before'): { date: string; price: number } | null {
    // Try exact match first
    if (prices.has(targetDate)) {
        return { date: targetDate, price: prices.get(targetDate)! };
    }

    const target = new Date(targetDate).getTime();
    let bestDate: string | null = null;
    let bestDiff = Infinity;

    for (const [date, price] of prices) {
        const d = new Date(date).getTime();
        const diff = direction === 'before' ? target - d : d - target;
        if (diff >= 0 && diff < bestDiff && diff < 10 * 86400000) {
            bestDiff = diff;
            bestDate = date;
        }
    }

    // If no match in preferred direction, try the other
    if (!bestDate) {
        for (const [date, price] of prices) {
            const d = new Date(date).getTime();
            const diff = Math.abs(target - d);
            if (diff < bestDiff && diff < 10 * 86400000) {
                bestDiff = diff;
                bestDate = date;
            }
        }
    }

    return bestDate ? { date: bestDate, price: prices.get(bestDate)! } : null;
}

/**
 * Find price N years forward from a date
 */
function findForwardPrice(prices: Map<string, number>, startDate: string, years: number): number | null {
    const start = new Date(startDate);
    const targetDate = new Date(start);
    targetDate.setFullYear(targetDate.getFullYear() + years);
    const targetStr = targetDate.toISOString().split('T')[0];

    const result = findClosestPrice(prices, targetStr, 'after');
    return result ? result.price : null;
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
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        // 1. Get all regime timeline rows
        const regimeRows = db.prepare(`
            SELECT date, regime, entry_date
            FROM regime_timeline
            ORDER BY date ASC
        `).all() as RegimeRow[];

        // 2. Get asset daily prices
        const priceRows = db.prepare(`
            SELECT date, value
            FROM time_series
            WHERE asset_class = ? AND series_name = ? AND column_name = 'Value'
            ORDER BY date ASC
        `).all(assetConfig.assetClass, assetConfig.seriesName) as PriceRow[];

        db.close();

        // Build price lookup map (filter out any rows with non-date-string keys)
        const prices = new Map<string, number>();
        for (const row of priceRows) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
                prices.set(row.date, row.value);
            }
        }

        // 3. Build regime periods from consecutive rows
        const periods: RegimePeriod[] = [];
        let currentPeriod: RegimePeriod | null = null;

        for (const row of regimeRows) {
            if (!currentPeriod || currentPeriod.regime !== row.regime) {
                if (currentPeriod) periods.push(currentPeriod);
                currentPeriod = {
                    regime: row.regime,
                    startDate: row.date,
                    endDate: row.date,
                    months: 1,
                    isCurrent: false,
                };
            } else {
                currentPeriod.endDate = row.date;
                currentPeriod.months++;
            }
        }
        if (currentPeriod) {
            const lastDate = new Date(currentPeriod.endDate);
            const now = new Date();
            currentPeriod.isCurrent = (now.getTime() - lastDate.getTime()) / 86400000 < 60;
            periods.push(currentPeriod);
        }

        // 4. Calculate returns for each period
        const regimeStats = new Map<string, RegimeReturnStats>();

        for (const period of periods) {
            const entryResult = findClosestPrice(prices, period.startDate, 'before');
            const exitResult = findClosestPrice(prices, period.endDate, 'before');

            const entryPrice = entryResult?.price ?? null;
            const exitPrice = exitResult?.price ?? null;

            // During-regime return
            const duringReturn = entryPrice && exitPrice ? ((exitPrice - entryPrice) / entryPrice) * 100 : null;

            // Forward returns from regime START date
            const fwd1YPrice = findForwardPrice(prices, period.startDate, 1);
            const fwd3YPrice = findForwardPrice(prices, period.startDate, 3);
            const fwd5YPrice = findForwardPrice(prices, period.startDate, 5);

            const forward1Y = entryPrice && fwd1YPrice ? ((fwd1YPrice - entryPrice) / entryPrice) * 100 : null;
            const forward3Y = entryPrice && fwd3YPrice ? ((fwd3YPrice - entryPrice) / entryPrice) * 100 : null;
            const forward5Y = entryPrice && fwd5YPrice ? ((fwd5YPrice - entryPrice) / entryPrice) * 100 : null;

            const detail: PeriodDetail = {
                startDate: period.startDate,
                endDate: period.isCurrent ? 'Current' : period.endDate,
                months: period.months,
                isCurrent: period.isCurrent,
                duringReturn: duringReturn !== null ? Math.round(duringReturn * 100) / 100 : null,
                forward1Y: forward1Y !== null ? Math.round(forward1Y * 100) / 100 : null,
                forward3Y: forward3Y !== null ? Math.round(forward3Y * 100) / 100 : null,
                forward5Y: forward5Y !== null ? Math.round(forward5Y * 100) / 100 : null,
                entryPrice: entryPrice !== null ? Math.round(entryPrice * 100) / 100 : null,
                exitPrice: exitPrice !== null ? Math.round(exitPrice * 100) / 100 : null,
            };

            if (!regimeStats.has(period.regime)) {
                regimeStats.set(period.regime, {
                    regime: period.regime,
                    occurrences: 0,
                    avgDurationMonths: 0,
                    medianDurationMonths: 0,
                    avgDuringReturn: null,
                    medianDuringReturn: null,
                    minDuringReturn: null,
                    maxDuringReturn: null,
                    avg1Y: null,
                    avg3Y: null,
                    avg5Y: null,
                    median1Y: null,
                    median3Y: null,
                    median5Y: null,
                    periods: [],
                });
            }

            regimeStats.get(period.regime)!.periods.push(detail);
            regimeStats.get(period.regime)!.occurrences++;
        }

        // 5. Compute aggregate stats per regime
        const results: RegimeReturnStats[] = [];

        for (const [, stats] of regimeStats) {
            const durations = stats.periods.map(p => p.months);
            const duringReturns = stats.periods.map(p => p.duringReturn).filter((v): v is number => v !== null);
            const fwd1Ys = stats.periods.map(p => p.forward1Y).filter((v): v is number => v !== null);
            const fwd3Ys = stats.periods.map(p => p.forward3Y).filter((v): v is number => v !== null);
            const fwd5Ys = stats.periods.map(p => p.forward5Y).filter((v): v is number => v !== null);

            stats.avgDurationMonths = Math.round((avg(durations) ?? 0) * 10) / 10;
            stats.medianDurationMonths = median(durations) ?? 0;
            stats.avgDuringReturn = avg(duringReturns) !== null ? Math.round(avg(duringReturns)! * 100) / 100 : null;
            stats.medianDuringReturn = median(duringReturns) !== null ? Math.round(median(duringReturns)! * 100) / 100 : null;
            stats.minDuringReturn = duringReturns.length > 0 ? Math.round(Math.min(...duringReturns) * 100) / 100 : null;
            stats.maxDuringReturn = duringReturns.length > 0 ? Math.round(Math.max(...duringReturns) * 100) / 100 : null;
            stats.avg1Y = avg(fwd1Ys) !== null ? Math.round(avg(fwd1Ys)! * 100) / 100 : null;
            stats.avg3Y = avg(fwd3Ys) !== null ? Math.round(avg(fwd3Ys)! * 100) / 100 : null;
            stats.avg5Y = avg(fwd5Ys) !== null ? Math.round(avg(fwd5Ys)! * 100) / 100 : null;
            stats.median1Y = median(fwd1Ys) !== null ? Math.round(median(fwd1Ys)! * 100) / 100 : null;
            stats.median3Y = median(fwd3Ys) !== null ? Math.round(median(fwd3Ys)! * 100) / 100 : null;
            stats.median5Y = median(fwd5Ys) !== null ? Math.round(median(fwd5Ys)! * 100) / 100 : null;

            // Sort periods by start date descending
            stats.periods.sort((a, b) => b.startDate.localeCompare(a.startDate));

            results.push(stats);
        }

        // Sort by occurrences descending
        results.sort((a, b) => b.occurrences - a.occurrences);

        return NextResponse.json({ regimeReturns: results, asset: assetKey, assetLabel: assetConfig.label });
    } catch (error) {
        console.error('Error calculating regime returns:', error);
        return NextResponse.json(
            { error: 'Failed to calculate regime returns' },
            { status: 500 }
        );
    }
}
