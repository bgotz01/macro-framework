import { ZodiacData } from './types';

export const monkeyData: ZodiacData = {
    emoji: '🐒',
    name: 'Monkey',
    title: 'Narrative Chaos',
    cyclePosition: 9,
    function: 'Stir up instability through narrative whiplash and reflexive agitation',
    coreStatement: [
        "The stillness doesn't hold — new shocks, new stories, new reversals.",
        "Monkey doesn't just reveal instability — it stirs it up."
    ],
    coreTheme: {
        title: 'Monkey comes after Goat because',
        previousSays: 'the system is tense + under-engaged, confidence is thin, positioning is defensive, belief is already fragile',
        currentSays: '"unexpected stuff" starts happening again, stories flip rapidly, people stop trusting the map'
    },
    pillars: [
        {
            title: '1. Narrative Whiplash',
            points: [
                'Competing explanations cycle quickly',
                "Yesterday's consensus becomes today's joke",
                'People trade the narrative, not the reality'
            ],
            quote: 'The story changes faster than the facts.'
        },
        {
            title: '2. Reflexive Agitation',
            points: [
                'Reaction becomes the driver (not the catalyst)',
                'Markets move because people expect them to move',
                'Second-order thinking dominates ("what will they do?")'
            ],
            quote: 'Everyone watches everyone.'
        },
        {
            title: '3. Correlation Mischief',
            points: [
                'Relationships behave inconsistently',
                "Diversifiers don't diversify when you need them",
                'Strange co-moves appear'
            ],
            quote: 'Old pairings stop holding.'
        },
        {
            title: '4. Trickster Volatility',
            points: [
                'Sharp moves without clear cause',
                'Breakouts fail, breakdowns reverse',
                'Traps and squeezes become common'
            ],
            quote: "The market 'pranks' conviction."
        },
        {
            title: '5. Confidence Erosion',
            points: [
                'Less faith in institutions, forecasts, and models',
                'Participants become tactical and short-duration',
                'More hedging, more skittishness, less commitment'
            ],
            quote: 'Nobody wants to be caught believing.'
        }
    ],
    whyFollows: {
        title: 'Why Monkey Must Follow Goat',
        relationship: 'Goat lowers the flame; Monkey throws sparks into the dry room.',
        withoutCurrent: [
            'The system is tense + under-engaged',
            'Confidence is thin',
            'Positioning is defensive',
            'Belief is already fragile'
        ],
        conclusion: "Monkey doesn't just reveal instability — it stirs it up."
    },
    contrast: {
        previous: 'Goat',
        current: 'Monkey',
        rows: [
            { previous: 'Withdrawal', current: 'Disruption' },
            { previous: 'Defense', current: 'Chaos' },
            { previous: 'Calm attempt', current: 'Instability' },
            { previous: 'Control-seeking', current: 'Control loss' }
        ]
    },
    canonicalDefinition: {
        title: 'Monkey Year — Disruption & Narrative Whiplash',
        description: 'A phase where the system becomes mischievous: headlines move markets, confidence flips, and narratives replace fundamentals as the steering wheel.',
        explains: [
            'feel like whipsaw, fakeouts, sudden regime shifts',
            '"wait, we\'re back to that story again?"',
            'narratives replace fundamentals as the steering wheel'
        ]
    },
    colorScheme: {
        border: 'border-yellow-500/30',
        bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900'
    }
};
