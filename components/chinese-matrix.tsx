interface ZodiacYear {
    year: number;
    animal: string;
    element: string;
}

interface MatrixCell {
    label: string;
    description?: string;
}

interface ChineseMatrixProps {
    title: string;
    subtitle: string;
    levels: [
        { label: string; value: string; color: 'green' | 'yellow' | 'red' },
        { label: string; value: string; color: 'green' | 'yellow' | 'red' },
        { label: string; value: string; color: 'green' | 'yellow' | 'red' }
    ];
    cells: {
        rangebound: [MatrixCell, MatrixCell, MatrixCell];
        trending: [MatrixCell, MatrixCell, MatrixCell];
        explosive: [MatrixCell, MatrixCell, MatrixCell];
    };
    insight?: string;
}

const colorClasses = {
    green: 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100',
    yellow: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100',
    red: 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100',
};

// Chinese Zodiac cycle (12 animals × 5 elements = 60-year cycle)
const zodiacAnimals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const zodiacElements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

function getZodiacYear(year: number): ZodiacYear {
    const animalIndex = (year - 4) % 12;
    const elementIndex = Math.floor(((year - 4) % 10) / 2);
    return {
        year,
        animal: zodiacAnimals[animalIndex],
        element: zodiacElements[elementIndex]
    };
}

export default function ChineseMatrix({
    title,
    subtitle,
    levels,
    cells,
    insight
}: ChineseMatrixProps) {
    const currentYear = new Date().getFullYear();
    const zodiac = getZodiacYear(currentYear);

    return (
        <div className="mb-12">
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{title}</h2>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Current Year</div>
                        <div className="text-2xl font-bold text-primary">
                            {currentYear}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {zodiac.element} {zodiac.animal}
                        </div>
                    </div>
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
                                Rangebound
                            </th>
                            <th className="border border-border p-3 text-center font-bold text-base">
                                Trending
                            </th>
                            <th className="border border-border p-3 text-center font-bold text-base">
                                Explosive
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {levels.map((level, idx) => (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                <td className={`border border-border p-3 font-bold ${colorClasses[level.color]}`}>
                                    <div className="text-base mb-1">{level.label}</div>
                                    <div className="text-xs font-normal opacity-75">{level.value}</div>
                                </td>
                                <td className="border border-border p-3 text-center">
                                    <div className="font-semibold text-base">{cells.rangebound[idx].label}</div>
                                    {cells.rangebound[idx].description && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {cells.rangebound[idx].description}
                                        </div>
                                    )}
                                </td>
                                <td className="border border-border p-3 text-center">
                                    <div className="font-semibold text-base">{cells.trending[idx].label}</div>
                                    {cells.trending[idx].description && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {cells.trending[idx].description}
                                        </div>
                                    )}
                                </td>
                                <td className="border border-border p-3 text-center">
                                    <div className="font-semibold text-base">{cells.explosive[idx].label}</div>
                                    {cells.explosive[idx].description && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {cells.explosive[idx].description}
                                        </div>
                                    )}
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
