interface RegimeTrackerProps {
    label: string;
    value: number | null;
    metricLabel: string;
    centerLabel?: boolean;
    getStatus: (value: number | null) => {
        emoji: string;
        label: string;
        description: string;
        colorClass: string;
    };
}

export default function RegimeTracker({ label, value, metricLabel, centerLabel = false, getStatus }: RegimeTrackerProps) {
    const status = getStatus(value);

    return (
        <div className="flex flex-col gap-2">
            <div className={`text-sm font-bold text-foreground ${centerLabel ? 'text-center' : ''}`}>{label}</div>
            <div className={`px-4 py-3 rounded-lg border-2 ${status.colorClass}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold mb-1">
                            {status.emoji} {status.label}
                        </div>
                        <div className="text-xs opacity-80">
                            {status.description}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">{metricLabel}</div>
                        <div className="text-sm font-bold">
                            {value !== null ? `${value.toFixed(2)}%` : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
