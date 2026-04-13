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

function MetricCell({
    level,
    levelColor,
    value,
    percentile,
}: {
    level: string;
    levelColor: string;
    value: string;
    percentile: number | null;
}) {
    return (
        <div className="flex flex-col items-center gap-1.5 py-0.5">
            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide ${levelColor}`}>
                {level}
            </span>
            <span className="text-sm font-mono tabular-nums text-foreground">{value}</span>
            {percentile !== null && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                    {percentile.toFixed(0)}th pct
                </span>
            )}
        </div>
    );
}

function OutlierCell({
    metric,
    value,
    percentile,
}: {
    metric: string | undefined;
    value: string;
    percentile: number | null;
}) {
    if (!metric) return <span className="text-muted-foreground">—</span>;
    return (
        <div className="flex flex-col items-center gap-1.5 py-0.5">
            <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">{metric}</span>
            <span className="text-sm font-mono tabular-nums text-foreground">{value}</span>
            {percentile !== null && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                    {percentile.toFixed(0)}th pct
                </span>
            )}
        </div>
    );
}

export function DecadeTable({ data, getLevelColor, getLevel, levels }: DecadeTableProps) {
    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr className="table-head-row">
                        <th className="table-th-left">Decade</th>
                        <th className="table-th-left">Year</th>
                        <th className="table-th-center">Outlier 1</th>
                        <th className="table-th-center">Outlier 2</th>
                        <th className="table-th-center">Inflation</th>
                        <th className="table-th-center">Fed Funds</th>
                        <th className="table-th-center">10Y Yield</th>
                        <th className="table-th-center">Real 10Y</th>
                        <th className="table-th-center">
                            Yield Curve
                            <div className="table-th-sub">10Y − 3M</div>
                        </th>
                        <th className="table-th-center">P/E 5yr</th>
                        <th className="table-th-center">
                            EY Premium 5yr
                            <div className="table-th-sub">1/PE5yr − 3M</div>
                        </th>
                        <th className="table-th-last">
                            Real EY 5yr
                            <div className="table-th-sub">EY5yr − CPI</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => {
                        const isLatest = row.decade === 'Latest';
                        const rowClass = isLatest
                            ? 'table-row-highlight'
                            : i % 2 === 0
                                ? 'table-row-even'
                                : 'table-row-odd';

                        const inflationLevel = getLevel(row.inflation, levels.inflation);
                        const bondYieldLevel = getLevel(row.bondYield, levels.bondYieldsNominal);
                        const realYieldLevel = getLevel(row.realYield, levels.bondYieldsReal);
                        const fedFundsLevel = getLevel(row.fedFunds, levels.fedFunds);
                        const yieldCurveLevel = getLevel(row.yieldCurve, levels.yieldCurve);
                        const equityPE5yrLevel = getLevel(row.equityPE5yr, levels.equityPE);
                        const earningsYieldPremium5yrLevel = getLevel(row.earningsYieldPremium5yr, levels.earningsYield);
                        const realEarningsYield5yrLevel = getLevel(row.realEarningsYield5yr, levels.earningsYield);

                        return (
                            <tr key={row.decade} className={rowClass}>
                                <td className="table-td-label">{row.decade}</td>
                                <td className="table-td-muted">
                                    {row.date === 'latest' ? 'Now' : row.date.split('-')[0]}
                                </td>
                                <td className="table-td-center">
                                    <OutlierCell
                                        metric={row.outlier1?.metric}
                                        value={row.outlier1 && row.outlier1.value !== null
                                            ? `${row.outlier1.value.toFixed(1)}${row.outlier1.metric.includes('P/E') ? 'x' : '%'}`
                                            : '—'}
                                        percentile={row.outlier1?.percentile ?? null}
                                    />
                                </td>
                                <td className="table-td-center">
                                    <OutlierCell
                                        metric={row.outlier2?.metric}
                                        value={row.outlier2 && row.outlier2.value !== null
                                            ? `${row.outlier2.value.toFixed(1)}${row.outlier2.metric.includes('P/E') ? 'x' : '%'}`
                                            : '—'}
                                        percentile={row.outlier2?.percentile ?? null}
                                    />
                                </td>
                                <td className="table-td-center">
                                    <MetricCell level={inflationLevel} levelColor={getLevelColor(inflationLevel)}
                                        value={row.inflation !== null ? `${row.inflation.toFixed(1)}%` : '—'}
                                        percentile={row.inflationPercentile} />
                                </td>
                                <td className="table-td-center">
                                    <MetricCell level={fedFundsLevel} levelColor={getLevelColor(fedFundsLevel)}
                                        value={row.fedFunds !== null ? `${row.fedFunds.toFixed(1)}%` : '—'}
                                        percentile={row.fedFundsPercentile} />
                                </td>
                                <td className="table-td-center">
                                    <MetricCell level={bondYieldLevel} levelColor={getLevelColor(bondYieldLevel)}
                                        value={row.bondYield !== null ? `${row.bondYield.toFixed(1)}%` : '—'}
                                        percentile={row.bondYieldPercentile} />
                                </td>
                                <td className="table-td-center">
                                    <MetricCell level={realYieldLevel} levelColor={getLevelColor(realYieldLevel)}
                                        value={row.realYield !== null ? `${row.realYield.toFixed(1)}%` : '—'}
                                        percentile={row.realYieldPercentile} />
                                </td>
                                <td className="table-td-center">
                                    <MetricCell level={yieldCurveLevel} levelColor={getLevelColor(yieldCurveLevel)}
                                        value={row.yieldCurve !== null
                                            ? `${row.yieldCurve > 0 ? '+' : ''}${row.yieldCurve.toFixed(2)}%`
                                            : '—'}
                                        percentile={row.yieldCurvePercentile} />
                                </td>
                                <td className="table-td-center">
                                    <MetricCell level={equityPE5yrLevel} levelColor={getLevelColor(equityPE5yrLevel)}
                                        value={row.equityPE5yr !== null ? `${row.equityPE5yr.toFixed(1)}x` : '—'}
                                        percentile={row.equityPE5yrPercentile} />
                                </td>
                                <td className="table-td-center">
                                    <MetricCell level={earningsYieldPremium5yrLevel} levelColor={getLevelColor(earningsYieldPremium5yrLevel)}
                                        value={row.earningsYieldPremium5yr !== null ? `${row.earningsYieldPremium5yr.toFixed(2)}%` : '—'}
                                        percentile={row.earningsYieldPremium5yrPercentile} />
                                </td>
                                <td className="table-td-center">
                                    <MetricCell level={realEarningsYield5yrLevel} levelColor={getLevelColor(realEarningsYield5yrLevel)}
                                        value={row.realEarningsYield5yr !== null ? `${row.realEarningsYield5yr.toFixed(2)}%` : '—'}
                                        percentile={row.realEarningsYield5yrPercentile} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
