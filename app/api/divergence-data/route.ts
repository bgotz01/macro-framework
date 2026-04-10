import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const MA_PERIODS = [50, 200, 500];

function rollingPercentile(values: number[]): number[] {
    return values.map((v, i) => {
        const history = values.slice(0, i + 1);
        const below = history.filter(x => x <= v).length;
        return parseFloat(((below / history.length) * 100).toFixed(4));
    });
}

function computeAllMetrics(prices: { date: string; price: number }[], maPeriod: number) {
    const result: {
        date: string;
        price: number;
        ma: number;
        div: number;
        slope: number;
        slopeStreak: number;
        priceAboveStreak: number;
    }[] = [];

    for (let i = maPeriod - 1; i < prices.length; i++) {
        const win = prices.slice(i - maPeriod + 1, i + 1);
        const ma = win.reduce((s, x) => s + x.price, 0) / maPeriod;
        const price = prices[i].price;
        const div = (price - ma) / ma * 100;

        // Slope: % change of MA over last 20 days
        let slope = 0;
        if (i >= maPeriod + 19) {
            const prevWin = prices.slice(i - maPeriod - 18, i - 18);
            const prevMa = prevWin.reduce((s, x) => s + x.price, 0) / maPeriod;
            slope = prevMa !== 0 ? (ma - prevMa) / prevMa * 100 : 0;
        }

        // Slope streak: consecutive days MA slope is positive
        let slopeStreak = 0;
        if (slope > 0) {
            for (let j = i; j >= maPeriod + 19; j--) {
                const wj = prices.slice(j - maPeriod + 1, j + 1);
                const maj = wj.reduce((s, x) => s + x.price, 0) / maPeriod;
                const prevWj = prices.slice(j - maPeriod - 18, j - 18);
                const prevMaj = prevWj.reduce((s, x) => s + x.price, 0) / maPeriod;
                const sj = prevMaj !== 0 ? (maj - prevMaj) / prevMaj * 100 : 0;
                if (sj > 0) slopeStreak++;
                else break;
            }
        } else {
            for (let j = i; j >= maPeriod + 19; j--) {
                const wj = prices.slice(j - maPeriod + 1, j + 1);
                const maj = wj.reduce((s, x) => s + x.price, 0) / maPeriod;
                const prevWj = prices.slice(j - maPeriod - 18, j - 18);
                const prevMaj = prevWj.reduce((s, x) => s + x.price, 0) / maPeriod;
                const sj = prevMaj !== 0 ? (maj - prevMaj) / prevMaj * 100 : 0;
                if (sj <= 0) slopeStreak--;
                else break;
            }
        }

        // Price above streak: consecutive days price > MA
        let priceAboveStreak = 0;
        if (price > ma) {
            for (let j = i; j >= maPeriod - 1; j--) {
                const wj = prices.slice(j - maPeriod + 1, j + 1);
                const maj = wj.reduce((s, x) => s + x.price, 0) / maPeriod;
                if (prices[j].price > maj) priceAboveStreak++;
                else break;
            }
        } else {
            for (let j = i; j >= maPeriod - 1; j--) {
                const wj = prices.slice(j - maPeriod + 1, j + 1);
                const maj = wj.reduce((s, x) => s + x.price, 0) / maPeriod;
                if (prices[j].price <= maj) priceAboveStreak--;
                else break;
            }
        }

        result.push({ date: prices[i].date, price, ma, div, slope, slopeStreak, priceAboveStreak });
    }

    const divPct = rollingPercentile(result.map(r => r.div));
    const slopePct = rollingPercentile(result.map(r => r.slope));
    const slopeStreakPct = rollingPercentile(result.map(r => r.slopeStreak));
    const priceAboveStreakPct = rollingPercentile(result.map(r => r.priceAboveStreak));

    return result.map((r, i) => ({
        date: r.date,
        price: r.price,
        ma: r.ma,
        div: r.div,
        slope: r.slope,
        slopeStreak: r.slopeStreak,
        priceAboveStreak: r.priceAboveStreak,
        divPct: divPct[i],
        slopePct: slopePct[i],
        slopeStreakPct: slopeStreakPct[i],
        priceAboveStreakPct: priceAboveStreakPct[i],
    }));
}

