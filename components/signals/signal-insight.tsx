interface SignalInsightProps {
    insight: string;
}

export default function SignalInsight({ insight }: SignalInsightProps) {
    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Key Insight</h2>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
                <p className="text-sm">{insight}</p>
            </div>
        </section>
    );
}
