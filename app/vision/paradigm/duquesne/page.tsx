import PageHeader from '@/components/page-header';

export default function DuquesnePage() {
    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader title="Duquesne" subtitle="Asymmetric Macro Bets" />

            <div className="space-y-8">
                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h2 className="text-2xl font-bold text-card-foreground mb-6">The Approach</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            Druckenmiller's approach to identifying inflection points where risk/reward is heavily skewed.
                            Concentrated positions when conviction meets opportunity.
                        </p>
                    </div>
                </div>

                <div className="p-8 rounded-3xl border border-border/50 bg-card">
                    <h2 className="text-2xl font-bold text-card-foreground mb-6">Key Lessons</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p className="text-lg italic">
                            Wait for the fat pitch. When you see it, swing hard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
