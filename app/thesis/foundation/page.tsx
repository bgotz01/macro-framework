import Link from 'next/link'
import Image from 'next/image'

export default function FoundationChapter() {
    return (
        <div className="prose prose-lg max-w-none">
            <div className="mb-8">
                <Link href="/thesis" className="text-blue-600 hover:text-blue-800 text-sm">
                    ← Back to Thesis Home
                </Link>
            </div>

            <h1>Chapter 1: Foundation</h1>

            <p className="text-xl text-gray-600 mb-8">
                Understanding the fundamental principles that drive market behavior and economic cycles.
            </p>

            <h2>The Core Premise</h2>

            <p>
                Markets are not random walks but follow predictable patterns driven by human psychology,
                economic fundamentals, and structural forces. These patterns manifest across different
                time horizons and asset classes, creating opportunities for systematic investment approaches.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Key Insight</h3>
                <p className="text-blue-800 mb-0">
                    "The four most dangerous words in investing are: 'This time is different.'"
                    - Sir John Templeton
                </p>
            </div>

            <h2>The Three Pillars</h2>

            <p>Our framework rests on three fundamental pillars:</p>

            <h3>1. Cyclical Nature of Markets</h3>
            <p>
                Markets move in cycles driven by credit expansion and contraction, demographic shifts,
                technological innovation, and policy responses. Understanding these cycles allows us to
                position portfolios for different phases.
            </p>

            <h3>2. Regime-Based Thinking</h3>
            <p>
                Economic environments can be categorized into distinct regimes characterized by different
                combinations of growth and inflation. Each regime favors different asset classes and
                investment strategies.
            </p>

            <h3>3. Quantitative Framework</h3>
            <p>
                While intuition and experience matter, systematic analysis of data provides the foundation
                for consistent decision-making. Our framework combines multiple quantitative indicators
                with qualitative assessment.
            </p>

            <div className="my-12 p-6 bg-gray-50 rounded-lg">
                <h3>Chapter Sections</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 not-prose">
                    <Link
                        href="/thesis/foundation/market-cycles"
                        className="block p-4 bg-white rounded border hover:shadow-md transition-shadow"
                    >
                        <h4 className="font-semibold text-gray-900">Market Cycles</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Understanding the anatomy of market cycles
                        </p>
                    </Link>

                    <Link
                        href="/thesis/foundation/economic-indicators"
                        className="block p-4 bg-white rounded border hover:shadow-md transition-shadow"
                    >
                        <h4 className="font-semibold text-gray-900">Economic Indicators</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Key metrics for regime identification
                        </p>
                    </Link>

                    <Link
                        href="/thesis/foundation/asset-classes"
                        className="block p-4 bg-white rounded border hover:shadow-md transition-shadow"
                    >
                        <h4 className="font-semibold text-gray-900">Asset Classes</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            How different assets behave in various regimes
                        </p>
                    </Link>
                </div>
            </div>

            <div className="flex justify-between items-center mt-12 pt-6 border-t">
                <Link
                    href="/thesis"
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Previous: Introduction
                </Link>
                <Link
                    href="/thesis/market-regimes"
                    className="text-blue-600 hover:text-blue-800"
                >
                    Next: Market Regimes →
                </Link>
            </div>
        </div>
    )
}