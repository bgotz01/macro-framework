//major-events/1970s-inflation/page.tsx
import Timeline, { TimelineEvent } from '../../../components/timeline';
import ChartFixed from '../../../components/chart-fixed';
import ScrollNav from '../../../components/scroll-nav';

const pivotEvents: TimelineEvent[] = [
    {
        date: '1979-08-06',
        title: 'Paul Volcker Becomes Fed Chairman',
        description: 'President Carter appoints Paul Volcker as Chairman of the Federal Reserve, signaling a new approach to fighting inflation.',
        impact: 'high',
        category: 'Leadership Change'
    },
    {
        date: '1979-10-06',
        title: 'Emergency Weekend Rate Hike',
        description: 'In an unprecedented weekend announcement, the Fed raises the federal funds rate to 12%, shocking financial markets and signaling a dramatic shift in monetary policy.',
        impact: 'high',
        value: '12',
        valueUnit: '%',
        category: 'Policy Action'
    },
    {
        date: '1980-12-05',
        title: 'Peak Interest Rates',
        description: 'Federal funds rate reaches its historic peak of 20%, the highest level in modern U.S. history, as Volcker maintains his aggressive anti-inflation stance.',
        impact: 'high',
        value: '20',
        valueUnit: '%',
        category: 'Policy Peak'
    }
];

const scrollNavItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'us-evidence', label: 'US Evidence' },
    { id: 'german-contrast', label: 'German Contrast' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'policy-reversal', label: 'Swing' },
];

