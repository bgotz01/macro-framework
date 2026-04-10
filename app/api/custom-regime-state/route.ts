import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

interface Conditions {
    rey: number | null;
    eyp: number | null;
    real10Y: number | null;
    real3M: number | null;
    realM2: number | null;
}

interface RegimeResult {
    regime: string;
    entryDate: string;
    triggerReason: string;
}

function buildTriggers(t: any) {
    return {
        'Liquidity Shock': {
            entry: (c: Conditions) => c.realM2 !== null && c.realM2 >= t.liquidityShock.entry,
            exit: (c: Conditions) => c.realM2 !== null && c.realM2 <= t.liquidityShock.exit,
            reason: (c: Conditions) => `Liquidity Shock: Real M2 ${c.realM2?.toFixed(1)}%`,
        },
        'Crisis': {
            entry: (c: Conditions) => c.real10Y !== null && c.realM2 !== null && c.real10Y <= t.crisis.entryReal10Y && c.realM2 <= t.crisis.entryRealM2,
            exit: (c: Conditions) => c.real10Y !== null && c.realM2 !== null && (c.real10Y >= t.crisis.exitReal10Y || c.realM2 >= t.crisis.exitRealM2),
            reason: (c: Conditions) => `Crisis: Real 10Y ${c.real10Y?.toFixed(2)}%, Real M2 ${c.realM2?.toFixed(1)}%`,
        },
        'Bond Stress': {
            entry: (c: Conditions) => c.real10Y !== null && c.real3M !== null && c.real10Y <= t.bondStress.entryReal10Y && c.real3M <= t.bondStress.entryReal3M,
            exit: (c: Conditions) => c.real10Y !== null && c.real10Y >= t.bondStress.exitReal10Y,
            reason: (c: Conditions) => `Bond Stress: Real 10Y ${c.real10Y?.toFixed(2)}%, Real 3M ${c.real3M?.toFixed(2)}%`,
        },
        'Contraction': {
            entry: (c: Conditions) => c.rey !== null && c.eyp !== null && c.real10Y !== null && c.rey <= t.contraction.entryRey && c.eyp <= t.contraction.entryEyp && c.real10Y <= t.contraction.entryReal10Y,
            exit: (c: Conditions) => c.rey !== null && c.rey >= t.contraction.exitRey,
            reason: (c: Conditions) => `Contraction: REY ${c.rey?.toFixed(2)}%, EYP ${c.eyp?.toFixed(2)}%`,
        },
        'Overvaluation': {
            entry: (c: Conditions) => c.eyp !== null && c.rey !== null && (c.eyp <= t.overvaluation.entryEyp || c.rey <= t.overvaluation.entryRey),
            exit: (c: Conditions) => c.eyp !== null && c.rey !== null && c.eyp >= t.overvaluation.exitEyp && c.rey >= t.overvaluation.exitRey,
            reason: (c: Conditions) => `Overvaluation: EYP ${c.eyp?.toFixed(2)}%, REY ${c.rey?.toFixed(2)}%`,
        },
        'Broad Growth': {
            entry: (c: Conditions) => c.rey !== null && c.rey >= t.broadGrowth.entry,
            exit: (c: Conditions) => c.rey !== null && c.rey < t.broadGrowth.exit,
            reason: (c: Conditions) => `Broad Growth: REY ${c.rey?.toFixed(2)}%`,
        },
        'Long Duration': {
            entry: (c: Conditions) => c.eyp !== null && c.real10Y !== null && c.rey !== null && c.eyp <= t.longDuration.entryEyp && c.real10Y >= t.longDuration.entryReal10Y && c.rey >= t.longDuration.entryRey,
            exit: (c: Conditions) => c.eyp !== null && c.rey !== null && (c.eyp >= t.longDuration.exitEypHigh || c.eyp <= t.longDuration.exitEypLow || c.rey <= t.longDuration.exitRey),
            reason: (c: Conditions) => `Long Duration: EYP ${c.eyp?.toFixed(2)}%, Real 10Y ${c.real10Y?.toFixed(2)}%`,
        },
        'Normal': {
            entry: () => false,
            exit: () => false,
            reason: () => 'Balanced conditions - no extreme triggers',
        },
    };
}

const PRECEDENCE = [
    'Liquidity Shock', 'Crisis', 'Bond Stress',
    'Overvaluation', 'Broad Growth', 'Long Duration',
];

function buildCustomTrigger(cr: any) {
    const evalSide = (side: any, logic: string, c: Conditions): boolean => {
        const map: Record<string, number | null> = {
            rey: c.rey, eyp: c.eyp, real10Y: c.real10Y, real3M: c.real3M, realM2: c.realM2,
        };
        const results = Object.keys(side)
            .filter(k => side[k].enabled)
            .map(k => {
                const val = map[k];
                if (val === null) return false;
                return side[k].op === 'lte' ? val <= side[k].value : val >= side[k].value;
            });
        if (results.length === 0) return false;
        return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
    };
    return {
        entry: (c: Conditions) => evalSide(cr.entry, cr.entryLogic, c),
        exit: (c: Conditions) => evalSide(cr.exit, cr.exitLogic, c),
        reason: () => `${cr.name}: custom regime triggered`,
    };
}

