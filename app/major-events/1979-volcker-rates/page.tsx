import Timeline, { TimelineEvent } from '../../../components/timeline';

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

            {/* Crisis Context */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">The Crisis Context</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Stagflation Crisis</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                <div className="text-sm text-muted-foreground">Double-digit inflation eroding purchasing power</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                <div className="text-sm text-muted-foreground">Economic stagnation despite rising prices</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                <div className="text-sm text-muted-foreground">Loss of confidence in the dollar</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                <div className="text-sm text-muted-foreground">Previous Fed policies had failed</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">The Volcker Appointment</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                <div className="text-sm text-muted-foreground">Carter needed a credible inflation fighter</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                <div className="text-sm text-muted-foreground">Volcker had experience at NY Fed</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                <div className="text-sm text-muted-foreground">Known for hawkish monetary views</div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                <div className="text-sm text-muted-foreground">Signaled dramatic policy shift</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="mb-12">
                <Timeline
                    events={volckerEvents}
                    title="Key Moments in the Volcker Era"
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

            {/* Market Reactions */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Market Reactions</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-6 rounded-2xl bg-muted/50 border border-border/30">
                        <div className="text-2xl mb-2">📉</div>
                        <div className="font-semibold text-card-foreground mb-2">Bond Markets</div>
                        <div className="text-sm text-muted-foreground">Initially sold off heavily</div>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-muted/50 border border-border/30">
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-semibold text-card-foreground mb-2">Stock Markets</div>
                        <div className="text-sm text-muted-foreground">High volatility, bear market</div>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-muted/50 border border-border/30">
                        <div className="text-2xl mb-2">💵</div>
                        <div className="font-semibold text-card-foreground mb-2">Dollar</div>
                        <div className="text-sm text-muted-foreground">Strengthened dramatically</div>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-muted/50 border border-border/30">
                        <div className="text-2xl mb-2">🛢️</div>
                        <div className="font-semibold text-card-foreground mb-2">Commodities</div>
                        <div className="text-sm text-muted-foreground">Prices collapsed</div>
                    </div>
                </div>
            </div>

            {/* Legacy */}
            <div className="p-8 rounded-3xl gradient-primary text-primary-foreground relative overflow-hidden mb-12">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-6">The Volcker Legacy</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-3">Key Principles Established</h3>
                            <ul className="space-y-2 text-sm text-primary-foreground/90">
                                <li>• Central Bank Independence is crucial</li>
                                <li>• Credibility must be earned through actions</li>
                                <li>• Short-term pain prevents long-term damage</li>
                                <li>• Clear communication anchors expectations</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Modern Lessons</h3>
                            <ul className="space-y-2 text-sm text-primary-foreground/90">
                                <li>• Act decisively when facing imbalances</li>
                                <li>• Accept political costs of effective policy</li>
                                <li>• Focus on long-term stability</li>
                                <li>• Maintain consistency in commitments</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/5 blur-xl"></div>
            </div>

            {/* Conclusion */}
            <div className="text-center p-8 rounded-2xl border border-border/50 bg-card">
                <p className="text-lg text-muted-foreground italic">
                    "The Volcker shock remains one of the most successful examples of using monetary policy to combat inflation,
                    establishing the template for modern central banking's focus on price stability and institutional independence."
                </p>
            </div>
        </div>
    );
}