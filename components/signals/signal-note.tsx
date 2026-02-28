interface SignalNoteProps {
    note: string;
}

export default function SignalNote({ note }: SignalNoteProps) {
    return (
        <section>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
                <p className="text-sm">
                    <span className="font-semibold">Important:</span> {note}
                </p>
            </div>
        </section>
    );
}
