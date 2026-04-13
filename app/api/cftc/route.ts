import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get the latest report date
        const latest = await prisma.$queryRaw<{ reportDate: Date }[]>`
            SELECT "reportDate" FROM cftc_cot ORDER BY "reportDate" DESC LIMIT 1
        `;
        if (!latest.length) return NextResponse.json({ data: [], reportDate: null });

        const reportDate = latest[0].reportDate;

        const rows = await prisma.$queryRaw<any[]>`
            SELECT DISTINCT ON (commodity)
                id, commodity, "marketName", "reportDate",
                "openInterest",
                "mMoneyLong", "mMoneyShort", "mMoneyNet",
                "prodMercLong", "prodMercShort", "prodMercNet",
                "swapLong", "swapShort", "swapNet",
                "otherLong", "otherShort", "otherNet",
                "speculativeLong", "speculativeShort", "speculativeNet",
                "commercialLong", "commercialShort", "commercialNet",
                "changeOI", "changeMMoneyLong", "changeMMoneyShort",
                "changeOtherLong", "changeOtherShort",
                "changeProdMercLong", "changeProdMercShort",
                "changeSwapLong", "changeSwapShort"
            FROM cftc_cot
            ORDER BY commodity, "reportDate" DESC
        `;

        const avgs = await prisma.$queryRaw<any[]>`
            SELECT
                commodity,
                AVG("mMoneyNet"::float      / NULLIF("openInterest", 0) * 100) AS "avgMMoneyPct",
                AVG("otherNet"::float       / NULLIF("openInterest", 0) * 100) AS "avgOtherPct",
                AVG("speculativeNet"::float / NULLIF("openInterest", 0) * 100) AS "avgNonComPct",
                AVG("prodMercNet"::float    / NULLIF("openInterest", 0) * 100) AS "avgProdPct",
                AVG("swapNet"::float        / NULLIF("openInterest", 0) * 100) AS "avgSwapPct",
                AVG("commercialNet"::float  / NULLIF("openInterest", 0) * 100) AS "avgComPct"
            FROM cftc_cot
            GROUP BY commodity
        `;

        const avgMap = Object.fromEntries(avgs.map((a: any) => [a.commodity, {
            avgMMoneyPct: parseFloat(a.avgMMoneyPct),
            avgOtherPct: parseFloat(a.avgOtherPct),
            avgNonComPct: parseFloat(a.avgNonComPct),
            avgProdPct: parseFloat(a.avgProdPct),
            avgSwapPct: parseFloat(a.avgSwapPct),
            avgComPct: parseFloat(a.avgComPct),
        }]));

        return NextResponse.json({
            data: rows,
            reportDate: reportDate.toISOString(),
            averages: avgMap,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch CFTC data' }, { status: 500 });
    }
}
