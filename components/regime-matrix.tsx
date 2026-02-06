interface MatrixLevel {
    label: string;
    value: string;
    description?: string;
    color: 'green' | 'yellow' | 'red';
}

interface MatrixCell {
    label: string;
}

interface RegimeMatrixProps {
    title: string;
    subtitle: string;
    levels: [MatrixLevel, MatrixLevel, MatrixLevel];
    cells: {
        falling: [MatrixCell, MatrixCell, MatrixCell];
        stable: [MatrixCell, MatrixCell, MatrixCell];
        rising: [MatrixCell, MatrixCell, MatrixCell];
    };
    insight?: string;
    currentValue?: number;
    currentTrend?: 'falling' | 'stable' | 'rising';
    levelThresholds?: { low: number; mid: number };
    valueFormat?: 'percentage' | 'number'; // Add format option
}

const colorClasses = {
    green: 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100',
    yellow: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100',
    red: 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100',
};

export default function RegimeMatrix({
    title,
    subtitle,
    levels,
    cells,
    insight,
    currentValue,
    currentTrend,
    levelThresholds,
    valueFormat = 'percentage' // Default to percentage
}: RegimeMatrixProps) {
    // Determine which level index the current value falls into
    let currentLevelIndex = -1;
    if (currentValue !== undefined && levelThresholds) {
        if (currentValue < levelThresholds.low) {
            currentLevelIndex = 0; // LOW/CHEAP/INVERTED
        } else if (currentValue < levelThresholds.mid) {
            currentLevelIndex = 1; // MID/FAIR/FLAT
        } else {
            currentLevelIndex = 2; // HIGH/EXPENSIVE/STEEP
        }
    }

    // Format the display value
    const formatValue = (value: number) => {
        if (valueFormat === 'number') {
            return value.toFixed(1);
        }
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    return (
        <div className="mb-12">
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{title}</h2>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    {currentValue !== undefined && (
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Current</div>
                            <div className="text-2xl font-bold text-primary">
                                {formatValue(currentValue)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/50 shadow-lg">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                            <th className="border border-border p-3 text-left font-bold text-base">
                                Level
                            </th>
                            <th className="border border-border p-3 text-center font-bold text-base">
                                Falling ↓
                            </th>
                            <th className="border border-border p-3 text-center font-bold text-base">
                                Stable →
                            </th>
                            <th className="border border-border p-3 text-center font-bold text-base">
                                Rising ↑
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {levels.map((level, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                <td className={`border border-border p-3 font-bold ${colorClasses[level.color]}`}>
                                    <div className="text-base mb-1">{level.label}</div>
                                    <div className="text-xs font-normal opacity-75">{level.value}</div>
                                    {level.description && (
                                        <div className="text-xs font-normal opacity-60 italic">{level.description}</div>
                                    )}
                                </td>
                                <td className={`border border-border p-3 text-center ${currentLevelIndex === idx && currentTrend === 'falling'
                                    ? 'bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500 ring-inset'
                                    : ''
                                    }`}>
                                    <div className="font-semibold text-base">{cells.falling[idx].label}</div>
                                </td>
                                <td className={`border border-border p-3 text-center ${currentLevelIndex === idx && currentTrend === 'stable'
                                    ? 'bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500 ring-inset'
                                    : ''
                                    }`}>
                                    <div className="font-semibold text-base">{cells.stable[idx].label}</div>
                                </td>
                                <td className={`border border-border p-3 text-center ${currentLevelIndex === idx && currentTrend === 'rising'
                                    ? 'bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500 ring-inset'
                                    : ''
                                    }`}>
                                    <div className="font-semibold text-base">{cells.rising[idx].label}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {insight && (
                <div className="mt-3 p-3 rounded-lg bg-primary/10 border-l-4 border-primary">
                    <p className="text-xs italic text-muted-foreground">💡 {insight}</p>
                </div>
            )}
        </div>
    );
}
