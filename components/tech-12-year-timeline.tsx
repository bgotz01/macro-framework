export default function Tech12YearTimeline() {
    const events = [
        { year: 1948, title: "Compute as Control", subtitle: "Feedback & systems thinking" },
        { year: 1960, title: "Institutional Mainframes", subtitle: "Centralized enterprise IT" },
        { year: 1972, title: "Edge Compute & Markets", subtitle: "Microprocessors + electronic trading" },
        { year: 1984, title: "Personal Computing Stack", subtitle: "PCs, GUIs, naming layers" },
        { year: 1996, title: "Internet Platforms", subtitle: "Web distribution & discovery" },
        { year: 2008, title: "Mobile–Cloud Rails", subtitle: "Apps, global distribution, hyperscale" },
        { year: 2020, title: "Algorithms & Chains", subtitle: "Attention, machine cognition, crypto rails" },
    ];

    return (
        <>
            {/* Desktop/Tablet Horizontal Timeline */}
            <div className="hidden sm:block w-full overflow-x-auto py-8">
                <div className="min-w-max px-4">
                    <div className="relative flex items-center justify-between gap-8">
                        {/* Timeline line */}
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200" />

                        {events.map((event, index) => (
                            <div key={event.year} className="relative flex flex-col items-center min-w-[140px]">
                                {/* Dot */}
                                <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-lg z-10 mb-4" />

                                {/* Year */}
                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">{event.year}</div>

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

            {/* Mobile Vertical Timeline */}
            <div className="block sm:hidden py-4">
                <div className="relative px-4">
                    {/* Vertical timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-purple-400 to-purple-200" />

                    {events.map((event, index) => (
                        <div key={event.year} className="relative flex items-start mb-8 last:mb-0">
                            {/* Dot */}
                            <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-lg z-10 mr-4 mt-1 flex-shrink-0" />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {/* Year */}
                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">{event.year}</div>

                                {/* Title */}
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    {event.title}
                                </div>

                                {/* Subtitle */}
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {event.subtitle}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
