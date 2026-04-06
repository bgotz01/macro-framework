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

// Chinese Lunar New Year dates (1990-2026)
const LUNAR_NEW_YEAR_DATES: Record<number, string> = {
    1990: '1990-01-27',
    1991: '1991-02-15',
    1992: '1992-02-04',
    1993: '1993-01-23',
    1994: '1994-02-10',
    1995: '1995-01-31',
    1996: '1996-02-19',
    1997: '1997-02-07',
    1998: '1998-01-28',
    1999: '1999-02-16',
    2000: '2000-02-05',
    2001: '2001-01-24',
    2002: '2002-02-12',
    2003: '2003-02-01',
    2004: '2004-01-22',
    2005: '2005-02-09',
    2006: '2006-01-29',
    2007: '2007-02-18',
    2008: '2008-02-07',
    2009: '2009-01-26',
    2010: '2010-02-14',
    2011: '2011-02-03',
    2012: '2012-01-23',
    2013: '2013-02-10',
    2014: '2014-01-31',
    2015: '2015-02-19',
    2016: '2016-02-08',
    2017: '2017-01-28',
    2018: '2018-02-16',
    2019: '2019-02-05',
    2020: '2020-01-25',
    2021: '2021-02-12',
    2022: '2022-02-01',
    2023: '2023-01-22',
    2024: '2024-02-10',
    2025: '2025-01-29',
    2026: '2026-02-17',
};

// Tooltip component
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
    const [show, setShow] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="absolute z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                    {content}
                    <div className="absolute w-2 h-2 bg-gray-900 rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
            )}
        </div>
    );
}

// Chinese Zodiac animals in order (12-year cycle)
const ZODIAC_ANIMALS = [
    'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
    'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
];

// Get zodiac animal for a given year
function getZodiacAnimal(year: number): string {
    // 1900 was the year of the Rat (index 0)
    // The cycle repeats every 12 years
    const index = (year - 1900) % 12;
    return ZODIAC_ANIMALS[index];
}

// Get zodiac emoji
function getZodiacEmoji(animal: string): string {
    const emojiMap: Record<string, string> = {
        'Rat': '🐀',
        'Ox': '🐂',
        'Tiger': '🐅',
        'Rabbit': '🐇',
        'Dragon': '🐉',
        'Snake': '🐍',
        'Horse': '🐴',
        'Goat': '🐐',
        'Monkey': '🐵',
        'Rooster': '🐓',
        'Dog': '🐕',
        'Pig': '🐖'
    };
    return emojiMap[animal] || '';
}

interface LunarReturnsTableProps {
    data: Array<{ date: string; value: number }>;
    indexName: string;
}

export default function LunarReturnsTable({ data, indexName }: LunarReturnsTableProps) {
    const [returns, setReturns] = useState<YearReturn[]>([]);
    const [selectedZodiac, setSelectedZodiac] = useState<string>('All');

    useEffect(() => {
        if (data.length > 0) {
            const calculated = calculateLunarReturns(data);
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

    const calculateLunarReturns = (data: Array<{ date: string; value: number }>): YearReturn[] => {
        const returns: YearReturn[] = [];
        const years = Object.keys(LUNAR_NEW_YEAR_DATES).map(Number).sort((a, b) => a - b);

        for (let i = 0; i < years.length - 1; i++) {
            const year = years[i];
            const nextYear = years[i + 1];

            if (year < 1990) continue;

            const startDate = LUNAR_NEW_YEAR_DATES[year];
            const endDate = LUNAR_NEW_YEAR_DATES[nextYear];

            const startData = findClosestValue(data, startDate);
            const endData = findClosestValue(data, endDate);

            if (startData && endData && endData.index > startData.index) {
                const returnPct = ((endData.value - startData.value) / startData.value) * 100;
                const volatility = calculateVolatility(data, startData.index, endData.index);

                returns.push({
                    year: `${year}`,
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

    const filteredReturns = selectedZodiac === 'All'
        ? returns
        : returns.filter(r => getZodiacAnimal(parseInt(r.year)) === selectedZodiac);

    const filteredAvg = filteredReturns.length > 0
        ? filteredReturns.reduce((sum, r) => sum + r.return, 0) / filteredReturns.length
        : null;

    const filteredWins = filteredReturns.filter(r => r.return > 0).length;

    return (
        <div className="space-y-6">
            {/* Stats Card */}
            {stats && (
                <div className="p-6 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
                        Chinese Lunar Year
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-purple-700 dark:text-purple-300">Average Return:</span>
                            <span className={`font-bold ${getReturnColor(stats.avg)}`}>
                                {formatPercent(stats.avg)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-purple-700 dark:text-purple-300">Std Deviation:</span>
                            <span className="font-bold text-purple-900 dark:text-purple-100">
                                {stats.stdDev.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-purple-700 dark:text-purple-300">Best Year:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                                {formatPercent(stats.max)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-purple-700 dark:text-purple-300">Worst Year:</span>
                            <span className="font-bold text-red-600 dark:text-red-400">
                                {formatPercent(stats.min)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-purple-700 dark:text-purple-300">Win Rate:</span>
                            <span className="font-bold text-purple-900 dark:text-purple-100">
                                {stats.positive}/{stats.total} ({((stats.positive / stats.total) * 100).toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Lunar Year Returns</h2>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="text-sm text-muted-foreground">Filter by Zodiac:</span>
                        {['All', ...ZODIAC_ANIMALS].map(animal => (
                            <button
                                key={animal}
                                onClick={() => setSelectedZodiac(animal)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${selectedZodiac === animal
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {animal === 'All' ? 'All' : `${getZodiacEmoji(animal)} ${animal}`}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Year</th>
                                    <th className="px-4 py-3 text-left font-semibold">Zodiac</th>
                                    <th className="px-4 py-3 text-right font-semibold">Return</th>
                                    <th className="px-4 py-3 text-right font-semibold">Volatility</th>
                                    <th className="px-4 py-3 text-right font-semibold">Closing Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredReturns.map((ret) => {
                                    const yearNum = parseInt(ret.year);
                                    const zodiacAnimal = getZodiacAnimal(yearNum);
                                    const zodiacEmoji = getZodiacEmoji(zodiacAnimal);

                                    return (
                                        <tr
                                            key={ret.year}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                <Tooltip content={`${ret.startDate} to ${ret.endDate}`}>
                                                    <span className="cursor-help border-b border-dotted border-current">
                                                        {ret.year}
                                                    </span>
                                                </Tooltip>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="text-lg">{zodiacEmoji}</span>
                                                    <span className="text-muted-foreground">{zodiacAnimal}</span>
                                                </span>
                                            </td>
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
                                    );
                                })}
                            </tbody>
                            {filteredAvg !== null && (
                                <tfoot className="border-t-2 border-border bg-muted/50">
                                    <tr>
                                        <td className="px-4 py-3 font-semibold text-muted-foreground" colSpan={2}>
                                            Avg ({filteredReturns.length} years, {filteredWins}W / {filteredReturns.length - filteredWins}L)
                                        </td>
                                        <td className={`px-4 py-3 text-right font-bold ${getReturnColor(filteredAvg)}`}>
                                            {formatPercent(filteredAvg)}
                                        </td>
                                        <td colSpan={2} />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
