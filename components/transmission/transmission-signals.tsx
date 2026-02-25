export default function TransmissionSignals() {
    return (
        <div className="mb-16">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Primary Shock Sources</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Two authorities control the macro environment through distinct transmission channels
                </p>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monetary Authority */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-4 text-xl">
                            M
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                Monetary Authority
                            </h3>
                            <p className="text-blue-700 dark:text-blue-300 font-medium">
                                Central Bank
                            </p>
                        </div>
                    </div>

                    {/* Shock Types */}
                    <div className="mb-8">
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            Shock Types
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-sm">Rate hikes / cuts</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-sm">Balance sheet expansion / contraction</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-sm">Emergency facilities (QE, QE-lite, backstops)</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            This Controls
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-400 mr-3"></div>
                                <span className="text-sm font-medium">Cost of capital</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-400 mr-3"></div>
                                <span className="text-sm font-medium">Liquidity availability</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-400 mr-3"></div>
                                <span className="text-sm font-medium">Duration math</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-400 mr-3"></div>
                                <span className="text-sm font-medium">Leverage viability</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fiscal Authority */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-2xl p-8 border-2 border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mr-4 text-xl">
                            F
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                Fiscal / Structural Authority
                            </h3>
                            <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                                Government
                            </p>
                        </div>
                    </div>

                    {/* Shock Types */}
                    <div className="mb-8">
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                            Shock Types
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-sm">Fiscal spending / austerity</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-sm">Tax regimes</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-sm">Trade policy (WTO entry, tariffs, sanctions)</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-sm">Regulation / deregulation</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-sm">Industrial policy (subsidies, reshoring)</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
                        <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                            This Controls
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-emerald-400 mr-3"></div>
                                <span className="text-sm font-medium">Nominal demand</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-emerald-400 mr-3"></div>
                                <span className="text-sm font-medium">Profit pools</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-emerald-400 mr-3"></div>
                                <span className="text-sm font-medium">Capital flows</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-emerald-400 mr-3"></div>
                                <span className="text-sm font-medium">Sectoral winners/losers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}