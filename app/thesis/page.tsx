import Link from 'next/link'
import Image from 'next/image'

export default function ThesisHome() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1>The Macro Framework Thesis</h1>

            <p className="text-xl text-gray-600 mb-8">
                A comprehensive guide to understanding market cycles, economic regimes,
                and the framework for navigating macro investment decisions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-3">Chapter 1: Foundation</h3>
                    <p className="text-gray-600 mb-4">
                        Understanding the basic principles of macro investing and market cycles.
                    </p>
                    <Link
                        href="/thesis/foundation"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Read Chapter →
                    </Link>
                </div>

                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-3">Chapter 2: Market Regimes</h3>
                    <p className="text-gray-600 mb-4">
                        How to identify and navigate different economic and market environments.
                    </p>
                    <Link
                        href="/thesis/market-regimes"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Read Chapter →
                    </Link>
                </div>

                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-3">Chapter 3: Cycles & Timing</h3>
                    <p className="text-gray-600 mb-4">
                        Understanding long-term cycles and their impact on asset allocation.
                    </p>
                    <Link
                        href="/thesis/cycles-timing"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Read Chapter →
                    </Link>
                </div>

                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-3">Chapter 4: Implementation</h3>
                    <p className="text-gray-600 mb-4">
                        Practical application of the framework in portfolio construction.
                    </p>
                    <Link
                        href="/thesis/implementation"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Read Chapter →
                    </Link>
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
                <h2>About This Thesis</h2>
                <p>
                    This thesis presents a systematic approach to macro investing based on decades
                    of market observation and analysis. Each chapter builds upon the previous,
                    creating a comprehensive framework for understanding and navigating financial markets.
                </p>
                <p>
                    The framework combines quantitative analysis with qualitative insights,
                    providing both theoretical foundation and practical application guidance.
                </p>
            </div>
        </div>
    )
}