export default function ParadigmPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    Framework • Operating System
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                    The OS Paradigm
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    An Operating System for reading reality: Signal, Swing, Story.
                </p>
            </div>

            {/* Taglines */}
            <div className="text-center mb-16">
                <div className="space-y-2">
                    <p className="text-lg font-medium text-card-foreground">Spot the Signal.</p>
                    <p className="text-lg font-medium text-card-foreground">Anticipate the Swing.</p>
                    <p className="text-lg font-medium text-card-foreground">Write the Story.</p>
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
                                <td className="py-6 px-6 font-medium text-card-foreground">O1 <span className="italic">(obvious)</span></td>
                                <td className="py-6 px-6 font-medium text-card-foreground">Signal</td>
                                <td className="py-6 px-6 text-muted-foreground">The problem is obvious. So is the fix. </td>
                            </tr>
                            <tr className="border-b border-border/50">
                                <td className="py-6 px-6 font-medium text-card-foreground">O2 <span className="italic">(opposite)</span></td>
                                <td className="py-6 px-6 font-medium text-card-foreground">Swing</td>
                                <td className="py-6 px-6 text-muted-foreground">The counterforce. Inversion pressure. The opposite regime unfolds.</td>
                            </tr>
                            <tr>
                                <td className="py-6 px-6 font-medium text-card-foreground">O3 <span className="italic">(outlier)</span></td>
                                <td className="py-6 px-6 font-medium text-card-foreground">Story</td>
                                <td className="py-6 px-6 text-muted-foreground">The winner is the outlier with a new story. That story defines the next era.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>



        </div>
    );
}