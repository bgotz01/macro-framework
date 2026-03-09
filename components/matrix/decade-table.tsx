import { DecadeData } from '@/types/matrix';

interface DecadeTableProps {
    data: DecadeData[];
    getLevelColor: (level: 'LOW' | 'MID' | 'HIGH' | '-') => string;
    getLevel: (value: number | null, thresholds: { low: number; mid: number }) => 'LOW' | 'MID' | 'HIGH' | '-';
    levels: {
        inflation: { low: number; mid: number };
        bondYieldsNominal: { low: number; mid: number };
        bondYieldsReal: { low: number; mid: number };
        yieldCurve: { low: number; mid: number };
        equityPE: { low: number; mid: number };
        earningsYield: { low: number; mid: number };
        fedFunds: { low: number; mid: number };
    };
}

export function DecadeTable({ data, getLevelColor, getLevel, levels }: DecadeTableProps) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-border shadow-lg">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <th className="border border-border p-4 text-left font-bold">Decade</th>
                        <th className="border border-border p-4 text-left font-bold">Year</th>
                        <th className="border border-border p-4 text-center font-bold bg-purple-50 dark:bg-purple-950/30">Outlier 1</th>
                        <th className="border border-border p-4 text-center font-bold bg-indigo-50 dark:bg-indigo-950/30">Outlier 2</th>
                        <th className="border border-border p-4 text-center font-bold">Inflation</th>
                        <th className="border border-border p-4 text-center font-bold">Fed Funds</th>
                        <th className="border border-border p-4 text-center font-bold">10Y Bond Yield</th>
                        <th className="border border-border p-4 text-center font-bold">Real 10Y Yield</th>
                        <th className="border border-border p-4 text-center font-bold">Yield Curve<br /><span className="text-xs font-normal">(10Y - 3M)</span></th>
                        <th className="border border-border p-4 text-center font-bold">P/E 5yr</th>
                        <th className="border border-border p-4 text-center font-bold">EY Premium 5yr<br /><span className="text-xs font-normal">(1/PE5yr - 3M)</span></th>
                        <th className="border border-border p-4 text-center font-bold">Real EY 5yr<br /><span className="text-xs font-normal">(EY5yr - CPI)</span></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => {
                        const inflationLevel = getLevel(row.inflation, levels.inflation);
                        const bondYieldLevel = getLevel(row.bondYield, levels.bondYieldsNominal);
                        const realYieldLevel = getLevel(row.realYield, levels.bondYieldsReal);
                        const fedFundsLevel = getLevel(row.fedFunds, levels.fedFunds);
                        const yieldCurveLevel = getLevel(row.yieldCurve, levels.yieldCurve);
                        const equityPE5yrLevel = getLevel(row.equityPE5yr, levels.equityPE);
                        const earningsYieldPremium5yrLevel = getLevel(row.earningsYieldPremium5yr, levels.earningsYield);
                        const realEarningsYield5yrLevel = getLevel(row.realEarningsYield5yr, levels.earningsYield);

                        return (
                            <tr key={row.decade} className={`transition-colors ${row.decade === 'Latest' ? 'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 border-t-2 border-blue-300 dark:border-blue-700' : 'hover:bg-muted/30'}`}>
                                <td className="border border-border p-4 font-bold text-lg">{row.decade}</td>
                                <td className="border border-border p-4 text-sm text-muted-foreground">
                                    {row.date === 'latest' ? 'Current' : row.date.split('-')[0]}
                                </td>
                                <td className="border border-border p-4 bg-purple-50 dark:bg-purple-950/30">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                            {row.outlier1?.metric || '-'}
                                        </div>
                                        <div className="text-sm font-mono">
                                            {row.outlier1 && row.outlier1.value !== null && row.outlier1.value !== undefined
                                                ? `${row.outlier1.value.toFixed(1)}${row.outlier1.metric.includes('P/E') ? 'x' : '%'}`
                                                : '-'}
                                        </div>
                                        <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                            {row.outlier1 && row.outlier1.percentile !== null ? `Pct: ${row.outlier1.percentile.toFixed(0)}%` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-border p-4 bg-indigo-50 dark:bg-indigo-950/30">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                            {row.outlier2?.metric || '-'}
                                        </div>
                                        <div className="text-sm font-mono">
                                            {row.outlier2 && row.outlier2.value !== null && row.outlier2.value !== undefined
                                                ? `${row.outlier2.value.toFixed(1)}${row.outlier2.metric.includes('P/E') ? 'x' : '%'}`
                                                : '-'}
                                        </div>
                                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                            {row.outlier2 && row.outlier2.percentile !== null ? `Pct: ${row.outlier2.percentile.toFixed(0)}%` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-border p-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(inflationLevel)}`}>
                                            {inflationLevel}
                                        </div>
                                        <div className="text-sm font-mono">
                                            {row.inflation !== null ? `${row.inflation.toFixed(1)}%` : '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {row.inflationPercentile !== null ? `Pct: ${row.inflationPercentile.toFixed(0)}%` : ''}
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
                                        <div className="text-xs text-muted-foreground">
                                            {row.fedFundsPercentile !== null ? `Pct: ${row.fedFundsPercentile.toFixed(0)}%` : ''}
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
                                        <div className="text-xs text-muted-foreground">
                                            {row.bondYieldPercentile !== null ? `Pct: ${row.bondYieldPercentile.toFixed(0)}%` : ''}
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
                                        <div className="text-xs text-muted-foreground">
                                            {row.realYieldPercentile !== null ? `Pct: ${row.realYieldPercentile.toFixed(0)}%` : ''}
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
                                        <div className="text-xs text-muted-foreground">
                                            {row.yieldCurvePercentile !== null ? `Pct: ${row.yieldCurvePercentile.toFixed(0)}%` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-border p-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(equityPE5yrLevel)}`}>
                                            {equityPE5yrLevel}
                                        </div>
                                        <div className="text-sm font-mono">
                                            {row.equityPE5yr !== null ? `${row.equityPE5yr.toFixed(1)}x` : '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {row.equityPE5yrPercentile !== null ? `Pct: ${row.equityPE5yrPercentile.toFixed(0)}%` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-border p-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(earningsYieldPremium5yrLevel)}`}>
                                            {earningsYieldPremium5yrLevel}
                                        </div>
                                        <div className="text-sm font-mono">
                                            {row.earningsYieldPremium5yr !== null ? `${row.earningsYieldPremium5yr.toFixed(2)}%` : '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {row.earningsYieldPremium5yrPercentile !== null ? `Pct: ${row.earningsYieldPremium5yrPercentile.toFixed(0)}%` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-border p-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor(realEarningsYield5yrLevel)}`}>
                                            {realEarningsYield5yrLevel}
                                        </div>
                                        <div className="text-sm font-mono">
                                            {row.realEarningsYield5yr !== null ? `${row.realEarningsYield5yr.toFixed(2)}%` : '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {row.realEarningsYield5yrPercentile !== null ? `Pct: ${row.realEarningsYield5yrPercentile.toFixed(0)}%` : ''}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
