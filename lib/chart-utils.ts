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

        // For each year, find the first data point in that year
        for (let year = startYear; year <= endYear; year++) {
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
