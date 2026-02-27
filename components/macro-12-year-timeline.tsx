export default function Macro12YearTimeline() {
    const events = [
        { year: 1948, title: "Bretton Woods Order", subtitle: "(rebuild Europe)" },
        { year: 1960, title: "Global Brands", subtitle: "(Nifty Fifty)" },
        { year: 1972, title: "Free-Floating Fiat", subtitle: "(Gold depeg)" },
        { year: 1984, title: "Credit Expansion", subtitle: "(financialization)" },
        { year: 1996, title: "Internet", subtitle: "(digitization)" },
        { year: 2008, title: "Policy-Managed Markets", subtitle: "(print money)" },
        { year: 2020, title: "Intangible Economy", subtitle: "(digital work)" },
    ];

    return (
        <div className="w-full overflow-x-auto py-8">
            <div className="min-w-max px-4">
                <div className="relative flex items-center justify-between gap-8">
                    {/* Timeline line */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

                    {events.map((event, index) => (
                        <div key={event.year} className="relative flex flex-col items-center min-w-[140px]">
                            {/* Dot */}
                            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10 mb-4" />

                            {/* Year */}
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">{event.year}</div>

                            {/* Title */}
                            <div className="text-sm font-semibold text-center text-gray-900 dark:text-gray-100 mb-0.5">
                                {event.title}
                            </div>

                            {/* Subtitle */}
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                {event.subtitle}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
