'use client';

interface CycleData {
    year: number;
    title: string;
    systemAnchor: string[];
    coreThemes: string[];
    capitalBehavior: string[];
    bestPerformingAssets: string[];
    hiddenRisk: string[];
}

const CYCLE_DATA: CycleData[] = [
    {
        year: 1948,
        title: "Institutional Reconstruction",
        systemAnchor: [
            "Bretton Woods system fully operational",
            "IMF / World Bank active",
            "Fixed FX + capital controls"
        ],
        coreThemes: [
            "State-Anchored Capital",
            "Rule-Based Stability",
            "Physical Reconstruction"
        ],
        capitalBehavior: [
            "Allocated through governments and banks",
            "Long-term planning > market signals",
            "Capital immobile, policy-directed"
        ],
        bestPerformingAssets: [
            "European equities (reconstruction catch-up)",
            "Infrastructure & industrial firms",
            "Housing / rebuilding materials"
        ],
        hiddenRisk: [
            "Rigidity",
            "Dependence on fixed rules",
            "Deferred inflation pressure"
        ]
    },
    {
        year: 1960,
        title: "Brand Permanence & Growth Certainty",
        systemAnchor: [
            "Postwar U.S. consumer dominance",
            "Demographics + productivity tailwinds",
            "Stable monetary regime (still Bretton Woods)"
        ],
        coreThemes: [
            "Institutional Capital Dominance",
            "Quality as Strategy",
            "Permanence as Thesis"
        ],
        capitalBehavior: [
            "Valuations justified by quality, not price",
            "Growth assumed to be stable and perpetual",
            "Concentration into a narrow set of \"obvious winners\""
        ],
        bestPerformingAssets: [
            "U.S. large-cap consumer & industrial equities",
            "The Nifty Fifty",
            "Blue-chip franchises"
        ],
        hiddenRisk: [
            "Valuation fragility",
            "Inflation blindness",
            "Duration overconfidence"
        ]
    },
    {
        year: 1972,
        title: "Fiat Regime Price Discovery",
        systemAnchor: [
            "Gold window closed (1971 decision → 1972 reality)",
            "Floating FX regimes",
            "Monetary policy becomes discretionary"
        ],
        coreThemes: [
            "Monetary Unanchoring",
            "Inflation Signaling",
            "Volatility Discovery"
        ],
        capitalBehavior: [
            "Capital flees nominal promises",
            "Hedging replaces permanence",
            "Price signals dominate narratives"
        ],
        bestPerformingAssets: [
            "Commodities (oil, metals)",
            "Gold & hard assets",
            "FX trading / macro strategies"
        ],
        hiddenRisk: [
            "Wage-price spirals",
            "Monetary instability",
            "Policy credibility erosion"
        ]
    },
    {
        year: 1984,
        title: "Credit Expansion",
        systemAnchor: [
            "Volcker disinflation complete",
            "Deregulation + financialization",
            "Declining interest-rate regime begins"
        ],
        coreThemes: [
            "Leverage as Growth",
            "Falling Discount Rates",
            "Financial Asset Dominance"
        ],
        capitalBehavior: [
            "Balance-sheet expansion replaces productivity",
            "Duration rewarded",
            "Risk migrates into leverage"
        ],
        bestPerformingAssets: [
            "Bonds (multi-decade bull market)",
            "Real estate",
            "Leveraged financial assets"
        ],
        hiddenRisk: [
            "Balance-sheet dependency",
            "Asset inflation divorced from wages",
            "System fragility under shocks"
        ]
    },
    {
        year: 1996,
        title: "Digital Infrastructure",
        systemAnchor: [
            "Internet protocols standardized",
            "Network-native software",
            "Electronic capital markets"
        ],
        coreThemes: [
            "Network Effects",
            "Software as Capital",
            "Scale Dominance"
        ],
        capitalBehavior: [
            "Capital chases scale, not profits",
            "Winner-take-most logic",
            "Optionality > cash flow"
        ],
        bestPerformingAssets: [
            "Technology equities",
            "Software & platform companies",
            "Venture capital"
        ],
        hiddenRisk: [
            "Extreme concentration",
            "Narrative-driven valuations",
            "Fragile unit economics"
        ]
    },
    {
        year: 2008,
        title: "Monetary Intervention",
        systemAnchor: [
            "Global Financial Crisis",
            "QE + zero interest rates",
            "Central banks become market actors"
        ],
        coreThemes: [
            "Policy-Backstopped Markets",
            "Risk Suppression",
            "Socialized Losses"
        ],
        capitalBehavior: [
            "\"Don't fight the Fed\"",
            "Volatility selling",
            "Yield starvation"
        ],
        bestPerformingAssets: [
            "Equities (policy-supported)",
            "Long-duration bonds",
            "Credit with implicit backstops"
        ],
        hiddenRisk: [
            "Moral hazard",
            "Price distortion",
            "Capital misallocation"
        ]
    },
    {
        year: 2020,
        title: "Digital Economy",
        systemAnchor: [
            "Pandemic response",
            "Fiscal + monetary fusion",
            "Direct transfers to households"
        ],
        coreThemes: [
            "Intangible Dominance",
            "Monetary–Social Fusion",
            "Trust as Constraint"
        ],
        capitalBehavior: [
            "Capital flows to intangibles",
            "Labor detached from asset returns",
            "Narrative + attention monetization"
        ],
        bestPerformingAssets: [
            "Platform equities",
            "Data, software, IP-heavy firms",
            "Digital networks"
        ],
        hiddenRisk: [
            "Social instability",
            "Trust erosion",
            "Political backlash"
        ]
    }
];

