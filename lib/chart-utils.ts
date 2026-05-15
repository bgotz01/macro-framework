/**
 * Generate tick marks for the start of each year using actual data points
 * @param chartData Array of data points with date field
 * @returns Array of date strings from actual data near January of each year
 */
export function generateYearlyTicks(chartData: Array<{ date: string | number }>): string[] | undefined {
    if (!chartData || chartData.length === 0) return undefined;

    try {
        const startDate = new Date(chartData[0].date);
        const endDate = new Date(chartData[chartData.length - 1].date);

        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return undefined;
        }

        const ticks: string[] = [];
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        const yearSpan = endYear - startYear;

        // Determine interval based on date range for consistent spacing
        let interval: number;
        if (yearSpan <= 10) {
            interval = 1; // Every year
        } else if (yearSpan <= 30) {
            interval = 2; // Every 2 years
        } else if (yearSpan <= 50) {
            interval = 5; // Every 5 years
        } else {
            interval = 10; // Every 10 years
        }

        // For each interval year, find the first data point in that year
        for (let year = startYear; year <= endYear; year += interval) {
            // Find first data point in this year
            const yearStart = `${year}-01`;
            const dataPoint = chartData.find(d => {
                const dateStr = typeof d.date === 'string' ? d.date : new Date(d.date).toISOString();
                return dateStr.startsWith(yearStart);
            });

            if (dataPoint) {
                const dateStr = typeof dataPoint.date === 'string'
                    ? dataPoint.date
                    : new Date(dataPoint.date).toISOString().split('T')[0];
                ticks.push(dateStr);
            }
        }

        // Only include the last year if it aligns with the interval
        // This prevents inconsistent spacing at the end of the chart
        const lastYearStart = `${endYear}-01`;
        const shouldIncludeLastYear = (endYear - startYear) % interval === 0;

        if (shouldIncludeLastYear) {
            const lastDataPoint = chartData.find(d => {
                const dateStr = typeof d.date === 'string' ? d.date : new Date(d.date).toISOString();
                return dateStr.startsWith(lastYearStart);
            });

            if (lastDataPoint && !ticks.some(t => t.startsWith(`${endYear}-`))) {
                const dateStr = typeof lastDataPoint.date === 'string'
                    ? lastDataPoint.date
                    : new Date(lastDataPoint.date).toISOString().split('T')[0];
                ticks.push(dateStr);
            }
        }

        // If we didn't find enough ticks, fall back to evenly spaced ticks
        if (ticks.length < 2) {
            const interval = Math.max(1, Math.floor(chartData.length / 10));
            return chartData
                .filter((_, index) => index % interval === 0)
                .map(d => typeof d.date === 'string' ? d.date : new Date(d.date).toISOString().split('T')[0]);
        }

        return ticks;
    } catch (error) {
        console.error('Error generating yearly ticks:', error);
        return undefined;
    }
}

/**
 * Generate tick marks for the start of each month (or every N months) using actual data points.
 * Automatically reduces density for longer date ranges to avoid crowding.
 * @param chartData Array of data points with date field
 * @returns Array of date strings from actual data near the 1st of each tick month
 */
export function generateMonthlyTicks(chartData: Array<{ date: string | number }>): string[] | undefined {
    if (!chartData || chartData.length === 0) return undefined;

    try {
        const startDate = new Date(chartData[0].date + 'T00:00:00');
        const endDate = new Date(chartData[chartData.length - 1].date + 'T00:00:00');

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return undefined;

        const totalMonths =
            (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            (endDate.getMonth() - startDate.getMonth());

        // Pick a tick interval (in months) so we get roughly 6–14 ticks
        let interval: number;
        if (totalMonths <= 12) {
            interval = 1;
        } else if (totalMonths <= 24) {
            interval = 2;
        } else if (totalMonths <= 48) {
            interval = 3;
        } else if (totalMonths <= 96) {
            interval = 6;
        } else {
            interval = 12;
        }

        const ticks: string[] = [];
        let year = startDate.getFullYear();
        let month = startDate.getMonth(); // 0-indexed

        while (year < endDate.getFullYear() || (year === endDate.getFullYear() && month <= endDate.getMonth())) {
            const mm = String(month + 1).padStart(2, '0');
            const prefix = `${year}-${mm}`;

            const dataPoint = chartData.find(d => {
                const dateStr = typeof d.date === 'string' ? d.date : new Date(d.date).toISOString().split('T')[0];
                return dateStr.startsWith(prefix);
            });

            if (dataPoint) {
                const dateStr = typeof dataPoint.date === 'string'
                    ? dataPoint.date
                    : new Date(dataPoint.date).toISOString().split('T')[0];
                ticks.push(dateStr);
            }

            month += interval;
            while (month >= 12) {
                month -= 12;
                year += 1;
            }
        }

        if (ticks.length < 2) {
            // Fallback: evenly spaced
            const step = Math.max(1, Math.floor(chartData.length / 10));
            return chartData
                .filter((_, i) => i % step === 0)
                .map(d => typeof d.date === 'string' ? d.date : new Date(d.date).toISOString().split('T')[0]);
        }

        return ticks;
    } catch (error) {
        console.error('Error generating monthly ticks:', error);
        return undefined;
    }
}
