import { ZodiacData } from './types';

export const tigerData: ZodiacData = {
    emoji: '🐅',
    name: 'Tiger',
    title: 'Aggressive Testing',
    cyclePosition: 3,
    function: 'Test the rebuilt system under pressure',
    coreStatement: [
        'Tiger years push the system hard to see what it can really handle.',
        "Not because it's reckless — but because untested systems fail later, worse."
    ],
    coreTheme: {
        title: 'From structure to strain',
        previousSays: "It's stable.",
        currentSays: 'Prove it.'
    },
    pillars: [
        {
            title: '1. Risk Re-Engagement',
            points: [
                'Participants take risk again',
                'Boundaries are probed',
                'Leverage reappears'
            ],
            quote: "Let's see how far this goes."
        },
        {
            title: '2. Stress Through Action',
            points: [
                'Stress is created by use, not theory',
                'Weak points surface',
                'Assumptions are challenged'
            ],
            quote: 'Does this actually work in the wild?'
        },
        {
            title: '3. Conviction & Momentum',
            points: [
                'People commit, not hedge',
                'Narratives harden quickly',
                'Moves are decisive'
            ],
            quote: 'If it works, go big.'
        },
        {
            title: '4. Visible Winners & Losers',
            points: [
                'Skill and positioning matter again',
                'Early adopters separate from laggards',
                'Payoffs are uneven'
            ],
            quote: 'Not everyone survives the test.'
        },
        {
            title: '5. Confidence Feedback Loop',
            points: [
                'Success breeds more risk',
                'Failure is punished fast',
                'System learns by doing'
            ],
            quote: 'Confidence is earned, not assumed.'
        }
    ],
    whyFollows: {
        title: 'Why Tiger Must Follow Ox',
        relationship: 'Ox builds capacity. Tiger loads it.',
        withoutCurrent: [
            'fragility stays hidden',
            'Dragon becomes catastrophic'
        ],
        withoutPrevious: [
            'the system would fail immediately'
        ],
        conclusion: 'Tiger is necessary friction.'
    },
    contrast: {
        previous: 'Rat',
        current: 'Tiger',
        rows: [
            { previous: 'Save', current: 'Test' },
            { previous: 'Emergency', current: 'Strain' },
            { previous: 'System-first', current: 'Action-first' }
        ]
    },
    canonicalDefinition: {
        title: 'Tiger Year — Aggressive Testing',
        description: 'A phase where participants actively stress the rebuilt system through decisive risk-taking, revealing strengths, weaknesses, and new power dynamics.',
        explains: [
            'markets "wake up"',
            'narratives feel alive again',
            'motion becomes obvious'
        ]
    },
    colorScheme: {
        border: 'border-orange-500/30',
        bg: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900'
    }
};
