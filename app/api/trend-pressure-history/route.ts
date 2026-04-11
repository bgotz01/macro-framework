import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function rollingPercentile(values: number[]): number[] {
    return values.map((v, i) => {
        const history = values.slice(0, i + 1);
        const below = history.filter(x => x <= v).length;
        return parseFloat(((below / history.length) * 100).toFixed(4));
    });
}

export async function GET(request: NextRequest) {
    const ma = request.nextUrl.searchParams.get('ma') || '200';
    const index = request.nextUrl.searchParams.get('index') || 'sp500';

    try {
        const prefix = index === 'ndx' ? 'NDX' : 'SP500';

        const baseRows = await prisma.$queryRaw<any[]>`
            SELECT
                d.date::text                AS date,
                d.value                     AS divergence_value,
                d.percentile_rank           AS divergence_percentile,
                p.value                     AS days_above_value,
                p.percentile_rank           AS days_above_percentile,
                s.value                     AS slope_value,
                s.percentile_rank           AS slope_percentile,
                ma50.value                  AS ma50_price,
                ma200.value                 AS ma200_price
            FROM macro_percentile_analysis d
            JOIN macro_percentile_analysis p     ON d.date = p.date
            JOIN macro_percentile_analysis s     ON d.date = s.date
            JOIN macro_percentile_analysis ma50  ON d.date = ma50.date
            JOIN macro_percentile_analysis ma200 ON d.date = ma200.date
            WHERE d.series_name    = ${`${prefix}-${ma}MA-Div`}
              AND p.series_name    = ${`${prefix}-${ma}MA-PriceAboveStreak`}
              AND s.series_name    = ${`${prefix}-${ma}MA-Slope`}
              AND ma50.series_name = ${`${prefix}-MA50`}
              AND ma200.series_name= ${`${prefix}-MA200`}
              AND d.percentile_rank   IS NOT NULL
              AND p.percentile_rank   IS NOT NULL
              AND s.percentile_rank   IS NOT NULL
            ORDER BY d.date ASC
        `;

        // Compute rolling percentile of 50/200 MA divergence
        const divValues = baseRows.map((r: any) =>
            r.ma200_price > 0 ? (r.ma50_price - r.ma200_price) / r.ma200_price * 100 : 0
        );
        const divPct = rollingPercentile(divValues);

        const data = baseRows.map((r: any, i: number) => ({
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

        return NextResponse.json({ data, ma, index });
    } catch (error) {
        console.error('Error fetching trend pressure history:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
