'use client';

import { useEffect, useState } from 'react';

interface LatestDataPoint {
    country: string;
    bankRate: { value: number | null; date: string | null };
    threeMonth: { value: number | null; date: string | null };
    tenYear: { value: number | null; date: string | null };
    cpi: { value: number | null; date: string | null };
}

const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'JP', name: 'Japan' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
];

export default function LatestData() {
    const [selectedCountry, setSelectedCountry] = useState('US');
    const [data, setData] = useState<LatestDataPoint | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLatestData() {
            setLoading(true);
            try {
                const countryData = await fetchCountryData(selectedCountry);
                setData(countryData);
            } catch (error) {
                console.error('Error fetching latest data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLatestData();
    }, [selectedCountry]);

    async function fetchCountryData(country: string): Promise<LatestDataPoint> {
        // Fetch the latest values for each indicator
        const [bankRate, threeMonth, tenYear, cpi] = await Promise.all([
            fetchLatestValue('economic', `${country}/FEDFUNDS`),
            fetchLatestValue('bonds', `${country}/IRX`),
            fetchLatestValue('bonds', `${country}/TNX`),
            fetchLatestValue('economic', 'CPI')
        ]);

        return {
            country,
            bankRate,
            threeMonth,
            tenYear,
            cpi
        };
    }

    async function fetchLatestValue(assetClass: string, seriesName: string): Promise<{ value: number | null; date: string | null }> {
        try {
            const response = await fetch(`/api/data/${assetClass}?series=${seriesName}`);
            if (!response.ok) return { value: null, date: null };

            const result = await response.json();
            if (result.data && result.data.length > 0) {
                // Get the last data point
                const latest = result.data[result.data.length - 1];
                const columns = Object.keys(latest).filter(k => k !== 'date');
                const value = columns.length > 0 ? latest[columns[0]] : null;

                return {
                    value,
                    date: latest.date
                };
            }
            return { value: null, date: null };
        } catch (error) {
            console.error(`Error fetching ${assetClass}/${seriesName}:`, error);
            return { value: null, date: null };
        }
    }

    if (loading) {
        return (
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-48 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-20 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    // Get the most recent date from all the data points
    const latestDate = [
        data.bankRate.date,
        data.threeMonth.date,
        data.tenYear.date,
        data.cpi.date
    ].filter(d => d !== null).sort().reverse()[0];

    return (
        <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-card-foreground">Latest Economic Data</h2>
                </div>

                {/* Country Dropdown */}
                <div className="relative">
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="appearance-none bg-muted/50 border border-border/30 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-card-foreground hover:bg-muted/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        {COUNTRIES.map((country) => (
                            <option key={country.code} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="border border-border/30 rounded-2xl p-6 bg-muted/30">
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">
                    {COUNTRIES.find(c => c.code === selectedCountry)?.name}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-card border border-border/20">
                        <div className="text-sm text-muted-foreground mb-1">Bank Rate</div>
                        <div className="text-2xl font-bold text-primary">
                            {data.bankRate.value !== null ? `${data.bankRate.value.toFixed(2)}%` : 'N/A'}
                        </div>
                        {data.bankRate.date && (
                            <div className="text-xs text-muted-foreground mt-1">
                                {new Date(data.bankRate.date).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    <div className="text-center p-4 rounded-xl bg-card border border-border/20">
                        <div className="text-sm text-muted-foreground mb-1">3-Month Yield</div>
                        <div className="text-2xl font-bold text-primary">
                            {data.threeMonth.value !== null ? `${data.threeMonth.value.toFixed(2)}%` : 'N/A'}
                        </div>
                        {data.threeMonth.date && (
                            <div className="text-xs text-muted-foreground mt-1">
                                {new Date(data.threeMonth.date).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    <div className="text-center p-4 rounded-xl bg-card border border-border/20">
                        <div className="text-sm text-muted-foreground mb-1">10-Year Yield</div>
                        <div className="text-2xl font-bold text-primary">
                            {data.tenYear.value !== null ? `${data.tenYear.value.toFixed(2)}%` : 'N/A'}
                        </div>
                        {data.tenYear.date && (
                            <div className="text-xs text-muted-foreground mt-1">
                                {new Date(data.tenYear.date).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    <div className="text-center p-4 rounded-xl bg-card border border-border/20">
                        <div className="text-sm text-muted-foreground mb-1">CPI</div>
                        <div className="text-2xl font-bold text-primary">
                            {data.cpi.value !== null ? `${data.cpi.value.toFixed(1)}%` : 'N/A'}
                        </div>
                        {data.cpi.date && (
                            <div className="text-xs text-muted-foreground mt-1">
                                {new Date(data.cpi.date).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>

                {latestDate && (
                    <div className="mt-4 text-xs text-muted-foreground text-right">
                        Most recent data: {new Date(latestDate).toLocaleDateString()}
                    </div>
                )}
            </div>
        </div>
    );
}
