export interface PresidentialTerm {
    president: string;
    party: 'Republican' | 'Democratic' | 'Progressive' | 'Whig';
    startYear: number;
    endYear: number;
    termNumber?: number; // For presidents with multiple terms
}

export const US_PRESIDENTS: PresidentialTerm[] = [
    // Theodore Roosevelt
    { president: 'Theodore Roosevelt', party: 'Republican', startYear: 1900, endYear: 1904, termNumber: 1 },
    { president: 'Theodore Roosevelt', party: 'Republican', startYear: 1904, endYear: 1908, termNumber: 2 },

    // William Howard Taft
    { president: 'William Howard Taft', party: 'Republican', startYear: 1908, endYear: 1912 },

    // Woodrow Wilson
    { president: 'Woodrow Wilson', party: 'Democratic', startYear: 1912, endYear: 1916, termNumber: 1 },
    { president: 'Woodrow Wilson', party: 'Democratic', startYear: 1916, endYear: 1920, termNumber: 2 },

    // Warren G. Harding
    { president: 'Warren G. Harding', party: 'Republican', startYear: 1920, endYear: 1924 },

    // Calvin Coolidge
    { president: 'Calvin Coolidge', party: 'Republican', startYear: 1924, endYear: 1928 },

    // Herbert Hoover
    { president: 'Herbert Hoover', party: 'Republican', startYear: 1928, endYear: 1932 },

    // Franklin D. Roosevelt
    { president: 'Franklin D. Roosevelt', party: 'Democratic', startYear: 1932, endYear: 1936, termNumber: 1 },
    { president: 'Franklin D. Roosevelt', party: 'Democratic', startYear: 1936, endYear: 1940, termNumber: 2 },
    { president: 'Franklin D. Roosevelt', party: 'Democratic', startYear: 1940, endYear: 1944, termNumber: 3 },
    { president: 'Franklin D. Roosevelt', party: 'Democratic', startYear: 1944, endYear: 1948, termNumber: 4 },

    // Harry S. Truman
    { president: 'Harry S. Truman', party: 'Democratic', startYear: 1948, endYear: 1952 },

    // Dwight D. Eisenhower
    { president: 'Dwight D. Eisenhower', party: 'Republican', startYear: 1952, endYear: 1956, termNumber: 1 },
    { president: 'Dwight D. Eisenhower', party: 'Republican', startYear: 1956, endYear: 1960, termNumber: 2 },

    // John F. Kennedy
    { president: 'John F. Kennedy', party: 'Democratic', startYear: 1960, endYear: 1964 },

    // Lyndon B. Johnson
    { president: 'Lyndon B. Johnson', party: 'Democratic', startYear: 1964, endYear: 1968 },

    // Richard M. Nixon
    { president: 'Richard M. Nixon', party: 'Republican', startYear: 1968, endYear: 1972, termNumber: 1 },
    { president: 'Richard M. Nixon', party: 'Republican', startYear: 1972, endYear: 1976, termNumber: 2 },

    // Jimmy Carter
    { president: 'Jimmy Carter', party: 'Democratic', startYear: 1976, endYear: 1980 },

    // Ronald Reagan
    { president: 'Ronald Reagan', party: 'Republican', startYear: 1980, endYear: 1984, termNumber: 1 },
    { president: 'Ronald Reagan', party: 'Republican', startYear: 1984, endYear: 1988, termNumber: 2 },

    // George H.W. Bush
    { president: 'George H.W. Bush', party: 'Republican', startYear: 1988, endYear: 1992 },

    // Bill Clinton
    { president: 'Bill Clinton', party: 'Democratic', startYear: 1992, endYear: 1996, termNumber: 1 },
    { president: 'Bill Clinton', party: 'Democratic', startYear: 1996, endYear: 2000, termNumber: 2 },

    // George W. Bush
    { president: 'George W. Bush', party: 'Republican', startYear: 2000, endYear: 2004, termNumber: 1 },
    { president: 'George W. Bush', party: 'Republican', startYear: 2004, endYear: 2008, termNumber: 2 },

    // Barack Obama
    { president: 'Barack Obama', party: 'Democratic', startYear: 2008, endYear: 2012, termNumber: 1 },
    { president: 'Barack Obama', party: 'Democratic', startYear: 2012, endYear: 2016, termNumber: 2 },

    // Donald J. Trump
    { president: 'Donald J. Trump', party: 'Republican', startYear: 2016, endYear: 2020, termNumber: 1 },

    // Joe Biden
    { president: 'Joe Biden', party: 'Democratic', startYear: 2020, endYear: 2024 },

    // Donald J. Trump (second term)
    { president: 'Donald J. Trump', party: 'Republican', startYear: 2024, endYear: 2028, termNumber: 2 },
];

/**
 * Get the president(s) for a given year
 */
export function getPresidentByYear(year: number): PresidentialTerm | undefined {
    return US_PRESIDENTS.find(term => year >= term.startYear && year < term.endYear);
}

/**
 * Get all presidents within a year range
 */
export function getPresidentsByYearRange(startYear: number, endYear: number): PresidentialTerm[] {
    return US_PRESIDENTS.filter(term =>
        (term.startYear >= startYear && term.startYear < endYear) ||
        (term.endYear > startYear && term.endYear <= endYear) ||
        (term.startYear <= startYear && term.endYear >= endYear)
    );
}

/**
 * Get the 12-year cycle presidents (3 terms)
 */
export function get12YearCyclePresidents(cycleStartYear: number): PresidentialTerm[] {
    return getPresidentsByYearRange(cycleStartYear, cycleStartYear + 12);
}
