interface SignalTriggerProps {
    trigger: string | string[];
}

export default function SignalTrigger({ trigger }: SignalTriggerProps) {
    const isMultiLine = Array.isArray(trigger) && trigger.length > 3;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">
                {isMultiLine ? 'Prerequisites' : 'Trigger Condition'}
            </h2>
            <div className="bg-muted/30 p-4 rounded font-mono text-sm space-y-1">
                {Array.isArray(trigger) ? (
                    trigger.map((line, i) => <div key={i}>{line || '\u00A0'}</div>)
                ) : (
                    <div>{trigger}</div>
                )}
            </div>
            {isMultiLine && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Trigger Condition</h3>
                    <div className="bg-muted/30 p-4 rounded font-mono text-sm">
                        {Array.isArray(trigger) && trigger[trigger.length - 1]}
                    </div>
                </div>
            )}
        </section>
    );
}
