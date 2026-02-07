import { ZodiacData } from './types';

export const rabbitData: ZodiacData = {
    emoji: '🐇',
    name: 'Rabbit',
    title: 'Narrative Stabilization',
    cyclePosition: 4,
    function: 'Normalize the tested system through trust, coordination, and story',
    coreStatement: [
        'Rabbit years decide whether people believe in the system they just tested.'
    ],
    coreTheme: {
        title: 'From stress to shared understanding',
        previousSays: 'It works under pressure.',
        currentSays: 'Can we live inside this?'
    },
    pillars: [
        {
            title: '1. Trust & Coordination',
            points: [
                'Participants re-align expectations',
                'Norms and etiquette re-emerge',
                'Friction is smoothed'
            ],
            quote: "Let's make this work together."
        },
        {
            title: '2. Narrative Formation',
            points: [
                'Explanations solidify',
                'Successes are rationalized',
                'Failures are reframed'
            ],
            quote: "Here's what this system means."
        },
        {
            title: '3. Soft Power & Signaling',
            points: [
                'Reputation matters more than force',
                'Consensus replaces confrontation',
                'Influence becomes indirect'
            ],
            quote: 'Belief does the work now.'
        },
        {
            title: '4. Selective Fragility',
            points: [
                'The system looks calm',
                'Weaknesses are masked, not fixed',
                'Stress is deferred, not resolved'
            ],
            quote: 'As long as confidence holds…'
        },
        {
            title: '5. Social Buy-In',
            points: [
                'Broader participation returns',
                'Risk is normalized culturally',
                'The system feels legitimate again'
            ],
            quote: 'This is safe enough.'
        }
    ],
    whyFollows: {
        title: 'Why Rabbit Must Follow Tiger',
        relationship: 'Tiger proves mechanical viability. Rabbit establishes social legitimacy.',
        withoutCurrent: [
            "Tiger's gains stay narrow",
            'Adoption stalls',
            'Dragon becomes isolated speculation'
        ],
        conclusion: 'Rabbit is the bridge from function to belief.'
    },
    contrast: {
        previous: 'Tiger',
        current: 'Rabbit',
        rows: [
            { previous: 'Force', current: 'Influence' },
            { previous: 'Action', current: 'Perception' },
            { previous: 'Stress test', current: 'Normalization' },
            { previous: 'Conviction', current: 'Comfort' }
        ]
    },
    warning: {
        title: 'Important Warning (This Sets Up Dragon)',
        content: [
            'strengthen the cycle if narratives match reality',
            'weaken the cycle if narratives paper over risk'
        ],
        conclusion: 'That tension is exactly why Dragon later becomes explosive.'
    },
    canonicalDefinition: {
        title: 'Rabbit Year — Narrative Stabilization',
        description: 'A phase where trust, coordination, and shared explanations form around a tested system, smoothing friction and enabling broader participation.',
        explains: [
            'feel calm',
            'feel "reasonable"',
            'can break suddenly if belief cracks'
        ]
    },
    colorScheme: {
        border: 'border-pink-500/30',
        bg: 'from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900'
    }
};
