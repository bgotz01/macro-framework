export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getDateFromSlider(value: number, startYear: number) {
    const year = startYear + Math.floor(value / 12);
    const month = value % 12;
    return { year, month };
}

export function formatDisplayDate(year: number, month: number): string {
    return `${MONTH_NAMES[month]} ${year}`;
}

export function formatDateString(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-01`;
}
