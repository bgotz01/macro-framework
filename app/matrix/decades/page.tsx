import Database from 'better-sqlite3';
import path from 'path';

// Threshold definitions (same as main matrix page)
const LEVELS = {
    inflation: { low: 3, mid: 6 },
    bondYieldsNominal: { low: 2, mid: 5 },
    bondYieldsReal: { low: 0, mid: 2 },
    yieldCurve: { low: -0.5, mid: 0.5 },
    equityPE: { low: 15, mid: 20 },
    earningsYield: { low: 5, mid: 6.67 }, // Inverse of P/E: 1/20 = 5%, 1/15 = 6.67%
    fedFunds: { low: 2, mid: 4 },
};

interface DecadeData {
    decade: string;
    date: string;
    inflation: number | null;
    bondYield: number | null;
    realYield: number | null;
    yieldCurve: number | null;
    equityPE: number | null;
    earningsYield: number | null;
    fedFunds: number | null;
}

function getLevel(value: number | null, thresholds: { low: number; mid: number }): 'LOW' | 'MID' | 'HIGH' | '-' {
    if (value === null) return '-';
    if (value < thresholds.low) return 'LOW';
    if (value < thresholds.mid) return 'MID';
    return 'HIGH';
}

function getLevelColor(level: 'LOW' | 'MID' | 'HIGH' | '-'): string {
    switch (level) {
        case 'LOW': return 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100';
        case 'MID': return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100';
        case 'HIGH': return 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100';
        default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
    }
}

async function getValueAtDate(assetClass: string, seriesName: string, targetDate: string): Promise<number | null> {
    try {
        const dbPath = path.join(process.cwd(), 'data', 'macro-data.db');
        const db = new Database(dbPath, { readonly: true });

        // Convert target date to timestamp
        const targetTimestamp = new Date(targetDate).getTime();

        // Find the closest date within 45 days (for monthly data)
        const query = `
            SELECT value, date
            FROM time_series
            WHERE asset_class = ? 
              AND series_name = ? 
              AND column_name = 'Value'
              AND ABS(date - ?) <= 45 * 24 * 60 * 60 * 1000
            ORDER BY ABS(date - ?)
            LIMIT 1
        `;

        const result = db.prepare(query).get(assetClass, seriesName, targetTimestamp, targetTimestamp) as { value: number } | undefined;
        db.close();

        return result ? result.value : null;
    } catch (error) {
        console.error(`Error fetching ${assetClass}/${seriesName} at ${targetDate}:`, error);
        return null;
    }
}

async function getDecadeData(): Promise<DecadeData[]> {
    const decades = [
        { decade: '1960s', date: '1969-12-31' },
        { decade: '1970s', date: '1979-12-31' },
        { decade: '1980s', date: '1989-12-31' },
        { decade: '1990s', date: '1999-12-31' },
        { decade: '2000s', date: '2009-12-31' },
        { decade: '2010s', date: '2019-12-31' },
        { decade: '2020s', date: '2024-12-31' }, // Most recent complete year
    ];

    const data: DecadeData[] = [];

    for (const { decade, date } of decades) {
        const [cpi, tenYear, twoYear, shillerPE, fedFunds] = await Promise.all([
            getValueAtDate('economic', 'CPI', date),
            getValueAtDate('bonds', 'US/TNX', date),
            getValueAtDate('bonds', 'US/US-2yr', date),
            getValueAtDate('valuations', 'Shiller-PE', date),
            getValueAtDate('economic', 'US/FEDFUNDS', date),
        ]);

        const realYield = tenYear !== null && cpi !== null ? tenYear - cpi : null;
        const yieldCurve = tenYear !== null && twoYear !== null ? tenYear - twoYear : null;
        const earningsYield = shillerPE !== null && shillerPE > 0 ? (100 / shillerPE) : null;

        data.push({
            decade,
            date,
            inflation: cpi,
            bondYield: tenYear,
            realYield,
            yieldCurve,
            equityPE: shillerPE,
            earningsYield,
            fedFunds,
        });
    }

    return data;
}

