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
                    <h3 className="text-lg font-semibold mb-3">Guide</h3>
                    <p className="text-gray-600 mb-4">
                        The operating system view of regimes, playbooks, and outlier-driven decisions.
                    </p>
                    <Link
                        href="/guide"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Open Guide →
                    </Link>
                </div>

                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-3">Cycles</h3>
                    <p className="text-gray-600 mb-4">
                        Explore the long-wave, business, debt, and credit cycle pages that are already live.
                    </p>
                    <Link
                        href="/cycles"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Explore Cycles →
                    </Link>
                </div>

                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold mb-3">Cockpit</h3>
                    <p className="text-gray-600 mb-4">
                        Jump from the thesis into the live regime, signal, and market-state dashboard.
                    </p>
                    <Link
                        href="/cockpit"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Open Cockpit →
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
