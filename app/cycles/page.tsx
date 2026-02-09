import Link from 'next/link';

export default function CyclesPage() {
    const cycles = [
        {
            title: '12-Year Cycle',
            href: '/cycles/12-year',
            description: 'The Chinese zodiac cycle and its correlation with market patterns',
            color: 'blue',
        },
        {
            title: '80-Year Cycle',
            href: '/cycles/80-year',
            description: 'Long-term generational cycles and major economic shifts',
            color: 'purple',
        },
        {
            title: 'Debt Cycle',
            href: '/cycles/debt-cycle',
            description: 'Long-term debt accumulation and deleveraging patterns',
            color: 'red',
        },
        {
            title: 'Credit Cycle',
            href: '/cycles/credit-cycle',
            description: 'Expansion and contraction of credit availability',
            color: 'green',
        },
        {
            title: 'Business Cycle',
            href: '/cycles/business-cycle',
            description: 'Economic expansion, peak, contraction, and trough phases',
            color: 'orange',
        },
    ];

    const colorClasses = {
        blue: 'border-blue-500/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:shadow-blue-500/20',
        purple: 'border-purple-500/30 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:shadow-purple-500/20',
        red: 'border-red-500/30 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 hover:shadow-red-500/20',
        green: 'border-green-500/30 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 hover:shadow-green-500/20',
        orange: 'border-orange-500/30 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 hover:shadow-orange-500/20',
    };

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
                        className={`group p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${colorClasses[cycle.color as keyof typeof colorClasses]
                            }`}
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
