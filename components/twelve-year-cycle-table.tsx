'use client';

import { Card } from '@/components/ui/card';

interface CycleData {
    start: number;
    theme: string;
    catalyst: string;
    capitalBehavior: string;
    dominantAssets: string;
    hiddenRisk: string;
}

const cycleData: CycleData[] = [
    {
        start: 1948,
        theme: 'Institutional Reconstruction',
        catalyst: 'Post-war rebuilding & Bretton Woods',
        capitalBehavior: 'Capital allocated through states & banks',
        dominantAssets: 'Infrastructure, manufacturing, housing',
        hiddenRisk: 'Rigidity, dependence on fixed rules'
    },
    {
        start: 1960,
        theme: 'Institutional Capital & Brand Permanence',
        catalyst: 'Rise of pensions, insurers, mutual funds',
        capitalBehavior: 'Buy-and-hold, concentration in "quality"',
        dominantAssets: 'Global brands, blue-chip equities (Nifty Fifty)',
        hiddenRisk: 'Valuation fragility under inflation'
    },
    {
        start: 1972,
        theme: 'Fiat Regime Price Discovery',
        catalyst: 'End of gold convertibility',
        capitalBehavior: 'Capital seeks inflation hedges',
        dominantAssets: 'Commodities, real assets, FX',
        hiddenRisk: 'Monetary instability, wage-price spirals'
    },
    {
        start: 1984,
        theme: 'Credit Expansion',
        catalyst: 'Inflation defeated, rates fall',
        capitalBehavior: 'Leverage replaces productivity',
        dominantAssets: 'Bonds, real estate, financial assets',
        hiddenRisk: 'Balance-sheet dependency'
    },
    {
        start: 1996,
        theme: 'Digital Infrastructure',
        catalyst: 'Internet + enterprise software',
        capitalBehavior: 'Scale & network effects rewarded',
        dominantAssets: 'Tech equities, software platforms',
        hiddenRisk: 'Winner-take-most concentration'
    },
    {
        start: 2008,
        theme: 'Monetary Intervention',
        catalyst: 'Financial crisis + QE',
        capitalBehavior: 'Risk suppressed by policy',
        dominantAssets: 'Equities, bonds (policy-backstopped)',
        hiddenRisk: 'Moral hazard, price distortion'
    },
    {
        start: 2020,
        theme: 'Digital Economy',
        catalyst: 'Pandemic + fiscal-monetary fusion',
        capitalBehavior: 'Capital flows to intangibles',
        dominantAssets: 'Platforms, data, code, attention',
        hiddenRisk: 'Trust erosion, social instability'
    }
];

export default function TwelveYearCycleTable() {
    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">
                                Cycle Start
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Macro Theme
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Primary Catalyst
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Capital Behavior
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Dominant Assets
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Hidden Risk
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {cycleData.map((cycle, idx) => (
                            <tr
                                key={cycle.start}
                                className="hover:bg-muted/30 transition-colors"
                            >
                                <td className="px-3 py-2 text-sm text-foreground font-semibold whitespace-nowrap">
                                    {cycle.start}
                                </td>
                                <td className="px-3 py-2 text-sm text-foreground">
                                    {cycle.theme}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {cycle.catalyst}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {cycle.capitalBehavior}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {cycle.dominantAssets}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {cycle.hiddenRisk}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
