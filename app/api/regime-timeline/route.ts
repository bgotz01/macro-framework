import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const rows = await prisma.macro_regime_timeline.findMany({
            select: { date: true, regime: true },
            orderBy: { date: 'asc' },
        });
        return NextResponse.json({ data: rows });
    } catch (error) {
        console.error('Error fetching regime timeline:', error);
        return NextResponse.json({ error: 'Failed to fetch regime timeline' }, { status: 500 });
    }
}
