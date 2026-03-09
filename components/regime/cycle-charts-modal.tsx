'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CycleChartsModalProps {
    cycleNumber: number;
    cycleTitle: string;
    charts: { name: string; path: string }[];
}

export default function CycleChartsModal({ cycleNumber, cycleTitle, charts }: CycleChartsModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (charts.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Charts ({charts.length})
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsOpen(false)}>
                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-6 py-4">
                            <div>
                                <h2 className="text-xl font-bold">{cycleTitle}</h2>
                                <p className="text-sm text-muted-foreground">Cycle {cycleNumber} Charts</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            {charts.map((chart, idx) => (
                                <div key={idx} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-foreground">{chart.name}</h3>
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                                        <Image
                                            src={chart.path}
                                            alt={chart.name}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
