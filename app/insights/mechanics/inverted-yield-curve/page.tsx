export default function InvertedYieldCurvePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">INVERTED YIELD CURVE</h1>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl text-muted-foreground mb-8">
                    An inverted yield curve is one of the most important macro warning signals in finance.
                    It doesn&apos;t predict what will break—but it reliably signals that the system is under strain.
                </p>

                {/* What it is */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">What it is</h2>
                    <p className="mb-4">
                        Normally, investors demand higher yields for longer-term bonds because of inflation and uncertainty.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                        <li><strong>Normal curve:</strong> Long-term rates &gt; short-term rates</li>
                        <li><strong>Inverted curve:</strong> Short-term rates &gt; long-term rates</li>
                    </ul>
                    <p className="font-semibold">That inversion is the signal.</p>
                </section>

                {/* Why it matters */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">Why it matters (the deep logic)</h2>

                    <div className="space-y-6">
                        <div className="bg-card border rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-3">1. It reflects expectations of economic slowdown</h3>
                            <p className="mb-3">Markets are effectively saying:</p>
                            <blockquote className="border-l-4 border-primary pl-4 italic mb-3">
                                &quot;Rates are high now, but they won&apos;t stay high—because growth won&apos;t hold.&quot;
                            </blockquote>
                            <p className="mb-2">Investors rush into long-term bonds (pushing long yields down) because they expect:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Slower growth</li>
                                <li>Falling inflation</li>
                                <li>Future rate cuts</li>
                            </ul>
                        </div>

                        <div className="bg-card border rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-3">2. It breaks the banking model</h3>
                            <p className="mb-3">Banks borrow short-term and lend long-term.</p>
                            <ul className="list-none space-y-2 mb-3">
                                <li>✅ Normal curve → banks profit → credit flows</li>
                                <li>❌ Inverted curve → banks get squeezed → lending slows</li>
                            </ul>
                            <p className="font-semibold">
                                Credit contraction is how financial stress becomes real economic pain.
                            </p>
                        </div>

                        <div className="bg-card border rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-3">3. It signals policy overtightening</h3>
                            <p className="mb-2">Historically, inversions appear when:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                                <li>Central banks raise short-term rates aggressively</li>
                                <li>Financial conditions tighten faster than the economy can absorb</li>
                            </ul>
                            <p className="font-semibold">It&apos;s a sign the system is being forced to slow.</p>
                        </div>
                    </div>
                </section>

                {/* Historical track record */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">Historical track record</h2>
                    <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="mr-2">📊</span>
                                <span>Every US recession in the last ~50 years was preceded by a yield curve inversion</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">⏱️</span>
                                <span>The recession usually comes 6–24 months later</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">⚠️</span>
                                <span>The inversion itself does not cause the recession—it reveals fragility</span>
                            </li>
                        </ul>
                        <p className="mt-4 font-semibold">
                            This is why it&apos;s watched more than almost any other macro indicator.
                        </p>
                    </div>
                </section>

                {/* What it does not mean */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">What it does not mean (important)</h2>
                    <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-6">
                        <ul className="space-y-2">
                            <li>❌ It does not mean &quot;recession tomorrow&quot;</li>
                            <li>❌ It does not give market timing</li>
                            <li>❌ It does not guarantee severity</li>
                        </ul>
                        <p className="mt-4 italic">
                            Think of it as a stress fracture X-ray, not the collapse itself.
                        </p>
                    </div>
                </section>

                {/* Practical takeaway */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">Practical takeaway</h2>
                    <div className="bg-card border-2 rounded-lg p-6">
                        <p className="mb-3">When the yield curve inverts, the question shifts from:</p>
                        <div className="space-y-3">
                            <div className="pl-4 border-l-4 border-muted">
                                <p className="text-muted-foreground">&quot;Is growth strong?&quot;</p>
                            </div>
                            <div className="text-center font-bold">↓</div>
                            <div className="pl-4 border-l-4 border-primary">
                                <p className="font-semibold">
                                    &quot;Where is the hidden leverage—and who cannot survive slower time?&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
