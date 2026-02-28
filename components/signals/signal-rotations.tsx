interface RotationOption {
    condition?: string;
    title: string;
    description: string;
    note?: string;
}

interface SignalRotationsProps {
    rotations: RotationOption[];
}

export default function SignalRotations({ rotations }: SignalRotationsProps) {
    const hasConditions = rotations.some(r => r.condition);

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">
                {hasConditions ? 'Recommended Rotation (depends on bonds)' : 'Recommended Rotation'}
            </h2>
            <div className="space-y-4">
                {rotations.map((rot, i) => (
                    <div key={i} className="bg-muted/30 border border-border rounded-lg p-4">
                        {rot.condition && <p className="text-sm font-semibold mb-2">{rot.condition}</p>}
                        <h3 className="font-semibold mb-2">{rot.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{rot.description}</p>
                        {rot.note && (
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">{rot.condition ? 'Example' : 'When'}:</span> {rot.note}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
