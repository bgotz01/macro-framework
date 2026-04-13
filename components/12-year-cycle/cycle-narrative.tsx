'use client';

import { getCycleNarrativeByYear } from '@/lib/cycle-narratives';

interface CycleNarrativeProps {
    year: number;
}

const BORDER_COLORS: Record<number, string> = {
    1948: 'border-slate-500',
    1960: 'border-amber-500',
    1972: 'border-blue-500',
    1984: 'border-purple-500',
    1996: 'border-green-500',
    2008: 'border-red-500',
    2020: 'border-orange-500',
};

const THEME_COLORS: Record<number, string> = {
    1948: 'text-slate-600 dark:text-slate-400',
    1960: 'text-amber-600 dark:text-amber-400',
    1972: 'text-blue-600 dark:text-blue-400',
    1984: 'text-purple-600 dark:text-purple-400',
    1996: 'text-green-600 dark:text-green-400',
    2008: 'text-red-600 dark:text-red-400',
    2020: 'text-orange-600 dark:text-orange-400',
};

export default function CycleNarrative({ year }: CycleNarrativeProps) {
    const narrative = getCycleNarrativeByYear(year);

    if (!narrative) {
        return null;
    }

    const borderColor = BORDER_COLORS[year] || 'border-border';
    const themeColor = THEME_COLORS[year] || 'text-muted-foreground';

    return (
        <div className={`border-l-4 ${borderColor} pl-6 py-2`}>
            <h2 className="text-2xl font-bold mb-2">{year} — {narrative.title}</h2>
            <p className={`text-lg font-semibold mb-4 ${themeColor}`}>Theme: {narrative.theme}</p>

            {narrative.previousCycle && (
                <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Previous cycle:</span> {narrative.previousCycle}
                    </p>
                </div>
            )}

            {narrative.sections.map((section, idx) => (
                <div key={idx} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        {section.items.map((item, itemIdx) => (
                            <li key={itemIdx}>{item}</li>
                        ))}
                    </ul>
                </div>
            ))}

            <div className="bg-muted/50 p-4 rounded">
                <p className="font-semibold">Why it matters</p>
                {narrative.whyItMatters.map((matter, idx) => (
                    <p key={idx} className="italic">{matter}</p>
                ))}
            </div>
        </div>
    );
}
