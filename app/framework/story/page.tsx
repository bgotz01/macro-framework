export default function StoryPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
                    Framework • Law 3
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    O3: Story
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    The third law focuses on how new stories emerge that control the narrative. Markets are driven by compelling stories that shape investor behavior.
                </p>
            </div>

            {/* Core Principle */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Core Principle</h2>
                <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/20 mb-6">
                    <p className="text-lg text-card-foreground italic">
                        "The most powerful market moves are driven by new stories that change how we think about value, risk, and opportunity."
                    </p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    New narratives emerge that fundamentally change how markets interpret information and value assets. These stories often start small but can grow to dominate market thinking and drive massive capital flows.
                </p>
            </div>

            {/* Story Lifecycle */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Story Lifecycle</h2>
                <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                            <div className="font-semibold text-card-foreground">Emergence</div>
                            <div className="text-sm text-muted-foreground">New story begins in niche communities</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                            <div className="font-semibold text-card-foreground">Early Adoption</div>
                            <div className="text-sm text-muted-foreground">Forward-thinking investors begin positioning</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                            <div className="font-semibold text-card-foreground">Mainstream Recognition</div>
                            <div className="text-sm text-muted-foreground">Story gains broader acceptance and media coverage</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                            <div className="font-semibold text-card-foreground">Peak Narrative</div>
                            <div className="text-sm text-muted-foreground">Story becomes dominant theme driving behavior</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center text-sm font-bold">5</div>
                        <div>
                            <div className="font-semibold text-card-foreground">Maturation/Decline</div>
                            <div className="text-sm text-muted-foreground">Story becomes consensus and loses power</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historical Examples */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Historical Examples</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">The Internet Story (1990s)</h4>
                        <p className="text-sm text-muted-foreground">
                            The narrative that the internet would transform business drove massive investment. While ultimately correct, timing and valuation mattered enormously.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">China Growth Story (2000s)</h4>
                        <p className="text-sm text-muted-foreground">
                            China's economic rise narrative drove commodity prices, emerging market investments, and global trade patterns for over a decade.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">Mobile Revolution (2007-2015)</h4>
                        <p className="text-sm text-muted-foreground">
                            The smartphone story transformed not just technology companies but entire industries, from retail to transportation.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/50">
                        <h4 className="font-bold text-card-foreground mb-3">ESG Story (2010s-2020s)</h4>
                        <p className="text-sm text-muted-foreground">
                            Environmental, social, and governance considerations evolved from niche concern to mainstream investment theme.
                        </p>
                    </div>
                </div>
            </div>

            {/* Story Categories */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Story Categories</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Technology Stories</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Artificial Intelligence</div>
                                <div className="text-sm text-muted-foreground">AI and automation transformation</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Quantum Computing</div>
                                <div className="text-sm text-muted-foreground">Advanced materials and computing</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Space Commercialization</div>
                                <div className="text-sm text-muted-foreground">Space exploration and commerce</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Economic Stories</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Deglobalization</div>
                                <div className="text-sm text-muted-foreground">Supply chain reshoring trends</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Digital Currencies</div>
                                <div className="text-sm text-muted-foreground">Central bank digital currencies</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30">
                                <div className="font-medium text-card-foreground">Demographic Transitions</div>
                                <div className="text-sm text-muted-foreground">Aging populations impact</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Implementation Strategy */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Implementation Strategy</h2>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Story Identification</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="font-medium text-card-foreground">Early Signal Detection</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Monitor niche publications and thought leaders</li>
                                    <li>• Track patent filings and research developments</li>
                                    <li>• Follow regulatory changes and policy discussions</li>
                                    <li>• Observe startup funding and VC themes</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-medium text-card-foreground">Narrative Analysis</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Assess story's logical foundation</li>
                                    <li>• Evaluate potential scale and timeline</li>
                                    <li>• Consider benefiting industries and assets</li>
                                    <li>• Identify obstacles or contradictions</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-4">Story-Based Investing</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div>• <strong>Thematic Positioning:</strong> Build portfolios around compelling narratives</div>
                                <div>• <strong>Lifecycle Management:</strong> Adjust positions as stories mature</div>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div>• <strong>Contrarian Opportunities:</strong> Identify over-hyped stories</div>
                                <div>• <strong>Cross-Asset Impact:</strong> Consider effects on different asset classes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Story Validation Framework */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8">Story Validation Framework</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-muted/30">
                        <h4 className="font-semibold text-card-foreground mb-3">Fundamental Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Is there real underlying change?</li>
                            <li>• Are economics sustainable?</li>
                            <li>• What evidence supports assumptions?</li>
                            <li>• Timeline for story to play out?</li>
                        </ul>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/30">
                        <h4 className="font-semibold text-card-foreground mb-3">Market Positioning</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• How widely accepted currently?</li>
                            <li>• Current positioning and valuation?</li>
                            <li>• Early-stage opportunities remaining?</li>
                            <li>• What could cause story to lose credibility?</li>
                        </ul>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/30">
                        <h4 className="font-semibold text-card-foreground mb-3">Implementation Feasibility</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Practical barriers to realization?</li>
                            <li>• Regulatory or technological obstacles?</li>
                            <li>• Dependency on specific developments?</li>
                            <li>• Alternative scenarios possible?</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Integration */}
            <div className="p-8 rounded-3xl gradient-secondary text-secondary-foreground mb-12">
                <h2 className="text-2xl font-bold mb-6">Integration with Other Laws</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
                        <h4 className="font-semibold mb-2">O1: Swing</h4>
                        <p className="text-sm text-secondary-foreground/90">
                            New stories often emerge at inflection points when old paradigms break down
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
                        <h4 className="font-semibold mb-2">O2: Signal</h4>
                        <p className="text-sm text-secondary-foreground/90">
                            Obvious signals often point toward emerging stories that will dominate future narratives
                        </p>
                    </div>
                </div>
            </div>

            {/* Story Risk Management */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Story Risk Management</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-muted/50">
                            <h4 className="font-semibold text-card-foreground mb-2">Diversification</h4>
                            <p className="text-sm text-muted-foreground">Don't bet everything on one story, no matter how compelling</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/50">
                            <h4 className="font-semibold text-card-foreground mb-2">Timeline Flexibility</h4>
                            <p className="text-sm text-muted-foreground">Stories often take longer to play out than expected</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-muted/50">
                            <h4 className="font-semibold text-card-foreground mb-2">Fundamental Anchor</h4>
                            <p className="text-sm text-muted-foreground">Ensure stories are supported by real change</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/50">
                            <h4 className="font-semibold text-card-foreground mb-2">Exit Strategy</h4>
                            <p className="text-sm text-muted-foreground">Have plans for when stories become consensus</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}