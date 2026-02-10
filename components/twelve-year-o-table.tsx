'use client';

import { Card } from '@/components/ui/card';

interface CycleOData {
    start: number;
    theme: string;
    o1Signal: string;
    o2Swing: string;
    o3Story: string;
}

const cycleOData: CycleOData[] = [
    {
        start: 1948,
        theme: 'Institutional Reconstruction',
        o1Signal: 'Rebuild legitimacy and prevent collapse through rules, fixed FX, and coordination',
        o2Swing: 'Fragmentation → Coordination',
        o3Story: 'Global monetary architecture anchored to one reserve currency and multilateral institutions'
    },
    {
        start: 1960,
        theme: 'Institutional Capital & Brand Permanence',
        o1Signal: 'Long-duration capital seeks stable, scalable equity franchises',
        o2Swing: 'State-led rebuilding → Institutional ownership',
        o3Story: '"One-decision stocks" and brand equity as durable, concentrated moats'
    },
    {
        start: 1972,
        theme: 'Fiat Regime Price Discovery',
        o1Signal: 'Anchor removed; inflation and FX volatility force repricing of money',
        o2Swing: 'Stability premium → Repricing premium',
        o3Story: 'Floating currencies and broad inflation in developed peacetime economies'
    },
    {
        start: 1984,
        theme: 'Credit Expansion',
        o1Signal: 'Disinflation restores credibility; debt becomes a usable growth lever',
        o2Swing: 'Inflation scarcity → Capital abundance',
        o3Story: 'Secular rate decline enabling leverage-driven expansion'
    },
    {
        start: 1996,
        theme: 'Digital Infrastructure',
        o1Signal: 'Coordination and productivity unlocked through software and networks',
        o2Swing: 'Balance-sheet growth → Scale economics',
        o3Story: 'Internet-driven network effects and winner-take-most markets'
    },
    {
        start: 2008,
        theme: 'Monetary Intervention Era',
        o1Signal: 'Markets cannot clear without collapse; policy becomes the stabilizer',
        o2Swing: 'Price discovery → Managed stability',
        o3Story: 'Central-bank balance sheets as primary shock absorbers; opt-out monetary systems'
    },
    {
        start: 2020,
        theme: 'Digital Economy',
        o1Signal: 'Economic continuity maintained through digitization and policy fusion',
        o2Swing: 'Market stabilization → Life stabilization',
        o3Story: 'Society-scale digitalization of work, money, and governance'
    }
];

export default function TwelveYearOTable() {
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
                                O1 Obvious (signal)
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                O2 Opposites (swing)
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                O3 Outlier (story)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {cycleOData.map((cycle) => (
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
                                    {cycle.o1Signal}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {cycle.o2Swing}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {cycle.o3Story}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
