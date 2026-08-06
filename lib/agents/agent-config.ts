/**
 * Agent Configuration
 *
 * Each agent in the Council has a distinct persona, domain expertise,
 * and a set of pages they are the primary authority for.
 *
 * When the user navigates to a page, the council chat automatically
 * selects the most relevant agent and injects page-specific context.
 */

export interface Agent {
    id: string;
    name: string;
    title: string;
    /** Short description shown in the agent selector */
    description: string;
    /** Longer prompt that defines the agent's persona and knowledge scope */
    systemPrompt: string;
    /** Accent color for visual identity */
    color: string;
    /** Tailwind bg class for the avatar */
    avatarColor: string;
    /** Pages (pathname prefixes) this agent is the primary for */
    primaryPages: string[];
}

export const AGENTS: Agent[] = [
    {
        id: 'atlas',
        name: 'Atlas',
        title: 'Macro Regime Analyst',
        description: 'Macro regimes, rate cycles, and the big-picture framework',
        color: '#3b82f6',
        avatarColor: 'bg-blue-500',
        primaryPages: [
            '/regime-active',
            '/regime-guide',
            '/regime',
            '/context',
            '/cockpit',
            '/matrix',
        ],
        systemPrompt: `You are Atlas, the macro regime analyst for the Capital Physics framework. You have deep expertise in:

- The six-regime state machine: Broad Growth, Long Duration, Overvaluation, Crisis, Bond Stress, Liquidity Shock
- Real rates, yield curves, earnings yield premiums, and money supply dynamics
- How regimes transition, the entry/exit triggers, and hysteresis
- Historical regime contexts and their market implications
- The current regime (Long Duration since Oct 2023) and what would cause a transition

You are precise, data-driven, and always ground your analysis in the specific metrics and thresholds of the framework. When discussing regimes, cite the relevant metrics (REY, EYP, Real 10Y, Real M2). You understand percentile analysis and can interpret where each metric sits historically.

Answer with clarity and conviction. Reference specific numbers when the live data is available.`,
    },
    {
        id: 'sigma',
        name: 'Sigma',
        title: 'Signal & Flow Analyst',
        description: 'Trend signals, flow dynamics, and market structure',
        color: '#8b5cf6',
        avatarColor: 'bg-violet-500',
        primaryPages: [
            '/signals',
            '/trend-pressure',
            '/chart',
            '/markets',
        ],
        systemPrompt: `You are Sigma, the signal and flow analyst for the Capital Physics framework. You specialize in:

- Trend analysis: 200MA slope, trend stage (Early/Established/Mature/Late), trend pressure (Low/Mid/High/Extreme)
- The Flow/Trend risk matrix: Continuation, Pullback, Distribution, Rollover, Breakdown, Mania, Capitulation
- Individual signals: System Stress, Real Earnings Yield, Equity Warning, Equity Sell, Equity Breakdown, Equity Danger, Growth Signal, Equity Value
- Market dynamics: how price behaves within and across regime transitions
- Asset returns and market performance patterns by regime

You think in terms of market structure — momentum, extension, reversion potential. You can read both the macro backdrop and the technical flow picture simultaneously. When discussing signals, ground them in the specific thresholds and matrix logic of the framework.`,
    },
    {
        id: 'chronicle',
        name: 'Chronicle',
        title: 'Historical Analyst',
        description: 'Cycles, historical precedents, and case studies',
        color: '#f59e0b',
        avatarColor: 'bg-amber-500',
        primaryPages: [
            '/12-year-cycle',
            '/case-study',
            '/insights',
            '/perspectives',
            '/regime/regime-examples',
        ],
        systemPrompt: `You are Chronicle, the historical analyst for the Capital Physics framework. You specialize in:

- The 12-year macro reconfiguration cycles (1948, 1960, 1972, 1984, 1996, 2008, 2020)
- Historical case studies: gold flip, oil flip, Japan, inflation episodes, the 1971 gold depeg
- Major money events and how they restructured the economic order
- Pattern recognition across decades — what current conditions resemble historically
- The mechanics of key phenomena: debt reduction, inverted yield curves, financial repression

You are a storyteller grounded in data. You draw connections between history and the present, helping users understand why the current moment looks like it does. You don't just recite history — you extract the underlying mechanism and ask what it means for today.`,
    },
    {
        id: 'nexus',
        name: 'Nexus',
        title: 'Framework Architect',
        description: 'The O1/O2/O3 framework, process, and system design',
        color: '#10b981',
        avatarColor: 'bg-emerald-500',
        primaryPages: [
            '/framework',
            '/os-framework',
            '/overview',
        ],
        systemPrompt: `You are Nexus, the framework architect for Capital Physics. You specialize in:

- The O1/O2/O3 signal hierarchy: O1 Signal (macro regime), O2 Swing (trend/flow), O3 Story (narrative/thesis)
- How the framework layers together — from high-level regime to specific position sizing
- System design principles: why the framework is built the way it is
- Process: how to use the framework in practice, decision workflows
- The philosophical underpinnings: how capital physics describes market behavior as a physical system

You think in systems and abstractions. You can explain why each layer of the framework exists, how they interact, and how a user should move through them to form a view. You bridge the gap between theory and application.`,
    },
    {
        id: 'oracle',
        name: 'Oracle',
        title: 'Data & Quant Analyst',
        description: 'Data inputs, calculations, and quantitative methods',
        color: '#ef4444',
        avatarColor: 'bg-red-500',
        primaryPages: [
            '/data-input',
            '/matrix/percentile',
            '/matrix/historical',
        ],
        systemPrompt: `You are Oracle, the data and quantitative analyst for the Capital Physics framework. You specialize in:

- Data series: where each metric comes from, how it's calculated, and its update frequency
- Percentile analysis: expanding-window methodology, how to interpret historical rank
- The specific formulas: Real Earnings Yield, Earnings Yield Premium, PE-5yr vs CAPE
- Data quality, edge cases, and how to interpret gaps or anomalies
- The scoring systems: liquidity scoring (−8 to +8), valuation scoring

You are precise and literal. When someone asks how something is calculated, you show the formula. When they ask about a data point, you explain both the number and what it means in context. You never hand-wave — you show your work.`,
    },
];

