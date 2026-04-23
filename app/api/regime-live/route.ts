import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { determineNextRegime } from '@/lib/regime-state-machine';

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
            return rows[0] ?? undefined;
        } catch {
            return undefined;
        }
    };

    try {
        // Fetch the same raw data as cockpit-live
        const [tnx, irx, gspc, cpi, m2yoy, eps5yr] = await Promise.all([
            get('bonds', 'US/TNX'),
            get('bonds', 'US/IRX'),
            get('equities', 'US/GSPC'),
            get('economic', 'CPI'),
            get('economic', 'M2-YoY'),
            get('valuations', 'SP500-EPS-5yr'),
        ]);

        // Check if we have all required data
        if (!tnx || !irx || !gspc || !cpi || !m2yoy || !eps5yr) {
            console.error('Missing data:', { tnx: !!tnx, irx: !!irx, gspc: !!gspc, cpi: !!cpi, m2yoy: !!m2yoy, eps5yr: !!eps5yr });
            return NextResponse.json({
                error: 'Missing required data',
                missing: {
                    tnx: !tnx,
                    irx: !irx,
                    gspc: !gspc,
                    cpi: !cpi,
                    m2yoy: !m2yoy,
                    eps5yr: !eps5yr
                }
            }, { status: 500 });
        }

        // Calculate derived values exactly like cockpit-client does
        const cpiVal = cpi.value;
        const m2yoyVal = m2yoy.value;
        const eps5yrVal = eps5yr.value;
        const tnxVal = tnx.value;
        const irxVal = irx.value;
        const price = gspc.value;

        const real10Y = tnxVal - cpiVal;
        const real3M = irxVal - cpiVal;
        const realM2 = m2yoyVal - cpiVal;
        const pe5yr = eps5yrVal > 0 && price > 0 ? price / eps5yrVal : null;
        const ey5yr = pe5yr !== null ? (1 / pe5yr) * 100 : null;
        const eyp = ey5yr !== null ? ey5yr - irxVal : null;
        const realEY = ey5yr !== null ? ey5yr - cpiVal : null;

        // Calculate live regime using the same logic as cockpit
        const liveRegime = determineNextRegime(null, {
            rey: realEY,
            eyp: eyp,
            real10Y: real10Y,
            real3M: real3M,
            realM2: realM2,
            liquidityScore: 0,
            stage: 'N/A',
            pressure: 'N/A',
            risk: 'N/A',
            direction: 'N/A',
            trendAge: null,
        }, new Date().toISOString().split('T')[0]);

        // Log for debugging
        console.log('Live Regime Calculation:', {
            rey: realEY,
            eyp: eyp,
            real10Y: real10Y,
            real3M: real3M,
            realM2: realM2,
            regime: liveRegime.regime,
            rawData: { tnx: tnxVal, irx: irxVal, cpi: cpiVal, price, eps5yr: eps5yrVal, pe5yr, ey5yr }
        });

        return NextResponse.json({
            regime: {
                name: liveRegime.regime
            },
            debug: {
                rey: realEY,
                eyp: eyp,
                real10Y: real10Y,
                real3M: real3M,
                realM2: realM2,
            }
        });
    } catch (error) {
        console.error('regime-live error:', error);
        return NextResponse.json({ error: 'Failed to fetch live regime data' }, { status: 500 });
    }
}
