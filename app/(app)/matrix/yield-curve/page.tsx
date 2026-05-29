'use client';

import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Landmark, Building2, AlertTriangle, BarChart3, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type CurveMode = 'normal' | 'inverted';

export default function YieldCurveMatrixPage() {
    const [mode, setMode] = useState<CurveMode>('inverted');

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Yield Curve Regime Matrix</h1>
                <p className="text-muted-foreground">
                    Understanding the impact of yield curve shape on economic conditions
                </p>
            </div>



            <div className="max-w-5xl">
                <Tabs value={mode} onValueChange={(v) => setMode(v as CurveMode)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="normal">Normal Curve</TabsTrigger>
                        <TabsTrigger value="inverted">Inverted Curve</TabsTrigger>
                    </TabsList>

                    <TabsContent value="inverted" className="mt-6 space-y-6">
                        <Card className="bg-muted/50">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold">Yield Curve Inversion</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Growth ↓ • Credit ↓ • CAPEX ↓ • Recession Risk ↑ • Bonds ↑ • Cyclicals ↓
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingDown className="h-5 w-5" />
                                            Growth Expectations — <span className="text-red-600 dark:text-red-500">LOWER</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Markets are pricing slower growth ahead.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="destructive">Inverted</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium mb-2">Bond investors expect:</p>
                                    <ul className="space-y-2 text-muted-foreground ml-4">
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Economic momentum is peaking</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Inflation pressures will cool</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Policy rates will be lower in the future</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="italic text-sm text-muted-foreground">
                                        Long-term confidence falls below short-term pressure.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Landmark className="h-5 w-5" />
                                            Credit & Lending — <span className="text-red-600 dark:text-red-500">LOWER</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Lending becomes unattractive for banks.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="destructive">Inverted</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="rounded-lg border p-4">
                                        <p className="font-medium mb-2">Normally:</p>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            <li>• Banks borrow short-term</li>
                                            <li>• Banks lend long-term</li>
                                        </ul>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="font-medium mb-2">With inversion:</p>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            <li>• Funding costs exceed loan returns</li>
                                            <li>• Margins compress</li>
                                            <li>• Risk isn&apos;t worth the spread</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <p className="font-medium mb-2">Result</p>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        <li>• Fewer loans issued</li>
                                        <li>• Stricter approval standards</li>
                                        <li>• Credit dries up first for marginal borrowers</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            Business Investment (CAPEX) — <span className="text-red-600 dark:text-red-500">LOWER</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Companies reduce risk before demand visibly slows.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="destructive">Inverted</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium mb-2">Typical responses:</p>
                                    <ul className="space-y-2 text-muted-foreground ml-4">
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Delay expansion plans</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Cut or postpone capital spending</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Preserve cash</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Slow hiring</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="italic text-sm text-muted-foreground">
                                        Earnings can look fine while forward investment quietly shrinks.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            Recession Risk — <span className="text-red-600 dark:text-red-500">HIGHER</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Inversion raises downturn risk, but not immediately.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="destructive">Inverted</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium mb-2">Historically:</p>
                                    <ul className="space-y-2 text-muted-foreground ml-4">
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Yield curve inversions precede recessions</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>The lag is usually 6–24 months</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                                    <p className="font-medium mb-2 text-sm">Important nuance:</p>
                                    <p className="text-sm text-muted-foreground">
                                        Recessions often begin after the curve un-inverts — once the slowdown is already baked in.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            Asset Dispersion — <span className="text-red-600 dark:text-red-500">HIGHER</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Assets stop moving together.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="destructive">Inverted</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Banks / financials</span>
                                        <span className="text-sm text-muted-foreground">→ pressured early</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Cyclicals</span>
                                        <span className="text-sm text-muted-foreground">→ weaken as growth expectations fade</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Growth stocks</span>
                                        <span className="text-sm text-muted-foreground">→ can rally on rate-cut expectations</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Real estate</span>
                                        <span className="text-sm text-muted-foreground">→ activity slows before prices adjust</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Long-duration bonds</span>
                                        <span className="text-sm text-muted-foreground">→ tend to benefit later</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="h-5 w-5" />
                                            Confidence & Risk Appetite — <span className="text-red-600 dark:text-red-500">LOWER</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Behavior changes even if headlines don&apos;t.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="destructive">Inverted</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium mb-2">Common signs:</p>
                                    <ul className="space-y-2 text-muted-foreground ml-4">
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Narratives shift from growth → resilience</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Risk-taking becomes selective</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Job data becomes the primary stress signal</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="italic text-sm text-muted-foreground">
                                        The system still works — but under tension.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="normal" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Growth Expectations — <span className="text-green-600 dark:text-green-500">STABLE</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Markets expect continued economic expansion.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">Normal</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium mb-2">Bond investors expect:</p>
                                    <ul className="space-y-2 text-muted-foreground ml-4">
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Economic momentum is sustained</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Inflation remains manageable</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Term premium compensates for duration risk</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="italic text-sm text-muted-foreground">
                                        Long-term confidence exceeds short-term pressure.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Landmark className="h-5 w-5" />
                                            Credit & Lending — <span className="text-green-600 dark:text-green-500">HEALTHY</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Banks maintain positive lending incentives.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">Normal</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium mb-2">Normal conditions:</p>
                                    <ul className="space-y-2 text-muted-foreground ml-4">
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Banks earn positive spreads on lending</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Credit flows to qualified borrowers</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Lending standards remain reasonable</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            Business Investment (CAPEX) — <span className="text-green-600 dark:text-green-500">SUPPORTED</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Companies continue expansion and investment.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">Normal</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium mb-2">Typical behavior:</p>
                                    <ul className="space-y-2 text-muted-foreground ml-4">
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Proceed with expansion plans</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Maintain capital spending</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Continue hiring</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Recession Risk — BASELINE
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Normal business cycle risk levels.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">Normal</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    A normal yield curve doesn&apos;t eliminate recession risk entirely, but it indicates that credit conditions
                                    are functioning properly and the financial system is supporting economic activity rather than constraining it.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            Asset Dispersion — <span className="text-green-600 dark:text-green-500">LOWER</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Assets tend to move more cohesively.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">Normal</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Banks / financials</span>
                                        <span className="text-sm text-muted-foreground">→ benefit from positive spreads</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Cyclicals</span>
                                        <span className="text-sm text-muted-foreground">→ supported by growth expectations</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Growth stocks</span>
                                        <span className="text-sm text-muted-foreground">→ perform based on fundamentals</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Real estate</span>
                                        <span className="text-sm text-muted-foreground">→ activity remains steady</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                                        <span className="text-sm font-medium min-w-[140px]">Long-duration bonds</span>
                                        <span className="text-sm text-muted-foreground">→ reflect term premium</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="h-5 w-5" />
                                            Confidence & Risk Appetite — <span className="text-green-600 dark:text-green-500">STABLE</span>
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            Market participants maintain constructive outlook.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">Normal</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium mb-2">Common characteristics:</p>
                                    <ul className="space-y-2 text-muted-foreground ml-4">
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Growth narratives remain dominant</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Risk-taking is broadly distributed</span>
                                        </li>
                                        <li className="flex gap-2 items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                                            <span>Multiple data points drive sentiment</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="italic text-sm text-muted-foreground">
                                        The system operates with normal friction levels.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
