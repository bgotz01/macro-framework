import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const year = searchParams.get('year');

        const changes = await prisma.sp500_changes.findMany({
            where: year ? { date: { startsWith: year } } : undefined,
            orderBy: { date: 'desc' },
            take: limit,
        });

        return NextResponse.json({ changes });
    } catch (error) {
        console.error('Error fetching S&P 500 changes:', error);
        return NextResponse.json({ error: 'Failed to fetch changes' }, { status: 500 });
    }
}
