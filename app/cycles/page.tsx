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
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">CYCLES</h1>
                <p className="page-subtitle">
                    Economic cycles that drive markets
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
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
