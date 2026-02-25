'use client';

import { Card } from '@/components/ui/card';

interface TechCycleData {
    start: number;
    techTheme: string;
    systemCatalyst: string;
    operationalShift: string;
    controlSurface: string;
    hiddenRisk: string;
}

const techCycleData: TechCycleData[] = [
    {
        start: 1948,
        techTheme: 'Control Systems & Computation',
        systemCatalyst: 'Programmable computers + information theory',
        operationalShift: 'Planning, logistics, and coordination become computable',
        controlSurface: 'Rules, feedback loops, centralized calculation',
        hiddenRisk: 'Overconfidence in models, brittle control'
    },
    {
        start: 1960,
        techTheme: 'Centralized Enterprise Computing',
        systemCatalyst: 'Mainframes + standardized business software',
        operationalShift: 'Administration and record-keeping mechanized at scale',
        controlSurface: 'Institutions, bureaucratic data ownership',
        hiddenRisk: 'Inflexibility, slow adaptation'
    },
    {
        start: 1972,
        techTheme: 'Computer Systems & Early Networking',
        systemCatalyst: 'Microprocessors + portable software + local networks',
        operationalShift: 'Computers become modular, network-capable systems',
        controlSurface: 'System architecture and protocols',
        hiddenRisk: 'Complexity without visibility'
    },
    {
        start: 1984,
        techTheme: 'User Interfaces & Financial Software',
        systemCatalyst: 'PCs, GUIs, spreadsheets, networking standards',
        operationalShift: 'Computation becomes usable by non-experts',
        controlSurface: 'Software abstractions and models',
        hiddenRisk: 'Leverage disguised as usability'
    },
    {
        start: 1996,
        techTheme: 'Internet Scale & Platform Software',
        systemCatalyst: 'Web protocols + enterprise software + search',
        operationalShift: 'Distribution and coordination scale globally',
        controlSurface: 'Platforms and network effects',
        hiddenRisk: 'Winner-take-most concentration'
    },
    {
        start: 2008,
        techTheme: 'Mobile, Cloud & Parallel Rails',
        systemCatalyst: 'Smartphones + cloud infrastructure + crypto',
        operationalShift: 'Always-on computing and software-mediated life',
        controlSurface: 'App ecosystems and centralized infrastructure',
        hiddenRisk: 'Dependence on opaque intermediaries'
    },
    {
        start: 2020,
        techTheme: 'Algorithms & LLMs',
        systemCatalyst: 'Model-driven ranking + generative language models',
        operationalShift: 'Production, attention, and labor become algorithmically mediated',
        controlSurface: 'Models deciding distribution and execution',
        hiddenRisk: 'Loss of human agency and interpretability'
    }
];

export default function TwelveYearTechCycleTable() {
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
                                Tech Theme
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                System Catalyst
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Operational Shift
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Control Surface
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                Hidden Risk
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {techCycleData.map((cycle) => (
                            <tr
                                key={cycle.start}
                                className="hover:bg-muted/30 transition-colors"
                            >
                                <td className="px-3 py-2 text-sm text-foreground font-semibold whitespace-nowrap">
                                    {cycle.start}
                                </td>
                                <td className="px-3 py-2 text-sm text-foreground">
                                    {cycle.techTheme}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {cycle.systemCatalyst}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {cycle.operationalShift}
                                </td>
                                <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {cycle.controlSurface}
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