export interface CycleNarrative {
    year: number;
    title: string;
    theme: string;
    previousCycle?: string;
    sections: {
        title: string;
        items: string[];
    }[];
    whyItMatters: string[];
}

export const CYCLE_NARRATIVES: CycleNarrative[] = [
    {
        year: 1948,
        title: "Institutional Reconstruction",
        theme: "Order rebuilt after collapse",
        previousCycle: "World War II (1936-1948)",
        sections: [
            {
                title: "What changed",
                items: [
                    "Post-WWII reconstruction",
                    "Bretton Woods architecture",
                    "IMF, World Bank, dollar-as-anchor",
                    "Strong state capacity, capital controls"
                ]
            },
            {
                title: "System effect",
                items: [
                    "Stability over efficiency",
                    "Fixed exchange rates",
                    "Growth driven by rebuilding, not leverage"
                ]
            }
        ],
        whyItMatters: [
            "This cycle answers: How do you restart a global system after total destruction?",
            "Everything here is about rules, institutions, and trust."
        ]
    },
    {
        year: 1960,
        title: "Institutional Capital & Brand Consolidation",
        theme: "Permanence as an investment thesis",
        previousCycle: "Institutional Reconstruction (1948-1960)",
        sections: [
            {
                title: "This is when:",
                items: [
                    "Pension funds, insurance companies, endowments become dominant allocators",
                    "Capital shifts from owner-operators to professional managers",
                    "\"Quality\" becomes a strategy, not just a trait"
                ]
            },
            {
                title: "What changed",
                items: [
                    "Rise of large institutional pools of capital",
                    "Buy-and-hold mentality (\"one-decision stocks\")",
                    "Equity investing framed as owning franchises, not trading cycles"
                ]
            },
            {
                title: "System effect",
                items: [
                    "Valuations decouple from near-term earnings",
                    "Brand + stability command a premium",
                    "Concentration in perceived winners"
                ]
            }
        ],
        whyItMatters: [
            "This cycle answers: What assets are safe enough to hold forever?",
            "That question only exists because institutions need duration."
        ]
    },
    {
        year: 1972,
        title: "Fiat Regime Price Discovery",
        theme: "Monetary freedom meets reality",
        previousCycle: "Brand Permanence (1960-1972)",
        sections: [
            {
                title: "What changed",
                items: [
                    "Gold constraint gone → currencies float",
                    "No anchor → prices must discover themselves",
                    "Wages, commodities, FX all reprice violently"
                ]
            },
            {
                title: "System effect",
                items: [
                    "Inflation is not a bug — it's price discovery",
                    "Governments learn fiat is powerful but unstable",
                    "Bond markets still enforce discipline"
                ]
            }
        ],
        whyItMatters: [
            "This cycle answers: What is money worth if it's no longer fixed to anything?"
        ]
    },
    {
        year: 1984,
        title: "Credit Expansion",
        theme: "Leverage becomes the growth engine",
        previousCycle: "Fiat Price Discovery (1972-1984)",
        sections: [
            {
                title: "What changed",
                items: [
                    "Inflation defeated → credibility restored",
                    "Rates begin secular decline",
                    "Credit replaces productivity as the growth lever"
                ]
            },
            {
                title: "System effect",
                items: [
                    "Debt becomes \"safe\"",
                    "Financialization accelerates",
                    "Balance sheets quietly overtake cash flows"
                ]
            }
        ],
        whyItMatters: [
            "This is when the system learns: We can grow faster by borrowing from the future."
        ]
    },
    {
        year: 1996,
        title: "Digital Infrastructure",
        theme: "Information → networked → scalable",
        previousCycle: "Credit Expansion (1984-1996)",
        sections: [
            {
                title: "What changed",
                items: [
                    "Internet, PCs, enterprise software",
                    "Supply chains digitized",
                    "Capital allocation speeds up"
                ]
            },
            {
                title: "System effect",
                items: [
                    "Productivity actually rises (rare!)",
                    "Winner-take-most dynamics emerge",
                    "Intangibles start to matter more than plant & equipment"
                ]
            }
        ],
        whyItMatters: [
            "This cycle builds the rails: Capital, labor, and ideas can now move at network speed.",
            "This sets up the tech run — but doesn't complete it yet."
        ]
    },
    {
        year: 2008,
        title: "Monetary Intervention Era",
        theme: "Liquidity replaces price signals",
        previousCycle: "Digital Infrastructure (1996-2008)",
        sections: [
            {
                title: "What changed",
                items: [
                    "QE, zero rates, balance-sheet expansion",
                    "Markets stabilized by central banks, not fundamentals",
                    "Parallel response: Bitcoin introduced (opt-out money)"
                ]
            },
            {
                title: "System effect",
                items: [
                    "Asset prices detach from underlying risk",
                    "Moral hazard becomes structural",
                    "Money becomes explicitly political"
                ]
            }
        ],
        whyItMatters: [
            "This answers: What happens when losses are no longer allowed?",
            "And quietly introduces the exit hatch."
        ]
    },
    {
        year: 2020,
        title: "Digital Economy",
        theme: "Reality goes virtual",
        previousCycle: "Monetary Intervention (2008-2020)",
        sections: [
            {
                title: "What changed",
                items: [
                    "Work, money, media, identity digitize rapidly",
                    "Fiscal + monetary policy merge",
                    "Platforms replace institutions"
                ]
            },
            {
                title: "System effect",
                items: [
                    "Intangible dominance (code, brand, networks)",
                    "Explosive inequality of outcomes",
                    "Control shifts from balance sheets to attention + compute"
                ]
            }
        ],
        whyItMatters: [
            "This is when: Economic activity becomes software-native.",
            "And the system starts running into trust limits again."
        ]
    }
];

export function getCycleNarrativeByYear(year: number): CycleNarrative | undefined {
    return CYCLE_NARRATIVES.find(cycle => cycle.year === year);
}
