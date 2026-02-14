'use client';

import { TWELVE_YEAR_CYCLES } from '@/data/twelve-year-cycles';

export default function TwelveYearSystemTable() {
    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">12-Year Cycles — System Reconfiguration View</h2>
                <p className="text-muted-foreground">
                    Major structural shifts in the global economic and financial system
                </p>
            </div>

            {TWELVE_YEAR_CYCLES.map((cycle) => (
                <div
                    key={cycle.year}
                    className="p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300"
                >
                    {/* Header */}
                    <div className="mb-6 pb-4 border-b border-border">
                        <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-4xl font-bold text-primary">{cycle.year}</span>
                            <span className="text-xl font-semibold text-card-foreground">—</span>
                            <h3 className="text-2xl font-bold text-card-foreground">{cycle.title}</h3>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* System Anchor */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                            <h4 className="text-sm font-bold text-card-foreground mb-3 uppercase tracking-wide">
                                System Anchor
                            </h4>
                            <ul className="space-y-2">
                                {cycle.systemAnchor.map((item, idx) => (
                                    <li key={idx} className="text-sm text-card-foreground flex items-center">
                                        <span className="text-muted-foreground mr-2">•</span>
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
                                    <li key={idx} className="text-sm text-card-foreground flex items-center">
                                        <span className="text-muted-foreground mr-2">•</span>
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
                                    <li key={idx} className="text-sm text-card-foreground flex items-center">
                                        <span className="text-muted-foreground mr-2">•</span>
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
                                    <li key={idx} className="text-sm text-card-foreground flex items-center">
                                        <span className="text-muted-foreground mr-2">•</span>
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
            ))}
        </div>
    );
}
