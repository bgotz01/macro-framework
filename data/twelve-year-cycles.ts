export interface CycleData {
    year: number;
    title: string;
    systemAnchor: string[];
    coreThemes: string[];
    capitalBehavior: string[];
    bestPerformingAssets: string[];
    hiddenRisk: string[];
}

export const TWELVE_YEAR_CYCLES: CycleData[] = [
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

/**
 * Get cycle data by year
 */
export function getCycleByYear(year: number): CycleData | undefined {
    return TWELVE_YEAR_CYCLES.find(cycle => cycle.year === year);
}
