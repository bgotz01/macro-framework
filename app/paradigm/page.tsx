export default function ParadigmPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Framework • Operating System
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    The O3 Paradigm
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Our Operating System for identifying and capitalizing on market opportunities through the interplay of three fundamental forces.
                </p>
            </div>

            {/* Taglines */}
            <div className="text-center mb-16">
                <div className="space-y-2">
                    <p className="text-lg font-medium text-card-foreground">You spot the Signal.</p>
                    <p className="text-lg font-medium text-card-foreground">You anticipate the Swing.</p>
                    <p className="text-lg font-medium text-card-foreground">You tell the Story.</p>
                </div>
            </div>

            {/* Framework Table */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-8 text-center">The Three Pillars</h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-4 px-6 font-semibold text-card-foreground">Law</th>
                                <th className="text-left py-4 px-6 font-semibold text-card-foreground">Pillar</th>
                                <th className="text-left py-4 px-6 font-semibold text-card-foreground">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-border/50">
                                <td className="py-6 px-6">
                                    <span className="inline-flex items-center px-3 py-1 rounded bg-muted text-muted-foreground text-sm font-medium">O1</span>
                                </td>
                                <td className="py-6 px-6 font-medium text-card-foreground">Signal</td>
                                <td className="py-6 px-6 text-muted-foreground">What is visible, dominant, rewarded, and socially reinforced</td>
                            </tr>
                            <tr className="border-b border-border/50">
                                <td className="py-6 px-6">
                                    <span className="inline-flex items-center px-3 py-1 rounded bg-muted text-muted-foreground text-sm font-medium">O2</span>
                                </td>
                                <td className="py-6 px-6 font-medium text-card-foreground">Swing</td>
                                <td className="py-6 px-6 text-muted-foreground">The counterforce, tension, cyclic pressure, and structural reversal</td>
                            </tr>
                            <tr>
                                <td className="py-6 px-6">
                                    <span className="inline-flex items-center px-3 py-1 rounded bg-muted text-muted-foreground text-sm font-medium">O3</span>
                                </td>
                                <td className="py-6 px-6 font-medium text-card-foreground">Story</td>
                                <td className="py-6 px-6 text-muted-foreground">The meaning layer: how outcomes are explained, remembered, and mythologized</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* The OS Loop */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center">The Full OS Loop</h2>
                <p className="text-center text-muted-foreground mb-8 italic">Non-causal, experiential — Not a flowchart, a lens:</p>

                <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                        <span className="inline-flex items-center px-3 py-1 rounded bg-muted text-muted-foreground text-sm font-medium mt-1">Signal</span>
                        <div>
                            <p className="text-lg font-medium text-card-foreground">"This hurts / breaks / feels wrong"</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <span className="inline-flex items-center px-3 py-1 rounded bg-muted text-muted-foreground text-sm font-medium mt-1">Swing</span>
                        <div>
                            <p className="text-lg font-medium text-card-foreground">"If this persists, structure must adjust"</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <span className="inline-flex items-center px-3 py-1 rounded bg-muted text-muted-foreground text-sm font-medium mt-1">Story</span>
                        <div>
                            <p className="text-lg font-medium text-card-foreground">"Here's why this outcome makes sense"</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Explanation */}
            <div className="p-8 rounded-3xl border border-border/50 bg-card mb-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">How the OS Works</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-3">The Cycle</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Markets and societies operate in cycles driven by the tension between what is obvious (O1) and what is opposite (O2).
                            The stories we tell (O3) shape how we interpret these cycles and prepare for the next swing.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-3">The Opportunity</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            By identifying the dominant signal (O1), recognizing the building counterforce (O2), and understanding
                            the narrative framework (O3), we can position ourselves ahead of major market shifts.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-3">The Operating System</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            This isn't just a framework—it's our Operating System for processing market information,
                            identifying patterns, and making decisions that capitalize on the inevitable swings between extremes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}