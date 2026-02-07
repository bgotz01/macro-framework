import { ZodiacData } from './types';

export const goatData: ZodiacData = {
    emoji: '🐐',
    name: 'Goat',
    title: 'Strategic Pullback',
    cyclePosition: 8,
    function: 'Step back deliberately after excess, prioritizing protection and positioning over progress',
    coreStatement: [
        'Goat years are defined by restraint — a deliberate step back after excess, where protection and positioning matter more than progress.',
        'No panic. No collapse. Just less reach.'
    ],
    coreTheme: {
        title: 'From speed to safety',
        previousSays: 'Go faster.',
        currentSays: "Let's pull back."
    },
    pillars: [
        {
            title: '1. Exposure Reduction',
            points: [
                'Positions are trimmed, not exited',
                'Risk is narrowed',
                'Optionality is preserved'
            ],
            quote: "Let's not be overextended."
        },
        {
            title: '2. Capital Preservation',
            points: [
                'Stability beats growth',
                'Yield beats upside',
                'Survival thinking returns quietly'
            ],
            quote: "Keep what we've earned."
        },
        {
            title: '3. Lower Participation',
            points: [
                'Fewer actors engage',
                'Liquidity thins',
                'Activity slows without drama'
            ],
            quote: "We don't need to be everywhere."
        },
        {
            title: '4. Temporary Calm',
            points: [
                'Volatility may compress',
                'Systems look steadier',
                'Underlying tensions remain unresolved'
            ],
            quote: 'This feels more controlled.'
        },
        {
            title: '5. Precursor, Not Resolution',
            points: [
                'Pullback delays reckoning',
                'It does not remove fragility',
                'It sets the stage for Monkey'
            ],
            quote: "We'll see."
        }
    ],
    whyFollows: {
        title: 'Why Goat Must Follow Horse',
        relationship: 'Horse — Wild Moves burns energy. Goat — Strategic Pullback conserves it. But nothing structural is fixed yet.',
        withoutCurrent: [
            'Horse momentum continues unchecked',
            'System burns out faster'
        ],
        conclusion: "That's why Monkey still comes."
    },
    contrast: {
        previous: 'Horse',
        current: 'Goat',
        rows: [
            { previous: 'Wild Moves', current: 'Strategic Pullback' },
            { previous: 'Momentum', current: 'Restraint' },
            { previous: 'Unconstrained', current: 'Deliberate' },
            { previous: 'Motion', current: 'Protection' }
        ]
    },
    canonicalDefinition: {
        title: 'Goat Year — Strategic Pullback',
        description: 'A phase where restraint replaces momentum — a deliberate step back after excess, where protection and positioning matter more than progress.',
        explains: [
            'restraint replaces momentum',
            'feel calmer but not resolved',
            'set the stage for what comes next'
        ]
    },
    colorScheme: {
        border: 'border-slate-500/30',
        bg: 'from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'
    }
};
