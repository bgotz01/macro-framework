import Link from 'next/link';

const examples = [
    {
        href: '/regime-examples/long-duration',
        regime: 'Long Duration',
        color: 'blue',
        periods: ['2023–Now', '2005–2007', '1994–2000'],
        description: 'High-growth stocks become the primary trade. Equities yield less than the risk-free rate — investors buy duration and growth over value.',
    },
    {
        href: '/regime-examples/overvaluation',
        regime: 'Overvaluation',
        color: 'yellow',
        periods: [],
        description: 'Extreme equity unattractiveness. EYP deeply negative — rotate away from equities toward bonds or gold depending on real rate direction.',
        comingSoon: true,
    },
];

const colorMap: Record<string, { badge: string; border: string; icon: string }> = {
    blue: {
        badge: 'bg-blue-500/10 text-blue-500',
        border: 'hover:border-blue-500/50',
        icon: 'text-blue-500',
    },
    yellow: {
        badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        border: 'hover:border-yellow-500/50',
        icon: 'text-yellow-500',
    },
};

export default function RegimeExamplesPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1
                    className="text-3xl font-light tracking-wider mb-2"
                    style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', letterSpacing: '0.15em' }}
                >
                    REGIME EXAMPLES
                </h1>
                <p className="text-sm font-light text-muted-foreground tracking-widest uppercase" style={{ letterSpacing: '0.2em' }}>
                    Historical periods by regime type
                </p>
                <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Each regime produces a distinct set of winning trades. These examples walk through real historical periods — what the macro setup looked like, and which stocks and assets performed.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
                {examples.map((ex) => {
                    const colors = colorMap[ex.color];
                    const card = (
                        <div
                            className={`group p-7 rounded-2xl border-2 border-border bg-card transition-all duration-200 h-full flex flex-col ${ex.comingSoon ? 'opacity-60 cursor-default' : `${colors.border} hover:shadow-lg cursor-pointer`
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                                    {ex.regime}
                                </span>
                                {!ex.comingSoon && (
                                    <svg
                                        className={`h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-all ${colors.icon}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                                {ex.comingSoon && (
                                    <span className="text-xs text-muted-foreground font-medium">Coming soon</span>
                                )}
                            </div>

                            <h2 className="text-xl font-semibold mb-2">{ex.regime}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{ex.description}</p>

                            {ex.periods.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {ex.periods.map((p) => (
                                        <span key={p} className="px-2.5 py-1 rounded-md bg-muted text-xs text-muted-foreground font-medium">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );

                    return ex.comingSoon ? (
                        <div key={ex.href}>{card}</div>
                    ) : (
                        <Link key={ex.href} href={ex.href} className="block h-full">
                            {card}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