function walkTimeline(rows: Array<{ date: string } & Conditions>, triggers: any, customRegimeDef?: any): RegimeResult {
    // Build precedence with custom regime injected
    const base = [...PRECEDENCE];
    if (customRegimeDef) {
        const pos = Math.max(0, Math.min((customRegimeDef.precedence ?? 5) - 1, base.length));
        base.splice(pos, 0, customRegimeDef.name);
        triggers[customRegimeDef.name] = buildCustomTrigger(customRegimeDef);
    }

    let current = null as RegimeResult | null;

    for (const row of rows) {
        const currentRegime = current ? current.regime : null;
        let nextRegime: RegimeResult | null = null;

        for (const regime of base) {
            const config = triggers[regime];
            if (!config) continue;

            const isCurrentRegime = regime === currentRegime;
            const shouldExit = isCurrentRegime && config.exit(row);
            const triggered = config.entry(row);

            if (triggered && regime !== currentRegime) {
                nextRegime = { regime, entryDate: row.date, triggerReason: config.reason(row) };
                break;
            }
            if (isCurrentRegime && !shouldExit) {
                nextRegime = current;
                break;
            }
        }

        if (!nextRegime) {
            if (current && current.regime !== 'Normal') {
                const config = triggers[current.regime];
                if (config && !config.exit(row)) {
                    nextRegime = current;
                } else {
                    nextRegime = { regime: 'Normal', entryDate: row.date, triggerReason: 'Balanced conditions - no extreme triggers' };
                }
            } else {
                nextRegime = { regime: 'Normal', entryDate: row.date, triggerReason: 'Balanced conditions - no extreme triggers' };
            }
        }

        current = nextRegime;
    }

    return current || { regime: 'Normal', entryDate: '', triggerReason: 'No data' };
}

export async function POST(request: NextRequest) {
    try {
        const { thresholds, targetDate } = await request.json();
        if (!thresholds) {
            return NextResponse.json({ error: 'Missing thresholds' }, { status: 400 });
        }

        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true, timeout: 10000 });

        const dateFilter = targetDate && targetDate !== 'latest' ? `AND r.date <= ?` : '';
        const params: string[] = [];
        if (targetDate && targetDate !== 'latest') params.push(targetDate);

        const rows = db.prepare(`
            SELECT
                r.date,
                r.value as rey,
                e.value as eyp,
                t.value as real10y,
                m3.value as real3m,
                m2.value as realM2
            FROM percentile_analysis r
            LEFT JOIN percentile_analysis e ON r.date = e.date AND e.asset_class = 'derived' AND e.series_name = 'Earnings-Yield-Premium-5yr'
            LEFT JOIN percentile_analysis t ON r.date = t.date AND t.asset_class = 'derived' AND t.series_name = 'Real-10Y'
            LEFT JOIN percentile_analysis m3 ON r.date = m3.date AND m3.asset_class = 'derived' AND m3.series_name = 'Real-3M'
            LEFT JOIN percentile_analysis m2 ON r.date = m2.date AND m2.asset_class = 'economic' AND m2.series_name = 'Real-M2-YoY'
            WHERE r.asset_class = 'derived' AND r.series_name = 'Real-Earnings-Yield-5yr'
            ${dateFilter}
            ORDER BY r.date ASC
        `).all(...params) as Array<{
            date: string; rey: number | null; eyp: number | null;
            real10y: number | null; real3m: number | null; realM2: number | null;
        }>;

        db.close();

        const mapped = rows.map(r => ({
            date: r.date,
            rey: r.rey,
            eyp: r.eyp,
            real10Y: r.real10y,
            real3M: r.real3m,
            realM2: r.realM2,
        }));

        const triggers = buildTriggers(thresholds);
        const result = walkTimeline(mapped, triggers, thresholds.customRegime);

        // Calculate months in regime
        let monthsInRegime = 0;
        if (result.entryDate && mapped.length > 0) {
            const entry = new Date(result.entryDate);
            const current = new Date(mapped[mapped.length - 1].date);
            monthsInRegime = (current.getFullYear() - entry.getFullYear()) * 12 + (current.getMonth() - entry.getMonth());
        }

        return NextResponse.json({
            regime: result.regime,
            entryDate: result.entryDate,
            currentDate: mapped.length > 0 ? mapped[mapped.length - 1].date : '',
            daysInRegime: monthsInRegime,
            triggerReason: result.triggerReason,
        });
    } catch (error) {
        console.error('Error calculating custom regime state:', error);
        return NextResponse.json({ error: 'Failed to calculate regime' }, { status: 500 });
    }
}