export default function TwelveYearSystemTable() {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">12-Year Cycles — System Reconfiguration View</h2>
                <p className="text-muted-foreground">
                    Major structural shifts in the global economic and financial system
                </p>
            </div>

            {CYCLE_DATA.map((cycle) => (
                <div
                    key={cycle.year}
                    className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300"
                >
                    {/* Header */}
                    <div className="mb-6 pb-4 border-b border-border">
                        <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-4xl font-bold text-primary">{cycle.year}</span>
                            <span className="text-xl font-semibold text-card-foreground">—</span>
                            <h3 className="text-2xl font-bold text-card-foreground">{cycle.title}</h3>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* System Anchor */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                            <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                                System Anchor
                            </h4>
                            <ul className="space-y-2">
                                {cycle.systemAnchor.map((item, idx) => (
                                    <li key={idx} className="text-sm text-card-foreground flex items-center">
                                        <span className="text-muted-foreground mr-2">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Core Themes */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                            <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                                Core Themes
                            </h4>
                            <ul className="space-y-2">
                                {cycle.coreThemes.map((item, idx) => (
                                    <li key={idx} className="text-sm text-card-foreground flex items-center">
                                        <span className="text-muted-foreground mr-2">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Capital Behavior */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                            <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                                Capital Behavior
                            </h4>
                            <ul className="space-y-2">
                                {cycle.capitalBehavior.map((item, idx) => (
                                    <li key={idx} className="text-sm text-card-foreground flex items-center">
                                        <span className="text-muted-foreground mr-2">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Best Performing Assets */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                            <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                                Best Performing Assets
                            </h4>
                            <ul className="space-y-2">
                                {cycle.bestPerformingAssets.map((item, idx) => (
                                    <li key={idx} className="text-sm text-card-foreground flex items-center">
                                        <span className="text-muted-foreground mr-2">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Hidden Risk - Full Width */}
                        <div className="md:col-span-2 p-4 rounded-xl bg-muted/30 border border-border/30">
                            <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                                Hidden Risk
                            </h4>
                            <ul className="flex flex-wrap gap-3">
                                {cycle.hiddenRisk.map((item, idx) => (
                                    <li key={idx} className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-card-foreground font-medium">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
