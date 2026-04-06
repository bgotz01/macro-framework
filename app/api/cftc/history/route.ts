import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const commodity = request.nextUrl.searchParams.get('commodity') || 'GOLD';

    try {
        const rows = await prisma.$queryRaw<any[]>`
            SELECT
                "reportDate",
                "openInterest",
                "mMoneyLong", "mMoneyShort", "mMoneyNet",
                "prodMercLong", "prodMercShort", "prodMercNet",
                "swapLong", "swapShort", "swapNet",
                "otherLong", "otherShort", "otherNet",
                "speculativeNet", "commercialNet"
            FROM cftc_cot
            WHERE commodity = ${commodity}
            ORDER BY "reportDate" ASC
        `;

        return NextResponse.json({ data: rows });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch CFTC history' }, { status: 500 });
    }
}
