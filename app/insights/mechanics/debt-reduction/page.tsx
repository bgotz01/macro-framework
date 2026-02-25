export default function DebtReductionPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-4xl font-bold mb-8">The Two Release Valves</h1>

            {/* Visual Flow Diagram */}
            <div className="mb-12 bg-card border rounded-lg p-8">
                <div className="flex flex-col items-center gap-8">
                    {/* Starting Point */}
                    <div className="bg-primary text-primary-foreground rounded-lg px-8 py-4 text-center">
                        <h3 className="text-2xl font-bold">Debt Reduction</h3>
                        <p className="text-sm mt-1">Two Pathways</p>
                    </div>

                    {/* Arrows Container */}
                    <div className="flex items-start justify-center gap-16 w-full max-w-5xl">
                        {/* Left Path - Default */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="flex flex-col items-center mb-4">
                                <svg className="w-8 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>

                            <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-6 w-full">
                                <div className="text-center mb-3">
                                    <span className="text-3xl">1️⃣</span>
                                    <h3 className="text-xl font-bold mt-2">Default / Restructuring</h3>
                                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                                        If debt is foreign owned
                                    </p>
                                </div>

                                <div className="bg-card rounded-md p-3 mb-3">
                                    <p className="text-sm font-semibold mb-1">Debt is written down or not paid</p>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="font-medium">Immediate effects:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>Credit contracts</li>
                                        <li>Spending falls</li>
                                        <li>Asset prices drop</li>
                                        <li>Banks pull back</li>
                                    </ul>
                                </div>

                                <div className="mt-4 bg-destructive/20 rounded-md p-3">
                                    <p className="font-bold text-sm">👉 Deflationary at first</p>
                                    <p className="text-xs mt-1">Money disappears when loans are written off</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Path - Inflation */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="flex flex-col items-center mb-4">
                                <svg className="w-8 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>

                            <div className="bg-orange-500/10 border-2 border-orange-500 rounded-lg p-6 w-full">
                                <div className="text-center mb-3">
                                    <span className="text-3xl">2️⃣</span>
                                    <h3 className="text-xl font-bold mt-2">Inflation / Monetization</h3>
                                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                                        If debt is domestically owned
                                    </p>
                                </div>

                                <div className="bg-card rounded-md p-3 mb-3">
                                    <p className="text-sm font-semibold mb-1">Debt is paid back in weaker money</p>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="font-medium">Immediate effects:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>Money supply expands</li>
                                        <li>Real value of debt falls</li>
                                        <li>Nominal incomes rise</li>
                                        <li>Savers lose purchasing power</li>
                                    </ul>
                                </div>

                                <div className="mt-4 bg-orange-500/20 rounded-md p-3">
                                    <p className="font-bold text-sm">👉 Inflationary by design</p>
                                    <p className="text-xs mt-1">Central banks print to prevent default</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
