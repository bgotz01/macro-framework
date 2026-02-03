'use client';

import Timeline, { TimelineEvent } from './timeline';

// Example usage of the Timeline component with different configurations

// Compact timeline for sidebar or smaller spaces
export const CompactTimeline = () => {
    const events: TimelineEvent[] = [
        {
            date: '2008-09-15',
            title: 'Lehman Brothers Collapse',
            impact: 'high',
            category: 'Financial Crisis'
        },
        {
            date: '2008-10-03',
            title: 'TARP Signed',
            description: 'Emergency Economic Stabilization Act',
            impact: 'high',
            value: '$700B',
            category: 'Government Response'
        }
    ];

    return (
        <Timeline
            events={events}
            title="2008 Financial Crisis"
            compact={true}
            showCategories={false}
        />
    );
};

// Full timeline with all features
export const DetailedTimeline = () => {
    const events: TimelineEvent[] = [
        {
            date: '1929-10-24',
            title: 'Black Thursday',
            description: 'Stock market crash begins with massive selling on Wall Street',
            impact: 'high',
            category: 'Market Crash'
        },
        {
            date: '1929-10-29',
            title: 'Black Tuesday',
            description: 'Stock market loses 12% in a single day, panic selling ensues',
            impact: 'high',
            value: '-12',
            valueUnit: '%',
            category: 'Market Crash'
        },
        {
            date: '1933-03-04',
            title: 'FDR Inaugurated',
            description: 'Franklin D. Roosevelt becomes president, promises New Deal',
            impact: 'medium',
            category: 'Political Response'
        }
    ];

    return (
        <Timeline
            events={events}
            title="The Great Depression Timeline"
            showCategories={true}
            compact={false}
        />
    );
};

// Simple timeline without categories
export const SimpleTimeline = () => {
    const events: TimelineEvent[] = [
        {
            date: '2020-03-11',
            title: 'WHO Declares Pandemic',
            description: 'COVID-19 officially declared a global pandemic',
            impact: 'high'
        },
        {
            date: '2020-03-16',
            title: 'Fed Cuts Rates to Zero',
            description: 'Emergency rate cut to support economy',
            impact: 'high',
            value: '0',
            valueUnit: '%'
        }
    ];

    return (
        <Timeline
            events={events}
            showCategories={false}
        />
    );
};