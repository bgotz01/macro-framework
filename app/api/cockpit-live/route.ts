import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const get = async (ac: string, sn: string) => {
        try {
            const rows = await prisma.$queryRaw<{ date: string; value: number }[]>`
                SELECT date::text as date, value
                FROM macro_time_series
                WHERE asset_class = ${ac}
                  AND series_name = ${sn}
                  AND column_name = 'Value'
                ORDER BY date DESC
                LIMIT 1
            `;
            console.log(`Fetched ${sn}:`, rows[0]?.date, rows[0]?.value);
            return rows[0] ?? undefined;
        } catch (err) {
            console.error(`Error fetching ${sn}:`, err);
            return undefined;
        }
    };

    try {
        const [tnx, irx, gspc, cpi, m2yoy, eps5yr, eps2yr] = await Promise.all([
            get('bonds', 'US/TNX'),
            get('bonds', 'US/IRX'),
            get('equities', 'US/GSPC'),
            get('economic', 'CPI'),
            get('economic', 'M2-YoY'),
            get('valuations', 'SP500-EPS-5yr'),
            get('valuations', 'SP500-EPS-2yr'),
        ]);

        return NextResponse.json({
            tnx: { value: tnx?.value ?? null, date: tnx?.date ?? null },
            irx: { value: irx?.value ?? null, date: irx?.date ?? null },
            gspc: { value: gspc?.value ?? null, date: gspc?.date ?? null },
            cpi: { value: cpi?.value ?? null, date: cpi?.date ?? null },
            m2yoy: { value: m2yoy?.value ?? null, date: m2yoy?.date ?? null },
            eps5yr: { value: eps5yr?.value ?? null, date: eps5yr?.date ?? null },
            eps2yr: { value: eps2yr?.value ?? null, date: eps2yr?.date ?? null },
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error('cockpit-live error:', error);
        return NextResponse.json({ error: 'Failed to fetch live data' }, { status: 500 });
    }
}
