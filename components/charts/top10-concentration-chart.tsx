'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '../theme-provider';

const data = [
    { year: 1880, concentration: 27 },
    { year: 1890, concentration: 22 },
    { year: 1900, concentration: 28 },
    { year: 1910, concentration: 26 },
    { year: 1920, concentration: 19 },
    { year: 1930, concentration: 20 },
    { year: 1940, concentration: 28 },
    { year: 1950, concentration: 26 },
    { year: 1960, concentration: 28 },
    { year: 1970, concentration: 28 },
    { year: 1980, concentration: 22 },
    { year: 1990, concentration: 20 },
    { year: 2000, concentration: 23 },
    { year: 2010, concentration: 19 },
    { year: 2020, concentration: 29 },
    { year: 2025, concentration: 40 }
];

export function Top10ConcentrationChart() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top 10 Stocks Market Cap Concentration</CardTitle>
                <CardDescription>
                    Share of top 10 stocks of S&P 500&apos;s market cap (1880-2025)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.3} />
                        <XAxis
                            dataKey="year"
                            stroke={isDark ? '#9ca3af' : '#6b7280'}
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            stroke={isDark ? '#9ca3af' : '#6b7280'}
                            tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                            label={{
                                value: 'Concentration (%)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: isDark ? '#9ca3af' : '#6b7280' }
                            }}
                        />
                        <ReferenceLine
                            y={25}
                            stroke={isDark ? '#6b7280' : '#9ca3af'}
                            strokeDasharray="3 3"
                        />
                        <Bar
                            dataKey="concentration"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                        >
                            <LabelList
                                dataKey="concentration"
                                position="top"
                                formatter={(value: any) => `${value}%`}
                                style={{ fill: isDark ? '#f9fafb' : '#111827', fontSize: 11, fontWeight: 600 }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                        The concentration of the top 10 stocks in the S&P 500 has reached historic highs at 40% in 2025,
                        significantly above the historical average of around 25%.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
