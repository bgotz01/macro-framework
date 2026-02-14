'use client';

import { get12YearCyclePresidents, PresidentialTerm } from '@/data/us-presidents';

interface PresidentialTermsProps {
    cycleStartYear: number;
}

function getPartyColor(party: string): string {
    switch (party) {
        case 'Republican':
            return 'border-red-500 dark:border-red-400';
        case 'Democratic':
            return 'border-blue-500 dark:border-blue-400';
        default:
            return 'border-gray-300 dark:border-gray-700';
    }
}

function getPartyTextColor(party: string): string {
    switch (party) {
        case 'Republican':
            return 'text-red-600 dark:text-red-400';
        case 'Democratic':
            return 'text-blue-600 dark:text-blue-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
}

function PresidentCard({ term }: { term: PresidentialTerm }) {
    const borderColor = getPartyColor(term.party);
    const textColor = getPartyTextColor(term.party);

    return (
        <div className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 ${borderColor} bg-card text-center transition-all hover:shadow-md`}>
            <h4 className={`font-semibold text-sm ${textColor}`}>{term.president}</h4>
            <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground">
                    {term.startYear}–{term.endYear}
                </span>
                {term.termNumber && (
                    <span className="text-xs text-muted-foreground/75">
                        Term {term.termNumber}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function PresidentialTerms({ cycleStartYear }: PresidentialTermsProps) {
    const presidents = get12YearCyclePresidents(cycleStartYear);

    if (presidents.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="flex items-start gap-6">
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-xl">
                        🏛️
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Presidential Terms</h3>
                        <p className="text-sm text-muted-foreground">
                            {cycleStartYear}–{cycleStartYear + 12}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 flex-1">
                    {presidents.map((term, idx) => (
                        <PresidentCard key={`${term.president}-${term.startYear}-${idx}`} term={term} />
                    ))}
                </div>
            </div>
        </div>
    );
}
