'use client';

import { useState } from 'react';
import { zodiacAnimals } from '@/lib/zodiac';

export default function TwelveYearCycle() {
    const [ratYear, setRatYear] = useState<number>(2008);

    return (
        <div>
            {/* Dropdown to select Rat year */}
            <div className="mb-6 flex items-center justify-center gap-3">
                <label htmlFor="rat-year" className="text-sm font-medium">
                    Rat Year (Cycle Start):
                </label>
                <select
                    id="rat-year"
                    value={ratYear}
                    onChange={(e) => setRatYear(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg border border-border bg-background text-foreground font-medium"
                >
                    <option value={2008}>2008</option>
                    <option value={2020}>2020</option>
                </select>
            </div>

            {/* The 12-Year Cycle Grid - matching the Select an Animal styling */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {zodiacAnimals.map((animal, index) => {
                    const year = ratYear + index;

                    return (
                        <div
                            key={animal.name}
                            className="p-6 rounded-2xl border-2 border-border bg-card flex flex-col items-center gap-2"
                        >
                            <div className="text-4xl">
                                {animal.emoji}
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground">
                                {year}
                            </div>
                            <div className="text-sm font-semibold">{animal.name}</div>
                            <div className="text-xs text-muted-foreground text-center">
                                {animal.theme}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
