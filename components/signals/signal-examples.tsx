interface SignalExamplesProps {
    examples: string[];
}

export default function SignalExamples({ examples }: SignalExamplesProps) {
    if (examples.length === 0) return null;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Historical Examples</h2>
            <ul className="space-y-2 text-muted-foreground">
                {examples.map((example, i) => (
                    <li key={i}>• {example}</li>
                ))}
            </ul>
        </section>
    );
}
