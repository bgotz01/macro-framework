import { ZodiacData } from './types';

export const pigData: ZodiacData = {
    emoji: '🐖',
    name: 'Pig',
    title: 'Broad Enjoyment & Complacency',
    cyclePosition: 12,
    function: 'Distribute gains widely and normalize comfort before reset',
    coreStatement: [
        'Pig years are when the system works well enough that people stop questioning it.',
        "That's the point — and the risk."
    ],
    coreTheme: {
        title: 'From trust to indulgence',
        previousSays: 'This works again.',
        currentSays: "Great — let's live."
    },
    pillars: [
        {
            title: '1. Broad Participation',
            points: [
                'Many actors benefit',
                'Returns feel accessible',
                'Inclusion expands'
            ],
            quote: 'Everyone gets a piece.'
        },
        {
            title: '2. Ease & Comfort',
            points: [
                'Friction is low',
                'Systems feel friendly',
                'Effort-to-reward feels reasonable'
            ],
            quote: 'Why would this ever change?'
        },
        {
            title: '3. Normalization of Success',
            points: [
                'Wins feel deserved, not lucky',
                'Risk feels distant',
                'Stability is assumed'
            ],
            quote: 'This is just how it is now.'
        },
        {
            title: '4. Complacency & Forgetting',
            points: [
                'Hard lessons fade',
                'Safeguards feel excessive',
                'Tail risks are ignored'
            ],
            quote: "We're past that."
        },
        {
            title: '5. Moral Hazard Without Malice',
            points: [
                'No villain phase',
                'Excess comes from comfort, not greed',
                'Fragility rebuilds quietly'
            ],
            quote: "Relax — nothing's wrong."
        }
    ],
    whyFollows: {
        title: 'Why Pig Must Come Last',
        relationship: 'Pig is not failure. Pig is amnesia.',
        withoutCurrent: [
            'overconfidence',
            'softened reflexes',
            'dependence on continuity'
        ],
        conclusion: 'Which makes the system ripe for Rat.'
    },
    contrast: {
        previous: 'Rat',
        current: 'Pig',
        rows: [
            { previous: 'Survival', current: 'Comfort' },
            { previous: 'Urgency', current: 'Assumption' },
            { previous: 'Rewiring', current: 'Enjoyment' },
            { previous: 'It must change', current: 'It works' }
        ]
    },
    warning: {
        title: 'The Full-Circle Moment',
        content: [
            "Pig forgets why the system works",
            "Rat remembers what happens when it doesn't"
        ],
        conclusion: "Pig years feel like the end of history — until the next Rat proves they aren't."
    },
    canonicalDefinition: {
        title: 'Pig Year — Broad Enjoyment & Complacency',
        description: 'A phase where trust, participation, and comfort peak, gains are widely shared, and vigilance fades — setting the stage for the next system reconfiguration.',
        explains: [
            'feel good',
            'feel stable',
            'feel "solved"'
        ]
    },
    colorScheme: {
        border: 'border-emerald-500/30',
        bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900'
    }
};
