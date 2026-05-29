import MetricsList from '@/components/metrics-list';
import PageHeader from '@/components/page-header';

const metrics = [
    {
        id: 'inflation',
        title: '1. Inflation',
        question: 'Is purchasing power stable or eroding?',
        observableVia: [
            'CPI (headline + core)',
            'Direction matters more than level',
        ],
        stateEncoding: ['Falling', 'Stable', 'Rising'],
        whyItBelongs: [
            'Everyone understands inflation',
            'It directly constrains policy',
            'It defines real vs nominal returns',
            'It is foundational to cost of capital',
            'Non-negotiable',
        ],
    },
    {
        id: 'bond-yields',
        title: '2. Bond Yields (Long Rates)',
        question: 'What is the market-imposed cost of capital?',
        observableVia: [
            '10Y Treasury (or equivalent sovereign)',
            'Real yields (optional secondary)',
        ],
        stateEncoding: [
            'Falling / Stable / Rising',
            'Low / Medium / High (relative to history)',
        ],
        whyItBelongs: [
            'Sets discount rates',
            'Drives equity duration',
            'Governs leverage viability',
            'This is the spine of the regime',
        ],
    },
    {
        id: 'policy-rate',
        title: '3. Policy Rate (Fed Funds / Central Bank Rate)',
        question: 'Is policy accommodative or restrictive?',
        observableVia: [
            'Target rate level',
            'Direction of change',
        ],
        stateEncoding: [
            'Cutting / Paused / Hiking',
            'Restrictive vs Accommodative (relative to inflation)',
        ],
        whyItBelongs: [
            'Explicit policy stance',
            'Easy to explain',
            'Anchors expectations',
        ],
        notes: 'Policy rate ≠ bond yields. That distinction is critical and intuitive.',
    },
    {
        id: 'equity-valuation',
        title: '4. Equity Valuation',
        question: 'How much future is priced in?',
        observableVia: [
            'Index-level P/E',
            'Earnings yield vs bond yield',
            'Percentiles, not absolutes',
        ],
        stateEncoding: ['Cheap / Fair / Expensive (relative)'],
        whyItBelongs: [
            'Everyone understands valuation',
            'It frames fragility vs resilience',
            'It conditions future returns without predicting them',
            'This is where "low cost of capital" becomes visible',
        ],
    },
    {
        id: 'equity-volatility',
        title: '5. Equity Volatility (Realized, Rolling Std Dev)',
        question: 'Are markets calm or stressed?',
        observableVia: [
            '63 / 126 / 252 day realized volatility',
            'Percentiles',
        ],
        stateEncoding: ['Compressed / Normal / Elevated'],
        whyItBelongs: [
            'It reflects experienced stress',
            'It activates correlation + liquidity risk',
            'It matters for decision constraints, not returns',
            'We already aligned on how to do this correctly',
        ],
    },
    {
        id: 'equity-revenue-growth',
        title: '6. Equity Revenue Growth',
        question: 'Is growth real, or financial?',
        observableVia: [
            'Aggregate index revenue growth',
            'Direction + persistence',
        ],
        stateEncoding: ['Accelerating / Trend / Slowing'],
        whyItBelongs: [
            'Anchors markets to fundamentals',
            'Distinguishes earnings-driven from multiple-driven markets',
            'Very intuitive for advisors and clients',
            'This is a huge differentiator vs price-only macro tools',
        ],
    },
    {
        id: 'gdp-growth',
        title: '7. GDP Growth (Optional, Slow Anchor)',
        question: 'What is the real economy doing?',
        observableVia: [
            'Real GDP growth (QoQ / YoY)',
        ],
        stateEncoding: ['Expanding / Trend / Contracting'],
        whyItBelongs: [
            'Familiar',
            'Slow-moving',
            'Lagging but stabilizing',
        ],
        notes: 'Use as context and confirmation, not a trigger.',
    },
    {
        id: 'monetary-base',
        title: '8. Monetary Base / Balance Sheet (Optional but Powerful)',
        question: 'Is liquidity being added or removed systemically?',
        observableVia: [
            'Central bank balance sheet',
            'Directional change',
        ],
        stateEncoding: ['Expanding / Flat / Contracting'],
        whyItBelongs: [
            'Explains valuation regimes',
            'Explains correlation behavior',
            'Explains asset inflation vs real growth',
            'This is how you ground "liquidity regime" in something concrete',
        ],
    },
    {
        id: 'government-policy',
        title: '9. Government Policy (Qualitative Override)',
        question: 'Are there exogenous political shocks?',
        observableVia: [
            'Fiscal stimulus',
            'Trade restrictions',
            'Industrial policy',
            'Regulatory intervention',
            'Capital controls',
            'Emergency measures',
        ],
        stateEncoding: [
            'Binary or categorical flag',
            'Time-stamped',
            'Explicitly labeled as "override"',
        ],
        whyItBelongs: [
            'Some regime shifts are political, not market-driven',
            'Markets react after policy, not before',
            'Pretending this is quantifiable is dishonest',
            'This is where human judgment belongs',
        ],
        notes: 'This is not a metric. It is an exogenous shock layer.',
    },
];

export default function RegimePage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <PageHeader title="REGIME METRICS" subtitle="Foundational variables that define market regimes" />

            {/* Introduction */}
            <div className="mb-12 p-6 rounded-2xl bg-muted/30 border border-border/50">
                <p className="text-foreground leading-relaxed mb-4">
                    These metrics form the input layer of the regime framework. They are not predictions—they are constraints.
                    Each metric answers a specific question about the current state of markets and policy.
                </p>
                <p className="text-muted-foreground text-sm">
                    Click on any metric to expand and see the details: what it measures, how to observe it,
                    how to encode its state, and why it belongs in the framework.
                </p>
            </div>

            {/* Metrics List */}
            <MetricsList metrics={metrics} />

            {/* Footer Note */}
            <div className="mt-12 p-6 rounded-2xl bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Key Principle
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    These are input variables (constraints and valuations), not output variables (prices).
                    Bond yields are to bonds what P/E is to equities—they are valuation metrics, not the assets themselves.
                </p>
            </div>
        </div>
    );
}
