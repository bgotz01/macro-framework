/**
 * Responsive chart utilities for mobile optimization
 */

export const getResponsiveHeight = (defaultHeight: number): number => {
    if (typeof window === 'undefined') return defaultHeight;

    const width = window.innerWidth;

    // iPhone and small mobile devices
    if (width < 640) {
        return Math.min(defaultHeight * 0.7, 300);
    }

    // Tablets
    if (width < 1024) {
        return Math.min(defaultHeight * 0.85, 400);
    }

    return defaultHeight;
};

export const getResponsiveMargin = () => {
    if (typeof window === 'undefined') {
        return { top: 5, right: 30, left: 20, bottom: 5 };
    }

    const width = window.innerWidth;

    // Mobile - negative left margin to eliminate empty space
    if (width < 640) {
        return { top: 5, right: 5, left: -20, bottom: 5 };
    }

    // Tablet
    if (width < 1024) {
        return { top: 5, right: 15, left: 0, bottom: 5 };
    }

    // Desktop
    return { top: 5, right: 30, left: 20, bottom: 5 };
};

export const getResponsiveFontSize = () => {
    if (typeof window === 'undefined') return 12;

    const width = window.innerWidth;

    // Mobile
    if (width < 640) return 10;

    // Tablet
    if (width < 1024) return 11;

    // Desktop
    return 12;
};

export const getResponsiveYAxisWidth = () => {
    if (typeof window === 'undefined') return 60;

    const width = window.innerWidth;

    // Mobile - narrower Y-axis to save space
    if (width < 640) return 35;

    // Tablet
    if (width < 1024) return 50;

    // Desktop
    return 60;
};
