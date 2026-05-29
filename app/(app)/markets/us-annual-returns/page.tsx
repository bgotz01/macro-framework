'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/page-header';

interface AnnualReturn {
    Year: number;
    'S&P 500': string;
    'US Small cap': string;
    '3-month T.Bill': string;
    'US T. Bond (10-year)': string;
    'Baa Corporate Bond': string;
    'Real Estate': string;
    Gold: string;
}

type FilterType = 'all' | 'decade' | '12-year';

export default function AnnualReturnsPage() {
    const [data, setData] = useState<AnnualReturn[]>([]);
    const [filteredData, setFilteredData] = useState<AnnualReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [selectedDecade, setSelectedDecade] = useState<number>(2020);
    const [selected12YearPeriod, setSelected12YearPeriod] = useState<number>(1948);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [data, filterType, selectedDecade, selected12YearPeriod]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/data/markets/AnnualReturns.csv');
            const text = await response.text();

            const lines = text.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/[^\x20-\x7E]/g, '').trim());

            const parsed = lines.slice(1).map(line => {
                const values = line.split(',');
                const row: any = {};
                headers.forEach((header, index) => {
                    if (header === 'Year') {
                        row[header] = parseInt(values[index]);
                    } else {
                        row[header] = values[index];
                    }
                });
                return row;
            });

            setData(parsed);
            setFilteredData(parsed);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        if (filterType === 'all') {
            setFilteredData(data);
        } else if (filterType === 'decade') {
            const filtered = data.filter(row => {
                const year = row.Year;
                return year >= selectedDecade && year < selectedDecade + 10;
            });
            setFilteredData(filtered);
        } else if (filterType === '12-year') {
            const filtered = data.filter(row => {
                const year = row.Year;
                return year >= selected12YearPeriod && year < selected12YearPeriod + 12;
            });
            setFilteredData(filtered);
        }
    };

    const parsePercentage = (value: string | undefined): number => {
        if (!value || value === undefined) return NaN;
        return parseFloat(value.replace('%', ''));
    };

    const calculateAverage = (values: (string | undefined)[]): string => {
        const numbers = values.map(parsePercentage).filter(n => !isNaN(n));
        if (numbers.length === 0) return '0.00%';
        const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
        return `${avg.toFixed(2)}%`;
    };

    const getDecades = (): number[] => {
        const decades: number[] = [];
        for (let year = 1920; year <= 2020; year += 10) {
            decades.push(year);
        }
        return decades;
    };

    const get12YearPeriods = (): number[] => {
        const periods: number[] = [];
        const startYear = 1948;
        const endYear = Math.max(...data.map(d => d.Year));
        for (let year = startYear; year <= endYear; year += 12) {
            periods.push(year);
        }
        return periods;
    };

    const calculateDecadeAverages = () => {
        const decades = getDecades();
        const columns = ['S&P 500', 'US Small cap', '3-month T.Bill', 'US T. Bond (10-year)', 'Baa Corporate Bond', 'Real Estate', 'Gold'];

        return decades.map(decade => {
            const decadeData = data.filter(row => row.Year >= decade && row.Year < decade + 10);
            if (decadeData.length === 0) return null;

            const averages: any = { decade: `${decade}s` };
            columns.forEach(col => {
                averages[col] = calculateAverage(decadeData.map(row => row[col as keyof AnnualReturn] as string));
            });

            return averages;
        }).filter(Boolean);
    };

    const calculate12YearAverages = () => {
        const periods = get12YearPeriods();
        const columns = ['S&P 500', 'US Small cap', '3-month T.Bill', 'US T. Bond (10-year)', 'Baa Corporate Bond', 'Real Estate', 'Gold'];

        return periods.map(period => {
            const periodData = data.filter(row => row.Year >= period && row.Year < period + 12);
            if (periodData.length === 0) return null;

            const averages: any = { period: `${period}-${period + 11}` };
            columns.forEach(col => {
                averages[col] = calculateAverage(periodData.map(row => row[col as keyof AnnualReturn] as string));
            });

            return averages;
        }).filter(Boolean);
    };

    const calculateTotalAverages = () => {
        const columns = ['S&P 500', 'US Small cap', '3-month T.Bill', 'US T. Bond (10-year)', 'Baa Corporate Bond', 'Real Estate', 'Gold'];
        const averages: any = {};

        columns.forEach(col => {
            averages[col] = calculateAverage(data.map(row => row[col as keyof AnnualReturn] as string));
        });

        return averages;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    const totalAverages = calculateTotalAverages();
    const decadeAverages = calculateDecadeAverages();
    const twelveYearAverages = calculate12YearAverages();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <PageHeader title="Annual Returns by Asset Class" subtitle="Historical annual returns from 1928 to 2025" />

            {/* Total Averages */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Total Averages (All Years)</h2>
                <div className="overflow-x-auto rounded-2xl border-2 border-border">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">S&P 500</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">US Small Cap</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">3-Month T.Bill</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">US T. Bond (10-year)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Baa Corporate Bond</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Real Estate</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Gold</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card">
                            <tr>
                                <td className="px-4 py-3 font-medium">{totalAverages['S&P 500']}</td>
                                <td className="px-4 py-3 font-medium">{totalAverages['US Small cap']}</td>
                                <td className="px-4 py-3 font-medium">{totalAverages['3-month T.Bill']}</td>
                                <td className="px-4 py-3 font-medium">{totalAverages['US T. Bond (10-year)']}</td>
                                <td className="px-4 py-3 font-medium">{totalAverages['Baa Corporate Bond']}</td>
                                <td className="px-4 py-3 font-medium">{totalAverages['Real Estate']}</td>
                                <td className="px-4 py-3 font-medium">{totalAverages['Gold']}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Decade Averages */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Averages by Decade</h2>
                <div className="overflow-x-auto rounded-2xl border-2 border-border">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Decade</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">S&P 500</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">US Small Cap</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">3-Month T.Bill</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">US T. Bond (10-year)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Baa Corporate Bond</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Real Estate</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Gold</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card">
                            {decadeAverages.map((decade: any, index) => (
                                <tr key={index} className="border-t border-border">
                                    <td className="px-4 py-3 font-semibold">{decade.decade}</td>
                                    <td className="px-4 py-3">{decade['S&P 500']}</td>
                                    <td className="px-4 py-3">{decade['US Small cap']}</td>
                                    <td className="px-4 py-3">{decade['3-month T.Bill']}</td>
                                    <td className="px-4 py-3">{decade['US T. Bond (10-year)']}</td>
                                    <td className="px-4 py-3">{decade['Baa Corporate Bond']}</td>
                                    <td className="px-4 py-3">{decade['Real Estate']}</td>
                                    <td className="px-4 py-3">{decade['Gold']}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 12-Year Period Averages */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Averages by 12-Year Period</h2>
                <div className="overflow-x-auto rounded-2xl border-2 border-border">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Period</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">S&P 500</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">US Small Cap</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">3-Month T.Bill</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">US T. Bond (10-year)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Baa Corporate Bond</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Real Estate</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Gold</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card">
                            {twelveYearAverages.map((period: any, index) => (
                                <tr key={index} className="border-t border-border">
                                    <td className="px-4 py-3 font-semibold">{period.period}</td>
                                    <td className="px-4 py-3">{period['S&P 500']}</td>
                                    <td className="px-4 py-3">{period['US Small cap']}</td>
                                    <td className="px-4 py-3">{period['3-month T.Bill']}</td>
                                    <td className="px-4 py-3">{period['US T. Bond (10-year)']}</td>
                                    <td className="px-4 py-3">{period['Baa Corporate Bond']}</td>
                                    <td className="px-4 py-3">{period['Real Estate']}</td>
                                    <td className="px-4 py-3">{period['Gold']}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Annual Returns Table */}
            <div>
                {/* Filters */}
                <div className="mb-6 p-6 rounded-2xl border-2 border-border bg-card">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Filter Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as FilterType)}
                                className="w-full px-4 py-2 rounded-lg bg-background border-2 border-border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            >
                                <option value="all">All Years</option>
                                <option value="decade">By Decade</option>
                                <option value="12-year">By 12-Year Period</option>
                            </select>
                        </div>

                        {filterType === 'decade' && (
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Select Decade</label>
                                <select
                                    value={selectedDecade}
                                    onChange={(e) => setSelectedDecade(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg bg-background border-2 border-border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                >
                                    {getDecades().map(decade => (
                                        <option key={decade} value={decade}>
                                            {decade}s ({decade}-{decade + 9})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {filterType === '12-year' && (
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Select 12-Year Period</label>
                                <select
                                    value={selected12YearPeriod}
                                    onChange={(e) => setSelected12YearPeriod(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg bg-background border-2 border-border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                >
                                    {get12YearPeriods().map(period => (
                                        <option key={period} value={period}>
                                            {period}-{period + 11}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">
                    Annual Returns
                    {filterType === 'decade' && ` - ${selectedDecade}s`}
                    {filterType === '12-year' && ` - ${selected12YearPeriod}-${selected12YearPeriod + 11}`}
                </h2>
                <div className="overflow-x-auto rounded-2xl border-2 border-border">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold sticky left-0 bg-muted z-10">Year</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">S&P 500</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">US Small Cap</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">3-Month T.Bill</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">US T. Bond (10-year)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Baa Corporate Bond</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Real Estate</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Gold</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card">
                            {filteredData.map((row, index) => (
                                <tr key={index} className="border-t border-border hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-semibold sticky left-0 bg-card z-10">{row.Year}</td>
                                    <td className="px-4 py-3">{row['S&P 500']}</td>
                                    <td className="px-4 py-3">{row['US Small cap']}</td>
                                    <td className="px-4 py-3">{row['3-month T.Bill']}</td>
                                    <td className="px-4 py-3">{row['US T. Bond (10-year)']}</td>
                                    <td className="px-4 py-3">{row['Baa Corporate Bond']}</td>
                                    <td className="px-4 py-3">{row['Real Estate']}</td>
                                    <td className="px-4 py-3">{row.Gold}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
