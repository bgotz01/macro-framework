import TwelveYearCycleTable from '@/components/twelve-year-cycle-table';
import TwelveYearOTable from '@/components/twelve-year-o-table';
import TwelveYearSystemTable from '@/components/twelve-year-system-table';
import TwelveYearSummary from '@/components/twelve-year-summary';
import WhyTwelve from '@/components/why-twelve';

export default function TwelveYearCyclePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-4xl font-bold mb-6">12-Year Macro Reconfiguration Cycles</h1>

            <div className="mb-12">
                <p className="text-xl mb-6">Each 12-year cycle does one primary job:</p>

                {/* One-Line Summaries */}
                <div className="mb-8">
                    <TwelveYearSummary />
                </div>

                {/* Expanded Table */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Expanded Overview</h2>
                    <TwelveYearCycleTable />
                </div>

                {/* System Reconfiguration Table */}
                <div className="mb-8">
                    <TwelveYearSystemTable />
                </div>

                {/* O-Framework Table */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">OS-Framework Analysis</h2>
                    <TwelveYearOTable />
                </div>

                {/* Visual Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <a href="#cycle-1948" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1948</div>
                        <div className="text-sm font-semibold mb-2">Institutional Reconstruction</div>
                        <div className="text-xs italic text-muted-foreground">Order rebuilt after collapse</div>
                    </a>

                    <a href="#cycle-1960" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1960</div>
                        <div className="text-sm font-semibold mb-2">Institutional Capital & Brand Consolidation</div>
                        <div className="text-xs italic text-muted-foreground">Permanence as an investment thesis</div>
                    </a>

                    <a href="#cycle-1972" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1972</div>
                        <div className="text-sm font-semibold mb-2">Fiat Regime Price Discovery</div>
                        <div className="text-xs italic text-muted-foreground">Monetary freedom meets reality</div>
                    </a>

                    <a href="#cycle-1984" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1984</div>
                        <div className="text-sm font-semibold mb-2">Credit Expansion</div>
                        <div className="text-xs italic text-muted-foreground">Leverage becomes the growth engine</div>
                    </a>

                    <a href="#cycle-1996" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">1996</div>
                        <div className="text-sm font-semibold mb-2">Digital Infrastructure</div>
                        <div className="text-xs italic text-muted-foreground">Information → networked → scalable</div>
                    </a>

                    <a href="#cycle-2008" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">2008</div>
                        <div className="text-sm font-semibold mb-2">Monetary Intervention Era</div>
                        <div className="text-xs italic text-muted-foreground">Liquidity replaces price signals</div>
                    </a>

                    <a href="#cycle-2020" className="p-4 rounded-lg border-2 border-border bg-card hover:bg-accent transition-colors">
                        <div className="font-bold text-lg mb-1">2020</div>
                        <div className="text-sm font-semibold mb-2">Digital Economy</div>
                        <div className="text-xs italic text-muted-foreground">Reality goes virtual</div>
                    </a>
                </div>
            </div>

            <div className="space-y-12">
                {/* 1948 */}
                <div id="cycle-1948" className="border-l-4 border-slate-500 pl-6 py-2 scroll-mt-24">
                    <h2 className="text-2xl font-bold mb-2">1948 — Institutional Reconstruction</h2>
                    <p className="text-lg font-semibold mb-4 text-slate-600 dark:text-slate-400">Theme: Order rebuilt after collapse</p>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">What changed</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Post-WWII reconstruction</li>
                            <li>Bretton Woods architecture</li>
                            <li>IMF, World Bank, dollar-as-anchor</li>
                            <li>Strong state capacity, capital controls</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">System effect</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Stability over efficiency</li>
                            <li>Fixed exchange rates</li>
                            <li>Growth driven by rebuilding, not leverage</li>
                        </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                        <p className="font-semibold">Why it matters</p>
                        <p className="italic">This cycle answers: How do you restart a global system after total destruction?</p>
                        <p className="italic mt-1">Everything here is about rules, institutions, and trust.</p>
                    </div>
                </div>

                {/* 1960 */}
                <div id="cycle-1960" className="border-l-4 border-amber-500 pl-6 py-2 scroll-mt-24">
                    <h2 className="text-2xl font-bold mb-2">1960 — Institutional Capital & Brand Consolidation</h2>
                    <p className="text-lg font-semibold mb-4 text-amber-600 dark:text-amber-400">Theme: Permanence as an investment thesis</p>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">This is when:</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Pension funds, insurance companies, endowments become dominant allocators</li>
                            <li>Capital shifts from owner-operators to professional managers</li>
                            <li>"Quality" becomes a strategy, not just a trait</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">What changed</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Rise of large institutional pools of capital</li>
                            <li>Buy-and-hold mentality ("one-decision stocks")</li>
                            <li>Equity investing framed as owning franchises, not trading cycles</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">System effect</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Valuations decouple from near-term earnings</li>
                            <li>Brand + stability command a premium</li>
                            <li>Concentration in perceived winners</li>
                        </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                        <p className="font-semibold">Why it matters</p>
                        <p className="italic">This cycle answers: What assets are safe enough to hold forever?</p>
                        <p className="italic mt-1">That question only exists because institutions need duration.</p>
                    </div>
                </div>

                {/* 1972 */}
                <div id="cycle-1972" className="border-l-4 border-blue-500 pl-6 py-2 scroll-mt-24">
                    <h2 className="text-2xl font-bold mb-2">1972 — Fiat Regime Price Discovery</h2>
                    <p className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">Theme: Monetary freedom meets reality</p>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">What changed</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Gold constraint gone → currencies float</li>
                            <li>No anchor → prices must discover themselves</li>
                            <li>Wages, commodities, FX all reprice violently</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">System effect</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Inflation is not a bug — it's price discovery</li>
                            <li>Governments learn fiat is powerful but unstable</li>
                            <li>Bond markets still enforce discipline</li>
                        </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                        <p className="font-semibold">Why it matters</p>
                        <p className="italic">This cycle answers: What is money worth if it's no longer fixed to anything?</p>
                    </div>
                </div>

                {/* 1984 */}
                <div id="cycle-1984" className="border-l-4 border-purple-500 pl-6 py-2 scroll-mt-24">
                    <h2 className="text-2xl font-bold mb-2">1984 — Credit Expansion</h2>
                    <p className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">Theme: Leverage becomes the growth engine</p>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">What changed</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Inflation defeated → credibility restored</li>
                            <li>Rates begin secular decline</li>
                            <li>Credit replaces productivity as the growth lever</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">System effect</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Debt becomes "safe"</li>
                            <li>Financialization accelerates</li>
                            <li>Balance sheets quietly overtake cash flows</li>
                        </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                        <p className="font-semibold">Why it matters</p>
                        <p className="italic">This is when the system learns: We can grow faster by borrowing from the future.</p>
                    </div>
                </div>

                {/* 1996 */}
                <div id="cycle-1996" className="border-l-4 border-green-500 pl-6 py-2 scroll-mt-24">
                    <h2 className="text-2xl font-bold mb-2">1996 — Digital Infrastructure</h2>
                    <p className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">Theme: Information → networked → scalable</p>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">What changed</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Internet, PCs, enterprise software</li>
                            <li>Supply chains digitized</li>
                            <li>Capital allocation speeds up</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">System effect</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Productivity actually rises (rare!)</li>
                            <li>Winner-take-most dynamics emerge</li>
                            <li>Intangibles start to matter more than plant & equipment</li>
                        </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                        <p className="font-semibold">Why it matters</p>
                        <p className="italic">This cycle builds the rails: Capital, labor, and ideas can now move at network speed.</p>
                        <p className="italic mt-1">This sets up the tech run — but doesn't complete it yet.</p>
                    </div>
                </div>

                {/* 2008 */}
                <div id="cycle-2008" className="border-l-4 border-red-500 pl-6 py-2 scroll-mt-24">
                    <h2 className="text-2xl font-bold mb-2">2008 — Monetary Intervention Era</h2>
                    <p className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">Theme: Liquidity replaces price signals</p>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">What changed</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>QE, zero rates, balance-sheet expansion</li>
                            <li>Markets stabilized by central banks, not fundamentals</li>
                            <li>Parallel response: Bitcoin introduced (opt-out money)</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">System effect</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Asset prices detach from underlying risk</li>
                            <li>Moral hazard becomes structural</li>
                            <li>Money becomes explicitly political</li>
                        </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                        <p className="font-semibold">Why it matters</p>
                        <p className="italic">This answers: What happens when losses are no longer allowed?</p>
                        <p className="italic mt-1">And quietly introduces the exit hatch.</p>
                    </div>
                </div>

                {/* 2020 */}
                <div id="cycle-2020" className="border-l-4 border-orange-500 pl-6 py-2 scroll-mt-24">
                    <h2 className="text-2xl font-bold mb-2">2020 — Digital Economy</h2>
                    <p className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400">Theme: Reality goes virtual</p>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">What changed</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Work, money, media, identity digitize rapidly</li>
                            <li>Fiscal + monetary policy merge</li>
                            <li>Platforms replace institutions</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">System effect</h3>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Intangible dominance (code, brand, networks)</li>
                            <li>Explosive inequality of outcomes</li>
                            <li>Control shifts from balance sheets to attention + compute</li>
                        </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded">
                        <p className="font-semibold">Why it matters</p>
                        <p className="italic">This is when: Economic activity becomes software-native.</p>
                        <p className="italic mt-1">And the system starts running into trust limits again.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
