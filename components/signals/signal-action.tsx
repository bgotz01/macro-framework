interface SignalActionProps {
    rotation: {
        title: string;
        description: string;
        bullets: string[];
    };
}

export default function SignalAction({ rotation }: SignalActionProps) {
    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Recommended Action</h2>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{rotation.title}</h3>
                {rotation.description && (
                    <p className="text-sm text-muted-foreground mb-3">{rotation.description}</p>
                )}
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {rotation.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span>•</span>
                            <span>{bullet}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
