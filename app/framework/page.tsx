export default function FrameworkPage() {
    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                    Three Laws of Market Behavior
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Power Law
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Understanding market behavior through three fundamental laws that govern economic cycles and investment opportunities.
                </p>
            </div>

            <div className="space-y-12">
                {/* O1: Swing */}
                <div className="group p-10 rounded-3xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300">
                    <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                                <div className="w-8 h-8 border-3 border-primary-foreground rounded-full opacity-90"></div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center mb-4">
                                <h2 className="text-2xl lg:text-3xl font-bold text-primary mr-4">O1: Swing</h2>
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">Opposites</span>
                            </div>
                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                Trends swing to an extreme and then invert. When markets reach extreme positions, they tend to reverse direction.
                                This law helps identify turning points in economic cycles and market sentiment.
                            </p>
                            <div className="bg-muted/50 p-6 rounded-2xl border border-border/30">
                                <h4 className="font-semibold mb-4 text-card-foreground flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-primary mr-3"></span>
                                    Key Applications
                                </h4>
                                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Market tops and bottoms
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Contrarian opportunities
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Cycle turning points
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* O2: Signal */}
                <div className="group p-10 rounded-3xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300">
                    <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
                                <div className="w-8 h-8 border-3 border-accent-foreground rounded opacity-90"></div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center mb-4">
                                <h2 className="text-2xl lg:text-3xl font-bold text-accent mr-4">O2: Signal</h2>
                                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold">Obvious</span>
                            </div>
                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                Markets signal what the obvious new opportunity is. When market consensus becomes too obvious,
                                it often signals the next major shift or opportunity that everyone can see but few act upon.
                            </p>
                            <div className="bg-muted/50 p-6 rounded-2xl border border-border/30">
                                <h4 className="font-semibold mb-4 text-card-foreground flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-accent mr-3"></span>
                                    Signal Indicators
                                </h4>
                                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Media sentiment extremes
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Unanimous predictions
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Crowded positioning
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* O3: Story */}
                <div className="group p-10 rounded-3xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300">
                    <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-2xl gradient-secondary flex items-center justify-center shadow-lg">
                                <div className="w-8 h-8 border-3 border-secondary-foreground rounded-sm opacity-90"></div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center mb-4">
                                <h2 className="text-2xl lg:text-3xl font-bold text-secondary-foreground mr-4">O3: Story</h2>
                                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">Outliers</span>
                            </div>
                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                New stories emerge that control the narrative. Outlier events, technologies, and ideas often drive
                                the biggest market moves by creating compelling new narratives that reshape how we think about value and opportunity.
                            </p>
                            <div className="bg-muted/50 p-6 rounded-2xl border border-border/30">
                                <h4 className="font-semibold mb-4 text-card-foreground flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-secondary-foreground mr-3"></span>
                                    Story Categories
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Technological breakthroughs
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Geopolitical shifts
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        New economic narratives
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2">•</span>
                                        Disruptive business models
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration Section */}
            <div className="mt-16 p-10 rounded-3xl gradient-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-center">Framework Integration</h3>
                    <p className="text-lg text-primary-foreground/90 text-center max-w-3xl mx-auto leading-relaxed mb-8">
                        These three laws work together to provide a comprehensive view of market dynamics.
                        Use them in combination to identify opportunities, manage risk, and understand the broader economic narrative.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                            <h4 className="font-semibold mb-2">Swing</h4>
                            <p className="text-sm text-primary-foreground/80">Identify extremes and reversals</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                            <h4 className="font-semibold mb-2">Signal</h4>
                            <p className="text-sm text-primary-foreground/80">Recognize obvious opportunities</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur">
                            <h4 className="font-semibold mb-2">Story</h4>
                            <p className="text-sm text-primary-foreground/80">Follow emerging narratives</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/5 blur-xl"></div>
            </div>
        </div>
    );
}