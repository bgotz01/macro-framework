export default function Macro12YearTimeline() {
    const events = [
        { year: 1948, title: "Bretton Woods Order", subtitle: "(rebuild Europe)" },
        { year: 1960, title: "Global Brands", subtitle: "(Nifty Fifty)" },
        { year: 1972, title: "Free-Floating Fiat", subtitle: "(Gold depeg)" },
        { year: 1984, title: "Credit Expansion", subtitle: "(financialization)" },
        { year: 1996, title: "Asset Bubble Regime", subtitle: "(Internet & Housing)", highlight: true },
        { year: 2008, title: "Liquidity / QE Era", subtitle: "(policy-managed markets)", highlight: true },
        { year: 2020, title: "Fiscal / Power Consolidation", subtitle: "(AI infrastructure)", highlight: true, current: true },
    ];

    return (
        <div className="w-full overflow-x-auto py-8">
            <div className="min-w-max px-4">
                <div className="relative flex items-center justify-between gap-8">
                    {/* Timeline line */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-muted via-primary/50 to-primary" />

                    {events.map((event) => (
                        <div key={event.year} className="relative flex flex-col items-center min-w-[140px]">
                            {/* Dot */}
                            <div className={`w-3 h-3 rounded-full border-2 border-background shadow-lg z-10 mb-4 ${event.current
                                    ? 'bg-primary ring-2 ring-primary/30'
                                    : event.highlight
                                        ? 'bg-primary'
                                        : 'bg-muted-foreground'
                                }`} />

                            {/* Year */}
                            <div className={`text-lg font-bold mb-1 ${event.current
                                    ? 'text-primary'
                                    : event.highlight
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                }`}>
                                {event.year}
                                {event.current && <span className="text-xs ml-1">•</span>}
                            </div>

                            {/* Title */}
                            <div className={`text-sm font-semibold text-center mb-0.5 ${event.highlight ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                {event.title}
                            </div>

                            {/* Subtitle */}
                            <div className="text-xs text-muted-foreground text-center">
                                {event.subtitle}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
