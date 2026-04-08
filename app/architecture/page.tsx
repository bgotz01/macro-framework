export default function ArchitecturePage() {
    const layers = [
        {
            number: "01",
            label: "Regime",
            sublabel: "monthly",
            description: "Defines the environment",
            color: "text-blue-400",
            details: null,
        },
        {
            number: "02",
            label: "Strategy Selection",
            sublabel: "the core idea",
            description: "Different strategies per regime — not one strategy for all markets.",
            color: "text-emerald-400",
            details: null,
        },
        {
            number: "03",
            label: "Daily Trading System",
            sublabel: "inside each regime",
            description: "Each regime runs its own universe, its own signals, and its own rules.",
            color: "text-violet-400",
            details: null,
        },
    ];

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-16">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">System Design</p>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Architecture</h1>
                <p className="text-muted-foreground">This is now elite-level</p>
            </div>

            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[2.35rem] top-0 bottom-0 w-px bg-border/50" />

                <div className="space-y-0">
                    {layers.map((layer, i) => (
                        <div key={i} className="relative flex gap-8 pb-14 last:pb-0">
                            {/* Number bubble */}
                            <div className="relative z-10 flex-shrink-0 w-[4.7rem] flex justify-center">
                                <div className={`w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold ${layer.color}`}>
                                    {layer.number}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-1.5 flex-1">
                                <div className="flex items-baseline gap-3 mb-1">
                                    <h2 className="text-xl font-semibold text-card-foreground">{layer.label}</h2>
                                    <span className="text-xs text-muted-foreground">{layer.sublabel}</span>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">{layer.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
