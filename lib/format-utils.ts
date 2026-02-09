/**
 * Format a numeric value based on its units
 */
export function formatValue(value: number, units?: string | null): string {
    if (value === null || value === undefined) return '-';

    switch (units) {
        case 'billions':
            return `$${(value / 1).toLocaleString('en-US', { maximumFractionDigits: 1 })}B`;

        case 'millions':
            return `$${(value / 1).toLocaleString('en-US', { maximumFractionDigits: 0 })}M`;

        case 'percent':
            return `${value.toFixed(2)}%`;

        case 'ratio':
            return value.toFixed(2);

        case 'index':
            return value.toLocaleString('en-US', { maximumFractionDigits: 2 });

        case 'usd':
            return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

        case 'usd_per_oz':
            return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}/oz`;

        case 'usd_per_barrel':
            return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}/bbl`;

        case 'exchange_rate':
            return value.toFixed(4);

        default:
            // Default formatting for unknown units
            return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
}

/**
 * Get axis label for units
 */
export function getAxisLabel(units?: string | null): string {
    switch (units) {
        case 'billions':
            return 'Billions USD';

        case 'millions':
            return 'Millions USD';

        case 'percent':
            return 'Percent (%)';

        case 'ratio':
            return 'Ratio';

        case 'index':
            return 'Index Value';

        case 'usd':
            return 'USD';

        case 'usd_per_oz':
            return 'USD per oz';

        case 'usd_per_barrel':
            return 'USD per barrel';

        case 'exchange_rate':
            return 'Exchange Rate';

        default:
            return 'Value';
    }
}

/**
 * Format value for chart tooltip
 */
export function formatTooltipValue(value: number, units?: string | null): string {
    return formatValue(value, units);
}
