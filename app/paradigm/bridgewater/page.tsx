export default function BridgewaterPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">
                    Bridgewater
                </h1>
                <p className="page-subtitle">
                    Historical Macro Study
                </p>
                <div className="mt-3 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            </div>

            <div className="space-y-8">
                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h2 className="text-2xl font-bold text-card-foreground mb-6">The Approach</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            Deep analysis of economic history, identifying patterns across decades and centuries.
                            Understanding how debt cycles, policy responses, and structural forces shape long-term outcomes.
                        </p>
                    </div>
                </div>

                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h2 className="text-2xl font-bold text-card-foreground mb-6">Key Lessons</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p className="text-lg italic">
                            History doesn't repeat, but it rhymes. Study the past to understand the present.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
