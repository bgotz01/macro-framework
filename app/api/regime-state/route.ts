import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const targetDate = request.nextUrl.searchParams.get('date') || 'latest';

    try {
        const rows = await (targetDate === 'latest'
            ? prisma.$queryRaw<any[]>`
                SELECT date, regime, entry_date, trigger_reason,
                       liquidity_score, rey, eyp, "real10Y", "real3M", "realM2"
                FROM macro_regime_timeline
                ORDER BY date DESC LIMIT 1
              `
            : prisma.$queryRaw<any[]>`
                SELECT date, regime, entry_date, trigger_reason,
                       liquidity_score, rey, eyp, "real10Y", "real3M", "realM2"
                FROM macro_regime_timeline
                WHERE date <= ${targetDate}
                ORDER BY date DESC LIMIT 1
              `
        );

        const row = rows[0];
        if (!row) {
            return NextResponse.json({ error: 'No regime data found' }, { status: 404 });
        }

        const entryDate = new Date(row.entry_date);
        const currentDate = new Date(row.date);
        const monthsInRegime =
            (currentDate.getFullYear() - entryDate.getFullYear()) * 12 +
            (currentDate.getMonth() - entryDate.getMonth());

        return NextResponse.json({
            regime: row.regime,
            entryDate: row.entry_date,
            currentDate: row.date,
            daysInRegime: monthsInRegime,
            triggerReason: row.trigger_reason,
            conditions: {
                liquidityScore: row.liquidity_score,
                rey: row.rey,
                eyp: row.eyp,
                real10Y: row.real10Y,
                real3M: row.real3M,
                realM2: row.realM2,
                stage: 'N/A',
                pressure: 'N/A',
                risk: 'N/A',
                direction: 'N/A',
            },
        });
    } catch (error) {
        console.error('Error fetching regime state:', error);
        return NextResponse.json({ error: 'Failed to fetch regime state' }, { status: 500 });
    }
}
