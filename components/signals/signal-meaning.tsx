interface SignalMeaningProps {
    meaning: string[];
}

export default function SignalMeaning({ meaning }: SignalMeaningProps) {
    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">What This Means</h2>
            <ul className="space-y-3 text-muted-foreground">
                {meaning.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
