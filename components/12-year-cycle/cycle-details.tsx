'use client';

import { getCycleByYear, CycleData } from '@/lib/twelve-year-cycles';

interface CycleDetailsProps {
    year: number;
}

export default function CycleDetails({ year }: CycleDetailsProps) {
    const cycle = getCycleByYear(year);

    if (!cycle) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-border/50 bg-card p-6">
            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* System Anchor */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                        System Anchor
                    </h4>
                    <ul className="space-y-2">
                        {cycle.systemAnchor.map((item, idx) => (
                            <li key={idx} className="text-sm text-card-foreground flex items-start">
                                <span className="text-muted-foreground mr-2 mt-0.5">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Core Themes */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                        Core Themes
                    </h4>
                    <ul className="space-y-2">
                        {cycle.coreThemes.map((item, idx) => (
                            <li key={idx} className="text-sm text-card-foreground flex items-start">
                                <span className="text-muted-foreground mr-2 mt-0.5">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Capital Behavior */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                        Capital Behavior
                    </h4>
                    <ul className="space-y-2">
                        {cycle.capitalBehavior.map((item, idx) => (
                            <li key={idx} className="text-sm text-card-foreground flex items-start">
                                <span className="text-muted-foreground mr-2 mt-0.5">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Best Performing Assets */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                        Best Performing Assets
                    </h4>
                    <ul className="space-y-2">
                        {cycle.bestPerformingAssets.map((item, idx) => (
                            <li key={idx} className="text-sm text-card-foreground flex items-start">
                                <span className="text-muted-foreground mr-2 mt-0.5">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Hidden Risk - Full Width */}
                <div className="md:col-span-2 p-4 rounded-xl bg-muted/30 border border-border/30">
                    <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                        Hidden Risk
                    </h4>
                    <ul className="flex flex-wrap gap-3">
                        {cycle.hiddenRisk.map((item, idx) => (
                            <li key={idx} className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm text-card-foreground font-medium">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
