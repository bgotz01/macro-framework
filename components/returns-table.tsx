'use client';

import { useState, useEffect } from 'react';

interface YearReturn {
    year: string;
    startDate: string;
    endDate: string;
    startValue: number;
    endValue: number;
    return: number;
    volatility: number;
}

interface ReturnsTableProps {
    data: Array<{ date: string; value: number }>;
    indexName: string;
}

export default function ReturnsTable({ data, indexName }: ReturnsTableProps) {
    const [returns, setReturns] = useState<YearReturn[]>([]);

    useEffect(() => {
        if (data.length > 0) {
            const calculated = calculateCalendarReturns(data);
            setReturns(calculated);
        }
    }, [data]);

    const findClosestValue = (data: Array<{ date: string; value: number }>, targetDate: string, maxDaysBack: number = 10): { date: string; value: number; index: number } | null => {
        const target = new Date(targetDate);

        for (let i = 0; i <= maxDaysBack; i++) {
            const checkDate = new Date(target);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            const index = data.findIndex(d => d.date === dateStr);
            if (index !== -1) {
                return { date: data[index].date, value: data[index].value, index };
            }
        }

        return null;
    };

    const calculateVolatility = (data: Array<{ date: string; value: number }>, startIndex: number, endIndex: number): number => {
        if (endIndex <= startIndex) return 0;

        // Calculate daily returns
        const dailyReturns: number[] = [];
        for (let i = startIndex + 1; i <= endIndex; i++) {
            const dailyReturn = (data[i].value - data[i - 1].value) / data[i - 1].value;
            dailyReturns.push(dailyReturn);
        }

        if (dailyReturns.length === 0) return 0;

        // Calculate standard deviation of daily returns
        const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
        const squaredDiffs = dailyReturns.map(r => Math.pow(r - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / dailyReturns.length;
        const dailyStdDev = Math.sqrt(variance);

        // Annualize (assuming 252 trading days per year)
        const annualizedVolatility = dailyStdDev * Math.sqrt(252) * 100; // Convert to percentage

        return annualizedVolatility;
    };

    const calculateCalendarReturns = (data: Array<{ date: string; value: number }>): YearReturn[] => {
        const returns: YearReturn[] = [];
        const currentYear = new Date().getFullYear();

        for (let year = 1990; year < currentYear; year++) {
            const startDate = `${year}-12-31`;
            const endDate = `${year + 1}-12-31`;

            const startData = findClosestValue(data, startDate);
            const endData = findClosestValue(data, endDate);

            if (startData && endData && endData.index > startData.index) {
                const returnPct = ((endData.value - startData.value) / startData.value) * 100;
                const volatility = calculateVolatility(data, startData.index, endData.index);

                returns.push({
                    year: `${year + 1}`,
                    startDate: startData.date,
                    endDate: endData.date,
                    startValue: startData.value,
                    endValue: endData.value,
                    return: returnPct,
                    volatility: volatility
                });
            }
        }

        return returns;
    };

    const formatPercent = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    const getReturnColor = (value: number) => {
        if (value >= 20) return 'text-green-600 dark:text-green-400';
        if (value >= 10) return 'text-green-500 dark:text-green-500';
        if (value >= 0) return 'text-green-400 dark:text-green-600';
        if (value >= -10) return 'text-red-400 dark:text-red-600';
        if (value >= -20) return 'text-red-500 dark:text-red-500';
        return 'text-red-600 dark:text-red-400';
    };

    const calculateStats = () => {
        if (returns.length === 0) return null;

        const values = returns.map(r => r.return);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const positive = values.filter(v => v > 0).length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        // Calculate standard deviation
        const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(variance);

        return { avg, positive, max, min, stdDev, total: values.length };
    };

    const stats = calculateStats();

    return (
        <div className="space-y-6">
            {/* Stats Card */}
            {stats && (
                <div className="p-6 rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                        Calendar Year (Dec 31 - Dec 31)
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Average Return:</span>
                            <span className={`font-bold ${getReturnColor(stats.avg)}`}>
                                {formatPercent(stats.avg)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Std Deviation:</span>
                            <span className="font-bold text-blue-900 dark:text-blue-100">
                                {stats.stdDev.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Best Year:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                                {formatPercent(stats.max)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Worst Year:</span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                                {formatPercent(stats.min)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Win Rate:</span>
                            <span className="font-bold text-blue-900 dark:text-blue-100">
                                {stats.positive}/{stats.total} ({((stats.positive / stats.total) * 100).toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Calendar Year Returns</h2>
                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Year</th>
                                    <th className="px-4 py-3 text-right font-semibold">Return</th>
                                    <th className="px-4 py-3 text-right font-semibold">Volatility</th>
                                    <th className="px-4 py-3 text-right font-semibold">Closing Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {returns.map((ret) => (
                                    <tr key={ret.year} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium">{ret.year}</td>
                                        <td className={`px-4 py-3 text-right font-bold ${getReturnColor(ret.return)}`}>
                                            {formatPercent(ret.return)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">
                                            {ret.volatility.toFixed(2)}%
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">
                                            {ret.endValue.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
