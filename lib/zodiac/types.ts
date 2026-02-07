export interface ZodiacPillar {
    title: string;
    points: string[];
    quote: string;
}

export interface ZodiacContrast {
    previous: string;
    current: string;
    rows: {
        previous: string;
        current: string;
    }[];
}

export interface ZodiacWarning {
    title: string;
    content: string[];
    conclusion?: string;
}

export interface ZodiacData {
    emoji: string;
    name: string;
    title: string;
    cyclePosition: number;
    function: string;
    coreStatement: string[];
    coreTheme: {
        title: string;
        previousSays: string;
        currentSays: string;
    };
    pillars: ZodiacPillar[];
    whyFollows: {
        title: string;
        relationship: string;
        withoutCurrent: string[];
        withoutPrevious?: string[];
        conclusion: string;
    };
    contrast?: ZodiacContrast;
    warning?: ZodiacWarning;
    canonicalDefinition: {
        title: string;
        description: string;
        explains: string[];
    };
    colorScheme: {
        border: string;
        bg: string;
    };
}
