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
        theme: 'Bretton Woods Reconstruction',
        catalyst: 'Marshall Plan era + fixed FX / dollar-gold anchor',
        capitalBehavior: 'State- and bank-directed rebuilding; capacity buildout',
        dominantAssets: 'Infrastructure, industry, housing, fixed investment',
        hiddenRisk: 'Brittle fixed-rule system; external imbalances'
    },
    {
        start: 1960,
        theme: 'Large-Cap Equity & Brand Dominance',
        catalyst: 'Postwar prosperity + consumer confidence',
        capitalBehavior: 'Buy-and-hold faith in dominant U.S. corporations',
        dominantAssets: 'Large-cap U.S. equities, global brands (Nifty Fifty)',
        hiddenRisk: 'Valuation complacency under inflation and rate shocks'
    },
    {
        start: 1972,
        theme: 'Free-Floating Fiat & Inflation Regime',
        catalyst: 'Gold depeg → floating FX; oil/commodity shocks',
        capitalBehavior: 'Inflation hedging; real-return focus; higher risk premia',
        dominantAssets: 'Commodities, energy, real assets, FX; shorter-duration assets',
        hiddenRisk: 'Wage–price spirals; policy whipsaw; volatility'
    },
    {
        start: 1984,
        theme: 'Disinflation + Financialization',
        catalyst: 'Volcker disinflation → multi-decade rate decline',
        capitalBehavior: 'Leverage and balance-sheet growth rewarded; securitization expands',
        dominantAssets: 'Bonds, real estate, credit, financial equities',
        hiddenRisk: 'Debt overhang; tail risk hidden by low vol / refinancing'
    },
    {
        start: 1996,
        theme: 'Digitization & Globalized Scale',
        catalyst: 'Commercial internet + enterprise software + global supply chains',
        capitalBehavior: 'Winner-take-most scaling; intangible investment rises',
        dominantAssets: 'Tech/software equities, platforms, long-duration growth',
        hiddenRisk: 'Concentration + valuation fragility; offshoring dependency'
    },
    {
        start: 2008,
        theme: 'Policy-Backstopped Markets (QE Era)',
        catalyst: 'GFC → QE, ZIRP/NIRP, crisis liquidity facilities',
        capitalBehavior: 'Reach for yield; buy-the-dip reflex; volatility suppressed',
        dominantAssets: 'Equities + duration (bonds) supported by policy',
        hiddenRisk: 'Moral hazard; price discovery distortion; inequality / backlash'
    },
    {
        start: 2020,
        theme: 'Fiscal-Monetary Fusion & Digital Work',
        catalyst: 'Pandemic shock → fiscal transfers + balance-sheet expansion',
        capitalBehavior: 'Flows toward digital/AI and “intangible productivity”; barbell risk',
        dominantAssets: 'Platforms, data/software, semis/AI stack; attention-based businesses',
        hiddenRisk: 'Trust/legitimacy stress; inflation resurgence risk; fragmentation'
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
                        {cycleData.map((cycle) => (
                            <tr key={cycle.start} className="hover:bg-muted/30 transition-colors">
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