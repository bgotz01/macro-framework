import Link from 'next/link';
import PageHeader from '@/components/page-header';
import { stockdata } from '@/lib/stockdata';

async function getStockStats() {
    const [symbolCount, latestDate] = await Promise.all([
        stockdata.$queryRaw<[{ count: bigint }]>`SELECT COUNT(DISTINCT symbol) as count FROM historical_prices`,
        stockdata.$queryRaw<[{ max: Date }]>`SELECT MAX(date) as max FROM historical_prices`,
    ]);

    return {
        symbols: Number(symbolCount[0]?.count ?? 0),
        lastUpdated: latestDate[0]?.max?.toISOString().split('T')[0] ?? 'N/A',
    };
}

export default async function StocksPage() {
    const stats = await getStockStats();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <PageHeader
                title="Stocks"
                subtitle={`Stock data covering ${stats.symbols.toLocaleString()} symbols · Last updated ${stats.lastUpdated}`}
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Historical Prices */}
                <Link
                    href="/stocks/prices"
                    className="group p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <svg className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        Historical Prices
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Daily OHLCV price data for individual stocks. Search by symbol, view charts, and analyze price history.
                    </p>
                </Link>

                {/* Financials */}
                <Link
                    href="/stocks/financials"
                    className="group p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <svg className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        Financials
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Quarterly earnings, revenue, margins, and growth metrics. Income statements and balance sheet data.
                    </p>
                </Link>

                {/* Screener / Snapshots */}
                <Link
                    href="/stocks/screener"
                    className="group p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </div>
                        <svg className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        Screener
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Filter and rank stocks by market cap, sector, price performance, and fundamental metrics.
                    </p>
                </Link>
            </div>

            {/* Database Info */}
            <div className="mt-12 p-6 rounded-2xl border border-border/50 bg-card/50">
                <h3 className="text-lg font-semibold mb-3">Data Source</h3>
                <p className="text-muted-foreground leading-relaxed">
                    This section reads from the <code className="text-sm bg-muted px-1.5 py-0.5 rounded">stockdata</code> database,
                    separate from the macro-framework data. It includes historical prices, quarterly financials,
                    stock profiles, ETF data, and market breadth indicators.
                </p>
            </div>
        </div>
    );
}
