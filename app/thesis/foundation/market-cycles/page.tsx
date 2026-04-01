import Link from 'next/link'
import Image from 'next/image'

export default function MarketCyclesSection() {
    return (
        <div className="prose prose-lg max-w-none">
            <div className="mb-8">
                <Link href="/thesis/foundation" className="text-blue-600 hover:text-blue-800 text-sm">
                    ← Back to Foundation
                </Link>
            </div>

            <h1>Market Cycles</h1>

            <p className="text-xl text-gray-600 mb-8">
                Understanding the anatomy and drivers of market cycles across different time horizons.
            </p>

            <h2>The Cycle Framework</h2>

            <p>
                Market cycles operate on multiple time horizons simultaneously. Understanding these
                nested cycles is crucial for proper positioning and timing decisions.
            </p>

            <h3>Short-term Cycles (3-6 months)</h3>
            <ul>
                <li>Driven by sentiment, technical factors, and short-term economic data</li>
                <li>High volatility and noise</li>
                <li>Useful for tactical adjustments</li>
            </ul>

            <h3>Business Cycles (3-7 years)</h3>
            <ul>
                <li>Driven by credit cycles, inventory adjustments, and policy responses</li>
                <li>Most relevant for asset allocation decisions</li>
                <li>Clear phases: expansion, peak, contraction, trough</li>
            </ul>

            <h3>Long-term Cycles (20-80 years)</h3>
            <ul>
                <li>Driven by demographic shifts, technological innovation, and debt cycles</li>
                <li>Determine secular trends in growth, inflation, and asset returns</li>
                <li>Critical for strategic asset allocation</li>
            </ul>

            <div className="my-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-yellow-800 mb-3">Cycle Interaction</h3>
                <p className="text-yellow-700 mb-0">
                    The key insight is that cycles interact and amplify each other. When short-term,
                    business, and long-term cycles align, the resulting moves can be dramatic and
                    long-lasting.
                </p>
            </div>

            <h2>Identifying Cycle Phases</h2>

            <p>
                Each cycle phase has characteristic features that can be identified through a
                combination of quantitative indicators and qualitative assessment:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
                <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-green-700 mb-3">Expansion Phase</h4>
                    <ul className="text-sm space-y-1">
                        <li>• Rising GDP growth</li>
                        <li>• Declining unemployment</li>
                        <li>• Increasing corporate earnings</li>
                        <li>• Rising asset prices</li>
                        <li>• Optimistic sentiment</li>
                    </ul>
                </div>

                <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-red-700 mb-3">Peak Phase</h4>
                    <ul className="text-sm space-y-1">
                        <li>• Overheating indicators</li>
                        <li>• Rising inflation</li>
                        <li>• Tightening monetary policy</li>
                        <li>• Excessive valuations</li>
                        <li>• Euphoric sentiment</li>
                    </ul>
                </div>

                <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-orange-700 mb-3">Contraction Phase</h4>
                    <ul className="text-sm space-y-1">
                        <li>• Declining GDP growth</li>
                        <li>• Rising unemployment</li>
                        <li>• Falling corporate earnings</li>
                        <li>• Declining asset prices</li>
                        <li>• Pessimistic sentiment</li>
                    </ul>
                </div>

                <div className="border rounded-lg p-6">
                    <h4 className="font-semibold text-blue-700 mb-3">Trough Phase</h4>
                    <ul className="text-sm space-y-1">
                        <li>• Stabilizing indicators</li>
                        <li>• Accommodative policy</li>
                        <li>• Attractive valuations</li>
                        <li>• Capitulation sentiment</li>
                        <li>• Early recovery signs</li>
                    </ul>
                </div>
            </div>

            <h2>Practical Application</h2>

            <p>
                Understanding cycle phases allows for systematic positioning across asset classes.
                The key is to identify transitions early and position accordingly:
            </p>

            <div className="bg-gray-50 rounded-lg p-6 my-8">
                <h3>Asset Allocation by Cycle Phase</h3>
                <div className="mt-4 space-y-3 text-sm">
                    <div><strong>Early Expansion:</strong> Overweight equities, underweight bonds</div>
                    <div><strong>Late Expansion:</strong> Reduce equity exposure, add commodities</div>
                    <div><strong>Early Contraction:</strong> Overweight bonds, reduce risk assets</div>
                    <div><strong>Late Contraction:</strong> Prepare for recovery, add equity exposure</div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-12 pt-6 border-t">
                <Link
                    href="/thesis/foundation"
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back to Foundation
                </Link>
                <Link
                    href="/cycles"
                    className="text-blue-600 hover:text-blue-800"
                >
                    Next: Cycle Library →
                </Link>
            </div>
        </div>
    )
}
