import TransmissionSignals from '@/components/transmission/transmission-signals';

export default function TransmissionEnginePage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Framework • Transmission Mechanics
                </div>
                <h1 className="page-title text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    Transmission Engine
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    The six channels through which macro shocks propagate into company-level outcomes
                </p>
            </div>

            {/* Introduction */}
            <div className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
                <p className="text-lg leading-relaxed">
                    When a macro shock hits—tariffs, rate hikes, energy spikes, AI capability jumps—it doesn't affect all companies equally.
                    The <strong>Transmission Engine</strong> maps the six distinct channels through which these shocks propagate into real business outcomes.
                </p>
            </div>

            {/* Transmission Signals */}
            <TransmissionSignals />

            {/* The 6 Rails */}
            <div className="space-y-12">
                {/* A) Revenue Transmission */}
                <div className="border-l-4 border-green-500 pl-6">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-4 text-lg">
                            A
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Revenue Transmission</h2>
                            <p className="text-sm text-muted-foreground">Who gets paid more/less</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-base mb-3">
                            <strong>Mechanism:</strong> Demand shift, pricing power shift, market access changes
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border">
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-green-600 dark:text-green-400">
                            Track in framework terms:
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Demand elasticity:</strong> does end demand fall/rise?</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Pricing power:</strong> can prices reset upward/downward?</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Market access:</strong> can you still sell there? (tariffs/sanctions)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Substitution:</strong> do customers switch to alternatives?</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* B) Cost Transmission */}
                <div className="border-l-4 border-orange-500 pl-6">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold mr-4 text-lg">
                            B
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Cost Transmission</h2>
                            <p className="text-sm text-muted-foreground">Input shock + bargaining power</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-base mb-3">
                            <strong>Mechanism:</strong> Input prices move + ability to pass through changes
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border">
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-orange-600 dark:text-orange-400">
                            Framework levers:
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Energy intensity</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Labor intensity</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Commodity intensity</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Compute intensity</strong> (now a real input)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Supply chain fragility</strong> (single-source risk)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* C) Balance Sheet Transmission */}
                <div className="border-l-4 border-red-500 pl-6">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center font-bold mr-4 text-lg">
                            C
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Balance Sheet Transmission</h2>
                            <p className="text-sm text-muted-foreground">Assets/liabilities repriced</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-base mb-3">
                            <strong>Mechanism:</strong> Discount rate reset, refinancing stress, asset write-downs
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border">
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-red-600 dark:text-red-400">
                            Framework levers:
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Floating-rate sensitivity</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Refinancing wall timing</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Asset duration</strong> (long-duration cashflows get crushed)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Collateral sensitivity</strong> (mark-to-market assets)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Off-balance-sheet exposure</strong> (leases, derivatives)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* D) Capital & Discount Rate Transmission */}
                <div className="border-l-4 border-purple-500 pl-6">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mr-4 text-lg">
                            D
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Capital & Discount Rate Transmission</h2>
                            <p className="text-sm text-muted-foreground">Missing-but-critical rail</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-base mb-3">
                            Even if operations are unchanged, the required return changes.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border">
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-purple-600 dark:text-purple-400">
                            Framework levers:
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Equity duration</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Risk premia expansion/compression</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Cost of capital vs ROIC</strong></span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* E) FX & Cross-Border Transmission */}
                <div className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-4 text-lg">
                            E
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">FX & Cross-Border Transmission</h2>
                            <p className="text-sm text-muted-foreground">Currency and trade flows</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-base mb-3">
                            <strong>Mechanism:</strong> Competitiveness shifts, translation effects, capital flows
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border">
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            Framework levers:
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>USD up/down regime</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>FX mismatch</strong> (revenues vs costs vs debt)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Imported inflation</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Competitiveness</strong> (exporters/importers)</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* F) New Industries & Substitution */}
                <div className="border-l-4 border-pink-500 pl-6">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold mr-4 text-lg">
                            F
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">New Industries & Substitution</h2>
                            <p className="text-sm text-muted-foreground">Capability shock rail</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-base mb-3">
                            This is your AI agents example.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border">
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-pink-600 dark:text-pink-400">
                            Framework levers:
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Cost-to-produce collapses</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Time-to-build collapses</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Coordination costs collapse</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Regulatory perimeter shifts</strong></span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2">
                <h2 className="text-2xl font-bold mb-4">Why This Matters</h2>
                <p className="text-base leading-relaxed mb-4">
                    Most macro analysis stops at "rates are rising" or "tariffs are coming." But the real question is:
                    <strong> which companies get hit, and through which channel?</strong>
                </p>
                <p className="text-base leading-relaxed">
                    A retailer with floating-rate debt faces <strong>Balance Sheet Transmission</strong>.
                    An exporter to China faces <strong>Revenue Transmission</strong> via market access.
                    A software company with long-duration cashflows faces <strong>Discount Rate Transmission</strong>.
                    Same macro shock, completely different transmission paths.
                </p>
            </div>
        </div>
    );
}
