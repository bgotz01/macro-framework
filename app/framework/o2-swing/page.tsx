export default function SwingPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">O2: SWING</h1>
                <p className="page-subtitle">
                    Regime Inversions Through Structural Criteria
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            {/* Criteria */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">Criteria (tests)</h2>

                <div className="space-y-6">
                    {/* Direction Flip */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-start space-x-3 mb-3">
                            <span className="text-2xl">⟜</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-card-foreground mb-2">Direction flip</h3>
                                <p className="text-sm text-muted-foreground">
                                    Does it invert the prior cycle's "winning logic" (what was rewarded becomes penalized)?
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Constraint Reversal */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-start space-x-3 mb-3">
                            <span className="text-2xl">⟜</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-card-foreground mb-2">Constraint reversal</h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Does the binding constraint change?
                                </p>
                                <div className="bg-muted/30 p-3 rounded-xl text-sm">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-muted-foreground">e.g., liquidity</span>
                                        <span className="text-primary">→</span>
                                        <span className="text-card-foreground">funding scarcity</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-muted-foreground">labor abundance</span>
                                        <span className="text-primary">→</span>
                                        <span className="text-card-foreground">labor scarcity</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Relative Rotation */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-card">
                        <div className="flex items-start space-x-3 mb-3">
                            <span className="text-2xl">⟜</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-card-foreground mb-2">Relative rotation</h3>
                                <p className="text-sm text-muted-foreground">
                                    Do the opposite factor baskets outperform for a sustained window (not a one-week move)?
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Examples */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card mb-8">
                <h3 className="text-xl font-bold text-card-foreground mb-4">Examples</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                        <span className="text-muted-foreground">ZIRP / abundant liquidity</span>
                        <span className="text-primary text-lg">→</span>
                        <span className="text-card-foreground">positive real rates / scarce funding</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                        <span className="text-muted-foreground">Globalization</span>
                        <span className="text-primary text-lg">→</span>
                        <span className="text-card-foreground">fragmentation / reshoring</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                        <span className="text-muted-foreground">Growth-at-any-price</span>
                        <span className="text-primary text-lg">→</span>
                        <span className="text-card-foreground">profitability / cash flow</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                        <span className="text-muted-foreground">"Long duration wins"</span>
                        <span className="text-primary text-lg">→</span>
                        <span className="text-card-foreground">"duration is a liability"</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
