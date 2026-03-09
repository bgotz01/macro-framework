'use client';

import { useState } from 'react';
import EquitiesChart from '@/components/charts/equities-chart';

const NEGATIVE_REY_DATES = [
    { date: '1968-10-01', label: 'Oct 1968' },
    { date: '1973-06-01', label: 'Jun 1973' },
    { date: '1979-02-01', label: 'Feb 1979' },
    { date: '1989-06-01', label: 'Jun 1989' },
    { date: '1996-12-01', label: 'Dec 1996' },
    { date: '2000-01-01', label: 'Jan 2000' },
    { date: '2004-11-01', label: 'Nov 2004' },
    { date: '2007-11-01', label: 'Nov 2007' },
    { date: '2021-03-01', label: 'Mar 2021' },
];

export default function NegativeREYPerformance() {
    const [selectedDate, setSelectedDate] = useState(NEGATIVE_REY_DATES[0].date);

    // Calculate end date (2 years after selected date)
    const startDate = new Date(selectedDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 24);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const selectedLabel = NEGATIVE_REY_DATES.find(d => d.date === selectedDate)?.label || '';

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">
                    Select Date When REY Went Negative
                </label>
                <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                    {NEGATIVE_REY_DATES.map((item) => (
                        <option key={item.date} value={item.date}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="text-sm text-muted-foreground mb-4">
                    Showing S&P 500 performance from {selectedLabel} through the next 2 years
                </div>
                <EquitiesChart
                    key={selectedDate}
                    height={400}
                    initialAssetClass="equities"
                    initialSeries="US/GSPC"
                    initialStartDate={startDateStr}
                    initialEndDate={endDateStr}
                    hideControls={true}
                />
            </div>
        </div>
    );
}

