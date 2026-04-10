import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

function rollingPercentile(values: number[], windowSize: number): number[] {
    return values.map((v, i) => {
        const history = values.slice(0, i + 1);
        const below = history.filter(x => x <= v).length;
        return parseFloat(((below / history.length) * 100).toFixed(4));
    });
}

function computeNdxMetrics(
    prices: { date: string; price: number }[],
    maPeriod: number
): { date: string; divergence_value: number; divergence_percentile: number; days_above_value: number; days_above_percentile: number; slope_value: number; slope_percentile: number }[] {
    // Need enough data for the MA
    const result: { date: string; div: number; streak: number; slope: number }[] = [];

    for (let i = maPeriod - 1; i < prices.length; i++) {
        const win = prices.slice(i - maPeriod + 1, i + 1);
        const ma = win.reduce((s, x) => s + x.price, 0) / maPeriod;
        const price = prices[i].price;

        // Divergence: % above/below MA
        const div = (price - ma) / ma * 100;

        // Days above streak: consecutive days price > MA (negative if below)
        let streak = 0;
        if (price > ma) {
            for (let j = i; j >= maPeriod - 1; j--) {
                const wj = prices.slice(j - maPeriod + 1, j + 1);
                const maj = wj.reduce((s, x) => s + x.price, 0) / maPeriod;
                if (prices[j].price > maj) streak++;
                else break;
            }
        } else {
            for (let j = i; j >= maPeriod - 1; j--) {
                const wj = prices.slice(j - maPeriod + 1, j + 1);
                const maj = wj.reduce((s, x) => s + x.price, 0) / maPeriod;
                if (prices[j].price <= maj) streak--;
                else break;
            }
        }

        // Slope: % change of MA over last 20 days
        let slope = 0;
        if (i >= maPeriod + 19) {
            const prevWin = prices.slice(i - maPeriod - 18, i - 18);
            const prevMa = prevWin.reduce((s, x) => s + x.price, 0) / maPeriod;
            slope = prevMa !== 0 ? (ma - prevMa) / prevMa * 100 : 0;
        }

        result.push({ date: prices[i].date, div, streak, slope });
    }

    const divPct = rollingPercentile(result.map(r => r.div), result.length);
    const streakPct = rollingPercentile(result.map(r => r.streak), result.length);
    const slopePct = rollingPercentile(result.map(r => r.slope), result.length);

    return result.map((r, i) => ({
        date: r.date,
        divergence_value: parseFloat(r.div.toFixed(4)),
        divergence_percentile: divPct[i],
        days_above_value: r.streak,
        days_above_percentile: streakPct[i],
        slope_value: parseFloat(r.slope.toFixed(4)),
        slope_percentile: slopePct[i],
    }));
}

export async function GET(request: NextRequest) {
    const ma = request.nextUrl.searchParams.get('ma') || '200';
    const index = request.nextUrl.searchParams.get('index') || 'sp500';

    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        let rows: any[];

        if (index === 'ndx') {
            const maPeriod = parseInt(ma);
            const prices = db.prepare(`
                SELECT date, value AS price
                FROM time_series
                WHERE series_name = 'NDX' AND column_name = 'Value'
                ORDER BY date ASC
            `).all() as { date: string; price: number }[];

            // Also compute 50/200 divergence percentile for NDX
            const ndxRows = computeNdxMetrics(prices, maPeriod);

            // Compute 50MA and 200MA for NDX to get div_50_200
            const ndx50 = computeNdxMetrics(prices, 50);
            const ndx200 = computeNdxMetrics(prices, 200);
            const ma50Map = new Map(ndx50.map(r => [r.date, r.divergence_value]));
            const ma200Map = new Map(ndx200.map(r => [r.date, r.divergence_value]));

            // div_50_200 = (price_above_50ma% - price_above_200ma%) proxy via divergence values
            // Actually compute raw 50MA and 200MA prices to get the spread
            const priceMap = new Map(prices.map(r => [r.date, r.price]));
            const divValues: number[] = [];
            const divDates: string[] = [];
            ndxRows.forEach(r => {
                const price = priceMap.get(r.date);
                if (price == null) return;
                // Recompute 50MA and 200MA at this date
                const idx = prices.findIndex(p => p.date === r.date);
                if (idx < 199) return;
                const win200 = prices.slice(idx - 199, idx + 1);
                const win50 = prices.slice(idx - 49, idx + 1);
                const ma200v = win200.reduce((s, x) => s + x.price, 0) / 200;
                const ma50v = win50.reduce((s, x) => s + x.price, 0) / 50;
                divValues.push((ma50v - ma200v) / ma200v * 100);
                divDates.push(r.date);
            });
            const divPct = rollingPercentile(divValues, divValues.length);
            const divPctMap = new Map(divDates.map((d, i) => [d, divPct[i]]));

            db.close();
            rows = ndxRows.map(r => ({
                ...r,
                ma50_200_value: null,
                ma50_200_percentile: divPctMap.get(r.date) ?? null,
            }));
        } else {
            const baseRows = db.prepare(`
                SELECT
                    d.date,
                    d.value            AS divergence_value,
                    d.percentile_rank  AS divergence_percentile,
                    p.value            AS days_above_value,
                    p.percentile_rank  AS days_above_percentile,
                    s.value            AS slope_value,
                    s.percentile_rank  AS slope_percentile,
                    ma50.value         AS ma50_price,
                    ma200.value        AS ma200_price
                FROM percentile_analysis d
                JOIN percentile_analysis p   ON d.date = p.date
                JOIN percentile_analysis s   ON d.date = s.date
                JOIN percentile_analysis ma50  ON d.date = ma50.date
                JOIN percentile_analysis ma200 ON d.date = ma200.date
                WHERE d.series_name   = ?
                  AND p.series_name   = ?
                  AND s.series_name   = ?
                  AND ma50.series_name  = 'SP500-MA50'
                  AND ma200.series_name = 'SP500-MA200'
                  AND d.percentile_rank IS NOT NULL
                  AND p.percentile_rank IS NOT NULL
                  AND s.percentile_rank IS NOT NULL
                ORDER BY d.date ASC
            `).all(
                `SP500-${ma}MA-Div`,
                `SP500-${ma}MA-PriceAboveStreak`,
                `SP500-${ma}MA-Slope`
            ) as any[];

            db.close();

            // Compute rolling percentile of 50/200 divergence
            const divValues = baseRows.map((r: any) =>
                r.ma200_price > 0 ? (r.ma50_price - r.ma200_price) / r.ma200_price * 100 : 0
            );
            const divPct = rollingPercentile(divValues, divValues.length);

            rows = baseRows.map((r: any, i: number) => ({
                date: r.date,
                divergence_value: r.divergence_value,
                divergence_percentile: r.divergence_percentile,
                days_above_value: r.days_above_value,
                days_above_percentile: r.days_above_percentile,
                slope_value: r.slope_value,
                slope_percentile: r.slope_percentile,
                ma50_200_value: parseFloat(divValues[i].toFixed(4)),
                ma50_200_percentile: divPct[i],
            }));
        }

        return NextResponse.json({ data: rows, ma, index });
    } catch (error) {
        console.error('Error fetching trend pressure history:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
