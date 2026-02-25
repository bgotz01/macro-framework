'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const wealthData = [
    { name: 'Silent Generation (up to 1946)', value: 20.0, percentage: 12.3 },
    { name: 'Baby Boomers (1946-1964)', value: 83.3, percentage: 51.0 },
    { name: 'Gen X (1965-1980)', value: 42.6, percentage: 26.1 },
    { name: 'Millennials & Gen Z (1981+)', value: 17.1, percentage: 10.5 },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

const formatCurrency = (value: number) => `$${value.toFixed(1)}T`;

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-card border border-border rounded-lg shadow-lg p-4">
                <p className="font-semibold text-foreground mb-2">{data.name.split(' (')[0]}</p>
                <p className="text-sm text-muted-foreground mb-1">{data.name.match(/\(([^)]+)\)/)?.[1]}</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(data.value)}</p>
                <p className="text-sm text-muted-foreground mt-1">{data.percentage.toFixed(1)}% of total</p>
            </div>
        );
    }
    return null;
};

export default function WealthDistributionPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">America's Wealth Distribution</h1>
                <p className="text-muted-foreground">
                    Generational wealth breakdown as of 2025
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Wealth by Generation (2025)</CardTitle>
                    <CardDescription>
                        Total household wealth: $163.1 trillion
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={wealthData.map((item, index) => ({
                                        ...item,
                                        fill: COLORS[index % COLORS.length]
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry: any) => `${entry.percentage.toFixed(1)}%`}
                                    outerRadius={150}
                                    dataKey="value"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => {
                                        const gen = wealthData.find(d => d.name === value);
                                        if (gen?.name.includes('Baby Boomers')) {
                                            return `${value.split(' (')[0]}: ${formatCurrency(gen.value)}`;
                                        }
                                        return value.split(' (')[0];
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Generational Breakdown</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {wealthData.map((gen, index) => (
                        <Card key={gen.name}>
                            <CardHeader className="pb-3 text-center">
                                <CardTitle className="text-lg font-bold" style={{ color: COLORS[index] }}>
                                    {gen.name.split(' (')[0]}
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    {gen.name.match(/\(([^)]+)\)/)?.[1]}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-3xl font-bold">{formatCurrency(gen.value)}</div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {gen.percentage.toFixed(1)}% of total wealth
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
