import { ZodiacData } from './types';

export const dragonData: ZodiacData = {
    emoji: '🐉',
    name: 'Dragon',
    title: 'Power & Myth Realization',
    cyclePosition: 5,
    function: 'Convert belief and structure into scale, dominance, and legend',
    coreStatement: [
        'Dragon years reveal what the system can become at full power.',
        'This is not about testing anymore. This is about expression.'
    ],
    coreTheme: {
        title: 'From belief to magnitude',
        previousSays: 'People trust this.',
        currentSays: "Then let's scale it to the limit."
    },
    pillars: [
        {
            title: '1. Power Concentration',
            points: [
                'Capital, attention, and influence cluster',
                'Winners become obvious',
                'The system reveals its champions'
            ],
            quote: 'Not everything matters equally.'
        },
        {
            title: '2. Myth Creation',
            points: [
                'Success stories turn legendary',
                'Narratives shift from explanation to destiny',
                'Icons, heroes, and symbols emerge'
            ],
            quote: 'This is historic.'
        },
        {
            title: '3. Scale Without Precedent',
            points: [
                'Growth exceeds prior constraints',
                'Old comparisons stop working',
                'Models extrapolate wildly'
            ],
            quote: "We've never seen this before."
        },
        {
            title: '4. Rule Bending by Authority',
            points: [
                'Exceptions are made for the powerful',
                'Constraints apply asymmetrically',
                'Influence overrides procedure'
            ],
            quote: "They're too important to stop."
        },
        {
            title: '5. Hidden Fragility',
            points: [
                'Strength masks dependence',
                'Concentration increases systemic risk',
                'Failure, if it comes, will be nonlinear'
            ],
            quote: 'It works… because nothing has gone wrong yet.'
        }
    ],
    whyFollows: {
        title: 'Why Dragon Must Follow Rabbit',
        relationship: 'Rabbit creates belief. Dragon weaponizes it.',
        withoutCurrent: [
            'The cycle never reaches payoff',
            'The system remains local, modest, forgettable'
        ],
        withoutPrevious: [
            'Dragon looks absurd',
            'Scale is rejected'
        ],
        conclusion: 'Dragon is where power law dynamics enter the story.'
    },
    contrast: {
        previous: 'Rabbit',
        current: 'Dragon',
        rows: [
            { previous: 'Legitimacy', current: 'Authority' },
            { previous: 'Explanation', current: 'Myth' },
            { previous: 'Coordination', current: 'Concentration' },
            { previous: 'Comfort', current: 'Awe' }
        ]
    },
    warning: {
        title: 'Critical Warning (Important for Later Animals)',
        content: [
            'dependency',
            'asymmetry',
            'expectations of permanence'
        ],
        conclusion: "Dragon is not wrong. It's incomplete."
    },
    canonicalDefinition: {
        title: 'Dragon Year — Power & Myth Realization',
        description: 'A phase where trust and structure enable rapid scaling, concentrated dominance, and the creation of defining narratives that shape the rest of the cycle.',
        explains: [
            'feel extraordinary',
            'attract excess capital',
            'dominate historical memory'
        ]
    },
    colorScheme: {
        border: 'border-red-500/30',
        bg: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'
    }
};
