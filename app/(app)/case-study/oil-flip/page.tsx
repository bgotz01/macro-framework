'use client';

import PageHeader from '@/components/page-header';

export default function OilFlipPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                <div className="space-y-10">

                    {/* Header */}
                    <PageHeader title="OIL REGIME FLIP" subtitle="Control of Supply Determines Price" />

                    {/* Symmetrical Columns */}
                    <section className="grid md:grid-cols-2 gap-6">

                        {/* LEFT */}
                        <div className="rounded-3xl border border-border/60 bg-card p-8 lg:p-10 space-y-8">

                            {/* Header */}
                            <div className="text-center space-y-3">
                                <p className="text-2xl font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
                                    1960s
                                </p>
                                <h2 className="text-3xl font-semibold tracking-tight">
                                    Companies control oil flow
                                </h2>
                            </div>

                            {/* Control Details */}
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                                    Decide how much oil to produce
                                </div>
                                <div className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                                    Control transport, refining, and distribution
                                </div>
                                <div className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                                    Countries receive royalties but not control
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border/50" />

                            {/* Incentive */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Incentive
                                </p>
                                <p className="text-lg font-semibold">Expand supply</p>
                                <p className="text-sm text-muted-foreground">Grow demand</p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border/50" />

                            {/* Price */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Price
                                </p>
                                <p className="text-lg font-semibold">Low & stable</p>
                                <p className="text-sm text-muted-foreground">~$3/barrel</p>
                            </div>

                        </div>

                        {/* RIGHT */}
                        <div className="rounded-3xl border border-border/60 bg-card p-8 lg:p-10 space-y-8">

                            {/* Header */}
                            <div className="text-center space-y-3">
                                <p className="text-2xl font-bold uppercase tracking-[0.18em] text-muted-foreground/40">
                                    1970s
                                </p>
                                <h2 className="text-3xl font-semibold tracking-tight">
                                    Countries control oil flow
                                </h2>
                            </div>

                            {/* Control Details */}
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                                    Take control of production
                                </div>
                                <div className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                                    Coordinate supply through OPEC
                                </div>
                                <div className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                                    Restrict output when needed
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border/50" />

                            {/* Incentive */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Incentive
                                </p>
                                <p className="text-lg font-semibold">Restrict supply</p>
                                <p className="text-sm text-muted-foreground">Maximize price</p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border/50" />

                            {/* Price */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Price
                                </p>
                                <p className="text-lg font-semibold">High & volatile</p>
                                <p className="text-sm text-muted-foreground">$3 → $12 → $40</p>
                            </div>

                        </div>

                    </section>

                </div>
            </div>
        </div>
    );
}
