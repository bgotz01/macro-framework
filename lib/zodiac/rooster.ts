import { ZodiacData } from './types';

export const roosterData: ZodiacData = {
    emoji: '🐓',
    name: 'Rooster',
    title: 'Clarity & Realignment',
    cyclePosition: 10,
    function: 'Restore signal, coherence, and readability after narrative chaos',
    coreStatement: [
        'Rooster years end confusion.',
        'Competing narratives collapse into a dominant frame.'
    ],
    coreTheme: {
        title: 'From chaos to clarity',
        previousSays: 'Stories flip rapidly, nothing makes sense.',
        currentSays: 'At least we know what matters now.'
    },
    pillars: [
        {
            title: '1. Signal Over Noise',
            points: [
                'Competing narratives collapse into a dominant frame',
                'Data regains authority over vibes',
                'The system becomes readable again'
            ],
            quote: 'At least we know what matters.'
        },
        {
            title: '2. Realignment (not destruction)',
            points: [
                'Prices, roles, and expectations align with reality',
                'Some things adjust upward, others downward',
                'The key is coherence, not direction'
            ],
            quote: 'This fits again.'
        },
        {
            title: '3. Explicit Boundaries',
            points: [
                'What works vs what doesn\'t becomes clear',
                'Rules are clarified or enforced consistently',
                'Ambiguity shrinks'
            ],
            quote: "Here's the line."
        },
        {
            title: '4. Differentiation',
            points: [
                'Quality separates from noise',
                'Strong structures stand out',
                'Weakness is identifiable, not hidden'
            ],
            quote: 'Not everything is the same.'
        },
        {
            title: '5. Psychological Relief',
            points: [
                'Even painful clarity feels better than confusion',
                'Participants can plan again',
                'Conviction returns (selectively)'
            ],
            quote: 'Finally — I can think.'
        }
    ],
    whyFollows: {
        title: 'Why Rooster Must Follow Monkey',
        relationship: 'Monkey destabilizes meaning. Rooster restores signal by force.',
        withoutCurrent: [
            'Chaos lingers',
            'Trust never reforms',
            'Dog (repair) is impossible'
        ],
        conclusion: 'Rooster is the necessary cut.'
    },
    contrast: {
        previous: 'Monkey',
        current: 'Rooster',
        rows: [
            { previous: 'Narrative whiplash', current: 'Narrative resolution' },
            { previous: 'Noise dominates', current: 'Signal dominates' },
            { previous: 'Confusion', current: 'Legibility' },
            { previous: 'Reaction', current: 'Understanding' }
        ]
    },
    canonicalDefinition: {
        title: 'Rooster Year — Clarity & Realignment',
        description: 'A phase where narrative chaos resolves into coherent signal, uncertainty collapses into clarity, and the system realigns around what actually works.',
        explains: [
            'Monkey scrambles meaning. Rooster restores it.',
            'restore the ability to plan',
            'bring coherence without requiring destruction'
        ]
    },
    colorScheme: {
        border: 'border-rose-500/30',
        bg: 'from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900'
    }
};