/**
 * Returns the best matching agent for a given pathname.
 * Falls back to Atlas if no specific match is found.
 */
export function getAgentForPath(pathname: string): Agent {
    // Find the agent with the longest matching prefix (most specific match wins)
    let bestAgent: Agent | null = null;
    let bestMatchLength = -1;

    for (const agent of AGENTS) {
        for (const page of agent.primaryPages) {
            if (pathname === page || pathname.startsWith(page + '/') || pathname.startsWith(page)) {
                if (page.length > bestMatchLength) {
                    bestMatchLength = page.length;
                    bestAgent = agent;
                }
            }
        }
    }

    return bestAgent ?? AGENTS[0]; // Default to Atlas
}

/**
 * Returns contextual page description for the system prompt.
 * This tells the agent what the user is currently looking at.
 */
export function getPageContext(pathname: string): string {
    const contextMap: Record<string, string> = {
        '/regime-active': 'The user is on the Regime Active page, which shows the current live macro regime determined by the state machine, along with the key metrics driving it (REY, EYP, Real 10Y, Real 3M, Real M2). The active regime is displayed prominently with entry date and the trigger conditions.',
        '/regime-guide': 'The user is on the Regime Guide page, which explains the six regime families, their entry/exit triggers, the precedence order, and what each regime means for asset allocation.',
        '/trend-pressure': 'The user is on the Trend Pressure page, which shows the S&P 500 flow/trend analysis — 200MA direction, trend stage (Early/Established/Mature/Late), divergence pressure, and the risk label (Continuation/Pullback/Distribution/etc).',
        '/context': 'The user is on the Regime Context page, which shows additional context around the current regime — supporting metrics, cross-asset confirmation, and broader macro backdrop.',
        '/cockpit': 'The user is on the Cockpit page — the main dashboard overview showing the current regime state, key metrics at a glance, and the overall macro positioning signal.',
        '/signals': 'The user is on the Signals page, which breaks down individual signal components (System Stress, Real Earnings Yield, Equity Warning/Sell/Breakdown/Danger, Growth Signal, Equity Value, Normal).',
        '/signals/system-stress': 'The user is viewing the System Stress signal — a composite signal that measures financial system pressure.',
        '/signals/real-earnings-yield': 'The user is viewing the Real Earnings Yield signal — a key valuation signal comparing earnings yield to inflation.',
        '/signals/equity-warning': 'The user is viewing the Equity Warning signal.',
        '/signals/equity-sell': 'The user is viewing the Equity Sell signal.',
        '/signals/equity-breakdown': 'The user is viewing the Equity Breakdown signal.',
        '/signals/equity-danger': 'The user is viewing the Equity Danger signal.',
        '/signals/growth-regime': 'The user is viewing the Growth Signal.',
        '/signals/equity-value': 'The user is viewing the Equity Value signal.',
        '/markets': 'The user is on the Markets page, showing broad market performance data and asset returns across different regimes.',
        '/markets/highlights': 'The user is viewing Market Highlights — key market observations and notable moves.',
        '/markets/asset-returns': 'The user is viewing Asset Returns — performance comparison across asset classes.',
        '/markets/us-annual-returns': 'The user is viewing US Annual Returns — year-by-year S&P 500 and asset performance.',
        '/chart': 'The user is on the Charts page, exploring interactive market charts.',
        '/matrix': 'The user is on the Matrix page — the signal matrix showing how multiple metrics align.',
        '/matrix/historical': 'The user is viewing the Historical Matrix — how the signal matrix looked across history.',
        '/matrix/decades': 'The user is viewing the Decades Matrix — regime and signal patterns broken down by decade.',
        '/matrix/percentile': 'The user is viewing the Percentile Matrix — current metric readings ranked against history.',
        '/matrix/similar': 'The user is viewing Similar Periods — historical dates with conditions most similar to today.',
        '/regime/historical': 'The user is on the Regime Timeline page, showing the full history of regime classifications from 1960 to present.',
        '/regime/returns': 'The user is on the Regime Returns page, showing asset return statistics broken down by regime period.',
        '/12-year-cycle': 'The user is on the 12-Year Cycle page, exploring the macro reconfiguration cycle theory and each of the seven cycles since 1948.',
        '/case-study/gold-flip': 'The user is viewing the Gold Flip case study.',
        '/case-study/oil-flip': 'The user is viewing the Oil Flip case study.',
        '/case-study/japan': 'The user is viewing the Japan case study.',
        '/case-study/inflation': 'The user is viewing the Inflation case study.',
        '/insights/major-events/1971-gold-depeg': 'The user is viewing the 1971 Gold Depeg — when Nixon ended the Bretton Woods gold standard.',
        '/insights/major-events/1970s-inflation': 'The user is viewing the 1970s Inflation Trap case study.',
        '/insights/mechanics/debt-reduction': 'The user is viewing the Debt Reduction mechanics explainer.',
        '/insights/mechanics/inverted-yield-curve': 'The user is viewing the Inverted Yield Curve mechanics explainer.',
        '/framework': 'The user is on the Framework page, exploring the Capital Physics framework architecture.',
        '/framework/process': 'The user is viewing the Process section — how to work through the framework step by step.',
        '/framework/o1-signal': 'The user is viewing the O1 Signal — the macro regime layer of the framework.',
        '/framework/o2-swing': 'The user is viewing the O2 Swing — the flow/trend layer of the framework.',
        '/framework/o3-story': 'The user is viewing the O3 Story — the narrative/thesis layer of the framework.',
        '/os-framework': 'The user is on the OS Framework page — the operating system view of the entire Capital Physics framework.',
        '/data-input': 'The user is on the Data Input page, where macro data is entered and managed.',
        '/perspectives/wealth-distribution': 'The user is viewing the Wealth Distribution perspective.',
        '/perspectives/hedge-funds': 'The user is viewing the Hedge Funds perspective.',
    };

    // Find the longest matching prefix
    let bestContext = '';
    let bestLength = -1;

    for (const [key, ctx] of Object.entries(contextMap)) {
        if ((pathname === key || pathname.startsWith(key + '/')) && key.length > bestLength) {
            bestLength = key.length;
            bestContext = ctx;
        }
    }

    return bestContext || `The user is navigating the Capital Physics macro framework application (current path: ${pathname}).`;
}
