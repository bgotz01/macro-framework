import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const get = async (ac: string, sn: string) => {
            const rows = await prisma.$queryRaw<{ value: number }[]>`
                SELECT value FROM macro_percentile_analysis
                WHERE asset_class = ${ac} AND series_name = ${sn}
                ORDER BY date DESC LIMIT 1
            `;
            return rows[0]?.value ?? null;
        };

        const [tnx, irx, cpi, ey5yr] = await Promise.all([
            get('bonds', 'US/TNX-Monthly'),
            get('bonds', 'US/IRX-Monthly'),
            get('economic', 'CPI'),
            get('valuations', 'Earnings-Yield-5yr'),
        ]);

        return NextResponse.json({ tnx, irx, cpi, ey5yr });
    } catch (error) {
        console.error('Error fetching latest nominals:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
