import { ZodiacData } from './types';

export const horseData: ZodiacData = {
    emoji: '🐎',
    name: 'Horse',
    title: 'Wild Moves',
    cyclePosition: 7,
    function: 'Drive wild, unconstrained movement through instinct, imitation, and momentum',
    coreStatement: [
        'Horse years are defined by wild, unconstrained movement — motion driven by instinct, imitation, and momentum rather than control or design.',
        'Wild Moves — when motion outruns control.'
    ],
    coreTheme: {
        title: 'From precision to speed',
        previousSays: 'Move carefully.',
        currentSays: 'Move now.'
    },
    pillars: [
        {
            title: '1. Unconstrained Motion',
            points: [
                'Movement breaks free of oversight',
                'Speed becomes self-reinforcing',
                'Control lags reality'
            ],
            quote: "Things are moving because they're moving."
        },
        {
            title: '2. Instinctual Participation',
            points: [
                'Gut decisions dominate',
                'Imitation replaces evaluation',
                'Participation matters more than understanding'
            ],
            quote: 'Just ride it.'
        },
        {
            title: '3. Momentum as Proof',
            points: [
                'Movement itself becomes evidence',
                'Fragility is hidden by success',
                'Outcomes justify risk retroactively'
            ],
            quote: 'It worked, so it was right.'
        },
        {
            title: '4. Risk in the Background',
            points: [
                'Exposure grows invisibly',
                'Guardrails fade without alarm',
                'Stability depends on continued motion'
            ],
            quote: "We'll deal with that later."
        },
        {
            title: '5. No Clean Exit',
            points: [
                'Slowing causes turbulence',
                'Pauses feel dangerous',
                'The system only feels safe while moving'
            ],
            quote: "Don't stop now."
        }
    ],
    whyFollows: {
        title: 'Why Horse Must Follow Snake',
        relationship: 'Snake hides risk by redistributing it. Horse activates that hidden risk through speed.',
        withoutCurrent: [
            'Excess stays latent',
            'Instability never surfaces'
        ],
        conclusion: 'Horse makes the system kinetic — and therefore brittle.'
    },
    contrast: {
        previous: 'Snake',
        current: 'Horse',
        rows: [
            { previous: 'Precision', current: 'Speed' },
            { previous: 'Insight', current: 'Momentum' },
            { previous: 'Quiet', current: 'Loud' },
            { previous: 'Risk moved', current: 'Risk activated' }
        ]
    },
    canonicalDefinition: {
        title: 'Horse Year — Wild Moves',
        description: 'A phase where wild, unconstrained movement dominates — motion driven by instinct, imitation, and momentum rather than control or design.',
        explains: [
            'motion outruns control',
            'feel exciting and inevitable',
            'feel impossible to slow down'
        ]
    },
    colorScheme: {
        border: 'border-amber-500/30',
        bg: 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900'
    }
};
