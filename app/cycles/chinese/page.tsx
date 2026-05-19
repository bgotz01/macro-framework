'use client';

import { useRouter } from 'next/navigation';
import TwelveYearCycle from '@/components/zodiac/twelve-year-cycle';
import { zodiacAnimals } from '@/lib/zodiac';

export default function ChinesePage() {
    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="page-title text-3xl mb-1">
                    Chinese Zodiac Market Regime Framework
                </h1>
                <p className="page-subtitle">
                    12 archetypal market regimes mapped to zodiac animals
                </p>
            </div>



            {/* Zodiac Navigation */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-6">Select an Animal</h2>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {zodiacAnimals.map((animal) => (
                        <button
                            key={animal.name}
                            onClick={() => router.push(animal.path)}
                            className="p-6 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all duration-200 flex flex-col items-center gap-2 group"
                        >
                            <div className="text-4xl group-hover:scale-110 transition-transform">
                                {animal.emoji}
                            </div>
                            <div className="text-sm font-semibold">{animal.name}</div>
                            <div className="text-xs text-muted-foreground text-center">
                                {animal.theme}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 12-Year Cycle Display */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-6">The 12-Year Cycle</h2>
                <TwelveYearCycle />
            </div>

            {/* Introduction */}
            <div className="mt-16 p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                <h3 className="text-2xl font-bold mb-4">About This Framework</h3>
                <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                    Each zodiac animal represents a distinct market regime archetype — not a prediction,
                    but a pattern language for understanding how markets reconfigure, expand, compress,
                    and reset across cycles.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                    Click any animal above to explore its core theme, behavioral signature,
                    and historical manifestations.
                </p>
            </div>
        </div>
    );
}
