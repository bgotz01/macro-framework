//major-events/1979-volcker-rates/page.tsx
import Timeline, { TimelineEvent } from '../../../components/timeline';
import ChartFixed from '../../../components/chart-fixed';

const volckerEvents: TimelineEvent[] = [
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

export default function VolckerRatesPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 text-red-600 text-sm font-medium mb-6">
                    Major Events • 1979-1980
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    The Volcker Shock
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    How Paul Volcker's aggressive monetary policy broke the back of 1970s inflation through unprecedented interest rate hikes.
                </p>
            </div>

            {/* Overview */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
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
                    <div className="pl-11 space-y-3">
                        <div className="flex items-start space-x-3">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-medium mt-0.5">O2</span>
                            <div>
                                <span className="font-medium text-card-foreground">Obvious Signal:</span>
                                <span className="text-muted-foreground ml-2">Policy in Germany was working; in America it was not</span>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-medium mt-0.5">O1</span>
                            <div>
                                <span className="font-medium text-card-foreground">Opposite Swing:</span>
                                <span className="text-muted-foreground ml-2">Adopt the policy of the Bundesbank and raise interest rates above the inflation rate</span>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-medium mt-0.5">O3</span>
                            <div>
                                <span className="font-medium text-card-foreground">Outlier Story:</span>
                                <span className="text-muted-foreground ml-2">Unprecedentedly high Fed Funds rate to crush inflation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crisis Context */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">The Crisis Context - The Obvious</h2>

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

            {/* The Evidence: US Problem */}
            <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">🇺🇸 United States</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">3-Month Yield</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">CPI Inflation</span>
                </div>
                <div className="mb-4 p-6 rounded-xl bg-primary/10 border-2 border-primary/20">
                    <p className="text-base font-medium text-card-foreground">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O2: Signal</span>
                        CPI was consistently higher than US short term bond yields after 1973.
                    </p>
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O2: Signal</span>
                        US dollar losing value to the DeutscheMark
                    </p>
                </div>
                <ChartFixed
                    filePath="fx/dm-usd-monthly.csv"
                    title="DM/USD Exchange Rate (1971-1979)"
                    startDate="1971-01-01"
                    endDate="1979-12-31"
                    height={400}
                    colors={['#dc2626']}
                    xAxisKey="observation_date"
                    yAxisKey="DMUSD"
                    description="Deutsche Mark per US Dollar - Lower values = stronger DM"
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



            {/* Germany: The Solution */}
            <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">🇩🇪 Germany</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">3-Month Yield</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">VPI Inflation</span>
                </div>
                <div className="mb-4 p-6 rounded-xl bg-primary/10 border-2 border-primary/20">
                    <p className="text-base font-medium text-card-foreground">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O2: Signal</span>
                        German Bundesbank was "ahead" of inflation
                    </p>
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O2: Signal</span>
                        German inflation consistently lower than US inflation after 1973
                    </p>
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
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold mr-3">O2: Signal</span>
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

            {/* Timeline */}
            <div className="mb-12">
                <Timeline
                    events={volckerEvents}
                    title="Volcker's Response: Key Moments"
                    showCategories={true}
                />
            </div>



            {/* Economic Impact */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">The Economic Impact</h2>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Immediate Effects</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-red-600">Recession</span>
                                    <span className="text-sm text-red-500">1981-1982</span>
                                </div>
                                <p className="text-sm text-red-600">Economy plunged into severe recession</p>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-red-600">Unemployment</span>
                                    <span className="text-sm text-red-500">10%+</span>
                                </div>
                                <p className="text-sm text-red-600">Highest since Great Depression</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Long-term Success</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-green-600">Inflation Tamed</span>
                                    <span className="text-sm text-green-500">14% → 4%</span>
                                </div>
                                <p className="text-sm text-green-600">Price stability restored</p>
                            </div>
                            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-green-600">Credibility</span>
                                    <span className="text-sm text-green-500">Restored</span>
                                </div>
                                <p className="text-sm text-green-600">Fed's commitment established</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}