export async function GET(request: NextRequest) {
    const index = request.nextUrl.searchParams.get('index') || 'sp500';

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 30000 });

        // date → merged row
        const dateMap = new Map<string, Record<string, number>>();

        if (index === 'ndx') {
            const prices = db.prepare(`
                SELECT date, value AS price
                FROM time_series
                WHERE series_name = 'NDX' AND column_name = 'Value'
                ORDER BY date ASC
            `).all() as { date: string; price: number }[];

            db.close();

            for (const period of MA_PERIODS) {
                const rows = computeAllMetrics(prices, period);
                for (const r of rows) {
                    if (!dateMap.has(r.date)) dateMap.set(r.date, {});
                    const row = dateMap.get(r.date)!;
                    row.Price = r.price;
                    row[`MA${period}`] = r.ma;
                    row[`Div${period}`] = parseFloat(r.div.toFixed(4));
                    row[`Slope${period}`] = parseFloat(r.slope.toFixed(4));
                    row[`SlopeStreak${period}`] = r.slopeStreak;
                    row[`PriceAboveStreak${period}`] = r.priceAboveStreak;
                    row[`DivPercentile${period}`] = r.divPct;
                    row[`SlopePercentile${period}`] = r.slopePct;
                    row[`SlopeStreakPercentile${period}`] = r.slopeStreakPct;
                    row[`PriceAbovePercentile${period}`] = r.priceAboveStreakPct;
                }
            }
        } else {
            // SP500 — pull from pre-computed series
            const priceRows = db.prepare(`
                SELECT date, value AS price FROM time_series
                WHERE series_name = 'US/GSPC' AND column_name = 'Value'
                ORDER BY date ASC
            `).all() as { date: string; price: number }[];

            for (const r of priceRows) {
                dateMap.set(r.date, { Price: r.price });
            }

            for (const period of MA_PERIODS) {
                const maRows = db.prepare(`
                    SELECT date, value FROM percentile_analysis WHERE series_name = ? ORDER BY date ASC
                `).all(`SP500-MA${period}`) as { date: string; value: number }[];

                const divRows = db.prepare(`
                    SELECT date, value, percentile_rank FROM percentile_analysis WHERE series_name = ? ORDER BY date ASC
                `).all(`SP500-${period}MA-Div`) as { date: string; value: number; percentile_rank: number }[];

                const slopeRows = db.prepare(`
                    SELECT date, value, percentile_rank FROM percentile_analysis WHERE series_name = ? ORDER BY date ASC
                `).all(`SP500-${period}MA-Slope`) as { date: string; value: number; percentile_rank: number }[];

                const slopeStreakRows = db.prepare(`
                    SELECT date, value, percentile_rank FROM percentile_analysis WHERE series_name = ? ORDER BY date ASC
                `).all(`SP500-${period}MA-SlopeStreak`) as { date: string; value: number; percentile_rank: number }[];

                const priceAboveRows = db.prepare(`
                    SELECT date, value, percentile_rank FROM percentile_analysis WHERE series_name = ? ORDER BY date ASC
                `).all(`SP500-${period}MA-PriceAboveStreak`) as { date: string; value: number; percentile_rank: number }[];

                for (const r of maRows) {
                    if (!dateMap.has(r.date)) dateMap.set(r.date, {});
                    dateMap.get(r.date)![`MA${period}`] = r.value;
                }
                for (const r of divRows) {
                    if (!dateMap.has(r.date)) dateMap.set(r.date, {});
                    const row = dateMap.get(r.date)!;
                    row[`Div${period}`] = r.value;
                    row[`DivPercentile${period}`] = r.percentile_rank;
                }
                for (const r of slopeRows) {
                    if (!dateMap.has(r.date)) dateMap.set(r.date, {});
                    const row = dateMap.get(r.date)!;
                    row[`Slope${period}`] = r.value;
                    row[`SlopePercentile${period}`] = r.percentile_rank;
                }
                for (const r of slopeStreakRows) {
                    if (!dateMap.has(r.date)) dateMap.set(r.date, {});
                    const row = dateMap.get(r.date)!;
                    row[`SlopeStreak${period}`] = r.value;
                    row[`SlopeStreakPercentile${period}`] = r.percentile_rank;
                }
                for (const r of priceAboveRows) {
                    if (!dateMap.has(r.date)) dateMap.set(r.date, {});
                    const row = dateMap.get(r.date)!;
                    row[`PriceAboveStreak${period}`] = r.value;
                    row[`PriceAbovePercentile${period}`] = r.percentile_rank;
                }
            }

            db.close();
        }

        const data = Array.from(dateMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, vals]) => ({ date, ...vals }));

        return NextResponse.json({ data, index });
    } catch (error) {
        console.error('Error fetching divergence data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
