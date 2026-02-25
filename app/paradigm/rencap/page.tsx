export default function RenCapPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Synthesis • Market Regimes
                </div>
                <h1 className="page-title text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    RenCap
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Structured Market Regimes
                </p>
            </div>

            <div className="space-y-8">
                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h2 className="text-2xl font-bold text-card-foreground mb-6">The Approach</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            Clear classification of market environments based on growth and inflation dynamics.
                            A systematic framework for positioning across different macro conditions.
                        </p>
                    </div>
                </div>

                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h2 className="text-2xl font-bold text-card-foreground mb-6">Key Lessons</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p className="text-lg italic">
                            Markets operate in distinct regimes. Know which one you're in and position accordingly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
