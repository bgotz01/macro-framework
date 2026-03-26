'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';

const data = [
    { year: 1960, tons: 17800 },
    { year: 1961, tons: 17300 },
    { year: 1962, tons: 16800 },
    { year: 1963, tons: 15800 },
    { year: 1964, tons: 15200 },
    { year: 1965, tons: 14200 },
    { year: 1966, tons: 13200 },
    { year: 1967, tons: 12000 },
    { year: 1968, tons: 10400 },
    { year: 1969, tons: 9700 },
    { year: 1970, tons: 9000 },
    { year: 1971, tons: 8100 },
];

export default function GoldDrainChart() {
    return (
        <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold mb-1">U.S. Gold Reserves Decline</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Metric tons held by the U.S. Treasury, 1960–1971
            </p>
            <ResponsiveContainer width="100%" height={360}>
                <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        domain={[0, 20000]}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                                <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', padding: '8px 12px' }}>
                                    <div style={{ fontWeight: 600 }}>{d.year}</div>
                                    <div>{d.tons.toLocaleString()} tons</div>
                                </div>
                            );
                        }}
                    />
                    <ReferenceLine
                        y={8133}
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="4 4"
                        label={{ value: 'Current (8,133t)', position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Bar
                        dataKey="tons"
                        radius={[4, 4, 0, 0]}
                        fill="#eab308"
                        fillOpacity={0.85}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
