// Utility functions for regime parameters

import type { MetricData } from './regime-parameters-types';

export function emptyMetric(): MetricData {
    return { value: null, percentile: null, date: null };
}

export function formatValue(value: number | null, decimals: number = 2): string {
    if (value === null) return 'N/A';
    return `${value.toFixed(decimals)}%`;
}

export function formatPlainNumber(value: number | null, decimals: number = 2): string {
    if (value === null) return 'N/A';
    return value.toFixed(decimals);
}

export function formatDate(date: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    });
}

export function formatDateFull(date: string | null): string {
    if (!date) return '';
    // Parse as UTC to avoid timezone shifting the day
    const [year, month, day] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]}-${day}-${year}`;
}

export function formatPercentile(p: number | null): string {
    if (p === null) return 'N/A';
    return `${p.toFixed(0)}%`;
}

/**
 * 5-band colors matching the scoring system
 * No semantic meaning beyond percentile position.
 *
 * invertQuartiles:
 * false => 0-20% bright green, 20-40% green, 40-60% blue, 60-80% yellow, 80-100% red
 * true  => reversed
 */
export function getQuartileStyles(
    percentile: number | null,
    invertQuartiles: boolean = false
): { border: string; text: string } {
    if (percentile === null) {
        return {
            border: 'border-gray-300 dark:border-gray-700',
            text: 'text-gray-500 dark:text-gray-400'
        };
    }

    const normal = [
        {
            border: 'border-lime-500 dark:border-lime-400',
            text: 'text-lime-600 dark:text-lime-400'
        },
        {
            border: 'border-green-500 dark:border-green-400',
            text: 'text-green-600 dark:text-green-400'
        },
        {
            border: 'border-blue-500 dark:border-blue-400',
            text: 'text-blue-600 dark:text-blue-400'
        },
        {
            border: 'border-yellow-500 dark:border-yellow-400',
            text: 'text-yellow-600 dark:text-yellow-400'
        },
        {
            border: 'border-red-500 dark:border-red-400',
            text: 'text-red-600 dark:text-red-400'
        }
    ];

    const inverted = [
        {
            border: 'border-red-500 dark:border-red-400',
            text: 'text-red-600 dark:text-red-400'
        },
        {
            border: 'border-yellow-500 dark:border-yellow-400',
            text: 'text-yellow-600 dark:text-yellow-400'
        },
        {
            border: 'border-blue-500 dark:border-blue-400',
            text: 'text-blue-600 dark:text-blue-400'
        },
        {
            border: 'border-green-500 dark:border-green-400',
            text: 'text-green-600 dark:text-green-400'
        },
        {
            border: 'border-lime-500 dark:border-lime-400',
            text: 'text-lime-600 dark:text-lime-400'
        }
    ];

    const palette = invertQuartiles ? inverted : normal;

    if (percentile < 20) return palette[0];
    if (percentile < 40) return palette[1];
    if (percentile < 60) return palette[2];
    if (percentile < 80) return palette[3];
    return palette[4];
}
