'use client';

import { format, parseISO } from 'date-fns';

export interface TimelineEvent {
    date: string; // ISO date string (YYYY-MM-DD)
    title: string;
    description?: string;
    impact?: 'high' | 'medium' | 'low';
    category?: string;
    value?: string | number; // For displaying specific values like rates, prices, etc.
    valueUnit?: string; // Unit for the value (%, $, etc.)
}

interface TimelineProps {
    events: TimelineEvent[];
    title?: string;
    className?: string;
    showCategories?: boolean;
    compact?: boolean;
    horizontal?: boolean;
}

const IMPACT_COLORS = {
    high: 'bg-red-500 border-red-600',
    medium: 'bg-yellow-500 border-yellow-600',
    low: 'bg-green-500 border-green-600'
};

const IMPACT_TEXT_COLORS = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600'
};

export default function Timeline({
    events,
    title,
    className = '',
    showCategories = false,
    compact = false,
    horizontal = false
}: TimelineProps) {
    // Sort events by date
    const sortedEvents = [...events].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const formatEventDate = (dateStr: string) => {
        try {
            const date = parseISO(dateStr);
            return format(date, 'MMM d, yyyy');
        } catch {
            return dateStr;
        }
    };

    const getImpactDot = (impact?: string) => {
        const impactLevel = impact as keyof typeof IMPACT_COLORS || 'medium';
        return IMPACT_COLORS[impactLevel] || IMPACT_COLORS.medium;
    };

    const getImpactTextColor = (impact?: string) => {
        const impactLevel = impact as keyof typeof IMPACT_TEXT_COLORS || 'medium';
        return IMPACT_TEXT_COLORS[impactLevel] || IMPACT_TEXT_COLORS.medium;
    };

    return (
        <div className={`${className}`}>
            {title && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-card-foreground mb-2">{title}</h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                </div>
            )}

            {horizontal ? (
                // Horizontal Timeline
                <div className="relative">
                    {/* Horizontal timeline line */}
                    <div className="absolute top-8 left-0 right-0 h-0.5 bg-border"></div>

                    {/* Events */}
                    <div className="flex justify-between items-start relative">
                        {sortedEvents.map((event, index) => (
                            <div key={index} className="flex flex-col items-center max-w-xs">
                                {/* Timeline dot */}
                                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-4 ${getImpactDot(event.impact)} shadow-sm mb-4`}>
                                    <div className="absolute inset-2 bg-white rounded-full"></div>
                                </div>

                                {/* Event content */}
                                <div className="text-center">
                                    <div className="p-4 rounded-xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300">
                                        {/* Date */}
                                        <time className="text-xs font-medium text-primary block mb-2">
                                            {formatEventDate(event.date)}
                                        </time>

                                        {/* Title and value */}
                                        <h3 className="font-semibold text-card-foreground text-sm mb-2">
                                            {event.title}
                                        </h3>

                                        {event.value && (
                                            <div className="font-bold text-primary text-lg mb-2">
                                                {event.value}{event.valueUnit}
                                            </div>
                                        )}

                                        {/* Category */}
                                        {event.category && showCategories && (
                                            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                                                {event.category}
                                            </span>
                                        )}

                                        {/* Description */}
                                        {event.description && (
                                            <p className="text-muted-foreground text-xs mt-2">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Vertical Timeline (existing layout)
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>

                    {/* Events */}
                    <div className="space-y-6">
                        {sortedEvents.map((event, index) => (
                            <div key={index} className="relative flex items-start">
                                {/* Timeline dot */}
                                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-4 ${getImpactDot(event.impact)} shadow-sm`}>
                                    <div className="absolute inset-2 bg-white rounded-full"></div>
                                </div>

                                {/* Event content */}
                                <div className={`ml-6 ${compact ? 'pb-4' : 'pb-8'}`}>
                                    <div className={`p-6 rounded-2xl border border-border/50 bg-card hover:shadow-elegant transition-all duration-300 ${compact ? 'p-4' : ''}`}>
                                        {/* Date and category */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <time className="text-sm font-medium text-primary">
                                                    {formatEventDate(event.date)}
                                                </time>
                                                {event.category && showCategories && (
                                                    <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                                                        {event.category}
                                                    </span>
                                                )}
                                            </div>
                                            {event.impact && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactTextColor(event.impact)} bg-current/10`}>
                                                    {event.impact} impact
                                                </span>
                                            )}
                                        </div>

                                        {/* Title and value */}
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className={`font-semibold text-card-foreground ${compact ? 'text-base' : 'text-lg'}`}>
                                                {event.title}
                                            </h3>
                                            {event.value && (
                                                <div className="text-right ml-4">
                                                    <div className={`font-bold text-primary ${compact ? 'text-lg' : 'text-xl'}`}>
                                                        {event.value}{event.valueUnit}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {event.description && (
                                            <p className={`text-muted-foreground ${compact ? 'text-sm' : ''}`}>
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Timeline end marker */}
                    <div className="relative flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-4 border-muted bg-muted/50">
                            <div className="absolute inset-2 bg-muted rounded-full"></div>
                        </div>
                        <div className="ml-6">
                            <div className="text-sm text-muted-foreground italic">
                                Timeline continues...
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}