export default function SeventiesInflationPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <ScrollNav items={scrollNavItems} />

            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 text-red-600 text-sm font-medium mb-6">
                    Major Events • 1979-1980
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Breaking the 1970s Inflation Trap
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    How negative real rates and FX pressure forced a credibility reset—and rewired markets.
                </p>
            </div>

            {/* Overview */}
            <div id="overview" className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8 text-center">Case Study Overview</h2>

                {/* The Problem */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold mr-3 text-sm">1970s</div>
                        <h3 className="text-xl font-bold text-card-foreground">The Problem</h3>
                    </div>
                    <div className="pl-11 space-y-2">
                        <p className="text-muted-foreground">• US had persistent high inflation & negative real rates</p>
                        <p className="text-muted-foreground">• Investors in US bonds were losing purchasing power</p>
                        <p className="text-muted-foreground">• Money was flowing to Germany, which had positive real rates</p>
                        <p className="text-muted-foreground">• The Deutschmark was gaining against the Dollar</p>
                    </div>
                </div>

                {/* The Solution */}
                <div>
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold mr-3 text-sm">1980+</div>
                        <h3 className="text-xl font-bold text-card-foreground">The Solution</h3>
                    </div>
                    <div className="pl-11 space-y-2">
                        <p className="text-muted-foreground">• Policy needed to restore credibility by making real rates positive</p>
                        <p className="text-muted-foreground">• The US converged toward a Bundesbank-style stance</p>
                        <p className="text-muted-foreground">• Unprecedented rate hikes to break the inflation psychology</p>
                    </div>
                </div>
            </div>

            {/* OS Triad Header */}
            <div className="p-10 rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mb-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-card-foreground mb-3">The OS Triad</h2>
                    <p className="text-muted-foreground">How the Operating System identified and capitalized on this opportunity</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/50">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <span className="text-primary font-bold text-lg">O1</span>
                        </div>
                        <h3 className="font-semibold text-card-foreground mb-2">Signal</h3>
                        <p className="text-sm text-muted-foreground">Negative real rates + FX pressure</p>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/50">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                            <span className="text-orange-600 font-bold text-lg">O2</span>
                        </div>
                        <h3 className="font-semibold text-card-foreground mb-2">Swing</h3>
                        <p className="text-sm text-muted-foreground">Regime reversal to restore credibility</p>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-card/50 border border-border/50">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                            <span className="text-purple-600 font-bold text-lg">O3</span>
                        </div>
                        <h3 className="font-semibold text-card-foreground mb-2">Story</h3>
                        <p className="text-sm text-muted-foreground">"Volcker Shock" becomes the mythic turning point</p>
                    </div>
                </div>
            </div>

            {/* Crisis Context */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">The Crisis Context — The Pain</h2>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Economic Stagnation</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                <div className="text-sm text-muted-foreground">Economic stagnation despite rising prices</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                <div className="text-sm text-muted-foreground">Previous Fed policies had failed</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Inflation Crisis</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                <div className="text-sm text-muted-foreground">Double-digit inflation eroding purchasing power</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                <div className="text-sm text-muted-foreground">Loss of confidence in the dollar</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-xl font-bold text-card-foreground mb-6">What was the biggest, most obvious problem in the US in the 1970s?</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-red-50 border border-red-200">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold mr-3">1</div>
                                <h4 className="text-lg font-semibold text-red-700">High Persistent Inflation</h4>
                            </div>
                            <p className="text-red-600 text-sm">
                                Consumer prices rising at double-digit rates, eroding purchasing power and undermining economic stability.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-red-50 border border-red-200">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold mr-3">2</div>
                                <h4 className="text-lg font-semibold text-red-700">US Dollar Losing Value</h4>
                            </div>
                            <p className="text-red-600 text-sm">
                                Massive capital flight as investors lost confidence in the dollar amid failed monetary policies.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* United States: The Evidence */}
            <div id="us-evidence" className="mb-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-2">🇺🇸 United States: The Evidence</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-red-300 rounded-full"></div>
            </div>

            {/* The Evidence: US Problem */}
            <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">🇺🇸 United States</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">3-Month Yield</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">CPI Inflation</span>
                </div>
                <div className="mb-4 p-6 rounded-xl bg-primary/10 border-2 border-primary/20">
                    <p className="text-base font-medium text-card-foreground">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O1: Signal</span>
                        Negative Real Rates
                    </p>
                    <div className="mt-3 pl-16 space-y-1">
                        <p className="text-sm text-muted-foreground"><strong>Observation:</strong> CPI consistently higher than US 3-month yield after 1973</p>
                        <p className="text-sm text-muted-foreground"><strong>Pain:</strong> "Saving in USD bonds leads to purchasing power loss"</p>
                    </div>
                </div>
                <ChartFixed
                    filePath="events/USCPI3mo.csv"
                    title="US: 3-Month Yield vs CPI (1975-1982)"
                    startDate="1971-01-01"
                    endDate="1979-12-31"
                    height={400}
                    yAxisKeys={['3mo', 'CPI']}
                    colors={['#2563eb', '#dc2626']}
                    showLegend={true}
                />
            </div>

            {/* Dollar Crisis Evidence */}
            <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">🇺🇸 United States</span>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">🇩🇪 Germany</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">Exchange Rate</span>
                </div>
                <div className="mb-4 p-6 rounded-xl bg-primary/10 border-2 border-primary/20">
                    <p className="text-base font-medium text-card-foreground">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O1: Signal</span>
                        FX Pressure
                    </p>
                    <div className="mt-3 pl-16 space-y-1">
                        <p className="text-sm text-muted-foreground"><strong>Observation:</strong> DM per $ fell (USD weakened)</p>
                        <p className="text-sm text-muted-foreground"><strong>Effect:</strong> "USD credibility leak"</p>
                    </div>
                </div>
                <ChartFixed
                    filePath="events/DMUSDMonthly.csv"
                    title="DM/USD Exchange Rate (1971-1979)"
                    startDate="1971-01-01"
                    endDate="1979-12-31"
                    height={400}
                    colors={['#dc2626']}
                    xAxisKey="observation_date"
                    yAxisKey="DMUSD"
                    description="DM per $1 — higher = stronger USD, lower = weaker USD"
                />
            </div>

            {/* The Reality */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card mb-12">
                <div className="space-y-3">
                    <p className="text-lg font-semibold text-card-foreground">
                        Reality: Interest Rates were below the Inflation Rate
                    </p>
                    <p className="text-base text-muted-foreground">
                        Meaning: Anyone holding US dollar bonds was losing purchasing power each year
                    </p>
                    <p className="text-base text-muted-foreground">
                        Capital was moving to Germany
                    </p>
                </div>
            </div>

            {/* Germany: The Contrast */}
            <div id="german-contrast" className="mb-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-2">🇩🇪 Germany: The Contrast</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
            </div>

            {/* Germany: The Solution */}
            <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">🇩🇪 Germany</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">3-Month Yield</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">VPI Inflation</span>
                </div>
                <div className="mb-4 p-6 rounded-xl bg-primary/10 border-2 border-primary/20">
                    <p className="text-base font-medium text-card-foreground">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O1: Signal</span>
                        German Positive Real Rates
                    </p>
                    <div className="mt-3 pl-16 space-y-1">
                        <p className="text-sm text-muted-foreground"><strong>Observation:</strong> German 3-month rates consistently above VPI inflation</p>
                        <p className="text-sm text-muted-foreground"><strong>Gain:</strong> "Saving in German bonds leads to purchasing power growth"</p>
                    </div>
                </div>
                <ChartFixed
                    filePath="events/GermanyVPI3mo.csv"
                    title="Germany: 3-Month Yield vs VPI Inflation (1971-1979)"
                    startDate="1971-01-01"
                    endDate="1979-12-31"
                    height={400}
                    yAxisKeys={['3mo', 'VPI']}
                    colors={['#2563eb', '#dc2626']}
                    showLegend={true}
                    description="German 3-month rates consistently above inflation"
                />
            </div>

            {/* The German Reality */}
            <div className="p-8 rounded-3xl bg-green-50 border border-green-200 mb-12">
                <div className="text-center mb-6">

                    <p className="text-lg text-green-600 font-medium">
                        Reality: Investors were gaining purchasing power by holding German Bonds
                    </p>
                </div>
            </div>

            {/* Direct Comparisons */}
            <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">🇺🇸 United States</span>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">🇩🇪 Germany</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">Inflation Comparison</span>
                </div>
                <div className="mb-4 p-6 rounded-xl bg-primary/10 border-2 border-primary/20">
                    <p className="text-base font-medium text-card-foreground">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O1: Signal</span>
                        German Inflation Control
                    </p>
                    <div className="mt-3 pl-16 space-y-1">
                        <p className="text-sm text-muted-foreground"><strong>Observation:</strong> German VPI consistently lower than US CPI after 1973</p>
                        <p className="text-sm text-muted-foreground"><strong>Gain:</strong> "German monetary policy maintaining price stability"</p>
                    </div>
                </div>
                <ChartFixed
                    filePath="events/VPICPI.csv"
                    title="German VPI vs US CPI Inflation (1971-1979)"
                    startDate="1971-01-01"
                    endDate="1979-12-31"
                    height={400}
                    yAxisKeys={['GermanVPI', 'USCPI']}
                    colors={['#16a34a', '#dc2626']}
                    showLegend={true}
                    description="Direct comparison of inflation rates"
                />
            </div>

            <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">🇺🇸 United States</span>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">🇩🇪 Germany</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">Real Interest Rates</span>
                </div>
                <div className="mb-4 p-6 rounded-xl bg-primary/10 border-2 border-primary/20">
                    <p className="text-base font-medium text-card-foreground">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O1: Signal</span>
                        German real rates consistently positive while US real rates were negative
                    </p>
                </div>
                <ChartFixed
                    filePath="events/GermanUS3mo.csv"
                    title="German vs US Real Interest Rates (1971-1979)"
                    startDate="1971-01-01"
                    endDate="1979-12-31"
                    height={400}
                    yAxisKeys={['German3moReal', 'US3moReal']}
                    colors={['#16a34a', '#dc2626']}
                    showLegend={true}
                    referenceLine={0}
                    description="Real rates = Nominal interest rate minus inflation"
                />
            </div>

            {/* Divider */}
            <div className="my-12">
                <hr className="border-t-2 border-gray-300 dark:border-gray-600" />
            </div>

            {/* Timeline */}
            <div id="timeline" className="mb-12">
                <Timeline
                    events={pivotEvents}
                    title="The Pivot: Key Moments"
                    showCategories={true}
                    horizontal={true}
                />
            </div>

            {/* Divider */}
            <div className="my-12">
                <hr className="border-t-2 border-gray-300 dark:border-gray-600" />
            </div>

            {/* O2: Policy Reversal */}
            <div id="policy-reversal" className="mb-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-2">The Swing: Policy Pivot</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full"></div>
            </div>

            {/* The Swing: Policy Reversal */}
            <div className="mb-12">
                <div className="flex gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                        Pivot: 1979-10-06
                    </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">🇺🇸 United States</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">Real Interest Rates</span>
                </div>
                <div className="mb-4 p-6 rounded-xl bg-orange-100 border-2 border-orange-200">
                    <p className="text-base font-medium text-card-foreground">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-bold mr-3">O2: Swing</span>
                        The Policy Reversal
                    </p>
                    <div className="mt-3 pl-16 space-y-1">
                        <p className="text-sm text-muted-foreground"><strong>Observation:</strong> US real rates swing from deeply negative to strongly positive</p>
                        <p className="text-sm text-muted-foreground"><strong>Effect:</strong> "America adopts the Bundesbank model - rates above inflation"</p>
                    </div>
                </div>
                <ChartFixed
                    filePath="events/USRealRate3mo.csv"
                    title="US Real Interest Rates: The Great Reversal (1975-1985)"
                    startDate="1975-01-01"
                    endDate="1985-12-31"
                    height={400}
                    yAxisKeys={['3moReal']}
                    colors={['#2563eb']}
                    showLegend={true}
                    referenceLine={0}
                    description="Real rates = 3-month Treasury yield minus CPI inflation"
                />
            </div>

            {/* Dollar Recovery */}
            <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">🇺🇸 United States</span>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">🇩🇪 Germany</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">Exchange Rate</span>
                </div>
                <div className="mb-4 p-6 rounded-xl bg-orange-100 border-2 border-orange-200">
                    <p className="text-base font-medium text-card-foreground">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-bold mr-3">O2: Swing</span>
                        Dollar Strength Returns
                    </p>
                    <div className="mt-3 pl-16 space-y-1">
                        <p className="text-sm text-muted-foreground"><strong>Observation:</strong> DM per $ rose (USD strengthened)</p>
                        <p className="text-sm text-muted-foreground"><strong>Effect:</strong> "Credibility restored - capital flows back to America"</p>
                    </div>
                </div>
                <ChartFixed
                    filePath="events/DMUSDMonthly.csv"
                    title="DM/USD Exchange Rate: The Dollar Recovery (1980-1990)"
                    startDate="1980-01-01"
                    endDate="1985-12-31"
                    height={400}
                    colors={['#16a34a']}
                    xAxisKey="observation_date"
                    yAxisKey="DMUSD"
                    yAxisDomain={[1.5, 3.5]}
                    description="DM per $1 — higher = stronger USD, lower = weaker USD"
                />
            </div>







        </div>
    );
}