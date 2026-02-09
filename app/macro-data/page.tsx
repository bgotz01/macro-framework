import MacroDashboard from '../../components/macro-dashboard';
import LatestData from '../../components/latest-data';

export default function MacroDataPage() {
    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Global Economic Data
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Power Data
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Comprehensive economic data from major global economies, providing insights into market trends and economic cycles.
                </p>
            </div>

            {/* Latest Data Component */}
            <LatestData />



            <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Countries Section */}
                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <div className="flex items-center mb-6">
                        <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mr-4">
                            <div className="w-6 h-6 border-2 border-primary-foreground rounded-full opacity-80"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-card-foreground">Countries</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'United States', desc: 'Fed policy, employment, inflation data', href: '/macro-data/us' },
                            { name: 'Japan', desc: 'BOJ policy, demographics, trade data', href: '/macro-data/japan' },
                            { name: 'United Kingdom', desc: 'BOE policy, Brexit impact, financial services', href: '/macro-data/uk' },
                            { name: 'Canada', desc: 'BOC policy, commodities, housing market', href: '/macro-data/canada' }
                        ].map((country) => (
                            <a
                                key={country.href}
                                href={country.href}
                                className="block p-4 rounded-2xl hover:bg-muted/80 transition-all duration-200 group border border-transparent hover:border-border/50"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                            {country.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{country.desc}</div>
                                    </div>
                                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Asset Classes Section */}
                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <div className="flex items-center mb-6">
                        <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mr-4">
                            <div className="w-6 h-6 border-2 border-accent-foreground rounded opacity-80"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-card-foreground">Asset Classes</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Bond Yields', desc: 'Government bond yields across maturities', href: '/macro-data/bond-yields' },
                            { name: 'Foreign Exchange', desc: 'Major currency pairs and cross rates', href: '/macro-data/fx' },
                            { name: 'Equity Indexes', desc: 'Major stock market indices and sectors', href: '/macro-data/equity-indexes' }
                        ].map((asset) => (
                            <a
                                key={asset.href}
                                href={asset.href}
                                className="block p-4 rounded-2xl hover:bg-muted/80 transition-all duration-200 group border border-transparent hover:border-border/50"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-3 h-3 rounded-full bg-accent/60"></div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-card-foreground group-hover:text-accent transition-colors">
                                            {asset.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{asset.desc}</div>
                                    </div>
                                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Key Indicators Dashboard */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <div className="flex items-center mb-8">
                    <div className="h-12 w-12 rounded-xl gradient-secondary flex items-center justify-center mr-4">
                        <div className="w-6 h-6 border-2 border-secondary-foreground rounded-sm opacity-80"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-card-foreground">Key Economic Indicators</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { value: '2.5%', label: 'US 10Y Yield', change: '+0.1%', positive: true },
                        { value: '1.05', label: 'EUR/USD', change: '-0.02', positive: false },
                        { value: '4,800', label: 'S&P 500', change: '+1.2%', positive: true }
                    ].map((indicator, index) => (
                        <div key={index} className="text-center p-6 rounded-2xl bg-muted/50 border border-border/30 hover:shadow-md transition-all duration-200">
                            <div className="text-3xl font-bold text-primary mb-2">{indicator.value}</div>
                            <div className="text-sm text-muted-foreground mb-2">{indicator.label}</div>
                            <div className={`text-xs font-medium ${indicator.positive ? 'text-green-600' : 'text-red-600'}`}>
                                {indicator.change}
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground mt-6 text-center">
                    * Sample data for demonstration purposes. Real-time data integration coming soon.
                </p>
            </div>

            {/* Available Datasets Info */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <div className="flex items-center mb-6">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mr-4">
                        <div className="w-6 h-6 border-2 border-primary-foreground rounded opacity-80"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-card-foreground">Available Datasets</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-card-foreground mb-3">Equity Markets</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                                Shiller P/E Ratio - Historical valuation metrics
                            </li>
                            <li className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                                S&P 500 Companies - Market cap and performance
                            </li>
                            <li className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                                Dow Jones Industrial - Blue chip performance
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-card-foreground mb-3">Fixed Income</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-accent mr-3"></div>
                                US Treasury Yields - Government bond rates
                            </li>
                            <li className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-accent mr-3"></div>
                                Yield Curve Data - Term structure analysis
                            </li>
                            <li className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-accent mr-3"></div>
                                Credit Spreads - Risk premium indicators
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Data Sources */}
            <div className="p-8 rounded-3xl gradient-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center">
                    <h3 className="text-2xl font-bold mb-4">Data Sources & Integration</h3>
                    <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                        Our platform aggregates data from central banks, government agencies, and financial markets to provide comprehensive economic insights.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur">Federal Reserve</span>
                        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur">Bank of Japan</span>
                        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur">Bank of England</span>
                        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur">Bank of Canada</span>
                    </div>
                </div>
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/5 blur-xl"></div>
            </div>
        </div>
    );
}