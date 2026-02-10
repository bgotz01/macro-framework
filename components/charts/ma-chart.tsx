'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MAChartProps {
    title: string;
    data: Array<{
        date: string;
        value: number | null;
        ma12: number | null;
    }>;
    valueName: string;
}

export default function MAChart({ title, data, valueName }: MAChartProps) {
    return (
        <div className="mb-12 p-6 rounded-xl border border-border bg-card">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        interval={Math.floor(data.length / 10)}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        name={valueName}
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="ma12"
                        stroke="#a855f7"
                        name="MA 12mo"
                        dot={false}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
