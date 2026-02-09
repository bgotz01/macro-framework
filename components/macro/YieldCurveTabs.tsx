// components/macro/YieldCurveTabs.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type CurveMode = 'normal' | 'inverted';

export default function YieldCurveTabs() {
    const [mode, setMode] = useState<CurveMode>('inverted');

    const curve = useMemo(() => {
        if (mode === 'normal') {
            return {
                title: 'Normal Yield Curve',
                subtitle: 'Long-term yields > short-term yields',
                badge: 'Normal',
                badgeVariant: 'secondary' as const,
                interpretation: 'Term premium exists. Credit incentives are intact.',
                // Upward to the right (lower y = higher yield)
                path: 'M10,90 C50,75 95,60 170,45 C230,30 290,25 350,20',
                leftDotY: 90,
                rightDotY: 20,
                leftLabel: 'Short-term',
                rightLabel: 'Long-term',
                bottomLeft: 'Lower yield',
                bottomRight: 'Higher yield',
            };
        }

        return {
            title: 'Inverted Yield Curve',
            subtitle: 'Short-term yields > long-term yields',
            badge: 'Inverted',
            badgeVariant: 'destructive' as const,
            interpretation: 'Tight policy + slowdown risk. Credit incentives weaken.',
            // Downward to the right
            path: 'M10,20 C55,30 95,45 160,60 C230,75 290,82 350,90',
            leftDotY: 20,
            rightDotY: 90,
            leftLabel: 'Short-term',
            rightLabel: 'Long-term',
            bottomLeft: 'Higher yield',
            bottomRight: 'Lower yield',
        };
    }, [mode]);

    return (
        <div className="w-full max-w-3xl">
            <Tabs value={mode} onValueChange={(v) => setMode(v as CurveMode)} className="w-full">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="rounded-full">
                                Yield Curve
                            </Badge>
                            <Badge variant="secondary" className="rounded-full">
                                Visual
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Toggle to compare <span className="font-medium text-foreground">Normal</span> vs{' '}
                            <span className="font-medium text-foreground">Inverted</span>
                        </div>
                    </div>

                    <TabsList className="grid w-full grid-cols-2 sm:w-[320px]">
                        <TabsTrigger value="normal">Normal</TabsTrigger>
                        <TabsTrigger value="inverted">Inverted</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value={mode} className="mt-4">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-base sm:text-lg">{curve.title}</CardTitle>
                                    <CardDescription className="text-sm">{curve.subtitle}</CardDescription>
                                </div>
                                <Badge variant={curve.badgeVariant} className="rounded-full">
                                    {curve.badge}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="rounded-2xl border bg-background p-4">
                                {/* Top labels */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{curve.leftLabel}</span>
                                    <span>{curve.rightLabel}</span>
                                </div>

                                {/* SVG curve */}
                                <div className="mt-2">
                                    <svg viewBox="0 0 360 120" className="w-full h-[120px]">
                                        {/* axes */}
                                        <line x1="10" y1="105" x2="350" y2="105" stroke="currentColor" opacity="0.15" />
                                        <line x1="10" y1="15" x2="10" y2="105" stroke="currentColor" opacity="0.15" />

                                        {/* y-axis label */}
                                        <text x="2" y="12" fontSize="10" fill="currentColor" opacity="0.55">
                                            Yield
                                        </text>

                                        {/* curve */}
                                        <path
                                            d={curve.path}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            opacity="0.9"
                                            strokeLinecap="round"
                                        />

                                        {/* endpoint dots */}
                                        <circle cx="10" cy={curve.leftDotY} r="4" fill="currentColor" opacity="0.9" />
                                        <circle cx="350" cy={curve.rightDotY} r="4" fill="currentColor" opacity="0.9" />
                                    </svg>
                                </div>

                                {/* Bottom labels */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{curve.bottomLeft}</span>
                                    <span>{curve.bottomRight}</span>
                                </div>
                            </div>

                            <div className="rounded-2xl border p-4">
                                <div className="text-xs text-muted-foreground">Interpretation</div>
                                <div className="mt-1 text-sm font-medium">{curve.interpretation}</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
