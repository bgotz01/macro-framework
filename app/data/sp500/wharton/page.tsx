'use client';

import { useState, useEffect } from 'react';

interface Constituent {
    permno: string;
    ticker: string;
    company: string;
}

export default function SP500WhartonPage() {
    const [selectedDate, setSelectedDate] = useState('2021-12-31');
    const [constituents, setConstituents] = useState<Constituent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate year-end dates from 2000 to 2022
    const yearEndDates = [];
    for (let year = 2022; year >= 2000; year--) {
        yearEndDates.push(`${year}-12-31`);
    }

    useEffect(() => {
        fetchConstituents();
    }, [selectedDate]);

    const fetchConstituents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/sp500/wharton?date=${selectedDate}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setConstituents(data.constituents || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        S&P 500 Historical Constituents (Wharton Data - Test)
                    </h1>
                    <p className="text-gray-600">
                        View S&P 500 constituents at different points in time using Wharton PERMNO data
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <label htmlFor="date-select" className="text-sm font-medium text-gray-700">
                            Select Date:
                        </label>
                        <select
                            id="date-select"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {yearEndDates.map((date) => (
                                <option key={date} value={date}>
                                    {new Date(date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-4 text-gray-600">Loading constituents...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {constituents.length} Companies as of {new Date(selectedDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Tracked by PERMNO (permanent company identifier)
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            PERMNO
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ticker
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {constituents.map((constituent) => (
                                        <tr key={constituent.permno} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {constituent.permno}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {constituent.ticker || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {constituent.company || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
