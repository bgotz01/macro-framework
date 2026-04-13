import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SERIES_CONFIG: Record<string, { asset_class: string; series_name: string; column_name: string; timeSeriesOnly?: boolean; quarterFill?: boolean }> = {
    'CPI-U': { asset_class: 'economic', series_name: 'CPINominal', column_name: 'Value', timeSeriesOnly: true },
    'M2': { asset_class: 'economic', series_name: 'M2SL', column_name: 'Value', timeSeriesOnly: true },
    'SP500-EPS': { asset_class: 'valuations', series_name: 'SP500-EPS', column_name: 'Value', timeSeriesOnly: true, quarterFill: true },
};

function toMonthEnd(dateStr: string): string {
    const [y, m] = dateStr.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function quarterDates(dateStr: string): string[] {
    const [y, m] = dateStr.split('-').map(Number);
    return [0, 1, 2].map(offset => {
        const totalMonth = m + offset;
        const ny = y + Math.floor((totalMonth - 1) / 12);
        const nm = ((totalMonth - 1) % 12) + 1;
        const lastDay = new Date(ny, nm, 0).getDate();
        return `${ny}-${String(nm).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    });
}

async function upsertTimeSeries(date: string, asset_class: string, series_name: string, column_name: string, value: number) {
    await prisma.macro_time_series.upsert({
        where: { date_asset_class_series_name_column_name: { date, asset_class, series_name, column_name } },
        create: { date, asset_class, series_name, column_name, value },
        update: { value },
    });
}

async function upsertPercentile(date: string, asset_class: string, series_name: string, column_name: string, value: number) {
    await prisma.macro_percentile_analysis.upsert({
        where: { date_asset_class_series_name_column_name: { date, asset_class, series_name, column_name } },
        create: { date, asset_class, series_name, column_name, value, percentile_rank: null },
        update: { value },
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { series, date, value } = body as { series: string; date: string; value: number };

        if (!series || !date || value === undefined || value === null) {
            return NextResponse.json({ error: 'Missing required fields: series, date, value' }, { status: 400 });
        }

        const config = SERIES_CONFIG[series];
        if (!config) {
            return NextResponse.json({ error: `Unknown series: ${series}` }, { status: 400 });
        }

        const dates = config.quarterFill ? quarterDates(date) : [toMonthEnd(date)];

        // SP500-EPS: save to quarterly, compute TTM from last 4 quarters, fill 3 months
        if (series === 'SP500-EPS') {
            const quarterDate = toMonthEnd(date);
            // Save quarterly actual
            await upsertTimeSeries(quarterDate, 'valuations', 'SP500-EPS-Quarterly', 'Value', value);

            // Fetch last 4 quarters (including this one) to compute TTM
            const last4 = await prisma.macro_time_series.findMany({
                where: { asset_class: 'valuations', series_name: 'SP500-EPS-Quarterly', column_name: 'Value' },
                orderBy: { date: 'desc' },
                take: 4,
                select: { value: true },
            });
            const ttm = last4.length === 4 ? last4.reduce((s: number, r: { value: number | null }) => s + (r.value ?? 0), 0) : null;

            // Fill TTM across the 3 months of the quarter
            if (ttm !== null) {
                for (const d of quarterDates(date)) {
                    await upsertTimeSeries(d, 'valuations', 'SP500-EPS', 'Value', ttm);
                }
            }

            const extra = ttm !== null ? ` → TTM: ${ttm.toFixed(2)}` : ' (need 4 quarters for TTM)';
            return NextResponse.json({ success: true, date: quarterDate, dates: [quarterDate], series, value, extra });
        }

        for (const d of dates) {
            await upsertTimeSeries(d, config.asset_class, config.series_name, config.column_name, value);
            if (!config.timeSeriesOnly) {
                await upsertPercentile(d, config.asset_class, config.series_name, config.column_name, value);
            }
        }

        // Compute YoY for CPI-U and save both nominal and YoY
        let computedYoY: number | null = null;
        if (series === 'CPI-U') {
            const entryDate = dates[0];
            const [y, m] = entryDate.split('-').map(Number);
            const prevYear = y - 1;
            const prevMonthEnd = new Date(prevYear, m, 0).getDate();
            const prevDate = `${prevYear}-${String(m).padStart(2, '0')}-${String(prevMonthEnd).padStart(2, '0')}`;

            const prevRow = await prisma.macro_time_series.findUnique({
                where: { date_asset_class_series_name_column_name: { date: prevDate, asset_class: 'economic', series_name: 'CPINominal', column_name: 'Value' } },
                select: { value: true },
            });

            if (prevRow?.value) {
                computedYoY = ((value - prevRow.value) / prevRow.value) * 100;
                // Save YoY to CPINominal-YoY and to CPI (the series used by the regime model)
                await upsertTimeSeries(entryDate, 'economic', 'CPINominal-YoY', 'Value', computedYoY);
                await upsertTimeSeries(entryDate, 'economic', 'CPI', 'Value', computedYoY);
                await upsertPercentile(entryDate, 'economic', 'CPI', 'Value', computedYoY);
            }
        }

        // If M2, compute M2-YoY
        if (series === 'M2') {
            const entryDate = dates[0];
            const [y, m] = entryDate.split('-').map(Number);
            const prevYear = y - 1;
            const prevMonthEnd = new Date(prevYear, m, 0).getDate();
            const prevDate = `${prevYear}-${String(m).padStart(2, '0')}-${String(prevMonthEnd).padStart(2, '0')}`;

            const prevRow = await prisma.macro_time_series.findUnique({
                where: { date_asset_class_series_name_column_name: { date: prevDate, asset_class: 'economic', series_name: 'M2SL', column_name: 'Value' } },
                select: { value: true },
            });

            if (prevRow?.value) {
                computedYoY = ((value - prevRow.value) / prevRow.value) * 100;
                await upsertTimeSeries(entryDate, 'economic', 'M2-YoY', 'Value', computedYoY);
                await upsertPercentile(entryDate, 'economic', 'M2-YoY', 'Value', computedYoY);
            }
        }

        const extra = computedYoY !== null
            ? ` → YoY: ${computedYoY.toFixed(2)}%`
            : (series === 'CPI-U' ? ' (no prior year data for YoY)' : series === 'M2' ? ' (no prior year data for YoY)' : '');
        return NextResponse.json({ success: true, date: dates[0], dates, series, value, extra });
    } catch (error) {
        console.error('Error inserting data:', error);
        return NextResponse.json({ error: 'Failed to insert data' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const series = request.nextUrl.searchParams.get('series') || 'CPI';

    try {
        const config = SERIES_CONFIG[series];
        if (!config) {
            return NextResponse.json({ error: `Unknown series: ${series}` }, { status: 400 });
        }

        const where = { asset_class: config.asset_class, series_name: config.series_name, column_name: config.column_name };

        const take = series === 'CPI-U' ? 42 : 30;
        const rowsDesc = config.timeSeriesOnly
            ? await prisma.macro_time_series.findMany({ where, orderBy: { date: 'desc' }, take, select: { date: true, value: true } })
            : await prisma.macro_percentile_analysis.findMany({ where, orderBy: { date: 'desc' }, take, select: { date: true, value: true } });

        const rows = [...rowsDesc].reverse();

        // For M2 or CPI-U, fetch YoY values
        let yoyMap: Record<string, number> = {};
        if (series === 'M2') {
            const yoyRows = await prisma.macro_time_series.findMany({
                where: { asset_class: 'economic', series_name: 'M2-YoY', column_name: 'Value' },
                orderBy: { date: 'desc' },
                take: 30,
                select: { date: true, value: true },
            });
            for (const r of yoyRows) if (r.value !== null) yoyMap[r.date] = r.value;
        }
        if (series === 'CPI-U') {
            // Calculate YoY from the fetched rows directly
            const valueByDate: Record<string, number> = {};
            for (const r of rows) if (r.value !== null) valueByDate[r.date] = r.value!;
            for (const r of rows) {
                if (r.value === null) continue;
                const [y, m] = r.date.split('-').map(Number);
                const prevYear = y - 1;
                const prevMonthEnd = new Date(prevYear, m, 0).getDate();
                const prevDate = `${prevYear}-${String(m).padStart(2, '0')}-${String(prevMonthEnd).padStart(2, '0')}`;
                const prevVal = valueByDate[prevDate];
                if (prevVal) yoyMap[r.date] = ((r.value - prevVal) / prevVal) * 100;
            }
        }

        const QUARTER_MONTHS = new Set([3, 6, 9, 12]);
        let data: { date: string; value: number | null; isFilled: boolean }[];

        if (config.quarterFill) {
            let start = 0;
            while (start < rows.length && !QUARTER_MONTHS.has(parseInt(rows[start].date.split('-')[1]))) start++;
            const aligned = rows.slice(start);

            const chunks: { date: string; value: number | null; isFilled: boolean }[][] = [];
            let chunk: { date: string; value: number | null; isFilled: boolean }[] = [];
            for (const row of aligned) {
                const m = parseInt(row.date.split('-')[1]);
                const isAnchor = QUARTER_MONTHS.has(m);
                if (isAnchor && chunk.length > 0) { chunks.push(chunk); chunk = []; }
                chunk.push({ ...row, isFilled: !isAnchor });
            }
            if (chunk.length > 0) chunks.push(chunk);
            data = chunks.filter(c => c.length === 3).reverse().slice(0, 8).flat();
        } else {
            data = rows.reverse().map(row => ({ ...row, isFilled: false, yoy: yoyMap[row.date] ?? null }));
        }

        // For SP500-EPS, also load quarterly actuals from DB
        let quarterly: { date: string; eps: number }[] = [];
        if (series === 'SP500-EPS') {
            const qRows = await prisma.macro_time_series.findMany({
                where: { asset_class: 'valuations', series_name: 'SP500-EPS-Quarterly', column_name: 'Value' },
                orderBy: { date: 'desc' },
                take: 32,
                select: { date: true, value: true },
            });
            quarterly = qRows.filter((r: { date: string; value: number | null }) => r.value !== null).map((r: { date: string; value: number | null }) => ({ date: r.date, eps: r.value! }));
        }

        return NextResponse.json({ series, data, quarterly });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}