export default async function DecadesPage() {
    const decadeData = await getDecadeData();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Historical Analysis
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Decade-End Regime Levels
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Macro regime levels at the end of each decade (December 31st)
                </p>
            </div>

            {/* Legend */}
            <div className="mb-8 p-6 rounded-2xl border border-border bg-card">
                <h3 className="text-lg font-bold mb-4">Level Definitions</h3>
                <div className="grid md:grid-cols-6 gap-4 text-sm">
                    <div>
                        <div className="font-semibold mb-2">Inflation</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 3%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 3-6%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 6%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Bond Yield</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 2%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 2-5%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 5%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Real Yield</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 0%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 0-2%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 2%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Fed Funds</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 2%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 2-4%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 4%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Yield Curve</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>INV: &lt; -0.5%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>FLAT: -0.5 to 0.5%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>STEEP: &gt; 0.5%</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Shiller P/E</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>CHEAP: &lt; 15x</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>FAIR: 15-20x</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>EXP: &gt; 20x</div>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold mb-2">Earnings Yield</div>
                        <div className="space-y-1">
                            <div className={`px-2 py-1 rounded ${getLevelColor('HIGH')}`}>HIGH: &gt; 6.67%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('MID')}`}>MID: 5-6.67%</div>
                            <div className={`px-2 py-1 rounded ${getLevelColor('LOW')}`}>LOW: &lt; 5%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-border shadow-lg">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                            <th className="border border-border p-4 text-left font-bold">Decade</th>
                            <th className="border border-border p-4 text-left font-bold">Date</th>
                            <th className="border border-border p-4 text-center font-bold">Inflation</th>
                            <th className="border border-border p-4 text-center font-bold">10Y Bond Yield</th>
                            <th className="border border-border p-4 text-center font-bold">Real Yield</th>
                            <th className="border border-border p-4 text-center font-bold">Fed Funds</th>
                            <th className="border border-border p-4 text-center font-bold">Yield Curve</th>
                            <th className="border border-border p-4 text-center font-bold">Shiller P/E</th>
                            <th className="border border-border p-4 text-center font-bold">Earnings Yield</th>
                        </tr>
                    </thead>
                    <tbody>
                        {decadeData.map((row) => {
                            const inflationLevel = getLevel(row.inflation, LEVELS.inflation);
                            const bondYieldLevel = getLevel(row.bondYield, LEVELS.bondYieldsNominal);
                            const realYieldLevel = getLevel(row.realYield, LEVELS.bondYieldsReal);
                            const fedFundsLevel = getLevel(row.fedFunds, LEVELS.fedFunds);
                            const yieldCurveLevel = getLevel(row.yieldCurve, LEVELS.yieldCurve);
                            const equityPELevel = getLevel(row.equityPE, LEVELS.equityPE);
                            const earningsYieldLevel = getLevel(row.earningsYield, LEVELS.earningsYield);

                            return (
                                <tr key={row.decade} className="hover:bg-muted/30 transition-colors">
                                    <td className="border border-border p-4 font-bold text-lg">{row.decade}</td>
                                    <td className="border border-border p-4 text-sm text-muted-foreground">{row.date}</td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(inflationLevel)}`}>
                                                {inflationLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.inflation !== null ? `${row.inflation.toFixed(1)}%` : '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(bondYieldLevel)}`}>
                                                {bondYieldLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.bondYield !== null ? `${row.bondYield.toFixed(1)}%` : '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(realYieldLevel)}`}>
                                                {realYieldLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.realYield !== null ? `${row.realYield.toFixed(1)}%` : '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(fedFundsLevel)}`}>
                                                {fedFundsLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.fedFunds !== null ? `${row.fedFunds.toFixed(1)}%` : '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(yieldCurveLevel)}`}>
                                                {yieldCurveLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.yieldCurve !== null ? `${row.yieldCurve > 0 ? '+' : ''}${row.yieldCurve.toFixed(2)}%` : '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(equityPELevel)}`}>
                                                {equityPELevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.equityPE !== null ? `${row.equityPE.toFixed(1)}x` : '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-border p-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(earningsYieldLevel)}`}>
                                                {earningsYieldLevel}
                                            </div>
                                            <div className="text-sm font-mono">
                                                {row.earningsYield !== null ? `${row.earningsYield.toFixed(2)}%` : '-'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Insights */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="text-lg font-bold mb-3">📊 Key Observations</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• <strong>1970s:</strong> High inflation era with elevated bond yields</li>
                        <li>• <strong>1980s-1990s:</strong> Disinflation period with declining rates</li>
                        <li>• <strong>2000s-2010s:</strong> ZIRP environment with low inflation</li>
                        <li>• <strong>2020s:</strong> Return of inflation and rate normalization</li>
                    </ul>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-card">
                    <h3 className="text-lg font-bold mb-3">💡 Framework Note</h3>
                    <p className="text-sm text-muted-foreground">
                        This view shows only the <strong>level</strong> dimension of the regime framework.
                        The full framework includes both level and direction (falling/stable/rising) to create
                        a 3×3 matrix for each measure. Historical analysis of directional trends requires
                        comparing values over time windows.
                    </p>
                </div>
            </div>
        </div>
    );
}
