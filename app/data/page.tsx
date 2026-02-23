import Link from 'next/link';

export default function DataPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Markets • Historical Data
                </div>
                <h1 className="page-title text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Market Data & Analysis
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Explore historical market data, key metrics, and performance analysis across asset classes
                </p>
            </div>

            {/* Data Sections */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Highlights Card */}
                <Link
                    href="/data/highlights"
                    className="group p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <svg
                                className="h-6 w-6 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                            </svg>
                        </div>
                        <svg
                            className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
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
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        Market Highlights
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Key charts and insights on market concentration, cycles, and trends. View S&P 500 top 10 concentration and other critical market metrics.
                    </p>
                </Link>

                {/* Annual Returns Card */}
                <Link
                    href="/data/annual-returns"
                    className="group p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <svg
                                className="h-6 w-6 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <svg
                            className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
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
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        Annual Returns
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Historical annual returns across major asset classes from 1928 to 2025. Filter by decade or 12-year periods with comprehensive averages.
                    </p>
                </Link>

                {/* S&P 500 Card */}
                <Link
                    href="/data/sp500"
                    className="group p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <svg
                                className="h-6 w-6 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        <svg
                            className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
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
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        S&P 500
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        S&P 500 constituent tracking, historical changes, and analytics. Explore index composition and member company data over time.
                    </p>
                </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-12 p-6 rounded-2xl border border-border/50 bg-card/50">
                <h3 className="text-lg font-semibold mb-3">About This Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                    This section provides access to curated historical market data and analysis tools. The data spans multiple decades and covers various asset classes including equities, bonds, real estate, and commodities. Use these tools to understand long-term market trends, compare asset class performance, and identify cyclical patterns.
                </p>
            </div>
        </div>
    );
}
