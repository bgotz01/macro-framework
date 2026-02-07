'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { zodiacAnimals } from '@/lib/zodiac';

export default function ZodiacNav() {
    const pathname = usePathname();

    return (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border mb-8">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <Link
                        href="/chinese"
                        className="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                        ← Overview
                    </Link>
                    <div className="h-6 w-px bg-border flex-shrink-0" />
                    {zodiacAnimals.map((animal, index) => {
                        const isActive = pathname === animal.path;
                        return (
                            <Link
                                key={animal.name}
                                href={animal.path}
                                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-0.5">
                                    <div>
                                        <span className="mr-1">{animal.emoji}</span>
                                        {animal.name}
                                    </div>
                                    <div className="text-xs opacity-60">{index + 1}</div>
                                    <div className="text-xs opacity-50 text-center max-w-[120px] leading-tight">
                                        {animal.theme}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
