import Link from 'next/link';

export default function CyclesPage() {
    const cycles = [

        {
            title: '80-Year Cycle',
            href: '/cycles/80-year',
            description: 'Long-term generational cycles and major economic shifts',
        },
        {
            title: 'Debt Cycle',
            href: '/cycles/debt-cycle',
            description: 'Long-term debt accumulation and deleveraging patterns',
        },
        {
            title: 'Credit Cycle',
            href: '/cycles/credit-cycle',
            description: 'Expansion and contraction of credit availability',
        },
        {
            title: 'Business Cycle',
            href: '/cycles/business-cycle',
            description: 'Economic expansion, peak, contraction, and trough phases',
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Economic Cycles
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Cycles
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Understanding the various cycles that drive markets and economic behavior
                </p>
            </div>

            {/* Cycle Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {cycles.map((cycle) => (
                    <Link
                        key={cycle.href}
                        href={cycle.href}
                        className="group p-8 rounded-2xl border-2 border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/50"
                    >
                        <h2 className="text-2xl font-bold mb-3 group-hover:translate-x-1 transition-transform duration-200">
                            {cycle.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {cycle.description}
                        </p>
                        <div className="mt-4 flex items-center text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                            <span>Explore</span>
                            <svg
                                className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
