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
    currentDate?: string;
    ma12?: number; // 1-year moving average
    ma12Date?: string; // Date of the MA12 value
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
    currentDate,
    ma12,
    ma12Date,
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

    // Get level label
    const getLevelLabel = () => {
        if (currentLevelIndex === 0) return levels[0].label;
        if (currentLevelIndex === 1) return levels[1].label;
        if (currentLevelIndex === 2) return levels[2].label;
        return 'UNKNOWN';
    };

    // Get direction label
    const getDirectionLabel = () => {
        if (currentTrend === 'falling') return 'FALLING ↓';
        if (currentTrend === 'rising') return 'RISING ↑';
        return 'STABLE →';
    };

    // Get level color
    const getLevelColor = () => {
        if (currentLevelIndex === -1) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
        return colorClasses[levels[currentLevelIndex].color];
    };

    // Get direction color
    const getDirectionColor = () => {
        if (currentTrend === 'falling') return 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100';
        if (currentTrend === 'rising') return 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100';
        return 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100';
    };

    return (
        <div className="mb-12">
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{title}</h2>
                        <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>

                        {/* Diagnosis */}
                        {currentValue !== undefined && currentLevelIndex !== -1 && (
                            <div className="flex gap-3 items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground">Level:</span>
                                    <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getLevelColor()}`}>
                                        {getLevelLabel()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground">Direction:</span>
                                    <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getDirectionColor()}`}>
                                        {getDirectionLabel()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {currentValue !== undefined && (
                        <div className="flex gap-2">
                            {/* Latest */}
                            <div className="text-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700">
                                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Latest</div>
                                <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                    {formatValue(currentValue)}
                                </div>
                                {currentDate && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                        {new Date(currentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </div>
                                )}
                            </div>

                            {/* 1-Year Moving Average */}
                            {ma12 !== undefined && ma12 !== null && (
                                <div className="text-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-0.5">MA 1yr</div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatValue(ma12)}
                                    </div>
                                    {ma12Date && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                            {new Date(ma12Date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </div>
                                    )}
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-0.5">
                                        {currentValue !== undefined && (
                                            <span className={currentValue > ma12 ? 'text-green-600 dark:text-green-400' : currentValue < ma12 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}>
                                                {currentValue > ma12 ? '↑' : currentValue < ma12 ? '↓' : '→'}
                                                {' '}{Math.abs(currentValue - ma12).toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
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
